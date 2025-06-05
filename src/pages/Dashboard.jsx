// pages/Dashboard.jsx
import { useState } from 'react';
import DocumentUpload from '../components/DocumentUpload';
import FlashcardGenerator from '../components/FlashcardGenerator';
import StudyChatbot from '../components/StudyChatbot';
import QuizDisplay from '../components/QuizDisplay';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('upload');
  const [flashcards, setFlashcards] = useState([]);
  const [quiz, setQuiz] = useState('');
  const [summary, setSummary] = useState('');
  const { currentUser } = useAuth();

  const handleContentGenerated = (type, content) => {
    if (type === 'flashcards') {
      setFlashcards(content);
      setActiveTab('flashcards');
    } else if (type === 'summary') {
      setSummary(content);
      setActiveTab('summary');
    } else if (type === 'quiz') {
      setQuiz(content);
      setActiveTab('quiz');
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">StudyBuddy AI Dashboard</h1>
      
      {currentUser ? (
        <p className="mb-4 text-sm sm:text-base">Welcome back, {currentUser.displayName || currentUser.email}!</p>
      ) : (
        <p className="mb-4 text-sm sm:text-base">Welcome! Sign in to save your progress.</p>
      )}

      {/* Responsive Tab Navigation */}
      <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-hide">
        <div className="flex space-x-1 sm:space-x-2">
          {[
            { id: 'upload', label: 'Upload Content' },
            { id: 'flashcards', label: `Flashcards ${flashcards.length > 0 ? `(${flashcards.length})` : ''}` },
            { id: 'quiz', label: `Quiz ${quiz.length > 0 ? `(${quiz.length})` : ''}` },
            { id: 'summary', label: 'Summary' },
            { id: 'chat', label: 'Study Chatbot' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={(tab.id === 'flashcards' && flashcards.length === 0) || (tab.id === 'quiz' && quiz.length === 0) || (tab.id === 'summary' && !summary)}
              className={`px-3 py-2 text-xs sm:text-sm rounded-t-lg whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white border-t border-l border-r border-gray-200 font-medium text-blue-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } ${
                (tab.id === 'flashcards' && flashcards.length === 0) || (tab.id === 'quiz' && quiz.length === 0) || (tab.id === 'summary' && !summary)
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        {activeTab === 'upload' && (
          <DocumentUpload onContentGenerated={handleContentGenerated} />
        )}
        {activeTab === 'flashcards' && (
          <FlashcardGenerator flashcards={flashcards} />
        )}
         {activeTab === 'quiz' && (
          <QuizDisplay quiz={quiz} />
        )}
        {activeTab === 'summary' && (
          <div>
            <h2 className="text-xl sm:text-2xl font-medium mb-4">Content Summary</h2>
            <div className="prose max-w-none text-sm sm:text-base">
              <p className="whitespace-pre-line">{summary}</p>
            </div>
          </div>
        )}
        {activeTab === 'chat' && <StudyChatbot />}
      </div>
    </div>
  );
}