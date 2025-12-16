import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import the Logic (Auth Context)
import { AuthProvider } from './context/AuthContext';

// Import the Pages we just built
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// A simple Dashboard placeholder (We will build the real one later)
const Dashboard = () => (
  <div className="min-h-screen flex items-center justify-center bg-green-50">
    <div className="text-center p-10 bg-white shadow-lg rounded-xl">
      <h1 className="text-4xl font-bold text-green-600 mb-4">🎉 Success!</h1>
      <p className="text-xl text-gray-700">You have successfully logged in.</p>
      <p className="text-gray-500 mt-2">Welcome to the Dashboard.</p>
    </div>
  </div>
);

function App() {
  return (
    // 1. Wrap the app in AuthProvider so every page knows if user is logged in
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            {/* 2. Define the URLs */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;