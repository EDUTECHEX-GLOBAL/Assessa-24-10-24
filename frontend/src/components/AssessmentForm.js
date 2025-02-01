import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Select, Button, Form, message, Spin, Card } from "antd";
import axios from "axios";

const { Option } = Select;

const AssessmentForm = () => {
  const [loading, setLoading] = useState(false); // For form submission
  const [reviewing, setReviewing] = useState(false); // For assessment review
  const [generatedAssessment, setGeneratedAssessment] = useState([]); // To hold questions
  const [userAnswers, setUserAnswers] = useState({}); // To hold user answers
  const [reviewResult, setReviewResult] = useState([]); // To store review results
  const [result, setResult] = useState(null); // To hold the final score
  const navigate = useNavigate();

  const [form] = Form.useForm();

  // Handle form submission for assessment generation
  const handleSubmit = async (values) => {
    console.log("Form Data:", values);
    setLoading(true);
    try {
      const response = await axios.post("/api/generate-assessment", values);

      if (response.data.success) {
        const questions = parseAssessment(response.data.assessment);
        setGeneratedAssessment(questions);
        message.success("Assessment generated successfully!");
      } else {
        message.error("Failed to generate assessment.");
      }
    } catch (error) {
      console.error("Error generating assessment:", error);
      message.error("An error occurred while generating the assessment.");
    }
    setLoading(false);
  };

  // Handle assessment review (submit answers)
  const handleReview = () => {
    const results = generatedAssessment.map((q, index) => ({
      question: q.question,
      correctAnswer: q.correctAnswer,
      userAnswer: userAnswers[index],
      isCorrect: userAnswers[index] === q.correctAnswer,
    }));

    setReviewResult(results);

    const score = results.filter((r) => r.isCorrect).length;
    setResult(`You scored ${score} out of ${generatedAssessment.length}.`);
  };

  // Handle answer selection
  const handleAnswerChange = (questionIndex, selectedOption) => {
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: selectedOption }));
  };

  // Parse assessment text into a structured format
  const parseAssessment = (assessmentText) => {
    const questions = [];
    const questionBlocks = assessmentText.split(/\n\n+/);
  
    questionBlocks.forEach((block) => {
      const lines = block.split("\n");
      const questionText = lines[0];
      const options = lines.slice(1, -1).filter((line) => line.trim() && !line.startsWith("Correct Answer:"));
      const correctAnswerLine = lines.find((line) => line.startsWith("Correct Answer:"));
      const correctAnswer = correctAnswerLine?.split(":")[1]?.trim();
  
      if (questionText && options.length && correctAnswer) {
        questions.push({
          question: questionText,
          options,
          correctAnswer,
        });
      }
    });
  
    return questions;
  };
  

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
        AI-Powered Assessment Generator
      </h1>

      <Card className="mb-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-4"
        >
          <Form.Item
            name="topic"
            label={<span className="font-medium text-gray-700">Topic</span>}
            rules={[{ required: true, message: "Please enter a topic!" }]}
          >
            <Input
              placeholder="e.g., Mathematics, History"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </Form.Item>

          <Form.Item
            name="difficulty"
            label={
              <span className="font-medium text-gray-700">Difficulty Level</span>
            }
            rules={[{ required: true, message: "Please select a difficulty!" }]}
          >
            <Select
              placeholder="Select Difficulty"
              className="w-full border rounded-lg"
            >
              <Option value="easy">Easy</Option>
              <Option value="medium">Medium</Option>
              <Option value="hard">Hard</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="duration"
            label={
              <span className="font-medium text-gray-700">Duration (mins)</span>
            }
            rules={[{ required: true, message: "Please specify a duration!" }]}
          >
            <Input
              type="number"
              placeholder="e.g., 10, 20, 30"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-blue-500 text-white"
              loading={loading}
            >
              Generate Assessment
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {generatedAssessment.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Assessment:</h2>
          {generatedAssessment.map((q, index) => (
            <div key={index} className="mb-6">
              <p className="font-medium">{q.question}</p>
              <div className="space-y-2">
                {q.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`question-${index}-option-${optionIndex}`}
                      name={`question-${index}`}
                      value={option}
                      onChange={() => handleAnswerChange(index, option)}
                      className="h-4 w-4"
                    />
                    <label
                      htmlFor={`question-${index}-option-${optionIndex}`}
                      className="ml-2 text-gray-700"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Button
            type="primary"
            className="bg-green-500 text-white"
            onClick={handleReview}
            disabled={
              Object.keys(userAnswers).length !== generatedAssessment.length
            }
          >
            {reviewing ? <Spin /> : "Submit Assessment"}
          </Button>
        </div>
      )}

      {reviewResult.length > 0 && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-bold text-green-600">Review:</h2>
          {reviewResult.map((r, index) => (
            <div key={index} className="mb-4">
              <p className="font-medium">{r.question}</p>
              <p
                className={`text-sm ${
                  r.isCorrect ? "text-green-600" : "text-red-600"
                }`}
              >
                {r.isCorrect
                  ? `Correct! Your Answer: ${r.userAnswer}`
                  : `Incorrect. Your Answer: ${r.userAnswer}, Correct Answer: ${r.correctAnswer}`}
              </p>
            </div>
          ))}
          <div className="text-lg font-bold mt-4">{result}</div>
        </div>
      )}
    </div>
  );
};

export default AssessmentForm;
