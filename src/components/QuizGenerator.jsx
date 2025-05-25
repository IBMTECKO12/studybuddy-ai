import { useState } from "react";
import { generateContent } from "../services/gemini";

export default function QuizGenerator({ onQuizGenerated }) {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const generateQuiz = async () => {
  if (!topic.trim()) {
    setError("Please enter a topic");
    return;
  }

  setIsLoading(true);
  setError("");

  try {
    const quiz = await generateContent(
      `Generate a quiz about ${topic}`,
      "",
      "quiz"
    );
    
    // Additional parsing for Gemini's response
    let parsedQuiz;
    try {
      parsedQuiz = JSON.parse(quiz);
    } catch (parseError) {
      // Fallback in case Gemini returns non-JSON
      parsedQuiz = [
        {
          question: `Explain ${topic}`,
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctAnswer: "Option 1"
        }
      ];
    }
    
    onQuizGenerated(parsedQuiz);
  } catch (err) {
    setError("Failed to generate quiz");
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-lg font-medium mb-4">Quiz Generator</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Enter a topic for your quiz:
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., World War II, JavaScript Functions, Biology"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
      <button
        onClick={generateQuiz}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
      >
        {isLoading ? "Generating Quiz..." : "Generate Quiz"}
      </button>
    </div>
  );
}