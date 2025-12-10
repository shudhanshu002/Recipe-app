import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// api
import { recipeApi } from '../api/recipes';

// store
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';

// util, skeleton & icons
import { toast } from 'react-toastify';
import RecipeDetailSkeleton from './skeletons/RecipeDetailSkeleton';
import { Clock, Star, Lock, X, Maximize2, RefreshCw, LogOut, AlertTriangle, ShieldAlert, Drumstick, Leaf, Flame } from 'lucide-react';

const RecipeDetailPanel = ({ recipeId, onClose }) => {
    const { theme } = useThemeStore();
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    const isDarkMode = theme === 'dark';

    // Helper to check premium status safely
    const isUserPremium = user?.isPremium === true || user?.subscriptionStatus === 'premium';

    useEffect(() => {
        if (!recipeId) return;

        const fetchRecipe = async () => {
            setLoading(true);
            setIsLocked(false);
            setFetchError(null);
            setRecipe(null);

            try {
                const data = await recipeApi.getOne(recipeId);
                setRecipe(data);
            } catch (err) {
                console.error('Recipe Fetch Error:', err);

                const isForbidden = err.response?.status === 403 || err.message?.includes('Premium') || err.message?.includes('Forbidden');

                if (isForbidden) {
                    const partialData = err.response?.data?.data || err.response?.data?.recipe || err.data || err.recipe;

                    if (partialData) {
                        setRecipe(partialData);
                        setIsLocked(true);
                    } else {
                        setFetchError('ACCESS_DENIED');
                    }

                    if (isUserPremium) {
                        toast.error('Server verification failed. Please refresh your session.', {
                            toastId: 'auth-sync-error',
                        });
                    }
                } else {
                    setFetchError('GENERAL_ERROR');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchRecipe();
    }, [recipeId, isUserPremium]);

    const handleRefreshSession = () => {
        logout();
        navigate('/login');
    };

    // Styles
    const panelBg = isDarkMode ? 'bg-[#1e1e1e] border-l border-gray-800' : 'bg-white border-l border-gray-200';
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const subText = isDarkMode ? 'text-gray-400' : 'text-gray-600';
    const iconHover = isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
    const tagBg = isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700';

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

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {/* Loading State */}
                {loading && <RecipeDetailSkeleton />}

                {/* ACCESS DENIED (Server returned 403 & NO Data) */}
                {!loading && fetchError === 'ACCESS_DENIED' && (
                    <div className="flex flex-col items-center justify-center py-10 text-center h-full animate-in fade-in zoom-in-95">
                        <div className={`p-6 rounded-full mb-6 ${isDarkMode ? 'bg-red-900/20' : 'bg-red-100'}`}>
                            <ShieldAlert className="w-16 h-16 text-red-500" />
                        </div>
                        <h3 className={`text-2xl font-bold mb-3 ${textColor}`}>Access Restricted</h3>

                        <div className={`mb-8 max-w-sm mx-auto p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            {isUserPremium ? (
                                <>
                                    <p className="text-red-500 font-bold text-lg mb-2">Server Sync Error</p>
                                    <p className={`${subText} text-sm`}>You are logged in as Premium, but the server is blocking your request.</p>
                                    <p className={`${subText} text-xs mt-2 opacity-75`}>(Your Auth Token is outdated. Please refresh.)</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-yellow-600 font-bold text-lg mb-2">Premium Only</p>
                                    <p className={`${subText} text-sm`}>This recipe is locked for free users.</p>
                                </>
                            )}
                        </div>

                        {isUserPremium ? (
                            <button
                                onClick={handleRefreshSession}
                                className="flex items-center gap-2 bg-[#f97316] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-500/20"
                            >
                                <RefreshCw size={20} /> Force Refresh Session
                            </button>
                        ) : (
                            <Link to="/subscription" className="flex items-center gap-2 bg-yellow-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-yellow-600 transition shadow-lg">
                                <Star size={20} className="fill-current" /> Get Premium
                            </Link>
                        )}
                    </div>
                )}

                {/*  General Error */}
                {!loading && fetchError === 'GENERAL_ERROR' && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <AlertTriangle className="w-12 h-12 text-gray-400 mb-4" />
                        <p className={subText}>Failed to load recipe. Please try again later.</p>
                        <button onClick={() => window.location.reload()} className="mt-4 text-[#f97316] font-medium hover:underline">
                            Reload Page
                        </button>
                    </div>
                )}

                {/* Success State (Or 403 with Partial Data) */}
                {!loading && recipe && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Image & Lock Overlay */}
                        <div className="aspect-video w-full rounded-xl overflow-hidden relative bg-gray-200 shadow-md">
                            <img src={recipe.images?.[0] || 'https://via.placeholder.com/800'} alt={recipe.title} className="w-full h-full object-cover" />

                            {isLocked && (
                                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white backdrop-blur-md px-4 text-center">
                                    <Lock size={40} className="mb-3 text-yellow-400" />

                                    {isUserPremium ? (
                                        <>
                                            <span className="font-bold text-xl text-yellow-400 mb-1">Sync Required</span>
                                            <p className="text-sm text-gray-200 mt-1 mb-6 max-w-xs mx-auto">Your app says Premium, but the server token is old.</p>
                                            <button
                                                onClick={handleRefreshSession}
                                                className="flex items-center gap-2 bg-[#f97316] px-6 py-2.5 rounded-lg hover:bg-orange-600 transition-colors text-sm font-bold shadow-xl border border-white/20"
                                            >
                                                <RefreshCw size={16} /> Fix My Session
                                            </button>
                                        </>
                                    ) : (
                                        <span className="font-bold text-lg">Premium Content</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Title & Author */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                {recipe.isVegetarian ? (
                                    <span
                                        className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                            isDarkMode ? 'text-green-400 bg-green-900/30 border-green-800' : 'bg-green-100 border-green-200 text-green-700'
                                        }`}
                                    >
                                        <Leaf size={12} fill="currentColor" /> Vegetarian
                                    </span>
                                ) : (
                                    <span
                                        className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border  ${
                                            isDarkMode ? 'border-red-800 text-red-400 bg-red-900/30' : 'bg-red-100 text-red-700 border-red-200'
                                        }`}
                                    >
                                        <Drumstick size={12} fill="currentColor" /> Non-Veg
                                    </span>
                                )}
                            </div>

                            <h2 className={`text-2xl font-bold leading-tight ${textColor}`}>{recipe.title || 'Untitled Recipe'}</h2>
                            <div className={`flex items-center gap-2 mt-2 ${subText}`}>
                                <span>By {recipe.createdBy?.username || 'Unknown Chef'}</span>
                            </div>
                            <div className={`flex flex-wrap items-center gap-4 text-sm mt-4 pb-4 border-b ${subText} ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                                <div className="flex items-center gap-1">
                                    <Clock size={16} /> {recipe.cookingTime}m
                                </div>
                                {recipe.calories > 0 && (
                                    <div className="flex items-center gap-1">
                                        <Flame size={16} className="text-orange-500" fill="currentColor" /> {recipe.calories} kcal
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Star size={16} className="text-yellow-500" fill="currentColor" />
                                    {recipe.averageRating?.toFixed(1)}
                                </div>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${tagBg}`}>{recipe.difficulty}</span>
                            </div>
                        </div>

                        {/* Instructions Section */}
                        <div>
                            <h3 className={`font-bold mb-3 ${textColor}`}>Instructions</h3>
                            {isLocked ? (
                                <div className={`p-8 rounded-xl text-center border-2 border-dashed ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
                                    {isUserPremium ? (
                                        <>
                                            <p className={`text-sm mb-4 font-medium ${subText}`}>Instructions hidden by backend security rule.</p>
                                            <button
                                                onClick={handleRefreshSession}
                                                className="inline-flex items-center gap-2 text-[#f97316] font-bold hover:underline bg-[#f97316]/10 px-4 py-2 rounded-lg transition-colors"
                                            >
                                                <LogOut size={16} /> Logout & Login to View
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <p className={`text-sm mb-3 ${subText}`}>This content is locked.</p>
                                            <Link to="/subscription" className="text-[#f97316] text-sm font-bold hover:underline">
                                                Upgrade to Unlock
                                            </Link>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div
                                    className={`text-sm leading-relaxed prose ${
                                        isDarkMode ? 'prose-invert' : ''
                                    } max-w-none [&>p]:mb-2 [&>img]:rounded-lg [&>img]:my-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 ${subText}`}
                                    dangerouslySetInnerHTML={{ __html: recipe.instructions || 'No instructions available.' }}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipeDetailPanel;
