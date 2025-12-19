import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, AlertCircle, LogOut, Package, Search, ChefHat, Loader } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [newItem, setNewItem] = useState({ 
    name: '', quantity: 1, unit: 'pcs', expiryDate: '', category: 'Other' 
  });
  const [searchTerm, setSearchTerm] = useState('');

  // --- Fetch Data ---
  const fetchInventory = async () => {
    try {
      const res = await api.get('/inventory');
      setItems(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // --- AI Recipe Generator ---
  const handleGenerateRecipe = async () => {
    setGenerating(true);
    setRecipe(null); // Clear previous recipe
  
    // Get names of all items in pantry
    const ingredientList = items.map(item => item.name);
  
    try {
      const res = await api.post('/generate-recipe', { ingredients: ingredientList });
      setRecipe(res.data);
    } catch (err) {
      alert("Chef is busy! Try again later.");
    } finally {
      setGenerating(false);
    }
  };

  // --- Actions ---
  const handleAddItem = async (e) => {
    e.preventDefault(); 
    try {
      if(!newItem.name || !newItem.expiryDate) return;
      const res = await api.post('/inventory', newItem);
      setItems([...items, res.data]); 
      setNewItem({ name: '', quantity: 1, unit: 'pcs', expiryDate: '', category: 'Other' });
    } catch (err) {
      alert("Failed to add item");
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to remove this item?")) return;

    try {
      await api.delete(`/inventory/${id}`); 
      // Update UI immediately without reloading
      setItems(items.filter((item) => item._id !== id));
    } catch (err) {
      alert("Failed to delete item");
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const getExpiryStatus = (dateString) => {
    const today = new Date();
    const expiry = new Date(dateString);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { color: 'bg-red-100 text-red-700 border-red-200', text: 'Expired' };
    if (diffDays <= 3) return { color: 'bg-orange-100 text-orange-700 border-orange-200', text: 'Expiring Soon' };
    return { color: 'bg-green-100 text-green-700 border-green-200', text: 'Fresh' };
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 font-sans text-gray-800">
      
      {/* 1. Top Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-green-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-tr from-green-600 to-emerald-400 p-2 rounded-lg shadow-lg shadow-green-200">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-emerald-500 tracking-tight">
                  PantryAI
                </span>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-all text-sm font-semibold bg-white border border-gray-200 px-4 py-2 rounded-full hover:shadow-md hover:border-red-100"
            >
              <LogOut className="w-4 h-4" /> 
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8 md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Your Inventory</h2>
            <p className="mt-1 text-gray-500">Manage your household food items efficiently.</p>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4 md:mt-0 relative group">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search items..." 
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none w-full md:w-64 transition-all hover:border-green-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 3. Add Item Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-green-100/50 border border-white p-6 mb-8 transition-all hover:shadow-2xl hover:shadow-green-100/80">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="bg-green-100 p-1.5 rounded-md">
              <Plus className="w-5 h-5 text-green-700" />
            </div>
            Quick Add
          </h3>
          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Item Name</label>
              <input 
                type="text" placeholder="e.g. Avocado" required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Quantity</label>
              <div className="flex shadow-sm rounded-xl overflow-hidden">
                <input 
                  type="number" min="1" required
                  className="w-2/3 p-3 bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                />
                <select 
                  className="w-1/3 bg-gray-100 border-y border-r border-gray-200 text-sm text-gray-600 focus:outline-none cursor-pointer hover:bg-gray-200"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                >
                  <option>pcs</option><option>kg</option><option>L</option><option>pack</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Category</label>
              <select 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value})}
              >
                <option>Other</option><option>Vegetable</option><option>Fruit</option><option>Dairy</option><option>Grain</option><option>Meat</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Expiry Date</label>
              <input 
                type="date" required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none"
                value={newItem.expiryDate}
                onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
              />
            </div>

            <div className="md:col-span-12 flex justify-end mt-2">
               <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
                 <Plus className="w-5 h-5" /> Add to Pantry
               </button>
            </div>
          </form>
        </div>

        {/* 4. Inventory List & AI Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500 animate-pulse">Loading your pantry...</div>
          ) : (
            <div>
              {/* --- AI RECIPE SECTION (Pinned to Top) --- */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50/50 to-transparent">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <ChefHat className="text-orange-500" /> AI Chef
                  </h3>
                  <button 
                    onClick={handleGenerateRecipe}
                    disabled={generating || items.length === 0}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {generating ? <Loader className="animate-spin w-4 h-4" /> : "Suggest a Recipe"}
                  </button>
                </div>

                {/* The Recipe Card */}
                {recipe && (
                  <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-6 animate-fade-in mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-2xl font-bold text-gray-800">{recipe.title}</h4>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span className="bg-orange-50 px-3 py-1 rounded-full text-orange-600 font-semibold">{recipe.time}</span>
                          <span className="bg-green-50 px-3 py-1 rounded-full text-green-600 font-semibold">{recipe.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 bg-gray-50 p-4 rounded-xl text-gray-700 leading-relaxed whitespace-pre-line">
                      {recipe.instructions}
                    </div>
                  </div>
                )}
              </div>

              {/* --- TABLE SECTION (Scrollable) --- */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200">
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredItems.map((item) => {
                      const status = getExpiryStatus(item.expiryDate);
                      return (
                        <tr key={item._id} className="hover:bg-green-50/30 transition-colors group">
                          <td className="px-6 py-4 font-semibold text-gray-800">{item.name}</td>
                          <td className="px-6 py-4">
                            <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium border border-gray-200">
                              {item.category || 'Other'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 font-medium">{item.quantity} <span className="text-xs text-gray-400">{item.unit}</span></td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                              {status.text === 'Expired' && <AlertCircle className="w-3 h-3" />}
                              {status.text}
                              {status.text !== 'Fresh' && <span className="ml-1 opacity-75 font-normal">({new Date(item.expiryDate).toLocaleDateString()})</span>}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDeleteItem(item._id)}
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {!loading && filteredItems.length === 0 && (
                  <div className="p-16 text-center">
                    <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <Package className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Your pantry is empty</h3>
                    <p className="text-gray-500 mt-2 max-w-sm mx-auto">It looks a bit empty here! Start adding your groceries to track expiry dates.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default Dashboard;