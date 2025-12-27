import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Trash2, Check, Calendar, ShoppingCart, LogOut, Loader, Plus } from 'lucide-react';
import api from '../services/api';

// --- UNIT CONVERSION HELPER ---
const convertToMetric = (amount, originalUnit) => {
  const unit = (originalUnit || '').toLowerCase();

  if (['oz', 'ounce', 'ounces'].some(u => unit.includes(u))) {
    return { q: Math.round(amount * 28.35), u: 'g' };
  }
  if (['lb', 'pound', 'pounds'].some(u => unit.includes(u))) {
    const grams = amount * 453.6;
    if (grams >= 1000) return { q: Number((grams / 1000).toFixed(2)), u: 'kg' };
    return { q: Math.round(grams), u: 'g' };
  }
  if (['cup', 'cups'].some(u => unit.includes(u))) {
    return { q: Math.round(amount * 237), u: 'ml' };
  }
  if (['tbsp', 'tablespoon', 'tablespoons'].some(u => unit.includes(u))) {
    return { q: Math.round(amount * 15), u: 'ml' };
  }
  if (['tsp', 'teaspoon', 'teaspoons'].some(u => unit.includes(u))) {
    return { q: Math.round(amount * 5), u: 'ml' };
  }
  if (['fl oz', 'fluid ounce'].some(u => unit.includes(u))) {
    return { q: Math.round(amount * 29.57), u: 'ml' };
  }
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
  const [buyDetails, setBuyDetails] = useState({
    quantity: 1,
    unit: 'pcs',
    expiryDate: '',
    category: 'Other'
  });

  // ➕ Custom item state
  const [newItem, setNewItem] = useState({
    name: '',
    amount: 1,
    unit: 'pcs'
  });

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

    setBuyDetails({
      quantity: q,
      unit: u,
      expiryDate: '',
      category: 'Other'
    });
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
      alert(`${selectedItem.name} moved to Pantry!`);
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

  // ➕ Add custom item handler
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm border-b border-green-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Package className="h-6 w-6 text-green-600" />
            <span className="text-2xl font-extrabold text-green-700">PantryAI</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-green-600 font-bold text-sm">
              Dashboard
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-600 text-sm font-semibold">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Shopping Lists</h1>
            <p className="text-gray-500">Track what you need, move it to pantry when bought.</p>
          </div>
        </div>

        {lists.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow border border-gray-100">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-600">No active lists</h3>
            <p className="text-gray-400">Generate a recipe to create a shopping list!</p>
            <button onClick={() => navigate('/dashboard')} className="mt-4 text-green-600 font-bold hover:underline">
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {lists.map(list => (
              <div key={list._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-gray-800">{list.name}</h3>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {list.items.length} Items
                  </span>
                </div>

                {/* ➕ Add Custom Item Row */}
                <div className="px-6 py-3 border-b bg-white flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Add item..."
                    className="flex-1 p-2 border rounded-lg text-sm"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    className="w-20 p-2 border rounded-lg text-sm"
                    value={newItem.amount}
                    onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                  />
                  <select
                    className="p-2 border rounded-lg text-sm"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  >
                    <option value="pcs">pcs</option>
                    <option value="pack">pack</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="ml">ml</option>
                  </select>
                  <button
                    onClick={() => handleAddCustomItem(list._id)}
                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="divide-y divide-gray-50">
                  {list.items.length === 0 && (
                    <div className="p-6 text-center text-gray-400 text-sm">
                      All items bought! Great job.
                    </div>
                  )}

                  {list.items.map(item => (
                    <div key={item._id} className="p-4 flex items-center justify-between hover:bg-green-50/30 transition-colors">
                      <div className="flex items-center gap-4">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        )}
                        <div>
                          <div className="font-bold text-gray-800 capitalize">{item.name}</div>
                          <div className="text-xs text-gray-500">Need: {item.amount} {item.unit}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleBoughtClick(list._id, item)}
                          className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-200"
                        >
                          <Check className="w-4 h-4" /> Bought
                        </button>
                        <button
                          onClick={() => handleDeleteItem(list._id, item._id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
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

      {/* Modal */}
      {modalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-2">Add to Pantry</h3>
            <p className="text-sm text-gray-500 mb-6">
              Confirm details for <span className="font-bold capitalize">{selectedItem.name}</span>
            </p>

            <form onSubmit={confirmPurchase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    required
                    className="w-full p-3 bg-gray-50 border rounded-xl font-bold"
                    value={buyDetails.quantity}
                    onChange={(e) => setBuyDetails({ ...buyDetails, quantity: e.target.value })}
                  />
                  <select
                    className="bg-gray-100 px-4 py-3 rounded-xl border font-bold"
                    value={buyDetails.unit}
                    onChange={(e) => setBuyDetails({ ...buyDetails, unit: e.target.value })}
                  >
                    <option value="pcs">pcs</option>
                    <option value="pack">pack</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Expiry Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full p-3 border-2 border-green-100 rounded-xl"
                  value={buyDetails.expiryDate}
                  onChange={(e) => setBuyDetails({ ...buyDetails, expiryDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                <select
                  className="w-full p-3 bg-gray-50 border rounded-xl"
                  value={buyDetails.category}
                  onChange={(e) => setBuyDetails({ ...buyDetails, category: e.target.value })}
                >
                  <option>Other</option>
                  <option>Vegetable</option>
                  <option>Fruit</option>
                  <option>Dairy</option>
                  <option>Grain</option>
                  <option>Meat</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold">
                  Confirm & Move
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
