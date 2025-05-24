// parser.js
//  - Parses PDF questions traditionally
//  - Calls Meta Llama 3 Instruct via AWS Bedrock to generate new questions

const pdf = require('pdf-parse');
const { Buffer } = require('buffer');
const {
  BedrockRuntimeClient,
  InvokeModelCommand
} = require('@aws-sdk/client-bedrock-runtime');

// ——— Bedrock client setup ———
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ——— Call Bedrock to generate new questions ———
async function callBedrockForQuestions(questionTexts) {
  const joined = questionTexts.join('\n');
  const prompt = `<s>[INST]
Here are some assignment questions:
${joined}

Generate 8–10 new multiple-choice questions that are similar in style. 
Format each question like:

1. Question text?
A. Option1
B. Option2
C. Option3
D. Option4

Also indicate the correct option letter.
[/INST]`;

  const body = { prompt, max_gen_len: 512, temperature: 0.7, top_p: 0.9 };
  const command = new InvokeModelCommand({
    modelId: 'meta.llama3-70b-instruct-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(body),
  });

  try {
    const response = await bedrockClient.send(command);
    const text = await response.body.transformToString();
    let raw;
    try { raw = JSON.parse(text).generation; } catch { raw = text; }

    const items = raw
      .split(/\n(?=\d+\.)/)
      .map(s => s.trim())
      .filter(Boolean);

    return items.map(item => {
      const lines = item.split(/\n+/);
      const qLine = lines[0].replace(/^\d+\.\s*/, '').trim();
      const options = [];
      let correctAnswer = 0;

      lines.slice(1).forEach(line => {
        const m = line.match(/^([A-D])\.\s*(.+)$/i);
        if (m) {
          options.push(m[2].trim());
          if (item.toLowerCase().includes(`correct: ${m[1].toLowerCase()}`)) {
            correctAnswer = ['A','B','C','D'].indexOf(m[1].toUpperCase());
          }
        }
      });

      return { questionText: qLine, options, correctAnswer, marks: 1 };
    });
  } catch (err) {
    console.error('❌ AI generation failed:', err);
    return [];
  }
}

// ——— Traditional parser ———
const parseWithTraditional = async pdfBuffer => {
  const data = await pdf(pdfBuffer);
  const text = data.text.replace(/\r\n/g, '\n');
  console.log('📄 Extracted PDF text length:', text.length);

  const blocks = text.split(/(\n\d+[\.\)]|\nQ?\d+[\.\)])/);
  const questions = [];
  let current = null;

  for (let i = 1; i < blocks.length; i += 2) {
    const num = blocks[i].trim();
    const content = blocks[i+1] || '';
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

  return questions.map((q, i) => {
    const letter = answerKey[i+1];
    if (!letter || q.options.length < 2) return null;
    const idx = ['A','B','C','D'].indexOf(letter);
    if (idx < 0 || idx >= q.options.length) return null;
    return { questionText: q.questionText, options: q.options, correctAnswer: idx, marks: 1 };
  }).filter(Boolean);
};

// ——— Main export: dedupe selection logic with fallback ———
const parsePDFToQuestions = async pdfBuffer => {
  try {
    // 1. parse all questions
    const all = await parseWithTraditional(pdfBuffer);

    // 2. determine how many to pick (half of parsed count)
    const desiredCount = Math.ceil(all.length / 2);

    // 3. shuffle list
    const shuffled = all.sort(() => Math.random() - 0.5);

    // 4. pick unique until desiredCount
    const selectedUnique = [];
    const seen = new Set();
    for (const q of shuffled) {
      if (!seen.has(q.questionText)) {
        seen.add(q.questionText);
        selectedUnique.push(q);
      }
      if (selectedUnique.length >= desiredCount) break;
    }

    // 5. if not enough unique, fill with next items (allow duplicates)
    if (selectedUnique.length < desiredCount) {
      for (const q of shuffled) {
        if (selectedUnique.length >= desiredCount) break;
        selectedUnique.push(q);
      }
      console.warn(`⚠️ Only ${selectedUnique.length} unique found—filled to ${desiredCount} including duplicates.`);
    }

    console.log(`✅ Selected ${selectedUnique.length}/${desiredCount} originals`);

    // 6. AI generate
    const ai = await callBedrockForQuestions(selectedUnique.map(q => q.questionText));

    // 7. combine originals + AI
    const originalsCount = Math.max(0, desiredCount - ai.length);
    const combined = [
      ...selectedUnique.slice(0, originalsCount),
      ...ai.slice(0, ai.length)
    ];

    console.log(`🔗 Returning ${combined.length} questions total.`);
    return combined;
  } catch (err) {
    console.error('❌ parsePDFToQuestions failed:', err);
    throw err;
  }
};

module.exports = { parsePDFToQuestions };
