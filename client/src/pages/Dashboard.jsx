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
  Calendar, // Added Calendar icon
  Tag       // Added Tag icon for category
} from "lucide-react";
import api from "../services/api";
import UserProfile from "../components/userProfile"; 

const Dashboard = () => {
  const navigate = useNavigate();
  
  // --- Data State ---
  const [items, setItems] = useState([]);
  const [household, setHousehold] = useState(null); 
  const [loading, setLoading] = useState(true);

  // --- UI State ---
  const [activeTab, setActiveTab] = useState("pantry"); 
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState(null); 

  // --- Form State ---
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    unit: "pcs",
    expiryDate: "",
    category: "Other",
  });

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resInventory = await api.get('/inventory');
        setItems(resInventory.data);

        try {
          const resHousehold = await api.get('/household/current'); 
          setHousehold(resHousehold.data);
        } catch (hErr) {
          console.error("Failed to load household data", hErr);
          setHousehold({ name: 'My', joinCode: '----', currency: 'EUR' }); 
        }
        setLoading(false);
      } catch (err) { 
        console.error("Dashboard Load Error", err);
        setLoading(false); 
      }
    };
    fetchData();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Actions ---
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
      setNewItem({
        name: "",
        quantity: 1,
        unit: "pcs",
        expiryDate: "",
        category: "Other",
      });
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

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
    
    // Adjusted colors for Black Glass theme
    if (diffDays < 0) return { color: "bg-red-500/10 text-red-400 border border-red-500/20", text: "Expired" };
    if (diffDays <= 3) return { color: "bg-orange-500/10 text-orange-400 border border-orange-500/20", text: "Expiring Soon" };
    return { color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", text: "Fresh" };
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen font-sans text-gray-200 relative selection:bg-emerald-500/30">
      
      {/* --- BACKGROUND LAYER (Black Shine & Food) --- */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop')` 
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-950/90 to-gray-900/80"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      {/* --- CONTENT WRAPPER --- */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* --- NOTIFICATIONS --- */}
        {notification && (
          <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-xl animate-bounce-in ${
            notification.type === 'error' 
              ? 'bg-black/60 border-red-500/30 text-red-200' 
              : 'bg-black/60 border-emerald-500/30 text-emerald-200'
          }`}>
            {notification.type === 'error' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            <span className="font-bold text-sm">{notification.message}</span>
          </div>
        )}

        {/* --- STRATEGY MODAL --- */}
        {showStrategyModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-gray-900/80 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Choose Chef's Goal</h3>
                <button onClick={() => setShowStrategyModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid gap-4">
                <button onClick={() => handleGenerateRecipe("waste")} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-emerald-900/30 hover:border-emerald-500/30 transition-all text-left group">
                  <div className="bg-emerald-500/10 p-3 rounded-full text-emerald-400 group-hover:text-emerald-300"><Leaf className="w-6 h-6" /></div>
                  <div><div className="font-bold text-gray-200">Maximize Fridge</div><div className="text-xs text-gray-500">Use expiring food first.</div></div>
                </button>
                <button onClick={() => handleGenerateRecipe("health")} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-blue-900/30 hover:border-blue-500/30 transition-all text-left group">
                  <div className="bg-blue-500/10 p-3 rounded-full text-blue-400 group-hover:text-blue-300"><Heart className="w-6 h-6" /></div>
                  <div><div className="font-bold text-gray-200">Maximize Health</div><div className="text-xs text-gray-500">Strict macros focus.</div></div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- NAVBAR --- */}
        <nav className="sticky top-0 z-40 border-b border-white/5 bg-black/40 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab("pantry")}>
              <div className="bg-gradient-to-br from-gray-800 to-black p-2 rounded-xl border border-white/10 shadow-lg group-hover:border-emerald-500/50 transition-all">
                <Package className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-white tracking-tight block leading-none">PantryAI</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Premium</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {household?.joinCode && (
                <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-4 mr-2">
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">{household.name} Code</span>
                  <button onClick={copyToClipboard} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1 rounded-lg border border-white/5 transition-all text-sm font-mono font-bold tracking-widest hover:text-emerald-400">
                    {household.joinCode}
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-gray-500" />}
                  </button>
                </div>
              )}

              <button onClick={() => navigate("/shopping-list")} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all" title="Shopping List">
                <ShoppingCart className="w-5 h-5" />
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 px-4 py-2 rounded-full text-sm font-bold hover:bg-white/5 transition-all">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </nav>

        {/* --- MAIN CONTENT --- */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
          
          {/* TABS */}
          <div className="flex justify-center mb-10">
            <div className="bg-black/40 p-1.5 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md inline-flex">
              <button onClick={() => setActiveTab("pantry")} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "pantry" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/50" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                <Package className="w-4 h-4" /> Pantry
              </button>
              <button onClick={() => setActiveTab("profile")} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "profile" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/50" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                <User className="w-4 h-4" /> Profile
              </button>
            </div>
          </div>

          {activeTab === "pantry" && (
            <div className="animate-fade-in space-y-8">
              
              {/* HEADER SECTION */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-black text-white mb-2 drop-shadow-md tracking-tight">{household ? household.name : 'My'} Inventory</h1>
                  <p className="text-gray-400 flex items-center gap-2 font-medium">
                    <Users className="w-4 h-4 text-emerald-500"/> 
                    {household?.members ? `${household.members.length} Household Members` : 'Loading...'}
                  </p>
                </div>
                <div className="relative group w-full md:w-96">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search pantry..."
                    className="block w-full pl-11 pr-4 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-xl backdrop-blur-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* --- IMPROVED QUICK ADD CARD --- */}
              <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent opacity-50"></div>
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                    <Plus className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Quick Add</h3>
                </div>
                
                <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-12 gap-4 relative z-10">
                  
                  {/* Item Name */}
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block ml-1">Item Name</label>
                    <input type="text" placeholder="e.g. Fresh Milk" required 
                      className="w-full p-4 bg-black/40 border border-white/5 rounded-xl text-white placeholder-gray-600 focus:bg-black/60 focus:border-emerald-500/50 focus:outline-none transition-all"
                      value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} 
                    />
                  </div>

                  {/* Quantity & Unit */}
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block ml-1">Qty & Unit</label>
                    <div className="flex gap-2">
                      <input type="number" min="1" 
                        className="w-1/2 p-4 bg-black/40 border border-white/5 rounded-xl text-white focus:bg-black/60 focus:border-emerald-500/50 focus:outline-none text-center"
                        value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} 
                      />
                      <select 
                        className="w-1/2 p-4 bg-black/40 border border-white/5 rounded-xl text-gray-300 focus:bg-black/60 focus:border-emerald-500/50 focus:outline-none appearance-none"
                        value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      >
                        <option>pcs</option><option>kg</option><option>L</option>
                      </select>
                    </div>
                  </div>

                  {/* Category (Improved UI) */}
                  <div className="md:col-span-3">
                     <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block ml-1 flex items-center gap-1">
                        <Tag className="w-3 h-3"/> Category
                     </label>
                     <div className="relative">
                        <select 
                          className="w-full p-4 bg-black/40 border border-white/5 rounded-xl text-gray-300 focus:bg-black/60 focus:border-emerald-500/50 focus:outline-none appearance-none cursor-pointer"
                          value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        >
                          <option>Other</option><option>Vegetable</option><option>Fruit</option><option>Dairy</option><option>Grain</option><option>Meat</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                           ▼
                        </div>
                     </div>
                  </div>

                  {/* Expiry Date (Improved UI) */}
                  <div className="md:col-span-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block ml-1 flex items-center gap-1">
                       <Calendar className="w-3 h-3"/> Expiry
                    </label>
                    <input type="date" required 
                      className="w-full p-4 bg-black/40 border border-white/5 rounded-xl text-gray-300 focus:bg-black/60 focus:border-emerald-500/50 focus:outline-none [color-scheme:dark] cursor-pointer"
                      value={newItem.expiryDate} onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })} 
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="md:col-span-12 flex justify-end mt-2">
                    <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] border border-emerald-500/20">
                      Add to Pantry
                    </button>
                  </div>
                </form>
              </div>

              {/* INVENTORY TABLE CARD */}
              <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl min-h-[400px]">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <ChefHat className="text-orange-400" /> Pantry Stock
                  </h3>
                  <button onClick={handleOpenChef} disabled={items.length === 0} 
                    className="bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 border border-orange-500/30 px-6 py-2 rounded-xl font-bold shadow-lg disabled:opacity-50 transition-all flex items-center gap-2">
                    <ChefHat className="w-4 h-4" /> AI Suggestion
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-black/30">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Freshness</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredItems.map((item) => {
                        const status = getExpiryStatus(item.expiryDate);
                        return (
                          <tr key={item._id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-5 font-bold text-gray-200 group-hover:text-white transition-colors">{item.name}</td>
                            <td className="px-6 py-5"><span className="bg-white/5 text-gray-400 text-xs px-3 py-1 rounded-full border border-white/5">{item.category}</span></td>
                            <td className="px-6 py-5 text-sm text-gray-400 font-mono">{item.quantity} {item.unit}</td>
                            <td className="px-6 py-5">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                                {status.text === "Expired" && <AlertCircle className="w-3 h-3" />} {status.text}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <button onClick={() => handleDeleteItem(item._id)} className="text-gray-600 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {!loading && filteredItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="bg-white/5 p-6 rounded-full mb-4 border border-white/5 animate-pulse">
                         <Package className="w-10 h-10 text-gray-600" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Pantry is Empty</h3>
                      <p className="text-gray-500">Add ingredients to unlock AI recipes.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="animate-fade-in max-w-4xl mx-auto bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <UserProfile showNotification={showNotification} /> 
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;