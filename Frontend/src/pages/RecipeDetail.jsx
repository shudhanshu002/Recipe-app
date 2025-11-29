import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, User, Star, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { recipeApi } from '../api/recipes';
import useThemeStore from '../store/useThemeStore';

const RecipeDetail = () => {
    const { id } = useParams();
    const { isDarkMode } = useThemeStore();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false);

    
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const data = await recipeApi.getOne(id);
                setRecipe(data);
            } catch (err) {
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

    
    const nextImage = (e) => {
        e?.stopPropagation();
        if (recipe?.images?.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % recipe.images.length);
        }
    };

    const prevImage = (e) => {
        e?.stopPropagation();
        if (recipe?.images?.length > 1) {
            setCurrentImageIndex((prev) => (prev === 0 ? recipe.images.length - 1 : prev - 1));
        }
    };

    
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const subText = isDarkMode ? 'text-gray-300' : 'text-gray-600';
    const metaBorder = isDarkMode ? 'border-gray-700' : 'border-gray-100';
    const tagBg = isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700';
    const lockBoxBg = isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-300';

    if (loading) return <div className={`text-center py-20 ${textColor}`}>Loading...</div>;
    if (!recipe && !isLocked) return <div className={`text-center py-20 ${textColor}`}>Recipe not found</div>;

    const currentImage = recipe.images?.[currentImageIndex] || 'https://via.placeholder.com/800x450?text=No+Image';

    return (
        <div className="max-w-4xl mx-auto space-y-8 mb-10">
            
            <div className="space-y-4">
                <div className={`aspect-video w-full rounded-2xl overflow-hidden shadow-lg relative ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} group`}>
                    <img src={currentImage} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-300" />

                    
                    {isLocked && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm p-4 text-center z-10">
                            <Lock size={48} className="mb-4 text-yellow-400" />
                            <h2 className="text-3xl font-bold mb-2">Premium Content</h2>
                            <p className="text-lg text-gray-200">Subscribe to unlock full details.</p>
                        </div>
                    )}

                    
                    {recipe.images?.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}


                    {recipe.images?.length > 1 && (
                        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 text-white text-xs rounded-full">
                            {currentImageIndex + 1} / {recipe.images.length}
                        </div>
                    )}
                </div>


                {recipe.images?.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {recipe.images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                                    currentImageIndex === idx ? 'border-primary ring-2 ring-primary/30' : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                            >
                                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>


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
                    <div className="flex items-center gap-2">
                        <User size={18} />
                        <span>By {recipe?.createdBy?.username || 'Chef'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={18} />
                        <span>{recipe?.cookingTime || 30} mins</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full ${tagBg}`}>{recipe?.difficulty}</span>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                    <h3 className={`text-xl font-bold ${textColor}`}>Ingredients</h3>
                    <ul className="space-y-3">
                        {recipe?.ingredients?.map((ing, i) => (
                            <li key={i} className={`flex items-start gap-3 ${subText}`}>
                                <span className="w-2 h-2 rounded-full bg-primary mt-2" />
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
        </div>
    );
};

export default RecipeDetail;
