const pdf = require('pdf-parse');
const { Buffer } = require('buffer');

// ========== Traditional Regex Parser ==========
const parseWithTraditional = async (pdfBuffer) => {
  const data = await pdf(pdfBuffer);
  const text = data.text.replace(/\r\n/g, '\n');

  console.log("📄 Extracted PDF text length:", text.length);

  const questionBlocks = text.split(/(\n\d+[\.\)]|\nQ?\d+[\.\)])/);
  const questions = [];
  let currentQuestion = null;

  for (let i = 1; i < questionBlocks.length; i += 2) {
    const numberPart = questionBlocks[i].trim();
    const contentPart = questionBlocks[i + 1] || '';

    if (/^(\d+|Q?\d+)[\.\)]/.test(numberPart)) {
      if (currentQuestion) questions.push(currentQuestion);
      const questionText = contentPart.split(/\n\s*\n|(?=\n[A-Za-z][\.\)])/)[0].trim();
      currentQuestion = {
        questionText,
        options: [],
      };
    }

    if (currentQuestion) {
      const optionMatches = contentPart.matchAll(/(^|\n)([A-Da-d])[\.\)]\s*([^\n]+)/g);
      for (const match of optionMatches) {
        currentQuestion.options.push(match[3].trim());
      }
    }
  }

  if (currentQuestion) questions.push(currentQuestion);

  const answerKey = {};
  const answerSection = text.split(/answers[\s:\-]*\n/i)[1] || '';
  const answerLines = answerSection.matchAll(/(\d+)\.\s*([A-Da-d])/g);

  for (const match of answerLines) {
    answerKey[parseInt(match[1])] = match[2].toUpperCase();
  }

  const formatted = questions.map((q, index) => {
    const correctLetter = answerKey[index + 1];
    if (!correctLetter || q.options.length < 2) return null;

    const correctIndex = ['A', 'B', 'C', 'D'].indexOf(correctLetter);
    if (correctIndex < 0 || correctIndex >= q.options.length) return null;

    return {
      questionText: q.questionText,
      options: q.options,
      correctAnswer: correctIndex,
      marks: 1,
    };
  }).filter(Boolean);

  console.log(`✅ Parsed ${formatted.length} questions via traditional parser`);

  // Return a random half
  const half = Math.ceil(formatted.length / 2);
  const shuffled = formatted.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, half);
};

// ========== Main Export ==========
const parsePDFToQuestions = async (pdfBuffer) => {
  try {
    console.log("📄 Using traditional parser only.");
    return await parseWithTraditional(pdfBuffer);
  } catch (err) {
    console.error("❌ Traditional parser failed:", err.message);
    throw err;
  }
};

module.exports = { parsePDFToQuestions };
