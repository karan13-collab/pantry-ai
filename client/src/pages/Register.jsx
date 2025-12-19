import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    age: '',
    height: '',
    weight: '',
    gender: 'male',
    activityLevel: 'moderate'
  });

  const [error, setError] = useState('');

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-600">Create Account</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
        
        <form onSubmit={onSubmit} className="space-y-4">
   
          <input type="text" name="username" placeholder="Username" onChange={onChange} className="w-full p-2 border rounded" required />
          <input type="email" name="email" placeholder="Email" onChange={onChange} className="w-full p-2 border rounded" required />
          <input type="password" name="password" placeholder="Password" onChange={onChange} className="w-full p-2 border rounded" required />
          
       
          <div className="grid grid-cols-2 gap-4">
            <input type="number" name="age" placeholder="Age" onChange={onChange} className="w-full p-2 border rounded" required />
            <select name="gender" onChange={onChange} className="w-full p-2 border rounded">
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" name="height" placeholder="Height (cm)" onChange={onChange} className="w-full p-2 border rounded" required />
            <input type="number" name="weight" placeholder="Weight (kg)" onChange={onChange} className="w-full p-2 border rounded" required />
          </div>

          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Register</button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account? <Link to="/" className="text-blue-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;