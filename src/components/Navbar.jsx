import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/firebase';
import LoadingSpinner from './LoadingSpinner';

export default function Navbar() {
  const { currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
         <img src="/StudyBuddy AI.png" alt="StudyBuddy AI Logo" className="h-10 w-10 ml-4" />
          <Link to="/" className="text-xl font-bold text-blue-600 whitespace-nowrap">
            StudyBuddy AI
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <Link to="/" className="px-3 py-2 text-sm lg:text-base hover:text-blue-600">Dashboard</Link>
            {currentUser && (
              <>
                <Link to="/history" className="px-3 py-2 text-sm lg:text-base hover:text-blue-600">History</Link>
                <Link to="/quizzes" className="px-3 py-2 text-sm lg:text-base hover:text-blue-600">Quizzes</Link>
                <Link to="/documents" className="px-3 py-2 text-sm lg:text-base hover:text-blue-600">Documents</Link>
                <Link to="/settings" className="px-3 py-2 text-sm lg:text-base hover:text-blue-600">Settings</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center ml-4">
            {currentUser ? (
              <button
                onClick={logout}
                className="px-3 py-1.5 text-sm lg:text-base bg-gray-100 rounded hover:bg-gray-200"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 text-sm lg:text-base bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-4 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            
            {currentUser && (
              <>
                <Link
                  to="/quizzes"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Quizzes
                </Link>
                <Link
                  to="/documents"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Documents
                </Link>
                <Link
                  to="/settings"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <Link
                  to="/history"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  History
                </Link>
              </>
            )}
            
            <div className="pt-2 border-t">
              {currentUser ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}