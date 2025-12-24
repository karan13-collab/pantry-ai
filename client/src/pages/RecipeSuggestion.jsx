import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, BarChart, ShoppingCart, Plus, Loader, Leaf, Heart, X } from 'lucide-react';
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
  const [addingToList, setAddingToList] = useState(false); // Loading state for adding

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

  // 2. Open Modal (ROBUST VERSION)
  const openAddModal = async (item) => {
    setSelectedItem(item);
    setNewListName(''); // Reset input
    
    // Attempt to fetch lists, but open modal regardless of success/failure
    try {
      const res = await api.get('/shopping-lists');
      setUserLists(res.data);
    } catch (err) {
      console.warn("Could not fetch lists (maybe none exist yet)", err);
      setUserLists([]); // Default to empty
    } finally {
      setModalOpen(true); // <--- THIS GUARANTEES THE POPUP OPENS
    }
  };

  // 3. Handle Add to List
  const handleAddToList = async (listId, listName) => {
    setAddingToList(true);
    try {
      await api.post(`/shopping-lists/${listId}/items`, selectedItem);
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
      // Step A: Create List
      const res = await api.post('/shopping-lists', { name: newListName });
      const newListId = res.data._id;
      
      // Step B: Add Item to it
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader className="w-12 h-12 text-green-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-700">The AI Chef is Cooking...</h2>
        <p className="text-gray-500">Analyzing your pantry for the best {strategy === 'health' ? 'healthy' : 'waste-saving'} meal.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 max-w-md text-center">
          <h3 className="font-bold text-lg mb-2">Oops!</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-12">
      
      {/* HEADER IMAGE */}
      <div className="relative h-64 md:h-80 w-full">
        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6 md:p-12">
          <button onClick={() => navigate('/dashboard')} className="absolute top-6 left-6 bg-white/20 backdrop-blur text-white p-2 rounded-full hover:bg-white/30 transition-all">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="max-w-4xl mx-auto w-full">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase mb-3 ${strategy === 'health' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
              {strategy === 'health' ? <Heart className="w-3 h-3" /> : <Leaf className="w-3 h-3" />}
              {strategy === 'health' ? "Health Optimized" : "Waste Saver"}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{recipe.title}</h1>
            <div className="flex gap-4 text-white/90 text-sm font-medium">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {recipe.time}</span>
              <span className="flex items-center gap-1"><BarChart className="w-4 h-4" /> {recipe.difficulty}</span>
              <span>🔥 {recipe.nutrition.calories}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10 grid md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: INSTRUCTIONS & MACROS */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Nutrition Cards */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-4 gap-4 text-center">
             <div><div className="text-xs text-gray-400 font-bold uppercase">Protein</div><div className="text-xl font-bold text-blue-600">{recipe.nutrition.protein}</div></div>
             <div><div className="text-xs text-gray-400 font-bold uppercase">Carbs</div><div className="text-xl font-bold text-green-600">{recipe.nutrition.carbs}</div></div>
             <div><div className="text-xs text-gray-400 font-bold uppercase">Fats</div><div className="text-xl font-bold text-yellow-600">{recipe.nutrition.fat}</div></div>
             <div><div className="text-xs text-gray-400 font-bold uppercase">Used</div><div className="text-xl font-bold text-purple-600">{recipe.usedIngredientCount} items</div></div>
          </div>

          {/* Instructions */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              Step-by-Step Instructions
            </h3>
            <div className="prose prose-green max-w-none text-gray-600 whitespace-pre-line leading-relaxed">
              {recipe.instructions}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SHOPPING LIST */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100 sticky top-6">
            <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-green-600" /> Shop Missing Items
            </h3>
            <p className="text-xs text-gray-500 mb-6">Click + to add to your list.</p>

            <div className="space-y-3">
              {recipe.shoppingList && recipe.shoppingList.length > 0 ? (
                recipe.shoppingList.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-green-200 transition-all">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-white" />
                      <div>
                        <div className="font-bold text-sm text-gray-800 capitalize">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.amount} {item.unit}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => openAddModal(item)}
                      className="bg-white border border-gray-200 text-green-600 p-2 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400 italic">No missing ingredients!</div>
              )}
            </div>
            
            <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
              <p className="text-sm text-blue-800 font-medium">You have {recipe.usedIngredientCount} ingredients ready!</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- ADD TO LIST MODAL --- */}
      {modalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5"/>
            </button>
            <h3 className="text-lg font-bold mb-1">Add to Shopping List</h3>
            <p className="text-sm text-gray-500 mb-4">Where should we save <span className="font-bold text-green-600">{selectedItem.name}</span>?</p>
            
            {/* Existing Lists */}
            {userLists.length > 0 && (
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                <label className="text-xs font-bold text-gray-400 uppercase">Your Lists</label>
                {userLists.map(list => (
                  <button 
                    key={list._id}
                    disabled={addingToList}
                    onClick={() => handleAddToList(list._id, list.name)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-200 flex justify-between items-center group transition-all"
                  >
                    <span className="font-medium text-gray-700 group-hover:text-green-700">{list.name}</span>
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                  </button>
                ))}
              </div>
            )}

            {/* Create New List */}
            <div className="border-t border-gray-100 pt-4">
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Create New List</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. Walmart Run" 
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                />
                <button 
                  onClick={handleCreateAndAdd}
                  disabled={!newListName || addingToList}
                  className="bg-green-600 text-white px-4 rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-green-700 transition-colors"
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