// parser.js
//  - Parses PDF questions traditionally
//  - Calls Mistral 70B via AWS Bedrock to generate new questions
//  - Parses AI output into structured objects so `correctAnswer` is always present
//  - Combines ~70% AI questions + ~30% original questions (rounded up for AI)

const pdf = require('pdf-parse');
const { Buffer } = require('buffer');
const {
  BedrockRuntimeClient,
  InvokeModelCommand
} = require('@aws-sdk/client-bedrock-runtime');

// ——— Bedrock client setup ———
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_MODEL_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_MODEL_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_MODEL_ACCESS_KEY,
  },
});

// ——— Helper: Parse a single AI-generated question block into an object ———
function parseAIQuestionBlock(block) {
  // Example block:
  // "1. What is X?\nA. Option1\nB. Option2\nC. Option3\nD. Option4\nCorrect: B"
  const lines = block
    .trim()
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  // First line: “1. Question text?”
  let questionText = lines[0].replace(/^\d+\.\s*/, '').trim();

  const options = [];
  let correctAnswer = null;

  // Iterate subsequent lines to collect A.–D. and Correct:
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const optMatch = line.match(/^([A-D])\.\s*(.+)$/i);
    if (optMatch) {
      options.push(optMatch[2].trim());
      continue;
    }
    const corrMatch = line.match(/^Correct:\s*([A-D])/i);
    if (corrMatch) {
      correctAnswer = ['A', 'B', 'C', 'D'].indexOf(corrMatch[1].toUpperCase());
    }
  }

  // If parsing failed to find 4 options or correctAnswer, skip this question
  if (options.length !== 4 || correctAnswer === null) {
    return null;
  }

  return {
    questionText,
    options,
    correctAnswer,
    marks: 1
  };
}

// ——— Call Bedrock to generate new questions ———
async function callBedrockForQuestions(originalQuestions) {
  // originalQuestions is an array of objects with { questionText, ... }
  const inputQuestions = originalQuestions
    .map((q, idx) => `${idx + 1}. ${q.questionText}`)
    .join('\n');

  const prompt = `
You are an expert educational assistant.

Read the following multiple-choice questions and generate 8 to 10 new original questions of similar topic and difficulty.

Each generated question must:
- Have exactly 4 options labeled A to D
- Clearly indicate the correct option like: "Correct: C"
- Follow this format:

1. Sample question?
A. Option 1
B. Option 2
C. Option 3
D. Option 4
Correct: B

Original questions:
${inputQuestions}

Now generate the new questions:
`;

  console.log('📤 Sending prompt to Bedrock (Mistral 70B)...');
  console.log('--- PROMPT START ---\n' + prompt + '\n--- PROMPT END ---');

  const command = new InvokeModelCommand({
    modelId: 'mistral.mistral-large-2402-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      prompt,
      max_tokens: 8192,
      temperature: 0.7,
      top_p: 0.9,
    }),
  });

  try {
    const response = await bedrockClient.send(command);
    const rawBody = new TextDecoder().decode(response.body);
    const responseBody = JSON.parse(rawBody);

    console.log('📥 Raw model response:', responseBody);

    // Mistral returns text in outputs[0].text
    const generatedText = responseBody.outputs?.[0]?.text || '';

    // Split by lines that start with a number and dot (“1. ”, “2. ”, …)
    const rawBlocks = generatedText
      .split(/\n(?=\d+\.\s)/)
      .map(q => q.trim())
      .filter(Boolean);

    // Parse each block into a structured { questionText, options, correctAnswer, marks }
    const parsedAIQuestions = rawBlocks
      .map(block => parseAIQuestionBlock(block))
      .filter(q => q !== null);

    console.log(`✅ Parsed ${parsedAIQuestions.length} AI-generated questions.`);
    return parsedAIQuestions;
  } catch (err) {
    console.error('❌ Bedrock call failed:', err);
    return []; // return empty array so code can continue
  }
}

// ——— Traditional parser ———
const parseWithTraditional = async (pdfBuffer) => {
  const data = await pdf(pdfBuffer);
  const text = data.text.replace(/\r\n/g, '\n');
  console.log('📄 Extracted PDF text length:', text.length);

  const blocks = text.split(/(\n\d+[\.\)]|\nQ?\d+[\.\)])/);
  const questions = [];
  let current = null;

  for (let i = 1; i < blocks.length; i += 2) {
    const num = blocks[i].trim();
    const content = blocks[i + 1] || '';
    if (/^(\d+|Q?\d+)[\.\)]/.test(num)) {
      if (current) questions.push(current);
      const qText = content.split(/\n\s*\n|(?=\n[A-Za-z][\.\)])/)[0].trim();
      current = { questionText: qText, options: [] };
    }
    if (current) {
      for (const m of content.matchAll(/(^|\n)([A-Da-d])[\.\)]\s*([^\n]+)/g)) {
        current.options.push(m[3].trim());
      }
    }
  }
  if (current) questions.push(current);

  const answerKey = {};
  const ansSec = text.split(/answers[\s:\-]*\n/i)[1] || '';
  for (const m of ansSec.matchAll(/(\d+)\.\s*([A-Da-d])/g)) {
    answerKey[+m[1]] = m[2].toUpperCase();
  }

  return questions
    .map((q, i) => {
      const letter = answerKey[i + 1];
      if (!letter || q.options.length < 2) return null;
      const idx = ['A', 'B', 'C', 'D'].indexOf(letter);
      if (idx < 0 || idx >= q.options.length) return null;
      return {
        questionText: q.questionText,
        options: q.options,
        correctAnswer: idx,
        marks: 1,
        fromAI: false,          // <── add this (true in the AI branch)
        // topic: detectTopic(questionText) // optional helper
      };
    })
    .filter(Boolean);
};

// ——— Main export: combine ~70% AI + ~30% PDF-parsed originals ———
const parsePDFToQuestions = async (pdfBuffer) => {
  try {
    // 1. Parse all questions from PDF
    const all = await parseWithTraditional(pdfBuffer);

    // 2. Determine how many to pick (half of parsed count)
    const desiredCount = Math.ceil(all.length / 2);

    // 3. Shuffle the entire list of originals
    const shuffled = all.sort(() => Math.random() - 0.5);

    // 4. Pick 'desiredCount' unique originals
    const selectedUnique = [];
    const seen = new Set();
    for (const q of shuffled) {
      if (!seen.has(q.questionText)) {
        seen.add(q.questionText);
        selectedUnique.push(q);
      }
      if (selectedUnique.length >= desiredCount) break;
    }

    // 5. If not enough unique, fill with duplicates
    if (selectedUnique.length < desiredCount) {
      for (const q of shuffled) {
        if (selectedUnique.length >= desiredCount) break;
        selectedUnique.push(q);
      }
      console.warn(
        `⚠️ Only ${selectedUnique.length} unique found—filled to ${desiredCount} including duplicates.`
      );
    }

    console.log(`✅ Selected ${selectedUnique.length}/${desiredCount} originals`);

    // 6. Ask AI (Mistral) to generate new questions
    const aiGenerated = await callBedrockForQuestions(selectedUnique);

    // 7. Compute how many AI vs. original we want:
    //    ~70% of desiredCount from AI (rounded up), remaining from originals
    const totalWanted = selectedUnique.length; // e.g. 10
    const aiCount = Math.ceil(totalWanted * 0.7); // e.g. 7
    const origCount = totalWanted - aiCount;      // e.g. 3

    // 8. Filter out any AI questions that exactly match an original’s text,
    //    until we collect aiCount valid AI questions.
    const aiTaken = [];
    const originalTexts = new Set(selectedUnique.map((o) => o.questionText));
    for (const aiQ of aiGenerated) {
      if (aiTaken.length >= aiCount) break;
      if (!originalTexts.has(aiQ.questionText)) {
        aiTaken.push(aiQ);
      }
    }

    // If AI didn't produce enough unique questions, we take as many as it gave:
    //    remaining slots get filled by original questions
    const finalOrigCount = origCount + (aiCount - aiTaken.length);
    //    (if aiTaken.length < aiCount, we subtract the missing AI from origCount)

    // 9. From selectedUnique, pick 'finalOrigCount' originals.
    //    We’ll simply take the first N originals (they were already shuffled & deduped).
    const origTaken = selectedUnique.slice(0, finalOrigCount);

    // 10. Combine them (AI first, then originals)
    const combined = [...aiTaken.slice(0, aiCount), ...origTaken.slice(0, finalOrigCount)];

    console.log(`🔗 Returning ${combined.length} questions total.`);
    return combined;
  } catch (err) {
    console.error('❌ parsePDFToQuestions failed:', err);
    throw err;
  }
};

module.exports = { parsePDFToQuestions };
