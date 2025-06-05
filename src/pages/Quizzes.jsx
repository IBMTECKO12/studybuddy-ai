// pages/Quizzes.jsx
import { useState } from 'react';
import QuizGenerator from '../components/QuizGenerator';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Quizzes() {
  const { currentUser } = useAuth();
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  

  const handleQuizGenerated = (quiz) => {
    setGeneratedQuiz(quiz);
    setUserAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
  };

  const handleAnswerSelect = (questionIndex, selectedAnswer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedAnswer
    }));
  };

  const calculateScore = () => {
    if (!generatedQuiz) return 0;
    
    let correct = 0;
    generatedQuiz.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    
    return Math.round((correct / generatedQuiz.length) * 100);
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
  };

  const resetQuiz = () => {
    setGeneratedQuiz(null);
    setUserAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < generatedQuiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Quiz Center</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quiz Generator Panel */}
        <div className="order-2 lg:order-1">
          <QuizGenerator onQuizGenerated={handleQuizGenerated} />
        </div>
        
        {/* Quiz Display Area */}
        <div className="order-1 lg:order-2">
          {generatedQuiz ? (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Generated Quiz</h2>
                <button 
                  onClick={resetQuiz}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Create New Quiz
                </button>
              </div>
              
              {/* Progress indicator */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">
                    Question {currentQuestionIndex + 1} of {generatedQuiz.length}
                  </span>
                  <span className="text-sm text-gray-600">
                    {Object.keys(userAnswers).length}/{generatedQuiz.length} answered
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${((currentQuestionIndex + 1) / generatedQuiz.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Question */}
              <div className="mb-6">
                <h3 className="font-medium mb-3 text-sm sm:text-base">
                  {generatedQuiz[currentQuestionIndex].question}
                </h3>
                <div className="space-y-2">
                  {generatedQuiz[currentQuestionIndex].options.map((option, optionIndex) => (
                    <div 
                      key={optionIndex} 
                      className={`p-2 rounded-md border cursor-pointer transition-colors ${
                        userAnswers[currentQuestionIndex] === option
                          ? isSubmitted
                            ? option === generatedQuiz[currentQuestionIndex].correctAnswer
                              ? 'bg-green-100 border-green-500'
                              : 'bg-red-100 border-red-500'
                            : 'bg-blue-50 border-blue-500'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => !isSubmitted && handleAnswerSelect(currentQuestionIndex, option)}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border mr-2 flex-shrink-0 ${
                          userAnswers[currentQuestionIndex] === option
                            ? isSubmitted
                              ? option === generatedQuiz[currentQuestionIndex].correctAnswer
                                ? 'bg-green-500 border-green-600'
                                : 'bg-red-500 border-red-600'
                              : 'bg-blue-500 border-blue-600'
                            : 'border-gray-300'
                        }`}></div>
                        <span className="text-sm sm:text-base">{option}</span>
                        {isSubmitted && option === generatedQuiz[currentQuestionIndex].correctAnswer && (
                          <span className="ml-auto text-xs text-green-600 font-medium">Correct Answer</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={goToPrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`px-4 py-2 rounded-md ${
                    currentQuestionIndex === 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>
                
                {currentQuestionIndex < generatedQuiz.length - 1 ? (
                  <button
                    onClick={goToNextQuestion}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Next
                  </button>
                ) : !isSubmitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(userAnswers).length !== generatedQuiz.length}
                    className={`px-4 py-2 rounded-md ${
                      Object.keys(userAnswers).length === generatedQuiz.length
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    Submit Quiz
                  </button>
                ) : null}
              </div>
              
              {/* Results Display */}
              {isSubmitted && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium mb-2 text-center">Quiz Results</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold">Score: {calculateScore()}%</p>
                      <p className="text-sm text-gray-600">
                        {Object.values(userAnswers).filter((ans, i) => ans === generatedQuiz[i].correctAnswer).length} / {generatedQuiz.length} correct
                      </p>
                    </div>
                    <button
                      onClick={resetQuiz}
                      className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
              <div className="text-gray-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="mt-2">Generate a quiz to get started</p>
              </div>
              <p className="text-sm text-gray-500">
                Enter any topic to create a custom quiz (e.g., "React Hooks" or "Photosynthesis")
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}