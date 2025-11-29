import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, User, Star, Lock, ChevronLeft, ChevronRight, PlayCircle, Video } from 'lucide-react';
import { recipeApi } from '../api/recipes';
import useThemeStore from '../store/useThemeStore';

const RecipeDetail = () => {
    const { id } = useParams();
    const { isDarkMode } = useThemeStore();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false);

    // Carousel State
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const data = await recipeApi.getOne(id);
                setRecipe(data);
            } catch (err) {
                // Handle Premium Lock
                if (err.response?.status === 403) {
                    setRecipe(err.response.data.data);
                    setIsLocked(true);
                }
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchRecipe();
    }, [id]);

    // Helper to combine Images + Video into one list
    const getMediaList = () => {
        if (!recipe) return [];

        // 1. Add Images
        const list = recipe.images?.map((url) => ({ type: 'image', url })) || [];

        // 2. Add Video (Only if exists and NOT locked)
        if (recipe.videoUrl && !isLocked) {
            list.push({ type: 'video', url: recipe.videoUrl });
        }
        return list;
    };

    const mediaList = getMediaList();

    // Carousel Handlers
    const nextSlide = (e) => {
        e?.stopPropagation();
        if (mediaList.length > 1) {
            setCurrentIndex((prev) => (prev + 1) % mediaList.length);
        }
    };

    const prevSlide = (e) => {
        e?.stopPropagation();
        if (mediaList.length > 1) {
            setCurrentIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
        }
    };

    // Styles
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const subText = isDarkMode ? 'text-gray-300' : 'text-gray-600';
    const metaBorder = isDarkMode ? 'border-gray-700' : 'border-gray-100';
    const tagBg = isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700';
    const lockBoxBg = isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-300';

    if (loading) return <div className={`text-center py-20 ${textColor}`}>Loading...</div>;
    if (!recipe && !isLocked) return <div className={`text-center py-20 ${textColor}`}>Recipe not found</div>;

    const currentMedia = mediaList[currentIndex];

    return (
        <div className="max-w-4xl mx-auto space-y-8 mb-10">
            <div className="space-y-4">
                <div className={`aspect-video w-full rounded-2xl overflow-hidden shadow-lg relative ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} group`}>
                    {/* Display Current Media */}
                    {currentMedia?.type === 'video' ? (
                        <video
                            src={currentMedia.url}
                            controls
                            className="w-full h-full object-contain bg-black"
                            autoPlay
                            muted // Muted required for autoplay in many browsers
                        />
                    ) : (
                        <img
                            src={currentMedia?.url || 'https://via.placeholder.com/800x450?text=No+Image'}
                            alt={recipe.title}
                            className="w-full h-full object-cover transition-transform duration-300"
                        />
                    )}

                    {/* Premium Lock Overlay */}
                    {isLocked && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm p-4 text-center z-10">
                            <Lock size={48} className="mb-4 text-yellow-400" />
                            <h2 className="text-3xl font-bold mb-2">Premium Content</h2>
                            <p className="text-lg text-gray-200">Subscribe to unlock full details.</p>
                        </div>
                    )}

                    {/* Navigation Arrows */}
                    {mediaList.length > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 z-20"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 z-20"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}

                    {/* Counter Badge */}
                    {mediaList.length > 1 && (
                        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 text-white text-xs rounded-full z-20">
                            {currentIndex + 1} / {mediaList.length}
                        </div>
                    )}
                </div>

                {/* Thumbnails Row */}
                {mediaList.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {mediaList.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                                    currentIndex === idx ? 'border-primary ring-2 ring-primary/30' : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                            >
                                {item.type === 'video' ? (
                                    <div className="w-full h-full bg-black flex items-center justify-center text-white">
                                        <PlayCircle size={24} />
                                    </div>
                                ) : (
                                    <img src={item.url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Title & Meta */}
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <h1 className={`text-4xl font-bold ${textColor}`}>{recipe?.title || 'Premium Recipe'}</h1>
                    <div className={`flex items-center gap-1 text-yellow-500 px-3 py-1 rounded-lg ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                        <Star size={20} fill="currentColor" />
                        <span className="font-bold">{recipe?.averageRating?.toFixed(1) || 'New'}</span>
                    </div>
                </div>

                <p className={`text-lg leading-relaxed ${subText}`}>{recipe?.description}</p>

                <div className={`flex gap-6 text-sm py-4 border-y ${metaBorder} ${subText}`}>
                    
                    <Link to={`/profile/${recipe?.createdBy?.username}`} className="flex items-center gap-2 hover:text-primary transition-colors group">
                        <img src={recipe?.createdBy?.avatar || 'https://via.placeholder.com/30'} className="w-6 h-6 rounded-full object-cover" alt="Chef" />
                        <span className={`font-medium group-hover:text-primary ${textColor}`}>By {recipe?.createdBy?.username || 'Chef'}</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Clock size={18} />
                        <span>{recipe?.cookingTime || 30} mins</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full ${tagBg}`}>{recipe?.difficulty}</span>
                </div>
            </div>

            {/* Body Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                    <h3 className={`text-xl font-bold ${textColor}`}>Ingredients</h3>
                    <ul className="space-y-3">
                        {recipe?.ingredients?.map((ing, i) => (
                            <li key={i} className={`flex items-start gap-3 ${subText}`}>
                                <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                {ing}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <h3 className={`text-xl font-bold ${textColor}`}>Instructions</h3>
                    {isLocked ? (
                        <div className={`p-8 rounded-xl text-center border-2 border-dashed ${lockBoxBg}`}>
                            <Lock className="mx-auto text-gray-400 mb-2" size={32} />
                            <p className={subText}>Locked Content</p>
                            <Link to="/subscription" className="text-primary hover:underline font-bold mt-2 inline-block">
                                Upgrade to Premium
                            </Link>
                        </div>
                    ) : (
                        <div className={`whitespace-pre-wrap leading-relaxed ${subText}`}>{recipe?.instructions}</div>
                    )}
                </div>
            </div>


            <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
                <h3 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${textColor}`}>
                    <Video className="text-primary" /> Video Tutorial
                </h3>

                {isLocked ? (
                    <div className={`aspect-video w-full rounded-xl flex flex-col items-center justify-center border-2 border-dashed ${lockBoxBg}`}>
                        <Lock className="text-gray-400 mb-2" size={40} />
                        <p className={subText}>Video is locked for Premium Members</p>
                    </div>
                ) : recipe?.videoUrl ? (
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-lg">
                        <video
                            src={recipe.videoUrl}
                            controls
                            className="w-full h-full"
                            poster={recipe.images?.[0]} // Use first image as poster
                        />
                    </div>
                ) : (
                    <div className={`p-8 text-center rounded-xl border border-dashed ${isDarkMode ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-400'}`}>
                        No video available for this recipe.
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipeDetail;
