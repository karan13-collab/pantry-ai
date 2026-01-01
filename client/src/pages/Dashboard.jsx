import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Added 'User' to imports 👇
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
} from "lucide-react";
import api from "../services/api";
import UserProfile from "../components/userProfile"; // Ensure this matches your file name

const Dashboard = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- NEW: Tab State ---
  const [activeTab, setActiveTab] = useState("pantry"); // 'pantry' or 'profile'

  // Recipe & UI State
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    unit: "pcs",
    expiryDate: "",
    category: "Other",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [householdName, setHouseholdName] = useState('My');
  // UI State for Copying Code
  const [copied, setCopied] = useState(false);

  // --- HELPER: Extract JOIN CODE from Token ---
  const getJoinCode = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user.joinCode;
    } catch (e) {
      return null;
    }
  };

  const joinCode = getJoinCode();

  // --- Fetch Data ---
  // --- Fetch Data ---
  const fetchInventory = async () => {
    try {
      // 1. Get Inventory Items
      const res = await api.get('/inventory');
      setItems(res.data);

      // 2. Get User Profile (To find the Household Name)
      // This part was probably missing or incomplete in your code
      try {
        const resUser = await api.get('/user/profile');
        if (resUser.data.household) {
          setHouseholdName(resUser.data.household.name);
        }
      } catch (e) {
        // If profile fails, just keep default 'My'
        console.log("Could not fetch household name");
      }

      setLoading(false);
    } catch (err) { 
      setLoading(false); 
    }
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
    } catch (err) {
      alert("Failed to add item");
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Remove item?")) return;
    try {
      await api.delete(`/inventory/${id}`);
      setItems(items.filter((item) => item._id !== id));
    } catch (err) {}
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const copyToClipboard = () => {
    if (joinCode) {
      navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getExpiryStatus = (dateString) => {
    const today = new Date();
    const expiry = new Date(dateString);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0)
      return {
        color: "bg-red-100 text-red-700 border-red-200",
        text: "Expired",
      };
    if (diffDays <= 3)
      return {
        color: "bg-orange-100 text-orange-700 border-orange-200",
        text: "Expiring Soon",
      };
    return {
      color: "bg-green-100 text-green-700 border-green-200",
      text: "Fresh",
    };
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 font-sans text-gray-800 relative">
      {/* STRATEGY MODAL (Unchanged) */}
      {showStrategyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Choose Chef's Goal 
              </h3>
              <button
                onClick={() => setShowStrategyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-500 mb-6 text-sm">
              How should we prioritize your ingredients today?
            </p>
            <div className="grid gap-4">
              <button
                onClick={() => handleGenerateRecipe("waste")}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-green-100 hover:border-green-500 hover:bg-green-50 transition-all group text-left"
              >
                <div className="bg-green-100 p-3 rounded-full text-green-600 group-hover:bg-green-200">
                  <Leaf className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-gray-800">Maximize Fridge</div>
                  <div className="text-xs text-gray-500">
                    Prioritize using up expiring food.
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleGenerateRecipe("health")}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-blue-100 hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
              >
                <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-blue-200">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-gray-800">Maximize Health</div>
                  <div className="text-xs text-gray-500">
                    Strict macros and calorie limits.
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm border-b border-green-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setActiveTab("pantry")}
          >
            <Package className="h-6 w-6 text-green-600" />
            <span className="text-2xl font-extrabold text-green-700">
              PantryAI
            </span>
          </div>

          <div className="flex items-center gap-3">
            {joinCode && (
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  Join Code
                </span>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-green-50 text-gray-800 hover:text-green-700 px-3 py-1 rounded border border-gray-200 transition-all text-sm font-mono font-bold tracking-widest"
                  title="Click to Copy"
                >
                  {joinCode}
                  {copied ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            )}

            <button
              onClick={() => navigate("/shopping-list")}
              className="flex items-center gap-2 text-gray-600 hover:text-green-600 font-semibold px-4 py-2 rounded-full hover:bg-green-50 transition-all text-sm border border-transparent hover:border-green-100"
            >
              <ShoppingCart className="w-4 h-4" />{" "}
              <span className="hidden md:inline">Shopping List</span>
            </button>

            <div className="h-6 w-px bg-gray-200 mx-1"></div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-500 hover:text-red-600 text-sm font-semibold hover:bg-red-50 px-4 py-2 rounded-full transition-all"
            >
              <LogOut className="w-4 h-4" />{" "}
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* --- NEW: TAB NAVIGATION --- */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
            <button
              onClick={() => setActiveTab("pantry")}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "pantry"
                  ? "bg-green-100 text-green-700 shadow-sm"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Package className="w-4 h-4" /> My Pantry
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "profile"
                  ? "bg-green-100 text-green-700 shadow-sm"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <User className="w-4 h-4" /> My Profile
            </button>
          </div>
        </div>

        {/* --- VIEW 1: PANTRY INVENTORY --- */}
        {activeTab === "pantry" && (
          <div className="animate-fade-in">
            <div className="mb-8 md:flex md:items-center md:justify-between">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                {householdName === "PantryAI" ? "Your" : householdName}{" "}
                Inventory
              </h2>
              <div className="relative mt-4 md:mt-0">
                <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full w-full md:w-64 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Add Item Form */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="bg-green-100 p-1.5 rounded-md">
                  <Plus className="w-5 h-5 text-green-700" />
                </div>{" "}
                Quick Add
              </h3>
              <form
                onSubmit={handleAddItem}
                className="grid grid-cols-1 md:grid-cols-12 gap-4"
              >
                <div className="md:col-span-4">
                  <input
                    type="text"
                    placeholder="Item Name"
                    required
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2 flex">
                  <input
                    type="number"
                    min="1"
                    className="w-2/3 p-3 bg-gray-50 border border-gray-200"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({ ...newItem, quantity: e.target.value })
                    }
                  />
                  <select
                    className="w-1/3 bg-gray-100 border border-gray-200"
                    value={newItem.unit}
                    onChange={(e) =>
                      setNewItem({ ...newItem, unit: e.target.value })
                    }
                  >
                    <option>pcs</option>
                    <option>kg</option>
                    <option>L</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <select
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                    value={newItem.category}
                    onChange={(e) =>
                      setNewItem({ ...newItem, category: e.target.value })
                    }
                  >
                    <option>Other</option>
                    <option>Vegetable</option>
                    <option>Fruit</option>
                    <option>Dairy</option>
                    <option>Grain</option>
                    <option>Meat</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <input
                    type="date"
                    required
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                    value={newItem.expiryDate}
                    onChange={(e) =>
                      setNewItem({ ...newItem, expiryDate: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-12 flex justify-end">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Add
                  </button>
                </div>
              </form>
            </div>

            {/* AI Chef & Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50/50 to-transparent flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <ChefHat className="text-orange-500" /> AI Chef
                  </h3>
                  <p className="text-sm text-gray-500">
                    Intelligent meal planning.
                  </p>
                </div>
                <button
                  onClick={handleOpenChef}
                  disabled={items.length === 0}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-bold shadow-md flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                  Suggest Recipe
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                        Item
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                        Category
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                        Qty
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredItems.map((item) => {
                      const status = getExpiryStatus(item.expiryDate);
                      return (
                        <tr key={item._id} className="hover:bg-green-50/30">
                          <td className="px-6 py-4 font-semibold text-gray-800">
                            {item.name}
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full border">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${status.color}`}
                            >
                              {status.text === "Expired" && (
                                <AlertCircle className="w-3 h-3" />
                              )}{" "}
                              {status.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {!loading && filteredItems.length === 0 && (
                  <div className="p-12 text-center text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>Your pantry is empty. Add items to get started!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW 2: USER PROFILE --- */}
        {activeTab === "profile" && (
          <div className="animate-fade-in max-w-3xl mx-auto">
            <UserProfile />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
