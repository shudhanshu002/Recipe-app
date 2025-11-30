import React, { useEffect, useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { socialApi } from '../api/social';
import RecipeCard from '../components/RecipeCard';
import useThemeStore from '../store/useThemeStore';

const Favorites = () => {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isDarkMode } = useThemeStore();

    useEffect(() => {
        const fetchBookmarks = async () => {
            try {
                const data = await socialApi.getBookmarks();
                // Backend returns: [{ _id, user, recipe: { ... } }]
                setBookmarks(data);
            } catch (error) {
                console.error('Failed to fetch favorites', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookmarks();
    }, []);

    // ✅ NEW: Handler to remove item from UI immediately when unbookmarked
    const handleRemoveFromList = (recipeId) => {
        setBookmarks((prev) => prev.filter((b) => b.recipe._id !== recipeId));
    };

    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';

    if (loading)
        return (
            <div className={`flex justify-center py-20 ${textColor}`}>
                <Loader2 className="animate-spin" size={40} />
            </div>
        );

    return (
        <div className="max-w-6xl mx-auto space-y-8 mb-10">
            <h1 className={`text-3xl font-bold flex items-center gap-3 ${textColor}`}>
                <Heart className="text-red-500" fill="currentColor" /> Your Favorites
            </h1>

            {bookmarks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {bookmarks.map((b) =>
                        b.recipe ? (
                            <RecipeCard
                                key={b._id}
                                // ✅ FORCE isBookmarked: true because we are on the favorites page
                                recipe={{ ...b.recipe, isBookmarked: true }}
                                // ✅ Pass callback to remove it from this list instantly
                                onUnbookmark={() => handleRemoveFromList(b.recipe._id)}
                            />
                        ) : null,
                    )}
                </div>
            ) : (
                <div className={`text-center py-20 text-gray-500 rounded-xl border border-dashed ${isDarkMode ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-300'}`}>
                    <p className="text-lg">You haven't saved any recipes yet.</p>
                </div>
            )}
        </div>
    );
};
export default Favorites;
