import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, BarChart, ShoppingCart, Plus, Loader, Leaf, Heart, X, Check, ChefHat, RefreshCw 
} from 'lucide-react'; 
import api from '../services/api';
import '../css/RecipeSuggestion.css';

const LoadingScreen = ({ strategy }) => (
  <div className="rs-center-screen">
    <div className="relative">
       <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rs-pulse"></div>
       <ChefHat className="w-16 h-16 text-blue-400 relative z-10 animate-bounce" />
    </div>
    <h2 className="text-2xl font-bold mt-6 text-white">The AI Chef is Cooking...</h2>
    <p className="text-slate-500 mt-2">Finding the best {strategy === 'health' ? 'healthy' : 'waste-saving'} recipe for you.</p>
  </div>
);

const ErrorScreen = ({ error, onRetry, onBack }) => (
  <div className="rs-center-screen">
    <div className="rs-card max-w-md bg-red-900/20 border-red-500/30 text-center">
      <h3 className="font-bold text-xl text-red-400 mb-2">Oops!</h3>
      <p className="mb-6 text-red-200">{error}</p>
      <div className="flex justify-center gap-4">
        <button onClick={onBack} className="rs-btn-glass rs-btn-back px-6">Go Back</button>
        <button onClick={onRetry} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-xl font-bold transition-colors">
          Try Again
        </button>
      </div>
    </div>
  </div>
);

