import React, { useContext } from 'react'; // 👈 Added useContext here
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext'; // 👈 Import AuthContext
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RecipeSuggestion from './pages/RecipeSuggestion';
import ShoppingList from './pages/ShoppingList'; 
import ForgotPassword from './pages/ForgotPassword';

const PrivateRoute = ({ children }) => {
  // 👇 SECURITY UPGRADE: Read from the secure Context instead of localStorage 👇
  const { user, loading } = useContext(AuthContext);

  // Give the browser a fraction of a second to check the HttpOnly cookie
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-emerald-400">
        Authenticating Secure Session...
      </div>
    );
  }

  // Once loading is done, if we have a user, let them in. Otherwise, kick to login.
  return user ? children : <Navigate to="/" />;
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