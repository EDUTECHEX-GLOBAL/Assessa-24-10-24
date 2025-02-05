import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const StudyRecommendation = ({ userType }) => {
    const [topic, setTopic] = useState('');
    const [recommendation, setRecommendation] = useState('');
    const [explanation, setExplanation] = useState('');
    const [sources, setSources] = useState([]);
    const [relatedQuestions, setRelatedQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const getRecommendation = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/ai/study-recommendations', { topic, userType });

            if (response.data) {
                setRecommendation(response.data.aiResponse || "No recommendations found.");
                setSources(response.data.sources || []);
                setExplanation(response.data.explanation || '');
                setRelatedQuestions(response.data.relatedQuestions || []);
            } else {
                setRecommendation("No recommendations found.");
            }
        } catch (error) {
            console.error("Error fetching recommendation:", error);
            setRecommendation("Failed to fetch study recommendation.");
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <motion.h1
                className="text-4xl font-bold mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                AI-Powered Study Recommendations
            </motion.h1>
            <div className="w-full max-w-lg p-6 bg-gray-800 shadow-lg rounded-lg">
                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Enter a topic..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="p-3 text-lg bg-gray-700 border border-gray-600 rounded-lg focus:outline-none"
                    />
                    <button
                        onClick={getRecommendation}
                        disabled={loading}
                        className="w-full p-3 text-lg bg-blue-500 hover:bg-blue-600 rounded-lg transition duration-300"
                    >
                        {loading ? "Generating..." : "Get Recommendation"}
                    </button>

                    {/* Display Recommendation */}
                    {recommendation && (
                        <motion.div className="mt-4 p-4 bg-gray-700 rounded-lg"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                            <h3 className="text-lg font-semibold">Recommendation:</h3>
                            <p className="mt-2">{recommendation}</p>
                        </motion.div>
                    )}

                    {/* Display Explanation */}
                    {explanation && (
                        <motion.div className="mt-4 p-4 bg-gray-700 rounded-lg"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                            <h3 className="text-lg font-semibold">Explanation:</h3>
                            <p className="mt-2">{explanation}</p>
                        </motion.div>
                    )}

                    {/* Display Sources with Images */}
                    {sources.length > 0 && (
                        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Sources:</h3>
                            <ul>
                                {sources.map((source, index) => (
                                    <li key={index} className="mb-2">
                                        {source.image && <img src={source.image} alt={source.title} className="w-full h-40 object-cover rounded-lg mb-2" />}
                                        <a href={source.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                            {source.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Display Related Questions */}
                    {relatedQuestions.length > 0 && (
                        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                            <h3 className="text-lg font-semibold">Related Questions:</h3>
                            <ul>{relatedQuestions.map((q, i) => <li key={i}>{q}</li>)}</ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudyRecommendation;
