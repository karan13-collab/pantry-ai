import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  AlertCircle,
  LogOut,
  Package,
  Search,
  ChefHat,
  Leaf,
  Heart,
  ShoppingCart,
  X,
  Copy,
  Check,
  User,
  Users,
  CheckCircle,
  XCircle,
  Calendar,
  Tag,
  AlertTriangle,
  Loader,
} from "lucide-react";
import api from "../services/api";
import UserProfile from "../components/userProfile";
import '../css/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("pantry");
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState(null);

  const [listModalOpen, setListModalOpen] = useState(false);
  const [itemToAdd, setItemToAdd] = useState(null);
  const [userLists, setUserLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [addingToList, setAddingToList] = useState(false);

  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    unit: "pcs",
    expiryDate: "",
    category: "Other",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resInventory = await api.get("/inventory");
        setItems(resInventory.data);
        try {
          const resHousehold = await api.get("/household/current");
          setHousehold(resHousehold.data);
        } catch (hErr) {
          setHousehold({ name: "My", joinCode: "----", currency: "EUR" });
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const inventoryTotals = items.reduce((acc, item) => {
    const key = item.name.trim().toLowerCase();
    const qty = parseFloat(item.quantity) || 0;
    acc[key] = (acc[key] || 0) + qty;
    return acc;
  }, {});

  const alertItems = items.filter((item) => {
    const isExpiring = new Date(item.expiryDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const key = item.name.trim().toLowerCase();
    const totalQty = inventoryTotals[key];
    const unit = item.unit ? item.unit.toLowerCase() : 'pcs';
    let isGlobalLowStock = false;
    if (['kg', 'l', 'liters', 'litres'].includes(unit)) {
       isGlobalLowStock = totalQty < 1; 
    } else {
       isGlobalLowStock = totalQty <= 1; 
    }
    return isGlobalLowStock || isExpiring;
  }).map((item) => {
    const isExpiring = new Date(item.expiryDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const key = item.name.trim().toLowerCase();
    const totalQty = inventoryTotals[key];
    const unit = item.unit ? item.unit.toLowerCase() : 'pcs';
    let isGlobalLowStock = false;
    if (['kg', 'l', 'liters', 'litres'].includes(unit)) isGlobalLowStock = totalQty < 1;
    else isGlobalLowStock = totalQty <= 1;
    let reason = "";
    if (isGlobalLowStock) reason = "Low Stock";
    if (isExpiring) reason = isGlobalLowStock ? "Low & Expiring" : "Expiring Soon";
    return { ...item, reason };
  });

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  const handleOpenChef = () => setShowStrategyModal(true);
  const handleGenerateRecipe = async (strategy) => {
    setShowStrategyModal(false);
    navigate("/recipe-suggestion", { state: { strategy } });
  };
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      if (!newItem.name || !newItem.expiryDate) return;
      const res = await api.post("/inventory", newItem);
      setItems([...items, res.data]);
      setNewItem({ name: "", quantity: 1, unit: "pcs", expiryDate: "", category: "Other" });
      showNotification("Item added successfully!", "success");
    } catch (err) {
      showNotification("Failed to add item", "error");
    }
  };
  const handleDeleteItem = async (id) => {
    if (!window.confirm("Remove item?")) return;
    try {
      await api.delete(`/inventory/${id}`);
      setItems(items.filter((item) => item._id !== id));
      showNotification("Item removed", "success");
    } catch (err) {
      showNotification("Failed to remove item", "error");
    }
  };
  const openAddToListModal = async (item) => {
    setItemToAdd(item);
    setNewListName("");
    try {
      const res = await api.get("/shopping-lists");
      setUserLists(res.data);
    } catch (err) { setUserLists([]); }
    setListModalOpen(true);
  };
  const handleAddToList = async (listId, listName) => {
    setAddingToList(true);
    try {
      const payload = { name: itemToAdd.name, amount: 1, unit: itemToAdd.unit || "pcs", image: null };
      await api.post(`/shopping-lists/${listId}/items`, payload);
      showNotification(`Added ${itemToAdd.name} to ${listName}`, "success");
      setListModalOpen(false);
    } catch (err) { showNotification("Failed to add item", "error"); } finally { setAddingToList(false); }
  };
  const handleCreateAndAdd = async () => {
    if (!newListName) return;
    setAddingToList(true);
    try {
      const res = await api.post("/shopping-lists", { name: newListName });
      const newListId = res.data._id;
      const payload = { name: itemToAdd.name, amount: 1, unit: itemToAdd.unit || "pcs", image: null };
      await api.post(`/shopping-lists/${newListId}/items`, payload);
      showNotification(`Created list & added ${itemToAdd.name}`, "success");
      setListModalOpen(false);
    } catch (err) { showNotification("Failed to create list", "error"); } finally { setAddingToList(false); }
  };
  const handleLogout = () => { localStorage.removeItem("token"); navigate("/"); };
  const copyToClipboard = () => {
    if (household?.joinCode) {
      navigator.clipboard.writeText(household.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showNotification("Join code copied!", "success");
    }
  };

  const getExpiryStatus = (dateString) => {
    const today = new Date();
    const expiry = new Date(dateString);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return { className: "dash-status status-danger", text: "Expired" };
    if (diffDays <= 3) return { className: "dash-status status-warn", text: "Expiring Soon" };
    return { className: "dash-status status-fresh", text: "Fresh" };
  };

  const filteredItems = items.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="dash-page">
      <div className="dash-bg-img"></div>
      <div className="dash-bg-overlay"></div>

      <div className="dash-content-wrapper">
        {notification && (
          <div className="dash-toast" style={{ borderColor: notification.type === 'error' ? '#ef4444' : '#10b981' }}>
            {notification.type === "error" ? <XCircle className="w-5 h-5 text-red-400" /> : <CheckCircle className="w-5 h-5 text-emerald-400" />}
            <span className="font-bold text-sm">{notification.message}</span>
          </div>
        )}

        <nav className="dash-nav">
          <div className="dash-nav-container">
            <div className="dash-brand" onClick={() => setActiveTab("pantry")}>
              <div className="dash-brand-icon">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="dash-brand-title">PantryAI</span>
            </div>

            <div className="dash-nav-items">
              {household?.joinCode && (
                <div className="dash-code-container">
                  <span className="dash-label" style={{marginBottom: '2px', alignSelf: 'flex-end'}}>
                    {household.name} Code
                  </span>
                  <button onClick={copyToClipboard} className="dash-code-btn">
                    {household.joinCode}
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              )}
              <button onClick={() => navigate("/shopping-list")} className="dash-nav-btn" title="Shopping List">
                <ShoppingCart className="w-5 h-5" />
              </button>
              <button onClick={handleLogout} className="dash-nav-btn">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </nav>

        <main className="dash-main">
          <div className="dash-tabs">
            <div className="dash-tab-box">
              <button onClick={() => setActiveTab("pantry")} className={`dash-tab-btn ${activeTab === "pantry" ? "active" : ""}`}>
                <Package className="w-4 h-4" /> Pantry
              </button>
              <button onClick={() => setActiveTab("profile")} className={`dash-tab-btn ${activeTab === "profile" ? "active" : ""}`}>
                <User className="w-4 h-4" /> Profile
              </button>
            </div>
          </div>

          {activeTab === "pantry" && (
            <div className="dash-fade-in">
              {alertItems.length > 0 && (
                <div className="dash-alert-widget">
                  <div className="dash-alert-header">
                    <AlertTriangle className="w-4 h-4" /> Needs Attention ({alertItems.length})
                  </div>
                  <div className="dash-alert-grid">
                    {alertItems.map((item) => (
                      <div key={item._id} className="dash-alert-card">
                        <div>
                          <div style={{fontWeight:'bold', color: '#e2e8f0'}}>{item.name}</div>
                          <div style={{fontSize:'0.65rem', color:'#f87171', fontWeight:'bold', textTransform:'uppercase'}}>
                            {item.reason} ({item.quantity} {item.unit})
                          </div>
                        </div>
                        <button onClick={() => openAddToListModal(item)} className="dash-nav-btn" title="Add to Shopping List" style={{border: '1px solid #7f1d1d'}}>
                          <Plus className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="dash-header-section">
                <div>
                  <h1 className="dash-page-title">{household ? household.name : "My"} Inventory</h1>
                  <p className="dash-subtitle">
                    <Users className="w-4 h-4 text-emerald-400" />
                    {household?.members ? `${household.members.length} Household Members` : "Loading..."}
                  </p>
                </div>
                <div className="dash-search-container">
                  <div className="dash-search-icon"><Search className="h-5 w-5" /></div>
                  <input
                    type="text"
                    placeholder="Search pantry..."
                    className="dash-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="dash-quick-add">
                <div className="dash-quick-title">
                  <div className="dash-brand-icon" style={{background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)'}}>
                    <Plus className="w-5 h-5 text-emerald-400" />
                  </div>
                  Quick Add
                </div>
                <form onSubmit={handleAddItem} className="dash-form-grid">
                  <div className="d-col-4">
                    <label className="dash-label">Item Name</label>
                    <input type="text" placeholder="e.g. Fresh Milk" required className="dash-input"
                      value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                  </div>
                  <div className="d-col-2">
                    <label className="dash-label">Qty & Unit</label>
                    <div style={{display:'flex', gap:'0.5rem'}}>
                      <input type="number" min="1" className="dash-input" style={{textAlign:'center'}}
                        value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} />
                      <select className="dash-input" value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}>
                        <option>pcs</option><option>kg</option><option>L</option>
                      </select>
                    </div>
                  </div>
                  <div className="d-col-3">
                    <label className="dash-label"><Tag className="w-3 h-3 inline mr-1"/> Category</label>
                    <select className="dash-input" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
                      <option>Other</option><option>Vegetable</option><option>Fruit</option><option>Dairy</option><option>Grain</option><option>Meat</option>
                    </select>
                  </div>
                  <div className="d-col-3">
                    <label className="dash-label"><Calendar className="w-3 h-3 inline mr-1"/> Expiry Date</label>
                    <input type="date" required className="dash-input" style={{colorScheme:'dark'}}
                      value={newItem.expiryDate} onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })} />
                  </div>
                  <div className="d-col-12" style={{display:'flex', justifyContent:'flex-end', marginTop:'0.5rem'}}>
                    <button className="dash-btn-primary">Add to Pantry</button>
                  </div>
                </form>
              </div>

              <div className="dash-table-card">
                <div className="dash-table-header">
                  <h3 style={{fontSize:'1.25rem', fontWeight:'bold', color:'white', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                    <ChefHat className="w-6 h-6 text-white" /> Pantry Stock
                  </h3>
                  <button onClick={handleOpenChef} disabled={items.length === 0} className="dash-ai-btn">
                    <ChefHat className="w-4 h-4" /> AI Suggestion
                  </button>
                </div>
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Item</th><th>Category</th><th>Qty</th><th>Expiry</th><th>Freshness</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => {
                        const status = getExpiryStatus(item.expiryDate);
                        return (
                          <tr key={item._id}>
                            <td style={{fontWeight:'bold', color:'#e2e8f0'}}>{item.name}</td>
                            <td><span style={{background:'rgba(255,255,255,0.05)', padding:'2px 8px', borderRadius:'99px', fontSize:'0.75rem', border:'1px solid rgba(255,255,255,0.05)'}}>{item.category}</span></td>
                            <td style={{fontFamily:'monospace', color:'#94a3b8'}}>{item.quantity} {item.unit}</td>
                            <td style={{fontFamily:'monospace', color:'#94a3b8'}}>{new Date(item.expiryDate).toLocaleDateString()}</td>
                            <td>
                              <span className={status.className}>
                                {status.text === "Expired" && <AlertCircle className="w-3 h-3" />} {status.text}
                              </span>
                            </td>
                            <td style={{textAlign:'right'}}>
                              <button onClick={() => handleDeleteItem(item._id)} className="dash-nav-btn hover:text-red-400 hover:bg-red-900/20">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {!loading && filteredItems.length === 0 && (
                    <div style={{padding:'4rem', textAlign:'center', color:'#64748b'}}>
                      <div style={{background:'rgba(255,255,255,0.05)', padding:'1rem', borderRadius:'50%', display:'inline-block', marginBottom:'1rem'}}>
                        <Package className="w-8 h-8" />
                      </div>
                      <h3>Pantry is Empty</h3>
                      <p>Add ingredients to unlock AI recipes.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {activeTab === "profile" && (
             <div className="dash-fade-in">
               <div className="dash-quick-add">
                  <UserProfile showNotification={showNotification} />
               </div>
             </div>
          )}
        </main>

        {showStrategyModal && (
          <div className="dash-modal-overlay">
            <div className="dash-modal dash-fade-in">
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1rem'}}>
                <h3 style={{fontSize:'1.25rem', fontWeight:'bold', color:'white'}}>Choose Chef's Goal</h3>
                <button onClick={() => setShowStrategyModal(false)} className="dash-modal-close"><X className="w-5 h-5" /></button>
              </div>
              <button onClick={() => handleGenerateRecipe("waste")} className="dash-strategy-btn">
                <div style={{padding:'0.5rem', background:'rgba(16, 185, 129, 0.1)', borderRadius:'50%', color:'#34d399'}}><Leaf className="w-6 h-6"/></div>
                <div><div style={{fontWeight:'bold', color:'#e2e8f0'}}>Maximize Fridge</div><div style={{fontSize:'0.75rem', color:'#94a3b8'}}>Use expiring food first.</div></div>
              </button>
              <button onClick={() => handleGenerateRecipe("health")} className="dash-strategy-btn">
                <div style={{padding:'0.5rem', background:'rgba(59, 130, 246, 0.1)', borderRadius:'50%', color:'#60a5fa'}}><Heart className="w-6 h-6"/></div>
                <div><div style={{fontWeight:'bold', color:'#e2e8f0'}}>Maximize Health</div><div style={{fontSize:'0.75rem', color:'#94a3b8'}}>Strict macros focus.</div></div>
              </button>
            </div>
          </div>
        )}

        {listModalOpen && itemToAdd && (
          <div className="dash-modal-overlay">
            <div className="dash-modal dash-fade-in">
              <button onClick={() => setListModalOpen(false)} className="dash-modal-close"><X className="w-5 h-5"/></button>
              <h3 style={{fontSize:'1.125rem', fontWeight:'bold', color:'white', marginBottom:'0.25rem'}}>Restock Item</h3>
              <p style={{color:'#94a3b8', fontSize:'0.875rem', marginBottom:'1.5rem'}}>Add <span style={{fontWeight:'bold', color:'#34d399'}}>{itemToAdd.name}</span> to...</p>
              
              {userLists.length > 0 && (
                <div className="dash-list-items">
                  <span className="dash-label">Your Lists</span>
                  {userLists.map(list => (
                    <button key={list._id} disabled={addingToList} onClick={() => handleAddToList(list._id, list.name)} className="dash-list-btn group">
                      <span style={{fontWeight:'500'}}>{list.name}</span>
                      <Plus className="w-4 h-4 text-gray-500 group-hover:text-emerald-400" />
                    </button>
                  ))}
                </div>
              )}

              <div style={{borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:'1rem'}}>
                <span className="dash-label">Create New List</span>
                <div style={{display:'flex', gap:'0.5rem'}}>
                  <input type="text" placeholder="e.g. Costco" className="dash-input" style={{padding:'0.5rem 1rem'}}
                    value={newListName} onChange={(e) => setNewListName(e.target.value)} />
                  <button onClick={handleCreateAndAdd} disabled={!newListName || addingToList} className="dash-btn-primary" style={{width:'auto', padding:'0.5rem 1rem'}}>
                    {addingToList ? <Loader className="w-4 h-4 dash-spin"/> : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;