// /components/Navbar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/firebase';

export default function Navbar() {
  const { currentUser } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">
          StudyBuddy AI
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/" className="hover:text-blue-600">Dashboard</Link>
          {currentUser && (
            <>
              <Link to="/flashcards" className="hover:text-blue-600">Flashcards</Link>
              <Link to="/quizzes" className="hover:text-blue-600">Quizzes</Link>
              <Link to="/documents" className="hover:text-blue-600">Documents</Link>
              <Link to="/settings" className="hover:text-blue-600">Settings</Link>
            </>
          )}
          
          {currentUser ? (
            <button 
              onClick={logout}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              Logout
            </button>
          ) : (
            <Link 
              to="/login" 
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}