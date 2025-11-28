import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Heart, Bookmark, Clock, Star } from 'lucide-react';
import { socialApi } from '../api/social';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';

const RecipeCard = ({ recipe, onClick, isActive }) => {
    const { user } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    
    const imageSrc = recipe.images?.length > 0 ? recipe.images[0] : 'https://placehold.co/600x400/orange/white?text=YumTummy';

    const toggleLike = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return alert('Login to like');
        setIsLiked(!isLiked);
        try {
            await socialApi.toggleLike(recipe._id);
        } catch {
            setIsLiked(!isLiked);
        }
    };

    const toggleBookmark = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return alert('Login to bookmark');
        setIsBookmarked(!isBookmarked);
        try {
            await socialApi.toggleBookmark(recipe._id);
        } catch {
            setIsBookmarked(!isBookmarked);
        }
    };

    const cardBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-100';
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const activeClass = isActive ? `ring-2 ring-primary ring-offset-2 ${isDarkMode ? 'ring-offset-[#121212]' : 'ring-offset-white'}` : '';
    const Wrapper = onClick ? 'div' : Link;
    const wrapperProps = onClick ? { onClick: () => onClick(recipe._id) } : { to: `/recipes/${recipe._id}` };

    return (
        <Wrapper {...wrapperProps} className={`group block rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border cursor-pointer ${cardBg} ${activeClass}`}>
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                <img
                    src={imageSrc}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => (e.target.src = 'https://placehold.co/600x400?text=No+Image')}
                />

                <div className="absolute top-3 left-3 flex gap-2">
                    {recipe.isPremium && <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold uppercase rounded shadow-sm">Premium</span>}
                </div>

                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={toggleLike} className="p-2 bg-white/90 rounded-full shadow-sm hover:text-red-500">
                        <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                    </button>
                    <button onClick={toggleBookmark} className="p-2 bg-white/90 rounded-full shadow-sm hover:text-blue-500">
                        <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                </div>
            </div>

            <div className="p-4">
                <h3 className={`text-lg font-bold mb-1 line-clamp-1 ${textColor}`}>{recipe.title}</h3>
                <div className={`flex items-center gap-4 text-xs mb-3 ${subText}`}>
                    <div className="flex items-center gap-1">
                        <Clock size={14} /> {recipe.cookingTime || 30}m
                    </div>
                    <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500" fill="currentColor" /> {recipe.averageRating || 0}
                    </div>
                </div>
            </div>
        </Wrapper>
    );
};

RecipeCard.propTypes = {
    recipe: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    isActive: PropTypes.bool,
};

export default RecipeCard;
