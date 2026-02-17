import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RecipeSuggestion from './pages/RecipeSuggestion';
import ShoppingList from './pages/ShoppingList'; 
import ForgotPassword from './pages/ForgotPassword';

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
            
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

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
            <Route path="*" element={<Navigate to="/" />} />

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;