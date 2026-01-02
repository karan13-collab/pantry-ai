import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, BarChart, ShoppingCart, Plus, Loader, Leaf, Heart, X, Check, ChefHat } from 'lucide-react'; 
import api from '../services/api';

const RecipeSuggestion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const strategy = location.state?.strategy || 'waste';

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Shopping List Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [userLists, setUserLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [addingToList, setAddingToList] = useState(false);

  // 1. Generate Recipe
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await api.post('/inventory/generate-recipe', { strategy });
        setRecipe(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to generate recipe");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [strategy]);

  // 2. Open Modal
  const openAddModal = async (item) => {
    setSelectedItem(item);
    setNewListName(''); 
    try {
      const res = await api.get('/shopping-lists');
      setUserLists(res.data);
    } catch (err) {
      setUserLists([]); 
    } finally {
      setModalOpen(true); 
    }
  };

  // 3. Handle Add to List
  const handleAddToList = async (listId, listName) => {
    setAddingToList(true);
    try {
      await api.post(`/shopping-lists/${listId}/items`, selectedItem);
      // You could replace this alert with a proper Toast notification later
      alert(`✅ Added ${selectedItem.name} to ${listName}!`);
      setModalOpen(false);
    } catch (err) {
      alert("Failed to add item. Please try again.");
    } finally {
      setAddingToList(false);
    }
  };

  // 4. Create New List & Add
  const handleCreateAndAdd = async () => {
    if (!newListName) return;
    setAddingToList(true);
    try {
      const res = await api.post('/shopping-lists', { name: newListName });
      const newListId = res.data._id;
      await api.post(`/shopping-lists/${newListId}/items`, selectedItem);
      alert(`✅ Created "${newListName}" and added item!`);
      setModalOpen(false);
    } catch (err) {
      alert("Failed to create list. Check your server connection.");
    } finally {
      setAddingToList(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200">
        <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
            <ChefHat className="w-16 h-16 text-blue-400 animate-bounce relative z-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mt-6">The AI Chef is Cooking...</h2>
        <p className="text-slate-500 mt-2">Analyzing your pantry for the best {strategy === 'health' ? 'healthy' : 'waste-saving'} meal.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <div className="bg-red-900/20 text-red-400 p-8 rounded-2xl border border-red-500/30 max-w-md text-center backdrop-blur-sm">
          <h3 className="font-bold text-xl mb-2 text-white">Oops!</h3>
          <p className="mb-6">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-900/20">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 pb-12 selection:bg-blue-500/30">
      
      {/* HEADER IMAGE */}
      <div className="relative h-72 md:h-96 w-full">
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10"></div>
        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover opacity-80" />
        
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-12 max-w-7xl mx-auto w-full">
          <button onClick={() => navigate('/dashboard')} className="absolute top-6 left-6 md:left-12 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-3 rounded-full border border-white/10 transition-all group">
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="animate-fade-in-up">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase mb-4 shadow-lg border border-white/10 ${strategy === 'health' ? 'bg-blue-600/90 text-white' : 'bg-emerald-600/90 text-white'}`}>
              {strategy === 'health' ? <Heart className="w-3 h-3" /> : <Leaf className="w-3 h-3" />}
              {strategy === 'health' ? "Health Optimized" : "Waste Saver"}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-xl">{recipe.title}</h1>
            <div className="flex gap-6 text-slate-200 text-sm font-bold bg-black/30 w-fit px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-md">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" /> {recipe.time}</span>
              <span className="flex items-center gap-2"><BarChart className="w-4 h-4 text-orange-400" /> {recipe.difficulty}</span>
              <span className="flex items-center gap-2">🔥 {recipe.nutrition.calories}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 grid md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: INSTRUCTIONS & MACROS */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Nutrition Cards (Glassmorphism) */}
          <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 grid grid-cols-4 gap-4 text-center shadow-2xl">
             <div><div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Protein</div><div className="text-2xl font-black text-blue-400">{recipe.nutrition.protein}</div></div>
             <div><div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Carbs</div><div className="text-2xl font-black text-emerald-400">{recipe.nutrition.carbs}</div></div>
             <div><div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Fats</div><div className="text-2xl font-black text-yellow-400">{recipe.nutrition.fat}</div></div>
             <div><div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Used</div><div className="text-2xl font-black text-purple-400">{recipe.usedIngredientCount} items</div></div>
          </div>

          {/* Instructions (Glassmorphism) */}
          <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <ChefHat className="w-5 h-5 text-orange-400" /> Step-by-Step Instructions
            </h3>
            <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-line leading-relaxed font-light">
              {recipe.instructions}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INGREDIENTS & SHOPPING */}
        <div className="md:col-span-1">
          <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl sticky top-6 max-h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar">
            
            {/* 1. FROM YOUR PANTRY */}
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" /> From Your Pantry
            </h3>
            
            <div className="space-y-3 mb-8">
              {recipe.usedIngredients && recipe.usedIngredients.length > 0 ? (
                recipe.usedIngredients.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                     <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-black/20" />
                     <div className="flex-1">
                        <div className="font-bold text-sm text-emerald-100 capitalize">{item.name}</div>
                        <div className="text-xs text-emerald-400/80 font-bold">{item.amount} {item.unit}</div>
                     </div>
                     <div className="bg-emerald-500 p-1 rounded-full text-white shadow-lg shadow-emerald-500/20">
                       <Check className="w-3 h-3" />
                     </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500 italic px-2">No pantry items used.</div>
              )}
            </div>

            {/* 2. MISSING ITEMS / SHOPPING LIST */}
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-400" /> Missing Items
              </h3>
              <p className="text-xs text-slate-500 mb-4">Click + to add to your shopping list.</p>

              <div className="space-y-3">
                {recipe.shoppingList && recipe.shoppingList.length > 0 ? (
                  recipe.shoppingList.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-black/30 rounded-2xl border border-white/5 group hover:border-blue-500/50 transition-all">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-black/40" />
                        <div>
                          <div className="font-bold text-sm text-slate-200 capitalize group-hover:text-white transition-colors">{item.name}</div>
                          <div className="text-xs text-slate-500">{item.amount} {item.unit}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => openAddModal(item)}
                        className="bg-white/5 border border-white/10 text-slate-400 p-2 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-emerald-400 italic font-medium px-2">🎉 No missing ingredients!</div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- ADD TO LIST MODAL (Dark Theme) --- */}
      {modalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-sm w-full p-6 relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
              <X className="w-5 h-5"/>
            </button>
            <h3 className="text-lg font-bold mb-1 text-white">Add to Shopping List</h3>
            <p className="text-sm text-slate-400 mb-6">Where should we save <span className="font-bold text-blue-400">{selectedItem.name}</span>?</p>
            
            {/* Existing Lists */}
            {userLists.length > 0 && (
              <div className="space-y-2 mb-6 max-h-40 overflow-y-auto custom-scrollbar">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Your Lists</label>
                {userLists.map(list => (
                  <button 
                    key={list._id}
                    disabled={addingToList}
                    onClick={() => handleAddToList(list._id, list.name)}
                    className="w-full text-left p-3 rounded-xl border border-slate-700 bg-black/20 hover:bg-blue-600/10 hover:border-blue-500/50 flex justify-between items-center group transition-all"
                  >
                    <span className="font-medium text-slate-300 group-hover:text-blue-400">{list.name}</span>
                    <Plus className="w-4 h-4 text-slate-600 group-hover:text-blue-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Create New List */}
            <div className="border-t border-slate-800 pt-5">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">Create New List</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="e.g. Walmart Run" 
                  className="flex-1 bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                />
                <button 
                  onClick={handleCreateAndAdd}
                  disabled={!newListName || addingToList}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/20"
                >
                  {addingToList ? <Loader className="w-4 h-4 animate-spin"/> : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeSuggestion;