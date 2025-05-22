// pdfParser.js
const pdf = require('pdf-parse');

const parsePDFToQuestions = async (pdfBuffer) => {
  const data = await pdf(pdfBuffer);
  const text = data.text.replace(/\r\n/g, '\n'); // Normalize line endings

  // Extract all potential questions (number followed by question mark or dot)
  const questionBlocks = text.split(/(\n\d+[\.\)]|\nQ?\d+[\.\)])/);
  const questions = [];
  let currentQuestion = null;

  // First pass - identify questions and options
  for (let i = 1; i < questionBlocks.length; i += 2) {
    const numberPart = questionBlocks[i].trim();
    const contentPart = questionBlocks[i + 1] || '';
    
    // Question detection (flexible numbering)
    if (/^(\d+|Q?\d+)[\.\)]/.test(numberPart)) {
      if (currentQuestion) questions.push(currentQuestion);
      
      // Extract question text (until first option or double newline)
      const questionText = contentPart.split(/\n\s*\n|(?=\n[A-Za-z][\.\)])/)[0].trim();
      
      currentQuestion = {
        questionText,
        options: []
      };
    }
    
    // Option detection (flexible formatting)
    if (currentQuestion) {
      const optionMatches = contentPart.matchAll(/(^|\n)([A-Za-z])[\.\)]\s*([^\n]+)/g);
      for (const match of optionMatches) {
        currentQuestion.options.push(match[3].trim());
      }
    }
  }
  if (currentQuestion) questions.push(currentQuestion);

  // Second pass - find answers (flexible answer key format)
  const answerKey = {};
  const answerSection = text.split(/(?:answer|key|solution)[\s:]*\n/i)[1] || '';
  
  // Match various answer key formats (Q1: A, 1. A, etc.)
  const answerLines = answerSection.matchAll(/(?:Q?)(\d+)[\s:\.]+([A-Za-z0-9].*?)(?=\n|$)/gi);
  for (const match of answerLines) {
    answerKey[parseInt(match[1])] = match[2].trim().charAt(0).toUpperCase();
  }

  // Map questions to answers (with fuzzy matching)
  return questions.map((q, index) => {
    const qNumber = index + 1; // Default to position-based numbering
    const correctAnswer = answerKey[qNumber] || answerKey[index + 1];
    
    if (!correctAnswer || q.options.length < 2) return null;

    // Find best matching option
    const correctIndex = q.options.findIndex(opt => 
      opt.trim().charAt(0).toUpperCase() === correctAnswer.toUpperCase()
    );

    return correctIndex >= 0 ? {
      questionText: q.questionText,
      options: q.options,
      correctAnswer: correctIndex,
      marks: 1
    } : null;
  }).filter(q => q !== null);
};

module.exports = { parsePDFToQuestions };