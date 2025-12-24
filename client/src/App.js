import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Import Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RecipeSuggestion from './pages/RecipeSuggestion'; // The new AI Chef Page
import ShoppingList from './pages/ShoppingList'; // The new List Manager Page

// --- PROTECTION COMPONENT ---
// This checks if a user is logged in. If not, it kicks them back to Login.
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
          <Routes>
            
            {/* PUBLIC ROUTES (Anyone can see these) */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* PROTECTED ROUTES (Must be logged in) */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />

            <Route 
              path="/recipe-suggestion" 
              element={
                <PrivateRoute>
                  <RecipeSuggestion />
                </PrivateRoute>
              } 
            />

            <Route 
              path="/shopping-list" 
              element={
                <PrivateRoute>
                  <ShoppingList />
                </PrivateRoute>
              } 
            />

            {/* Catch-all: If user types a random URL, send to Login */}
            <Route path="*" element={<Navigate to="/" />} />

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;