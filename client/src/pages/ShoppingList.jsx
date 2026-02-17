import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Trash2, Check,ChefHat, ShoppingCart, LogOut, Loader, Plus, X } from 'lucide-react';
import api from '../services/api';
import '../css/ShoppingList.css';

const convertToMetric = (amount, originalUnit) => {
  const unit = (originalUnit || '').toLowerCase();
  const amt = parseFloat(amount) || 0;

  if (['oz', 'ounce'].some(u => unit.includes(u))) return { q: Math.round(amt * 28.35), u: 'g' };
  if (['lb', 'pound'].some(u => unit.includes(u))) return { q: Math.round(amt * 453.6), u: 'g' };
  if (['cup'].some(u => unit.includes(u))) return { q: Math.round(amt * 237), u: 'ml' };
  if (['l', 'liter', 'ml', 'g', 'kg', 'pcs'].includes(unit)) return { q: amt, u: unit };

  return { q: amt, u: 'pcs' };
};

const ShoppingList = () => {
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);
  const [buyDetails, setBuyDetails] = useState({ quantity: 1, unit: 'pcs', expiryDate: '', category: 'Other' });

  const [newItem, setNewItem] = useState({ name: '', amount: 1, unit: 'pcs' });

  const fetchLists = async () => {
    try {
      const res = await api.get('/shopping-lists');
      setLists(res.data);
    } catch (err) {
      console.error("Failed to fetch lists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLists(); }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const openPurchaseModal = (listId, item) => {
    setSelectedListId(listId);
    setSelectedItem(item);
    const { q, u } = convertToMetric(item.amount, item.unit);
    setBuyDetails({ quantity: q, unit: u, expiryDate: '', category: 'Other' });
    setModalOpen(true);
  };

  const Navbar = () => (
    <nav className="sl-navbar">
      <div className="sl-nav-content">
        <div className="sl-nav-logo" onClick={() => navigate('/dashboard')}>
          <div className="sl-icon-box">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
             <span className="block text-lg font-extrabold text-white leading-none">PantryAI</span>
             <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Shopping</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white font-bold text-sm transition-colors">
            Dashboard
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 font-bold text-sm transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </nav>
  );

  const PurchaseModal = () => {
    if (!modalOpen || !selectedItem) return null;
    
    const handleConfirm = async (e) => {
      e.preventDefault();
      if (!buyDetails.expiryDate) return alert("Please set an expiry date!");
      try {
        await api.post('/inventory', {
          name: selectedItem.name,
          ...buyDetails
        });
        await api.delete(`/shopping-lists/${selectedListId}/items/${selectedItem._id}`);
        fetchLists();
        setModalOpen(false);
      } catch (err) {
        alert("Error moving item.");
      }
    };

    return (
      <div className="sl-modal-overlay">
        <div className="sl-modal-content animate-fade-in-up">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">Add to Pantry</h3>
              <p className="text-sm text-gray-400">Buying <span className="text-emerald-400 font-bold">{selectedItem.name}</span></p>
            </div>
            <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20}/></button>
          </div>

          <form onSubmit={handleConfirm} className="space-y-4">
            <div>
              <label className="sl-label">Quantity & Unit</label>
              <div className="flex gap-2">
                <input type="number" step="any" required className="sl-input flex-1"
                  value={buyDetails.quantity} onChange={(e) => setBuyDetails({ ...buyDetails, quantity: e.target.value })}
                />
                <select className="sl-input w-24 cursor-pointer"
                  value={buyDetails.unit} onChange={(e) => setBuyDetails({ ...buyDetails, unit: e.target.value })}
                >
                  <option>pcs</option><option>kg</option><option>g</option><option>L</option><option>ml</option>
                </select>
              </div>
            </div>

            <div>
              <label className="sl-label">Expiry Date</label>
              <input type="date" required className="sl-input w-full [color-scheme:dark]"
                value={buyDetails.expiryDate} onChange={(e) => setBuyDetails({ ...buyDetails, expiryDate: e.target.value })}
              />
            </div>

            <div>
              <label className="sl-label">Category</label>
              <select className="sl-input w-full cursor-pointer"
                value={buyDetails.category} onChange={(e) => setBuyDetails({ ...buyDetails, category: e.target.value })}
              >
                <option>Other</option><option>Vegetable</option><option>Fruit</option><option>Dairy</option><option>Grain</option><option>Meat</option>
              </select>
            </div>

            <div className="pt-4 border-t border-gray-700 flex gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all">Confirm</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) return <div className="sl-page justify-center items-center"><Loader className="animate-spin text-emerald-500 w-12 h-12" /></div>;

  return (
    <div className="sl-page">
      <div className="sl-bg-layer sl-bg-image"></div>
      <div className="sl-bg-layer sl-bg-gradient"></div>

      <Navbar />

      <main className="sl-main">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/20">
            <ShoppingCart className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Shopping Lists</h1>
            <p className="text-gray-400">Track essentials and restock your pantry.</p>
          </div>
        </div>

        {lists.length === 0 ? (
          <div className="sl-card p-12 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
               <ShoppingCart className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No active lists</h3>
            <p className="text-gray-500">Generate a recipe or create a list to get started.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {lists.map(list => (
              <div key={list._id} className="sl-card animate-fade-in-up">
                
                <div className="sl-card-header">
                  <h3 className="text-xl font-bold text-white">{list.name}</h3>
                  <span className="sl-badge">{list.items.length} Items</span>
                </div>

                <div className="sl-input-row">
                  <input type="text" placeholder="Add custom item..." className="sl-input flex-[2] min-w-[140px]"
                    value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                  <div className="flex gap-2 flex-1">
                    <input type="number" className="sl-input w-20 text-center"
                      value={newItem.amount} onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                    />
                    <select className="sl-input flex-1 cursor-pointer"
                      value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    >
                      <option>pcs</option><option>kg</option><option>g</option><option>L</option><option>ml</option>
                    </select>
                    <button 
                      onClick={async () => {
                        if(!newItem.name) return;
                        await api.post(`/shopping-lists/${list._id}/items`, newItem);
                        setNewItem({ name: '', amount: 1, unit: 'pcs' });
                        fetchLists();
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors"
                    >
                      <Plus size={20}/>
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-800">
                  {list.items.map(item => (
                    <div key={item._id} className="sl-item-row group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                           {item.image ? <img src={item.image} alt="Loading" className="w-full h-full object-cover rounded-lg"/> : <Package className="text-gray-500 w-5 h-5"/>}
                        </div>
                        <div>
                          <div className="font-bold text-gray-200 group-hover:text-white transition-colors">{item.name}</div>
                          <div className="text-xs text-emerald-500 font-mono">{item.amount} {item.unit}</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button onClick={() => openPurchaseModal(list._id, item)} className="sl-btn-action sl-btn-buy">
                          <Check size={14}/> Bought
                        </button>
                        <button onClick={async () => {
                          if(window.confirm('Delete?')) {
                             await api.delete(`/shopping-lists/${list._id}/items/${item._id}`);
                             fetchLists();
                          }
                        }} className="sl-btn-action sl-btn-delete">
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </div>
                  ))}
                  {list.items.length === 0 && <div className="p-6 text-center text-gray-500 text-sm">List is empty.</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <PurchaseModal />
    </div>
  );
};

export default ShoppingList;