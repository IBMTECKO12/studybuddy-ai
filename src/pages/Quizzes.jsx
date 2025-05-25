import { useState, useEffect } from "react";
import QuizGenerator from "../components/QuizGenerator";
import { useAuth } from "../context/AuthContext";
import { getUserData, saveUserData } from "../services/firebase";

export default function Quizzes() {
  const { currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuizIndex, setActiveQuizIndex] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const loadQuizzes = async () => {
      try {
        const userData = await getUserData(currentUser.uid);
        if (userData?.quizzes) {
          setQuizzes(userData.quizzes);
        }
      } catch (error) {
        console.error("Error loading quizzes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizzes();
  }, [currentUser]);

  const handleQuizGenerated = async (newQuiz) => {
    const updatedQuizzes = [...quizzes, {
      id: Date.now().toString(),
      title: `Quiz ${quizzes.length + 1}`,
      questions: newQuiz,
      createdAt: new Date().toISOString()
    }];
    
    setQuizzes(updatedQuizzes);
    
    if (currentUser) {
      try {
        await saveUserData(currentUser.uid, { quizzes: updatedQuizzes });
      } catch (error) {
        console.error("Error saving quiz:", error);
      }
    }
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: answer
    });
  };

  const calculateScore = () => {
    if (activeQuizIndex === null || !quizzes[activeQuizIndex]) return 0;
    
    const quiz = quizzes[activeQuizIndex];
    let correct = 0;
    
    quiz.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    
    return Math.round((correct / quiz.questions.length) * 100);
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading your quizzes...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Quizzes</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QuizGenerator onQuizGenerated={handleQuizGenerated} />
          
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-4">Your Quiz Library</h2>
            {quizzes.length === 0 ? (
              <p className="text-gray-500">No quizzes yet. Generate one!</p>
            ) : (
              <ul className="space-y-2">
                {quizzes.map((quiz, index) => (
                  <li key={quiz.id}>
                    <button
                      onClick={() => setActiveQuizIndex(index)}
                      className={`w-full text-left p-2 rounded ${activeQuizIndex === index ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                    >
                      {quiz.title} - {quiz.questions.length} questions
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-2">
          {activeQuizIndex !== null && quizzes[activeQuizIndex] ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-medium mb-4">
                {quizzes[activeQuizIndex].title}
              </h2>
              
              <div className="space-y-6">
                {quizzes[activeQuizIndex].questions.map((question, qIndex) => (
                  <div key={qIndex} className="border-b pb-4">
                    <h3 className="font-medium mb-2">{question.question}</h3>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center">
                          <input
                            type="radio"
                            id={`q${qIndex}-o${oIndex}`}
                            name={`question-${qIndex}`}
                            checked={userAnswers[qIndex] === option}
                            onChange={() => handleAnswerSelect(qIndex, option)}
                            className="mr-2"
                          />
                          <label htmlFor={`q${qIndex}-o${oIndex}`}>{option}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {Object.keys(userAnswers).length === quizzes[activeQuizIndex].questions.length && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium mb-2">Quiz Results</h3>
                  <p>Your score: {calculateScore()}%</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              {quizzes.length > 0 
                ? "Select a quiz from your library" 
                : "Generate your first quiz to get started"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}