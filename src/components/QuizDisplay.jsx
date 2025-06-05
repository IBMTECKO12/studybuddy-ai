// components/QuizDisplay.jsx
import { useState } from 'react';
import { voiceService } from '../services/VoiceService';

export default function QuizDisplay({ quiz, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (index, answer) => {
    setSelectedAnswers(prev => ({ ...prev, [index]: answer }));
  };

  const calculateScore = () => {
    return quiz.reduce((score, question, index) => {
      return score + (selectedAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0);
  };

  const speakQuestion = () => {
    const currentQuestion = quiz[currentIndex];
    voiceService.speak(
      `Question ${currentIndex + 1}: ${currentQuestion.question}. Options: ${currentQuestion.options.join(', ')}`
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {!showResults ? (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">
              Question {currentIndex + 1} of {quiz.length}
              <button 
                onClick={speakQuestion}
                className="ml-2 p-1 text-blue-600 hover:text-blue-800"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </button>
            </h3>
            <p className="text-gray-800">{quiz[currentIndex].question}</p>
          </div>
          
          <div className="space-y-2 mb-6">
            {quiz[currentIndex].options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswerSelect(currentIndex, option)}
                className={`w-full text-left p-3 rounded border ${
                  selectedAnswers[currentIndex] === option
                    ? 'bg-blue-100 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            {currentIndex < quiz.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => setShowResults(true)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Submit Quiz
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="text-center">
          <h3 className="text-xl font-medium mb-4">Quiz Results</h3>
          <p className="text-lg mb-2">
            Score: {calculateScore()} out of {quiz.length} ({Math.round((calculateScore() / quiz.length) * 100)}%)
          </p>
          <button
            onClick={onComplete}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Another Quiz
          </button>
        </div>
      )}
    </div>
  );
}