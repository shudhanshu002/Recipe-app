import { useEffect, useState } from 'react';
import { socialApi } from '../api/social';
import useThemeStore from '../store/useThemeStore';
import RecipeCard from '../components/RecipeCard';
import RecipeCardSkeleton from '../components/skeletons/RecipeCardSkeleton';
import { Heart } from 'lucide-react';

const Favorites = () => {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useThemeStore();
    const isDarkMode = theme === 'dark';

    useEffect(() => {
        const fetchBookmarks = async () => {
            try {
                const data = await socialApi.getBookmarks();
                setBookmarks(data);
            } catch (error) {
                console.error('Failed to fetch favorites', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookmarks();
    }, []);

    // Handler to remove item from UI immediately when unbookmarked
    const handleRemoveFromList = (recipeId) => {
        setBookmarks((prev) => prev.filter((b) => b.recipe._id !== recipeId));
    };

    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';

    if (loading)
        return (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <RecipeCardSkeleton key={i} />
                ))}
            </div>
        );

    return (
        <div className="font-dancing max-w-6xl mx-auto space-y-8 mb-10 mt-5">
            <h1 className={`text-3xl font-bold flex items-center gap-3 ${textColor}`}>
                <Heart className="text-red-500" fill="currentColor" /> Your Favorites
            </h1>

            {bookmarks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {bookmarks.map((b) =>
                        b.recipe ? (
                            <RecipeCard
                                key={b._id}
                                // FORCE isBookmarked: true because we are on the favorites page
                                recipe={{ ...b.recipe, isBookmarked: true }}
                                // Pass callback to remove it from this list instantly
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
