import React, { useEffect, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { recipeApi } from '../api/recipes';
import RecipeCard from '../components/RecipeCard';
import useThemeStore from '../store/useThemeStore';

const Home = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [cuisine, setCuisine] = useState('');
    const { isDarkMode } = useThemeStore();

    // Styles
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const inputBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900';
    const emptyStateBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-300';

    useEffect(() => {
        let isMounted = true; // Prevents state updates if component unmounts

        const fetchRecipes = async () => {
            setLoading(true);
            try {
                // ✅ CLEAN PARAMS: Only send params if they have values
                const params = { page: 1, limit: 12 };
                if (search.trim()) params.search = search;
                if (cuisine && cuisine !== 'All') params.cuisine = cuisine;

                const data = await recipeApi.getAll(params);

                if (isMounted) {
                    // Safety check: ensure recipes is always an array
                    setRecipes(Array.isArray(data.recipes) ? data.recipes : []);
                }
            } catch (error) {
                console.error('Failed to fetch recipes:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchRecipes();
        }, 500); 

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [search, cuisine]);

    return (
        <div className="space-y-8 mb-10">
            {/* Header & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                    <h1 className={`text-3xl font-bold ${textColor}`}>Fresh Recipes</h1>
                    <p className={subText}>Discover delicious food from our community</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search recipes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm ${inputBg}`}
                        />
                    </div>
                    <select
                        value={cuisine}
                        onChange={(e) => setCuisine(e.target.value)}
                        className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm ${inputBg}`}
                    >
                        <option value="">All Cuisines</option>
                        <option value="Italian">Italian</option>
                        <option value="Indian">Indian</option>
                        <option value="Mexican">Mexican</option>
                        <option value="Chinese">Chinese</option>
                        <option value="American">American</option>
                    </select>
                </div>
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className={`flex justify-center py-20 ${textColor}`}>
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            ) : recipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {recipes.map((recipe) => (
                        <RecipeCard key={recipe._id} recipe={recipe} />
                    ))}
                </div>
            ) : (
                <div className={`text-center py-20 rounded-xl border border-dashed ${emptyStateBg} ${subText}`}>
                    <p className="text-lg">No recipes found matching your criteria.</p>
                    <button
                        onClick={() => {
                            setSearch('');
                            setCuisine('');
                        }}
                        className="mt-2 text-primary hover:underline"
                    >
                        Clear filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default Home;
