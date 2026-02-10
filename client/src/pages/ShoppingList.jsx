import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Trash2, Check, Calendar, ShoppingCart, LogOut, Loader, Plus, X, Tag } from 'lucide-react';
import api from '../services/api';
import '../css/ShoppingList.css'; // Import the CSS file

// --- UNIT CONVERSION HELPER ---
const convertToMetric = (amount, originalUnit) => {
  const unit = (originalUnit || '').toLowerCase();
  
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
      <div className="loading-screen">
        <Loader className="animate-spin text-blue-500 w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="shopping-page">
      
      {/* --- BACKGROUND --- */}
      <div className="bg-layer-image"></div>
      <div className="bg-layer-gradient"></div>
      <div className="bg-layer-noise"></div>

      <div className="page-content">
        
        {/* Navbar */}
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-logo-group" onClick={() => navigate('/dashboard')}>
              <div className="logo-icon-box">
                <Package className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                 <span className="logo-title">PantryAI</span>
                 <span className="logo-subtitle">Shopping</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <button onClick={() => navigate('/dashboard')} className="nav-link">
                Dashboard
              </button>
              <button onClick={handleLogout} className="btn-logout">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </nav>

        <main className="main-wrapper">
          <div className="page-header">
            <div className="header-icon-box">
              <ShoppingCart className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="page-title">Shopping Lists</h1>
              <p className="page-subtitle">Track what you need, move it to pantry when bought.</p>
            </div>
          </div>

          {lists.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-circle">
                 <ShoppingCart className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white">No active lists</h3>
              <p className="text-slate-500 mb-6">Generate a recipe to create a shopping list!</p>
              <button onClick={() => navigate('/dashboard')} className="btn-link-dashboard">
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="lists-grid">
              {lists.map(list => (
                <div key={list._id} className="list-card">
                  
                  {/* List Header */}
                  <div className="list-header">
                    <h3 className="list-name">{list.name}</h3>
                    <span className="item-count-badge">
                      {list.items.length} Items
                    </span>
                  </div>

                  {/* ➕ Add Custom Item Row */}
                  <div className="add-item-row">
                    <input
                      type="text"
                      placeholder="Add custom item (e.g. Soap)..."
                      className="input-custom-name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    />
                    <div className="add-inputs-group">
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        className="input-amount"
                        value={newItem.amount}
                        onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                      />
                      <select
                        className="input-unit-select"
                        value={newItem.unit}
                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      >
                        <option value="pcs">pcs</option><option value="kg">kg</option><option value="g">g</option><option value="L">L</option><option value="ml">ml</option>
                      </select>
                      <button
                        onClick={() => handleAddCustomItem(list._id)}
                        className="btn-add-custom"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="items-list">
                    {list.items.length === 0 && (
                      <div className="p-8 text-center text-slate-500 text-sm">
                        All items bought! Great job.
                      </div>
                    )}

                    {list.items.map(item => (
                      <div key={item._id} className="list-item-row group">
                        <div className="item-info-group">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="item-img" />
                          ) : (
                            <div className="item-placeholder"><Package className="text-slate-600 w-6 h-6"/></div>
                          )}
                          <div>
                            <div className="item-name">{item.name}</div>
                            <div className="item-meta">Need: <span>{item.amount} {item.unit}</span></div>
                          </div>
                        </div>
                        <div className="item-actions-group">
                          <button
                            onClick={() => handleBoughtClick(list._id, item)}
                            className="btn-bought"
                          >
                            <Check className="w-4 h-4" /> Bought
                          </button>
                          <button
                            onClick={() => handleDeleteItem(list._id, item._id)}
                            className="btn-delete"
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

        {/* --- MODAL --- */}
        {modalOpen && selectedItem && (
          <div className="modal-overlay">
            <div className="modal-card animate-fade-in">
              <button onClick={() => setModalOpen(false)} className="btn-close-modal">
                 <X className="w-5 h-5"/>
              </button>
              
              <h3 className="modal-title">Add to Pantry</h3>
              <p className="modal-desc">
                Confirm details for <span className="font-bold text-emerald-400 capitalize">{selectedItem.name}</span>
              </p>

              <form onSubmit={confirmPurchase}>
                <div className="form-group">
                  <label className="form-label">Quantity & Unit</label>
                  <div className="form-row">
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      required
                      className="modal-input"
                      value={buyDetails.quantity}
                      onChange={(e) => setBuyDetails({ ...buyDetails, quantity: e.target.value })}
                    />
                    <select
                      className="modal-select"
                      value={buyDetails.unit}
                      onChange={(e) => setBuyDetails({ ...buyDetails, unit: e.target.value })}
                    >
                      <option value="pcs">pcs</option><option value="pack">pack</option><option value="kg">kg</option><option value="g">g</option><option value="L">L</option><option value="ml">ml</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Calendar className="w-3 h-3" /> Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    className="modal-input"
                    value={buyDetails.expiryDate}
                    onChange={(e) => setBuyDetails({ ...buyDetails, expiryDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                     <Tag className="w-3 h-3"/> Category
                  </label>
                  <div className="select-wrapper">
                    <select
                      className="modal-input appearance-none"
                      style={{cursor: 'pointer'}}
                      value={buyDetails.category}
                      onChange={(e) => setBuyDetails({ ...buyDetails, category: e.target.value })}
                    >
                      <option>Other</option><option>Vegetable</option><option>Fruit</option><option>Dairy</option><option>Grain</option><option>Meat</option>
                    </select>
                    <div className="select-arrow">▼</div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-cancel">
                    Cancel
                  </button>
                  <button type="submit" className="btn-confirm">
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