const AddToListModal = ({ isOpen, onClose, selectedItem, userLists, onCreate }) => {
  const [newListName, setNewListName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !selectedItem) return null;

  const handleCreate = async () => {
    if (!newListName) return;
    setLoading(true);
    await onCreate(newListName);
    setLoading(false);
  };

  return (
    <div className="rs-modal-overlay">
      <div className="rs-modal-box animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-white">Add to Shopping List</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={20}/></button>
        </div>
        <p className="text-sm text-slate-400 mb-6">Where should we save <span className="font-bold text-blue-400">{selectedItem.name}</span>?</p>
        
        <div className="max-h-40 overflow-y-auto mb-4 custom-scrollbar">
           {userLists.map(list => (
             <button key={list._id} onClick={() => onCreate(null, list._id, list.name)} className="rs-list-btn group">
               <span className="font-medium group-hover:text-blue-400">{list.name}</span>
               <Plus size={16} className="group-hover:text-blue-400" />
             </button>
           ))}
        </div>

        <div className="rs-input-group">
          <input 
            type="text" 
            placeholder="New list name..." 
            className="rs-input"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
          <button onClick={handleCreate} disabled={!newListName || loading} className="rs-btn-create">
             {loading ? <Loader className="rs-spin w-4 h-4"/> : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

const RecipeSuggestion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const strategy = location.state?.strategy || 'waste';

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [userLists, setUserLists] = useState([]);

  const generateRecipe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/inventory/generate-recipe', { strategy });
      setRecipe(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate recipe.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { generateRecipe(); }, [strategy]);

  const openAddModal = async (item) => {
    setSelectedItem(item);
    try {
      const res = await api.get('/shopping-lists');
      setUserLists(res.data);
    } catch (err) { setUserLists([]); }
    setModalOpen(true);
  };

  const handleAddToList = async (newListName, existingListId = null, existingListName = null) => {
    try {
      let listId = existingListId;
      if (newListName && !listId) {
         const res = await api.post('/shopping-lists', { name: newListName });
         listId = res.data._id;
      }
      await api.post(`/shopping-lists/${listId}/items`, selectedItem);
      alert(`Added ${selectedItem.name} to ${existingListName || newListName}`);
      setModalOpen(false);
    } catch (err) {
      alert("Failed to add item.");
    }
  };

  if (loading) return <LoadingScreen strategy={strategy} />;
  if (error) return <ErrorScreen error={error} onRetry={generateRecipe} onBack={() => navigate('/dashboard')} />;

  return (
    <div className="rs-page">
      
      <div className="rs-hero">
        <div className="rs-hero-overlay"></div>
        <img src={recipe.image} alt={recipe.title} className="rs-hero-img" />
        
        
        <div className="rs-nav-bar">
           <button onClick={() => navigate('/dashboard')} className="rs-btn-glass rs-btn-back">
              <ArrowLeft size={24} />
           </button>
           <button onClick={generateRecipe} className="rs-btn-glass rs-btn-regen group">
              <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
              <span>Try Next</span>
           </button>
        </div>

        <div className="rs-hero-content">
          <div className={`rs-badge ${strategy === 'health' ? 'rs-badge-health' : 'rs-badge-waste'}`}>
             {strategy === 'health' ? <Heart size={12} /> : <Leaf size={12} />}
             {strategy === 'health' ? "Health Optimized" : "Waste Saver"}
          </div>
          <h1 className="rs-title">{recipe.title}</h1>
          
          <div className="rs-meta-row">
            <span className="rs-meta-pill"><Clock size={16} className="text-blue-400" /> {recipe.time}</span>
            <span className="rs-meta-pill"><BarChart size={16} className="text-orange-400" /> {recipe.difficulty}</span>
            <span className="rs-meta-pill text-yellow-400">🔥 {recipe.nutrition.calories} kcal</span>
          </div>
        </div>
      </div>

      <div className="rs-grid">
        
        <div className="space-y-6">
           <div className="rs-card rs-macro-grid">
             <div><div className="rs-macro-label">Protein</div><div className="rs-macro-val text-blue-400">{recipe.nutrition.protein}</div></div>
             <div><div className="rs-macro-label">Carbs</div><div className="rs-macro-val text-emerald-400">{recipe.nutrition.carbs}</div></div>
             <div><div className="rs-macro-label">Fats</div><div className="rs-macro-val text-yellow-400">{recipe.nutrition.fat}</div></div>
             <div><div className="rs-macro-label">Used Items</div><div className="rs-macro-val text-purple-400">{recipe.usedIngredientCount}</div></div>
           </div>

           <div className="rs-card">
             <h3 className="rs-header">
               <ChefHat className="text-orange-400" /> Instructions
             </h3>
             <div className="rs-text-body">{recipe.instructions}</div>
           </div>
        </div>

        <div className="relative">
          <div className="sticky top-6 space-y-6">
            
            <div className="rs-card p-4">
               <h3 className="rs-header border-none mb-2 pb-0 text-base">
                 <Check className="text-emerald-400" size={18} /> Pantry Items
               </h3>
               <div className="rs-ing-list">
                 {recipe.usedIngredients?.length > 0 ? (
                   recipe.usedIngredients.map((item, i) => (
                     <div key={i} className="rs-ing-item rs-ing-pantry">
                       <img src={item.image} className="rs-ing-img" alt={item.name}/>
                       <div className="flex-1">
                          <div className="font-bold text-sm text-emerald-100 capitalize">{item.name}</div>
                          <div className="text-xs text-emerald-400">{item.amount} {item.unit}</div>
                       </div>
                       <div className="bg-emerald-500 rounded-full p-1"><Check size={10} className="text-white"/></div>
                     </div>
                   ))
                 ) : <div className="text-sm text-slate-500 italic px-2">No pantry items used.</div>}
               </div>
            </div>

            <div className="rs-card p-4">
               <h3 className="rs-header border-none mb-2 pb-0 text-base">
                 <ShoppingCart className="text-blue-400" size={18} /> Missing Items
               </h3>
               <div className="rs-ing-list">
                 {recipe.shoppingList?.length > 0 ? (
                   recipe.shoppingList.map((item, i) => (
                     <div key={i} className="rs-ing-item rs-ing-missing group">
                        <div className="flex items-center gap-3">
                          <img src={item.image} className="rs-ing-img" alt={item.name}/>
                          <div>
                            <div className="font-bold text-sm text-slate-200 capitalize group-hover:text-white">{item.name}</div>
                            <div className="text-xs text-slate-500">{item.amount} {item.unit}</div>
                          </div>
                        </div>
                        <button onClick={() => openAddModal(item)} className="rs-btn-add">
                          <Plus size={16} />
                        </button>
                     </div>
                   ))
                 ) : <div className="text-sm text-emerald-400 italic font-bold">Nothing to buy!</div>}
               </div>
            </div>

          </div>
        </div>

      </div>

      <AddToListModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        selectedItem={selectedItem} 
        userLists={userLists} 
        onCreate={handleAddToList} 
      />
    </div>
  );
};

export default RecipeSuggestion;