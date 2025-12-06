import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Search, ChefHat } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { recipeApi } from '../api/recipes';
import RecipeCard from '../components/RecipeCard';
import RecipeDetailPanel from '../components/RecipeDetailPanel';
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';

const RecipeFeed = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { isDarkMode } = useThemeStore();
    const { user } = useAuthStore();

    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('Recipes');
    const [selectedRecipeId, setSelectedRecipeId] = useState(null);

    // Extract filters from URL
    const category = searchParams.get('category');
    const cuisine = searchParams.get('cuisine');
    const maxTime = searchParams.get('maxTime');
    const difficulty = searchParams.get('difficulty');
    const searchQuery = searchParams.get('search');

    useEffect(() => {
        // Dynamic Title
        if (searchQuery) setTitle(`Results for "${searchQuery}"`);
        else if (category === 'veg') setTitle('Vegetarian Recipes');
        else if (category === 'non-veg') setTitle('Non-Vegetarian Recipes');
        else if (category === 'premium') setTitle('Premium Collection');
        else if (category === 'healthy') setTitle('Healthy Recipes');
        else if (cuisine) setTitle(`${cuisine} Cuisine`);
        else if (maxTime) setTitle(`Quick Recipes (< ${maxTime} mins)`);
        else if (difficulty) setTitle(`${difficulty} Recipes`);
        else setTitle('Explore Recipes');

        const fetchFilteredRecipes = async () => {
            setLoading(true);
            try {
                // ✅ CLEAN PARAMETERS: Only add if they exist and are valid
                const params = { limit: 50 };

                if (category && category !== 'null') params.category = category;
                if (cuisine && cuisine !== 'null') params.cuisine = cuisine;
                if (maxTime && maxTime !== 'null') params.maxTime = maxTime;
                if (difficulty && difficulty !== 'null') params.difficulty = difficulty;
                if (searchQuery && searchQuery !== 'null') params.search = searchQuery;

                const data = await recipeApi.getAll(params);
                setRecipes(data.recipes || []);
            } catch (error) {
                console.error('Failed to fetch recipes', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFilteredRecipes();
    }, [searchParams]);

    const handleRecipeClick = (recipe) => {
        const isUserPremium = user?.subscriptionStatus === 'premium' || user?.isPremium === true;
        if (recipe.isPremium && !isUserPremium) {
            toast.error('👑 Premium recipe! Upgrade to unlock.', { position: 'top-center' });
            return;
        }
        setSelectedRecipeId(recipe._id);
    };

    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const subText = isDarkMode ? 'text-gray-400' : 'text-gray-600';
    const bgClass = isDarkMode ? 'bg-[#121212]' : 'bg-gray-50';

    return (
        <div className={`min-h-screen ${bgClass} pb-20`}>
            <ToastContainer />

            {/* Header */}
            <div className={`sticky top-16 z-30 px-6 py-4 flex items-center gap-4 border-b backdrop-blur-md ${isDarkMode ? 'bg-[#121212]/90 border-gray-800' : 'bg-white/90 border-gray-200'}`}>
                <button onClick={() => navigate(-1)} className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${textColor}`}>
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className={`text-xl font-bold ${textColor}`}>{title}</h1>
                    <p className={`text-xs ${subText}`}>{recipes.length} recipes found</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-1 overflow-hidden gap-6 relative">
                    {/* List */}
                    <div className={`flex-1 transition-all duration-300 ${selectedRecipeId ? 'hidden md:block md:w-1/2 lg:w-3/5' : 'w-full'}`}>
                        {loading ? (
                            <div className="flex justify-center py-40">
                                <Loader2 className="animate-spin text-primary" size={48} />
                            </div>
                        ) : recipes.length > 0 ? (
                            <div className={`grid gap-6 ${selectedRecipeId ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                                {recipes.map((recipe) => (
                                    <RecipeCard key={recipe._id} recipe={recipe} onClick={() => handleRecipeClick(recipe)} isActive={selectedRecipeId === recipe._id} />
                                ))}
                            </div>
                        ) : (
                            <div className={`text-center py-40 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                                <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p className={subText}>No recipes found for this category.</p>
                                <button onClick={() => navigate('/')} className="mt-4 text-primary font-bold hover:underline">
                                    Back to Home
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Detail Panel */}
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
        </div>
    );
};

export default RecipeFeed;
