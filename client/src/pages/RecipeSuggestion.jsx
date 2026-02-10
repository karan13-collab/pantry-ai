import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  BarChart, 
  ShoppingCart, 
  Plus, 
  Loader, 
  Leaf, 
  Heart, 
  X, 
  Check, 
  ChefHat, 
  RefreshCw 
} from 'lucide-react'; 
import api from '../services/api';

// IMPORTANT: Import the CSS file
import '../css/RecipeSuggestion.css';

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

  // --- 1. REUSABLE GENERATE FUNCTION ---
  const generateRecipe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/inventory/generate-recipe', { strategy });
      setRecipe(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to generate recipe. The chef might be busy.");
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    generateRecipe();
    // eslint-disable-next-line
  }, [strategy]);

  // --- 2. MODAL FUNCTIONS ---
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

  const handleAddToList = async (listId, listName) => {
    setAddingToList(true);
    try {
      await api.post(`/shopping-lists/${listId}/items`, selectedItem);
      alert(`✅ Added ${selectedItem.name} to ${listName}!`);
      setModalOpen(false);
    } catch (err) {
      alert("Failed to add item.");
    } finally {
      setAddingToList(false);
    }
  };

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
      alert("Failed to create list.");
    } finally {
      setAddingToList(false);
    }
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-icon-container">
            <div className="loading-glow"></div>
            <ChefHat className="loading-chef-icon" />
        </div>
        <h2 className="text-2xl font-bold mt-6">The AI Chef is Cooking...</h2>
        <p className="text-slate-500 mt-2">Analyzing your pantry for {recipe ? 'another' : 'the best'} {strategy === 'health' ? 'healthy' : 'waste-saving'} meal.</p>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="error-screen">
        <div className="error-card">
          <h3 className="font-bold text-xl mb-2">Oops!</h3>
          <p className="mb-6">{error}</p>
          <div className="error-actions">
            <button onClick={() => navigate('/dashboard')} className="glass-btn btn-back" style={{borderRadius: '0.75rem', padding: '0.5rem 1.5rem'}}>Go Back</button>
            <button onClick={generateRecipe} className="btn-regenerate" style={{backgroundColor: '#ef4444', color: 'white'}}>
              <RefreshCw className="w-4 h-4"/> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN CONTENT ---
  return (
    <div className="recipe-page">
      
      {/* HEADER IMAGE */}
      <div className="hero-container">
        <div className="hero-overlay"></div>
        <img src={recipe.image} alt={recipe.title} className="hero-image" />
        
        <div className="hero-content">
          
          {/* TOP NAV BUTTONS */}
          <div className="nav-bar">
             <button onClick={() => navigate('/dashboard')} className="glass-btn btn-back group">
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
             </button>

             <button onClick={generateRecipe} className="glass-btn btn-regenerate group">
                <RefreshCw className="w-4 h-4 spin-icon" />
                <span>Don't like it? Try Next</span>
             </button>
          </div>
          
          {/* TITLE & BADGES */}
          <div className="title-wrapper">
            <div className={`strategy-badge ${strategy === 'health' ? 'badge-health' : 'badge-waste'}`}>
              {strategy === 'health' ? <Heart className="w-3 h-3" /> : <Leaf className="w-3 h-3" />}
              {strategy === 'health' ? "Health Optimized" : "Waste Saver"}
            </div>
            
            <h1 className="recipe-title">{recipe.title}</h1>
            
            <div className="recipe-meta">
              <span className="meta-item"><Clock className="w-4 h-4 text-blue-400" /> {recipe.time}</span>
              <span className="meta-item"><BarChart className="w-4 h-4 text-orange-400" /> {recipe.difficulty}</span>
              <span className="meta-item">🔥 {recipe.nutrition.calories}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="content-grid">
        
        {/* LEFT COLUMN: MACROS & INSTRUCTIONS */}
        <div className="col-main space-y-8">
          
          {/* Nutrition Cards */}
          <div className="glass-card nutrition-grid">
             <div className="macro-box">
               <div className="label">Protein</div>
               <div className="value" style={{color: '#60a5fa'}}>{recipe.nutrition.protein}</div>
             </div>
             <div className="macro-box">
               <div className="label">Carbs</div>
               <div className="value" style={{color: '#34d399'}}>{recipe.nutrition.carbs}</div>
             </div>
             <div className="macro-box">
               <div className="label">Fats</div>
               <div className="value" style={{color: '#facc15'}}>{recipe.nutrition.fat}</div>
             </div>
             <div className="macro-box">
               <div className="label">Used</div>
               <div className="value" style={{color: '#c084fc'}}>{recipe.usedIngredientCount} items</div>
             </div>
          </div>

          {/* Instructions */}
          <div className="glass-card">
            <h3 className="section-header">
              <ChefHat className="w-5 h-5 text-orange-400" /> Step-by-Step Instructions
            </h3>
            <div className="instructions-text">
              {recipe.instructions}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INGREDIENTS */}
        <div className="col-side">
          <div className="glass-card ingredients-sticky">
            
            {/* 1. FROM YOUR PANTRY */}
            <h3 className="section-header" style={{border: 'none', marginBottom: '1rem'}}>
              <Check className="w-5 h-5 text-emerald-400" /> From Your Pantry
            </h3>
            
            <div style={{ marginBottom: '2rem' }}>
              {recipe.usedIngredients && recipe.usedIngredients.length > 0 ? (
                recipe.usedIngredients.map((item, idx) => (
                  <div key={idx} className="ingredient-item pantry-item">
                     <img src={item.image} alt={item.name} className="ingredient-img" />
                     <div className="flex-1 ingredient-info">
                        <div className="name" style={{color: '#d1fae5'}}>{item.name}</div>
                        <div className="amount" style={{color: '#34d399'}}>{item.amount} {item.unit}</div>
                     </div>
                     <div className="check-badge">
                       <Check className="w-3 h-3" />
                     </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500 italic px-2">No pantry items used.</div>
              )}
            </div>

            {/* 2. MISSING ITEMS / SHOPPING LIST */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-400" /> Missing Items
              </h3>
              <p className="text-xs text-slate-500 mb-4">Click + to add to your shopping list.</p>

              <div>
                {recipe.shoppingList && recipe.shoppingList.length > 0 ? (
                  recipe.shoppingList.map((item, idx) => (
                    <div key={idx} className="ingredient-item missing-item group">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="ingredient-img" />
                        <div className="ingredient-info">
                          <div className="name text-slate-200 group-hover:text-white transition-colors">{item.name}</div>
                          <div className="amount">{item.amount} {item.unit}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => openAddModal(item)}
                        className="btn-add-item"
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

      {/* --- ADD TO LIST MODAL --- */}
      {modalOpen && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <button onClick={() => setModalOpen(false)} className="modal-close">
              <X className="w-5 h-5"/>
            </button>
            <h3 className="font-bold">Add to Shopping List</h3>
            <p className="text-sm text-slate-400 mb-6">Where should we save <span className="font-bold text-blue-400">{selectedItem.name}</span>?</p>
            
            {/* Existing Lists */}
            {userLists.length > 0 && (
              <div className="list-scroll-area custom-scrollbar">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2 block">Your Lists</label>
                {userLists.map(list => (
                  <button 
                    key={list._id}
                    disabled={addingToList}
                    onClick={() => handleAddToList(list._id, list.name)}
                    className="list-btn group"
                  >
                    <span className="font-medium group-hover:text-blue-400">{list.name}</span>
                    <Plus className="w-4 h-4 group-hover:text-blue-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Create New List */}
            <div className="new-list-form">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">Create New List</label>
              <div className="input-row">
                <input 
                  type="text" 
                  placeholder="e.g. Walmart Run" 
                  className="modal-input"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                />
                <button 
                  onClick={handleCreateAndAdd}
                  disabled={!newListName || addingToList}
                  className="btn-create"
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