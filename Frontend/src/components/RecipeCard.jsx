import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// apis
import { socialApi } from '../api/social';
import { recipeApi } from '../api/recipes';

// store
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';

// animation & utils
import { motion } from 'framer-motion';
import { formatTime, formatRelativeDate } from '../utils/formatDate';
import ShareModal from './ShareModal';
import { FloatingHearts } from './FloatingHearts';

// icons
import {
  Heart,
  Bookmark,
  Clock,
  Star,
  Trash2,
  Eye,
  Share2,
} from 'lucide-react';

const DietBadge = ({ isVeg }) => {
  const colorClass = isVeg ? 'border-green-600' : 'border-red-600';
  const fillClass = isVeg ? 'bg-green-600' : 'bg-red-600';

  return (
    <div
      className={`w-5 h-5 border-[1.5px] ${colorClass} flex items-center justify-center bg-white rounded-sm`}
      title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
    >
      <div className={`w-2.5 h-2.5 rounded-full ${fillClass}`}></div>
    </div>
  );
};

const RecipeCard = ({ recipe, onClick, isActive, onUnbookmark, onDelete }) => {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  const isDarkMode = theme === 'dark';

  const [isLiked, setIsLiked] = useState(recipe.isLiked || false);
  const [likeCount, setLikeCount] = useState(recipe.likesCount || 0);
  const [isBookmarked, setIsBookmarked] = useState(
    recipe.isBookmarked || false
  );
  const [showShareModal, setShowShareModal] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);

  // useEffect(() => {
  //     setIsLiked(recipe.isLiked || false);
  //     setIsBookmarked(recipe.isBookmarked || false);
  //     if (recipe.likesCount !== undefined) setLikeCount(recipe.likesCount);
  // }, [recipe]);

  const imageSrc =
    recipe.images?.length > 0
      ? recipe.images[0]
      : 'https://placehold.co/600x400/orange/white?text=YumRecipe';
  const shareUrl = `${window.location.origin}/recipes/${recipe._id}`;

  const toggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return alert('Login to like');
    const prevLiked = isLiked;
    setIsLiked(!isLiked);

    if (!prevLiked) {
      setHeartBurst(Date.now());
    }

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

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await recipeApi.delete(recipe._id);
        if (onDelete) onDelete(recipe._id);
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

  const cardBg = isDarkMode
    ? 'bg-gray-900 border-gray-800'
    : 'bg-gray-200 border-gray-100';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const activeClass = isActive
    ? `ring-2 ring-[#f97316] ring-offset-2 ${isDarkMode ? 'ring-offset-[#121212]' : 'ring-offset-white'}`
    : '';

  const isOwner =
    user &&
    recipe.createdBy &&
    (user._id === recipe.createdBy._id ||
      user.username === recipe.createdBy.username);
  const Wrapper = onClick ? 'div' : Link;
  const wrapperProps = onClick
    ? { onClick: () => onClick(recipe._id), role: 'button' }
    : { to: `/recipes/${recipe._id}` };

  const bounceVariant = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: {
      opacity: 1,
      y: [20, -10, 0],
      scale: [0.95, 1.08, 1],
      transition: {
        duration: 0.2,
        ease: 'easeOut',
        times: [0, 0.4, 1],
      },
    },
    hover: {
      y: -8,
      scale: 1.08,
      transition: {
        type: 'spring',
        stiffness: 250,
        damping: 4,
      },
    },
  };

  return (
    <>
      <motion.div
        variants={bounceVariant}
        initial="hidden"
        whileInView="visible"
        whileHover="hover"
        viewport={{ once: true }}
        className="font-dancing rounded-xl relative"
      >
        <Wrapper
          {...wrapperProps}
          className={`font-dancing shadow-md hover:shadow-2xl group block rounded-xl overflow-hidden transition-all border cursor-pointer ${cardBg} ${activeClass} relative`}
        >
          <div className="relative aspect-4/3 overflow-hidden bg-gray-200">
            <img
              src={imageSrc}
              alt={recipe.title}
              className="w-full h-full object-cover "
              onError={(e) =>
                (e.target.src = 'https://placehold.co/600x400?text=No+Image')
              }
            />

            <div className="absolute top-3 left-3 z-10">
              <DietBadge isVeg={recipe.isVegetarian} />
            </div>

            <div className="absolute top-2 left-10 z-10">
              {recipe.isPremium && (
                <span className="px-3 py-1 text-xs font-bold uppercase rounded-md bg-black/70 text-yellow-400 border border-yellow-400 shadow-md">
                  Premium
                </span>
              )}
            </div>

            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-full shadow-sm hover:text-red-600 bg-white/90 text-red-500 mb-1 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-full shadow-sm hover:text-blue-500 transition-colors ${
                  isBookmarked
                    ? 'bg-[#f97316] text-white hover:text-white'
                    : 'bg-white/90 text-gray-600'
                }`}
              >
                <Bookmark
                  size={18}
                  fill={isBookmarked ? 'currentColor' : 'none'}
                />
              </button>
            </div>
          </div>

          <div className="p-4">
            <h3 className={`text-lg font-bold mb-1 line-clamp-1 ${textColor}`}>
              {recipe.title}
            </h3>

            <div
              className={`flex items-center justify-between text-xs mb-3 ${subText}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1" title="Cooking Time">
                  <Clock size={14} /> {formatTime(recipe.cookingTime)}
                </div>
                <div className="flex items-center gap-1">
                  <Star
                    size={14}
                    className="text-yellow-500"
                    fill="currentColor"
                  />{' '}
                  {recipe.averageRating > 0
                    ? recipe.averageRating.toFixed(1)
                    : 'New'}
                </div>
                {/* View Count */}
                <div className="flex items-center gap-1" title="Unique Views">
                  <Eye size={14} /> {recipe.views || 0}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Share Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowShareModal(true);
                  }}
                  className={`p-1.5 rounded-full text-gray-400 hover:text-blue-500 transition-colors ${isDarkMode ? 'hover:bg-blue-900/20' : 'hover:bg-blue-50'}`}
                  title="Share"
                >
                  <Share2 size={16} />
                </button>

                {/* Like Button */}
                <button
                  onClick={toggleLike}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors z-10 ${isLiked ? 'text-red-500' : 'text-gray-400'} ${
                    isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                  }`}
                >
                  <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                  {likeCount > 0 && (
                    <span className="font-bold">{likeCount}</span>
                  )}
                </button>
              </div>
            </div>

            <div
              onClick={handleProfileClick}
              className={`flex items-center gap-2 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} hover:opacity-80 transition-opacity relative z-10`}
            >
              <img
                src={
                  recipe.createdBy?.avatar || 'https://via.placeholder.com/30'
                }
                alt="Chef"
                className="w-6 h-6 rounded-full object-cover"
              />
              <span
                className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
              >
                {recipe.createdBy?.username || 'Unknown'}
              </span>
              <span className="text-[10px] text-gray-400 ml-auto">
                {formatRelativeDate(recipe.createdAt)}
              </span>
            </div>
          </div>
        </Wrapper>
        <FloatingHearts trigger={heartBurst} />
      </motion.div>
      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          url={shareUrl}
          title={recipe.title}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
};

export default RecipeCard;
