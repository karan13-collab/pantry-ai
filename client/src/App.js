import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
        
        {/* Temporary Navigation Bar (So we can test) */}
        <nav className="p-4 bg-white shadow-md flex justify-between">
          <h1 className="text-xl font-bold text-green-600">PantryAI</h1>
          <div className="space-x-4">
            <Link to="/" className="hover:text-green-600">Home</Link>
            <Link to="/login" className="hover:text-green-600">Login</Link>
            <Link to="/dashboard" className="hover:text-green-600">Dashboard</Link>
          </div>
        </nav>

        {/* This is where the pages will switch */}
        <div className="p-10">
          <Routes>
            <Route path="/" element={<h2 className="text-3xl font-bold">🏠 Welcome to the Home Page</h2>} />
            <Route path="/login" element={<h2 className="text-3xl font-bold text-blue-600">🔑 Login Page (Coming Soon)</h2>} />
            <Route path="/dashboard" element={<h2 className="text-3xl font-bold text-purple-600">📊 User Dashboard (Coming Soon)</h2>} />
          </Routes>
        </div>

      </div>
    </Router>
  );
}

export default App;