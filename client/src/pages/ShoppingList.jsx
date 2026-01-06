import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Trash2, Check, Calendar, ShoppingCart, LogOut, Loader, Plus, X } from 'lucide-react';
import api from '../services/api';

// --- UNIT CONVERSION HELPER ---
const convertToMetric = (amount, originalUnit) => {
  const unit = (originalUnit || '').toLowerCase();
  // ... (Same Logic)
  if (['oz', 'ounce', 'ounces'].some(u => unit.includes(u))) return { q: Math.round(amount * 28.35), u: 'g' };
  if (['lb', 'pound', 'pounds'].some(u => unit.includes(u))) {
    const grams = amount * 453.6;
    if (grams >= 1000) return { q: Number((grams / 1000).toFixed(2)), u: 'kg' };
    return { q: Math.round(grams), u: 'g' };
  }
  if (['cup', 'cups'].some(u => unit.includes(u))) return { q: Math.round(amount * 237), u: 'ml' };
  if (['tbsp', 'tablespoon', 'tablespoons'].some(u => unit.includes(u))) return { q: Math.round(amount * 15), u: 'ml' };
  if (['tsp', 'teaspoon', 'teaspoons'].some(u => unit.includes(u))) return { q: Math.round(amount * 5), u: 'ml' };
  if (['fl oz', 'fluid ounce'].some(u => unit.includes(u))) return { q: Math.round(amount * 29.57), u: 'ml' };
  if (['qt', 'quart', 'gallon', 'gal', 'pint'].some(u => unit.includes(u))) {
    if (unit.includes('gallon')) return { q: Number((amount * 3.78).toFixed(2)), u: 'L' };
    if (unit.includes('quart')) return { q: Number((amount * 0.94).toFixed(2)), u: 'L' };
    if (unit.includes('pint')) return { q: Math.round(amount * 473), u: 'ml' };
  }
  if (['kg', 'kilogram'].includes(unit)) return { q: amount, u: 'kg' };
  if (['g', 'gram'].includes(unit)) return { q: amount, u: 'g' };
  if (['l', 'liter'].includes(unit)) return { q: amount, u: 'L' };
  if (['ml', 'milliliter'].includes(unit)) return { q: amount, u: 'ml' };
  return { q: amount, u: 'pcs' };
};

