import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, Lock, X, Maximize2 } from 'lucide-react';
import { recipeApi } from '../api/recipes';
import useThemeStore from '../store/useThemeStore';

const RecipeDetailPanel = ({ recipeId, onClose }) => {
    const { isDarkMode } = useThemeStore();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        if (!recipeId) return;

        const fetchRecipe = async () => {
            setLoading(true);
            setIsLocked(false);
            try {
                const data = await recipeApi.getOne(recipeId);
                setRecipe(data);
            } catch (err) {
                if (err.response?.status === 403) {
                    setRecipe(err.response?.data?.data);
                    setIsLocked(true);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchRecipe();
    }, [recipeId]);

    // Styles
    const panelBg = isDarkMode ? 'bg-[#1e1e1e] border-l border-gray-800' : 'bg-white border-l border-gray-200';
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const subText = isDarkMode ? 'text-gray-400' : 'text-gray-600';
    const iconHover = isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

    if (!recipeId) return null;

    return (
        <div className={`h-full flex flex-col ${panelBg}`}>
            {/* Toolbar */}
            <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex gap-2">
                    <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${iconHover} ${subText}`} title="Close">
                        <X size={20} />
                    </button>
                    <Link to={`/recipes/${recipeId}`} className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${iconHover} ${subText}`} title="Open Full Page">
                        <Maximize2 size={18} />
                        <span className="text-sm font-medium hidden sm:inline">Full Screen</span>
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {loading ? (
                    <div className={`text-center py-20 ${subText}`}>Loading details...</div>
                ) : recipe ? (
                    <div className="space-y-6">
                        <div className="aspect-video w-full rounded-xl overflow-hidden relative bg-gray-200">
                            <img src={recipe.images?.[0]} alt={recipe.title} className="w-full h-full object-cover" />
                            {isLocked && (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                                    <Lock size={32} className="mb-2 text-yellow-400" />
                                    <span className="font-bold">Premium Only</span>
                                </div>
                            )}
                        </div>


                        <div>
                            <h2 className={`text-2xl font-bold leading-tight ${textColor}`}>{recipe.title}</h2>


                            <Link to={`/profile/${recipe.createdBy?.username}`} className="inline-flex items-center gap-2 mt-2 hover:opacity-80 transition-opacity group">
                                <img src={recipe.createdBy?.avatar || 'https://via.placeholder.com/30'} className="w-6 h-6 rounded-full object-cover" alt="chef" />
                                <span className={`text-sm font-medium group-hover:text-primary ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{recipe.createdBy?.username}</span>
                            </Link>

                            <div className={`flex items-center gap-4 text-sm mt-3 ${subText}`}>
                                <div className="flex items-center gap-1">
                                    <Clock size={16} /> {recipe.cookingTime}m
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star size={16} className="text-yellow-500" fill="currentColor" /> {recipe.averageRating?.toFixed(1)}
                                </div>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>{recipe.difficulty}</span>
                            </div>
                        </div>

                        <p className={`text-sm leading-relaxed ${subText}`}>{recipe.description}</p>

                        {/* Ingredients Preview */}
                        <div>
                            <h3 className={`font-bold mb-3 ${textColor}`}>Ingredients</h3>
                            <ul className="space-y-2">
                                {recipe.ingredients?.slice(0, 5).map((ing, i) => (
                                    <li key={i} className={`flex items-start gap-2 text-sm ${subText}`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                        {ing}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20">Recipe not found</div>
                )}
            </div>
        </div>
    );
};

export default RecipeDetailPanel;
