import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify'; // Import Toast components
import 'react-toastify/dist/ReactToastify.css'; // Import Toast CSS (Crucial!)

import { recipeApi } from '../api/recipes';
import RecipeCard from '../components/RecipeCard';
import RecipeDetailPanel from '../components/RecipeDetailPanel';
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';

const Community = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [cuisine, setCuisine] = useState('');
    const { isDarkMode } = useThemeStore();

    // Get user data to check subscription status
    const { user } = useAuthStore();

    // State for filter mode ('all' or 'premium')
    const [filterMode, setFilterMode] = useState('all');
    const location = useLocation();

    const [selectedRecipeId, setSelectedRecipeId] = useState(null);

    // Effect: Listen to URL changes to update filter mode
    // (This works when you click 'Premium Content' in your Navbar dropdown)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const filterParam = params.get('filter'); // Looks for /?filter=premium
        if (filterParam === 'premium') {
            setFilterMode('premium');
        } else {
            setFilterMode('all');
        }
    }, [location.search]);

    // Fetch Recipes
    useEffect(() => {
        let isMounted = true;
        const fetchRecipes = async () => {
            setLoading(true);
            try {
                const params = { page: 1, limit: 20 };
                if (search) params.search = search;
                if (cuisine && cuisine !== 'All') params.cuisine = cuisine;

                const data = await recipeApi.getAll(params);
                if (isMounted) setRecipes(data.recipes || []);
            } catch (error) {
                console.error(error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        const t = setTimeout(fetchRecipes, 500);
        return () => {
            isMounted = false;
            clearTimeout(t);
        };
    }, [search, cuisine]);

    // Handle Card Clicks with Security Check
    const handleRecipeClick = (recipe) => {
        // Check if user has premium status (checks both common DB field names)
        const isUserPremium = user?.subscriptionStatus === 'premium' || user?.isPremium === true;

        // If recipe is premium AND user is NOT premium
        if (recipe.isPremium && !isUserPremium) {
            toast.error('👑 This is a Premium recipe! Upgrade to unlock.', {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: isDarkMode ? 'dark' : 'light',
            });
            // Stop execution here so the details panel doesn't open
            return;
        }

        // If allowed, show details
        setSelectedRecipeId(recipe._id);
    };

    // Filter recipes for display
    const displayedRecipes = recipes.filter((recipe) => {
        if (filterMode === 'premium') {
            return recipe.isPremium === true;
        }
        return true;
    });

    // Styles
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const inputBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900';

    return (
        <div className="h-[calc(100vh-5rem)] flex flex-col relative">
            {/* ToastContainer must be rendered for toasts to show */}
            <ToastContainer />

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 flex-shrink-0">
                <div>
                    <h1 className={`text-3xl font-bold ${textColor}`}>{filterMode === 'premium' ? 'Premium Collection' : 'Fresh Recipes'}</h1>
                    <p className={subText}>Discover delicious food</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none ${inputBg}`}
                        />
                    </div>
                    <select value={cuisine} onChange={(e) => setCuisine(e.target.value)} className={`px-4 py-2 rounded-lg border focus:outline-none ${inputBg}`}>
                        <option value="">All</option>
                        <option value="Italian">Italian</option>
                        <option value="Indian">Indian</option>
                        <option value="Mexican">Mexican</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden gap-6 relative">
                {/* LEFT SIDE: List */}
                <div
                    className={`flex-1 overflow-y-auto pr-2 pb-20 transition-all duration-300 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
                        selectedRecipeId ? 'hidden md:block md:w-1/2 lg:w-3/5' : 'w-full'
                    }`}
                >
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-primary" size={40} />
                        </div>
                    ) : displayedRecipes.length > 0 ? (
                        <div className={`grid gap-6 ${selectedRecipeId ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                            {displayedRecipes.map((recipe) => (
                                <RecipeCard key={recipe._id} recipe={recipe} onClick={() => handleRecipeClick(recipe)} isActive={selectedRecipeId === recipe._id} />
                            ))}
                        </div>
                    ) : (
                        <div className={`text-center py-20 rounded-xl border border-dashed ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} ${subText}`}>No recipes found.</div>
                    )}
                </div>

                {/* RIGHT SIDE: Detail Panel */}
                {selectedRecipeId && (
                    <div
                        className={`fixed inset-0 z-40 md:static md:z-0 md:block md:w-1/2 lg:w-2/5 h-full shadow-xl rounded-xl overflow-hidden border ${
                            isDarkMode ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'
                        }`}
                    >
                        <RecipeDetailPanel recipeId={selectedRecipeId} onClose={() => setSelectedRecipeId(null)} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