const ShoppingList = () => {
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);

  // Buy form state
  const [buyDetails, setBuyDetails] = useState({ quantity: 1, unit: 'pcs', expiryDate: '', category: 'Other' });

  // ➕ Custom item state
  const [newItem, setNewItem] = useState({ name: '', amount: 1, unit: 'pcs' });

  const fetchLists = async () => {
    try {
      const res = await api.get('/shopping-lists');
      setLists(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch lists", err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchLists(); }, []);

  const handleBoughtClick = (listId, item) => {
    setSelectedListId(listId);
    setSelectedItem(item);
    const { q, u } = convertToMetric(item.amount || 1, item.unit || '');
    setBuyDetails({ quantity: q, unit: u, expiryDate: '', category: 'Other' });
    setModalOpen(true);
  };

  const confirmPurchase = async (e) => {
    e.preventDefault();
    if (!buyDetails.expiryDate) return alert("Please set an expiry date!");
    try {
      await api.post('/inventory', {
        name: selectedItem.name,
        quantity: buyDetails.quantity,
        unit: buyDetails.unit,
        expiryDate: buyDetails.expiryDate,
        category: buyDetails.category
      });
      await api.delete(`/shopping-lists/${selectedListId}/items/${selectedItem._id}`);
      fetchLists();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error moving item. Try again.");
    }
  };

  const handleDeleteItem = async (listId, itemId) => {
    if (!window.confirm("Remove from list?")) return;
    try {
      await api.delete(`/shopping-lists/${listId}/items/${itemId}`);
      fetchLists();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleAddCustomItem = async (listId) => {
    if (!newItem.name.trim()) return alert("Enter item name");
    try {
      await api.post(`/shopping-lists/${listId}/items`, newItem);
      setNewItem({ name: '', amount: 1, unit: 'pcs' });
      fetchLists();
    } catch (err) {
      console.error(err);
      alert("Failed to add item");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader className="animate-spin text-blue-500 w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 relative selection:bg-blue-500/30">
      
      {/* --- BACKGROUND --- */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
             style={{ backgroundImage: `url('https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2070&auto=format&fit=crop')` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-950/90 to-gray-900/80"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Navbar */}
        <nav className="bg-black/40 backdrop-blur-xl sticky top-0 z-40 border-b border-white/5">
          <div className="max-w-6xl mx-auto px-4 h-20 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="bg-gradient-to-br from-gray-800 to-black p-2 rounded-xl border border-white/10 shadow-lg group-hover:border-emerald-500/50 transition-all">
                <Package className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                 <span className="text-xl font-extrabold text-white tracking-tight block leading-none">PantryAI</span>
                 <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Shopping</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white font-bold text-sm transition-colors">
                Dashboard
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm font-semibold transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4 py-8 w-full">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-emerald-500/20 p-4 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
              <ShoppingCart className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Shopping Lists</h1>
              <p className="text-slate-400">Track what you need, move it to pantry when bought.</p>
            </div>
          </div>

          {lists.length === 0 ? (
            <div className="text-center py-16 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
              <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                 <ShoppingCart className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white">No active lists</h3>
              <p className="text-slate-500 mb-6">Generate a recipe to create a shopping list!</p>
              <button onClick={() => navigate('/dashboard')} className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="grid gap-8">
              {lists.map(list => (
                <div key={list._id} className="bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                  
                  {/* List Header */}
                  <div className="bg-black/20 px-6 py-5 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-white tracking-tight">{list.name}</h3>
                    <span className="bg-white/5 text-slate-400 text-xs font-bold px-3 py-1 rounded-full border border-white/5 uppercase tracking-wider">
                      {list.items.length} Items
                    </span>
                  </div>

                  {/* ➕ Add Custom Item Row */}
                  <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex flex-col sm:flex-row gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Add custom item..."
                      className="flex-1 p-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-all placeholder-slate-600 w-full"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    />
                    <div className="flex gap-2 w-full sm:w-auto">
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        className="w-20 p-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 text-center"
                        value={newItem.amount}
                        onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                      />
                      <select
                        className="p-3 bg-black/40 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500 appearance-none px-4 cursor-pointer"
                        value={newItem.unit}
                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      >
                        <option value="pcs">pcs</option><option value="kg">kg</option><option value="g">g</option><option value="L">L</option><option value="ml">ml</option>
                      </select>
                      <button
                        onClick={() => handleAddCustomItem(list._id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] border border-emerald-500/20"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-white/5">
                    {list.items.length === 0 && (
                      <div className="p-8 text-center text-slate-500 text-sm">
                        All items bought! Great job.
                      </div>
                    )}

                    {list.items.map(item => (
                      <div key={item._id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-4">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-black/50" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center"><Package className="text-slate-600 w-6 h-6"/></div>
                          )}
                          <div>
                            <div className="font-bold text-slate-200 capitalize group-hover:text-white transition-colors">{item.name}</div>
                            <div className="text-xs text-slate-500 font-mono">Need: <span className="text-emerald-400">{item.amount} {item.unit}</span></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleBoughtClick(list._id, item)}
                            className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-lg hover:shadow-emerald-900/20"
                          >
                            <Check className="w-4 h-4" /> Bought
                          </button>
                          <button
                            onClick={() => handleDeleteItem(list._id, item._id)}
                            className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* --- MODAL (Dark Theme) --- */}
        {modalOpen && selectedItem && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-md w-full p-6 relative">
              <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                 <X className="w-5 h-5"/>
              </button>
              
              <h3 className="text-xl font-bold mb-2 text-white">Add to Pantry</h3>
              <p className="text-sm text-slate-400 mb-6">
                Confirm details for <span className="font-bold text-emerald-400 capitalize">{selectedItem.name}</span>
              </p>

              <form onSubmit={confirmPurchase} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Quantity</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      required
                      className="w-full p-3 bg-black/40 border border-slate-700 rounded-xl text-white font-bold focus:border-emerald-500 focus:outline-none transition-all"
                      value={buyDetails.quantity}
                      onChange={(e) => setBuyDetails({ ...buyDetails, quantity: e.target.value })}
                    />
                    <select
                      className="bg-black/40 px-4 py-3 rounded-xl border border-slate-700 font-bold text-slate-300 focus:border-emerald-500 focus:outline-none transition-all"
                      value={buyDetails.unit}
                      onChange={(e) => setBuyDetails({ ...buyDetails, unit: e.target.value })}
                    >
                      <option value="pcs">pcs</option><option value="pack">pack</option><option value="kg">kg</option><option value="g">g</option><option value="L">L</option><option value="ml">ml</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full p-3 bg-black/40 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-all [color-scheme:dark]"
                    value={buyDetails.expiryDate}
                    onChange={(e) => setBuyDetails({ ...buyDetails, expiryDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Category</label>
                  <select
                    className="w-full p-3 bg-black/40 border border-slate-700 rounded-xl text-slate-300 focus:border-emerald-500 focus:outline-none transition-all"
                    value={buyDetails.category}
                    onChange={(e) => setBuyDetails({ ...buyDetails, category: e.target.value })}
                  >
                    <option>Other</option><option>Vegetable</option><option>Fruit</option><option>Dairy</option><option>Grain</option><option>Meat</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-800 mt-6">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all">
                    Confirm & Move
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;