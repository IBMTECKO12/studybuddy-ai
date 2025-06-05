// /App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
// import History from './pages/History';
import Quizzes from './pages/Quizzes';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import Login from './pages/Login'; // Add this import
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              {/* <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} /> */}
              <Route path="/quizzes" element={<PrivateRoute><Quizzes /></PrivateRoute>} />
              <Route path="/documents" element={<PrivateRoute><Documents /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;