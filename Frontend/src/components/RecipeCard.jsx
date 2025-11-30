import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Heart, Bookmark, Clock, Star, Trash2 } from 'lucide-react';
import { socialApi } from '../api/social';
import { recipeApi } from '../api/recipes'; // You need this to call delete
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import { formatTime, formatRelativeDate } from '../utils/formatDate';

const RecipeCard = ({ recipe, onClick, isActive, onUnbookmark, onDelete }) => {
    const { user } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const navigate = useNavigate();

    const [isLiked, setIsLiked] = useState(recipe.isLiked || false);
    const [likeCount, setLikeCount] = useState(recipe.likesCount || 0);
    const [isBookmarked, setIsBookmarked] = useState(recipe.isBookmarked || false);

    useEffect(() => {
        setIsLiked(recipe.isLiked || false);
        setIsBookmarked(recipe.isBookmarked || false);
        if (recipe.likesCount !== undefined) setLikeCount(recipe.likesCount);
    }, [recipe]);

    const imageSrc = recipe.images?.length > 0 ? recipe.images[0] : 'https://placehold.co/600x400/orange/white?text=YumRecipe';

    const toggleLike = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return alert('Login to like');
        const prevLiked = isLiked;
        setIsLiked(!isLiked);
        setLikeCount((prev) => (!prevLiked ? prev + 1 : Math.max(0, prev - 1)));
        try {
            await socialApi.toggleLike(recipe._id);
        } catch {
            setIsLiked(prevLiked);
            setLikeCount((prev) => (prevLiked ? prev + 1 : Math.max(0, prev - 1)));
        }
    };

    const toggleBookmark = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return alert('Login to bookmark');
        const prev = isBookmarked;
        setIsBookmarked(!isBookmarked);
        try {
            await socialApi.toggleBookmark(recipe._id);
            if (prev === true && onUnbookmark) onUnbookmark(recipe._id);
        } catch {
            setIsBookmarked(prev);
        }
    };

    //  Delete Handler
    const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this recipe? This cannot be undone.')) {
            try {
                await recipeApi.delete(recipe._id);
                if (onDelete) onDelete(recipe._id); // Callback to remove from UI
            } catch (error) {
                alert('Failed to delete recipe');
            }
        }
    };

    const handleProfileClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/profile/${recipe.createdBy?.username}`);
    };

    const cardBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-100';
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const activeClass = isActive ? `ring-2 ring-primary ring-offset-2 ${isDarkMode ? 'ring-offset-[#121212]' : 'ring-offset-white'}` : '';
    const isOwner = user && recipe.createdBy && (user._id === recipe.createdBy._id || user.username === recipe.createdBy.username);

    const Wrapper = onClick ? 'div' : Link;
    const wrapperProps = onClick ? { onClick: () => onClick(recipe._id), role: 'button' } : { to: `/recipes/${recipe._id}` };

    return (
        <Wrapper {...wrapperProps} className={`group block rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border cursor-pointer ${cardBg} ${activeClass} relative`}>
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                <img
                    src={imageSrc}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => (e.target.src = 'https://placehold.co/600x400?text=No+Image')}
                />

                <div className="absolute top-3 left-3 flex gap-2 z-10">
                    {recipe.isPremium && <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold uppercase rounded shadow-sm">Premium</span>}
                </div>

                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    
                    {isOwner && (
                        <button onClick={handleDelete} className="p-2 rounded-full shadow-sm hover:text-red-600 bg-white/90 text-red-500 mb-1">
                            <Trash2 size={18} />
                        </button>
                    )}

                    <button
                        onClick={toggleLike}
                        className={`p-2 rounded-full shadow-sm hover:text-red-500 transition-colors ${isLiked ? 'bg-red-500 text-white hover:text-white' : 'bg-white/90 text-gray-600'}`}
                    >
                        <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                    </button>
                    <button
                        onClick={toggleBookmark}
                        className={`p-2 rounded-full shadow-sm hover:text-blue-500 transition-colors ${isBookmarked ? 'bg-primary text-white hover:text-white' : 'bg-white/90 text-gray-600'}`}
                    >
                        <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                </div>
            </div>

            <div className="p-4">
                <h3 className={`text-lg font-bold mb-1 line-clamp-1 ${textColor}`}>{recipe.title}</h3>
                <div className={`flex items-center justify-between text-xs mb-3 ${subText}`}>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1" title="Cooking Time">
                            <Clock size={14} /> {formatTime(recipe.cookingTime)}
                        </div>
                        <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-500" fill="currentColor" /> {recipe.averageRating > 0 ? recipe.averageRating.toFixed(1) : 'New'}
                        </div>
                    </div>
                    <button
                        onClick={toggleLike}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors z-10 hover:bg-red-50 dark:hover:bg-red-900/20 ${isLiked ? 'text-red-500' : 'text-gray-400'}`}
                    >
                        <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                        {likeCount > 0 && <span className="font-bold">{likeCount}</span>}
                    </button>
                </div>
                <div className={`flex items-center justify-between pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div onClick={handleProfileClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity relative z-10">
                        <img src={recipe.createdBy?.avatar || 'https://via.placeholder.com/30'} alt="Chef" className="w-6 h-6 rounded-full object-cover" />
                        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{recipe.createdBy?.username || 'Unknown'}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">{formatRelativeDate(recipe.createdAt)}</span>
                </div>
            </div>
        </Wrapper>
    );
};

RecipeCard.propTypes = {
    recipe: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    isActive: PropTypes.bool,
    onUnbookmark: PropTypes.func,
    onDelete: PropTypes.func, 
};

export default RecipeCard;
