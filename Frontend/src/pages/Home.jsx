import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Search, Loader2, PlayCircle, Star, ChevronRight, X, Lock, Flame, Clock, ChefHat, Heart, Mail, ArrowRight, User, Zap } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { recipeApi } from '../api/recipes';
import RecipeCard from '../components/RecipeCard';
import RecipeDetailPanel from '../components/RecipeDetailPanel';
import CustomVideoPlayer from '../components/CustomVideoPlayer';
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';

// --- UI CONFIGURATION ---
const POPULAR_CATEGORIES = [
    { id: 'veg', label: 'Vegetarian', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80', filter: 'veg' },
    { id: 'non-veg', label: 'Non-Vegetarian', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80', filter: 'non-veg' },
    { id: 'dessert', label: 'Desserts', image: 'https://images.unsplash.com/photo-1563729768-b619b4141e9b?w=800&q=80', filter: 'dessert' },
    { id: 'healthy', label: 'Healthy', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80', filter: 'healthy' },
];

const TIME_CARDS = [
    { label: 'Speedy Meals', sub: '< 15 Mins', val: 15, color: 'bg-green-100 dark:bg-green-900/30 text-green-600', icon: <Zap size={24} /> },
    { label: 'Casual Cooking', sub: '30 Mins', val: 30, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', icon: <Clock size={24} /> },
    { label: 'Gourmet Prep', sub: '60 Mins', val: 60, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600', icon: <ChefHat size={24} /> },
    { label: 'Slow Food', sub: '1 Hr+', val: 120, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600', icon: <Flame size={24} /> },
];

const CUISINE_CARDS = [
    { label: 'Indian', image: 'https://images.unsplash.com/photo-1585937421612-70a008356f36?w=500&q=80' },
    { label: 'Italian', image: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=500&q=80' },
    { label: 'Chinese', image: 'https://images.unsplash.com/photo-1563245372-f21720e3260d?w=500&q=80' },
    { label: 'Mexican', image: 'https://images.unsplash.com/photo-1626808642875-0aa545482dfb?w=500&q=80' },
    { label: 'American', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80' },
    { label: 'Japanese', image: 'https://images.unsplash.com/photo-1583623025817-d180a4795b95?w=500&q=80' },
    { label: 'Mediterranean', image: 'https://images.unsplash.com/photo-1523986395389-c8a83261bb80?w=500&q=80' },
    { label: 'Thai', image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500&q=80' },
];

const CIRCLE_CATEGORIES = [
    { id: 'quick', label: 'Quick & Easy', image: 'https://images.unsplash.com/photo-1626808642875-0aa545482dfb?auto=format&fit=crop&w=300&q=80', param: 'maxTime=15' },
    { id: 'dinner', label: 'Dinner', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80', param: 'search=Dinner' },
    { id: 'lunch', label: 'Lunch', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80', param: 'search=Lunch' },
    { id: 'veg', label: 'Veg', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80', param: 'category=veg' },
    { id: 'non-veg', label: 'Non-Veg', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=300&q=80', param: 'category=non-veg' },
];

const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode } = useThemeStore();
    const { user } = useAuthStore();

    // --- STATE ---
    const [trendingRecipes, setTrendingRecipes] = useState([]);
    const [latestRecipes, setLatestRecipes] = useState([]);
    const [favoriteVideos, setFavoriteVideos] = useState([]);
    const [topChefs, setTopChefs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [selectedRecipeId, setSelectedRecipeId] = useState(null);
    const [viewingVideo, setViewingVideo] = useState(null);

    // --- FETCH DATA ---
    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Main Feed
                const data = await recipeApi.getAll({ limit: 60 });
                const recipes = data.recipes || [];

                if (isMounted) {
                    const trending = [...recipes].sort((a, b) => b.averageRating - a.averageRating).slice(0, 4);
                    setTrendingRecipes(trending);
                    const latest = [...recipes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
                    setLatestRecipes(latest);
                }

                if (user && isMounted) {
                    try {
                        const likedData = await recipeApi.getLikedVideos();
                        setFavoriteVideos(likedData || []);
                    } catch (error) {
                        console.error('Failed to load favorites', error);
                    }
                }

                try {
                    const chefs = await recipeApi.getTopChefs();
                    if (isMounted) setTopChefs(chefs || []);
                } catch (error) {
                    console.error('Failed to load top chefs', error);
                }
            } catch (error) {
                console.error('Failed to load home data', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => {
            isMounted = false;
        };
    }, [user]);

    const handleRecipeClick = (recipe) => {
        const isUserPremium = user?.subscriptionStatus === 'premium' || user?.isPremium === true;
        if (recipe.isPremium && !isUserPremium) {
            toast.error('👑 Premium recipe! Upgrade to unlock.', { position: 'top-center' });
            return;
        }
        setSelectedRecipeId(recipe._id);
    };

    const handleVideoClick = (recipe) => {
        const isUserPremium = user?.subscriptionStatus === 'premium' || user?.isPremium === true;
        if (recipe.isPremium && !isUserPremium) {
            toast.error('👑 Premium Content! Upgrade to watch.', { position: 'top-center' });
            return;
        }
        setViewingVideo(recipe);
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/recipes?search=${encodeURIComponent(search)}`);
        }
    };

    // ✅ NAVIGATION HANDLER
    const handleFilterClick = (type, value) => {
        let query = '';
        if (type === 'category') query = `category=${value}`;
        else if (type === 'time') query = `maxTime=${value}`;
        else if (type === 'cuisine') query = `cuisine=${value}`;
        else if (type === 'quick') query = value; // param is already formatted

        if (query) navigate(`/recipes?${query}`);
    };

    // --- STYLES ---
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const subText = isDarkMode ? 'text-gray-400' : 'text-gray-600';
    const cardBg = isDarkMode ? 'bg-[#252525] border-gray-800' : 'bg-white border-gray-100';
    const inputBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900';

    return (
        <div className="min-h-screen pb-20 relative">
            <ToastContainer />

            {/* HERO */}
            <div className="text-center py-16 px-4 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary/5 to-transparent -z-10 pointer-events-none" />
                <h1 className={`text-4xl md:text-6xl font-black ${textColor} tracking-tight leading-tight`}>
                    Taste the <span className="text-primary">Extraordinary</span>
                </h1>
                <p className={`text-lg md:text-xl max-w-2xl mx-auto ${subText}`}>Discover thousands of premium recipes, curated for the home chef.</p>
                <div className="max-w-2xl mx-auto relative mt-8 group">
                    <input
                        type="text"
                        placeholder="What are you craving today?"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearch}
                        className={`w-full pl-6 pr-14 py-4 rounded-full text-lg shadow-xl border outline-none focus:ring-4 focus:ring-primary/20 transition-all ${inputBg}`}
                    />
                    <button
                        onClick={() => navigate(`/recipes?search=${search}`)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-white p-3 rounded-full hover:bg-orange-600 transition shadow-lg"
                    >
                        <Search size={20} />
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 space-y-24">
                {/* 1. POPULAR CATEGORIES */}
                <section>
                    <div className="flex justify-between items-end mb-6">
                        <h2 className={`text-2xl md:text-3xl font-bold ${textColor}`}>Popular Categories</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {POPULAR_CATEGORIES.map((cat) => (
                            <div
                                key={cat.id}
                                onClick={() => handleFilterClick('category', cat.filter)}
                                className="relative h-48 rounded-3xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all"
                            >
                                <img src={cat.image} alt={cat.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-6 left-6">
                                    <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">{cat.label}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 2. WATCH MY FAVORITES */}
                {user && favoriteVideos.length > 0 && (
                    <section className={`py-8 -mx-4 px-4 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-orange-50/50'}`}>
                        <div className="max-w-7xl mx-auto">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-500">
                                    <PlayCircle size={24} />
                                </div>
                                <h2 className={`text-2xl font-bold ${textColor}`}>Watch My Favorites</h2>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
                                {favoriteVideos.map((recipe) => (
                                    <div
                                        key={recipe._id}
                                        onClick={() => handleVideoClick(recipe)}
                                        className="relative flex-shrink-0 w-80 h-48 rounded-xl overflow-hidden cursor-pointer snap-start shadow-lg group hover:ring-2 hover:ring-primary transition-all"
                                    >
                                        <img src={recipe.videoThumbnail || recipe.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-all">
                                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/50 group-hover:scale-110">
                                                <PlayCircle size={24} fill="currentColor" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-2 left-2 right-2">
                                            <p className="text-white text-sm font-bold truncate drop-shadow-md">{recipe.title}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* 3. TRENDING RECIPES */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600">
                            <Flame size={24} fill="currentColor" />
                        </div>
                        <h2 className={`text-2xl font-bold ${textColor}`}>Trending Now</h2>
                    </div>
                    <div className="flex overflow-x-auto pb-4 gap-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible">
                        {(loading ? [1, 2, 3, 4] : trendingRecipes).map((recipe, idx) => (
                            <div key={recipe._id || idx} className="min-w-[280px] md:min-w-0">
                                {loading ? (
                                    <div className={`h-64 rounded-2xl animate-pulse ${cardBg}`} />
                                ) : (
                                    <RecipeCard recipe={recipe} onClick={() => handleRecipeClick(recipe)} isActive={selectedRecipeId === recipe._id} />
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. COOK BY TIME */}
                <section>
                    <h3 className={`text-xl font-bold mb-6 ${textColor} flex items-center gap-2`}>
                        <Clock size={20} /> Cook by Time
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {TIME_CARDS.map((item) => (
                            <div
                                key={item.val}
                                onClick={() => handleFilterClick('time', item.val)}
                                className={`p-6 rounded-2xl cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 ${cardBg} border group`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${item.color} group-hover:scale-110 transition-transform`}>{item.icon}</div>
                                <h4 className={`font-bold text-lg ${textColor}`}>{item.label}</h4>
                                <p className={`text-sm ${subText}`}>{item.sub}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. BROWSE BY CUISINE */}
                <section>
                    <h3 className={`text-xl font-bold mb-6 ${textColor} flex items-center gap-2`}>
                        <ChefHat size={20} /> Browse by Cuisine
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
                        {CUISINE_CARDS.map((c) => (
                            <div key={c.label} onClick={() => handleFilterClick('cuisine', c.label)} className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-md">
                                <img src={c.image} alt={c.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                                    <h4 className="text-xl font-bold text-white tracking-wide">{c.label}</h4>
                                    <span className="text-white/80 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                        View Recipes
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 6. RECIPE OF THE DAY */}
                <section className="relative rounded-3xl overflow-hidden shadow-2xl h-[450px] group cursor-pointer">
                    <img
                        src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1200&q=80"
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        alt="Featured"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-8 md:px-16">
                        <span className="bg-yellow-500 text-black font-bold px-3 py-1 rounded-full text-xs w-fit mb-4 animate-pulse">⭐ RECIPE OF THE DAY</span>
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-2 leading-tight">
                            Fluffy Buttermilk <br />
                            Pancakes
                        </h2>
                        <p className="text-gray-200 mb-8 max-w-md line-clamp-2 text-lg">Golden, light, and fluffy. The perfect Sunday morning treat served with fresh berries.</p>
                        <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold w-fit hover:bg-orange-600 transition flex items-center gap-2 transform hover:translate-x-2">
                            View Recipe <ArrowRight size={18} />
                        </button>
                    </div>
                </section>

                {/* 7. LATEST RECIPES */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                            <Heart size={24} fill="currentColor" />
                        </div>
                        <h2 className={`text-2xl font-bold ${textColor}`}>Fresh From the Kitchen</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {latestRecipes.map((recipe) => (
                            <RecipeCard key={recipe._id} recipe={recipe} onClick={() => handleRecipeClick(recipe)} isActive={selectedRecipeId === recipe._id} />
                        ))}
                    </div>
                </section>

                {/* 8. TOP CHEFS */}
                <section className={`py-16 -mx-4 px-4 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}>
                    <div className="max-w-7xl mx-auto">
                        <h2 className={`text-3xl font-bold mb-10 text-center ${textColor}`}>Meet Our Top Chefs</h2>
                        {topChefs.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                                {topChefs.map((chef, i) => (
                                    <Link
                                        to={`/profile/${chef.username}`}
                                        key={i}
                                        className={`p-6 rounded-3xl flex flex-col items-center gap-4 text-center shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 ${cardBg}`}
                                    >
                                        <div className="relative">
                                            <img
                                                src={chef.avatar || `https://ui-avatars.com/api/?name=${chef.username}&background=random`}
                                                className="w-24 h-24 rounded-full object-cover border-4 border-primary p-1"
                                                alt={chef.username}
                                            />
                                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                                                TOP #{i + 1}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-lg ${textColor} truncate max-w-[120px]`}>{chef.username}</h4>
                                            <div className="flex items-center justify-center gap-1 text-xs text-yellow-500 mt-1">
                                                <Star size={12} fill="currentColor" /> {chef.avgRating || 0}
                                            </div>
                                            <p className={`text-xs ${subText} mt-1`}>{chef.totalRecipes} Recipes</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-10">
                                <p>No top chefs found yet. Start creating recipes to be here!</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 9. NEWSLETTER */}
                <section className="bg-primary/10 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
                    <div className="relative z-10 max-w-xl mx-auto space-y-6">
                        <Mail className="w-16 h-16 text-primary mx-auto" />
                        <h2 className={`text-3xl md:text-4xl font-bold ${textColor}`}>Deliciousness to your inbox</h2>
                        <p className={`text-lg ${subText}`}>Enjoy weekly hand picked recipes and recommendations.</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input type="email" placeholder="Email Address" className={`flex-1 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary text-lg shadow-sm ${cardBg}`} />
                            <button className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg text-lg">Join</button>
                        </div>
                    </div>
                </section>

                {/* 10. ABOUT OWNER */}
                <section className="text-center py-10 space-y-4">
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-primary/50">
                        <img src="https://avatars.githubusercontent.com/u/1?v=4" alt="Owner" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className={`text-xl font-bold ${textColor}`}>Sudhanshu</h3>
                        <p className={`text-sm ${subText} font-medium`}>Founder & Developer</p>
                    </div>
                    <p className={`max-w-lg mx-auto italic ${subText} text-sm leading-relaxed`}>"Building YumPlatform to connect food lovers across the globe. Coding, Cooking, and Creating."</p>
                </section>
            </div>

            {/* DETAIL PANEL & VIDEO PLAYER */}
            {selectedRecipeId && (
                <div className={`fixed inset-0 z-50 md:static md:z-50 md:block md:w-full lg:w-full h-full shadow-2xl overflow-hidden`}>
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setSelectedRecipeId(null)} />
                    <div className={`fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 z-50 shadow-2xl border-l ${isDarkMode ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}`}>
                        <RecipeDetailPanel recipeId={selectedRecipeId} onClose={() => setSelectedRecipeId(null)} />
                    </div>
                </div>
            )}

            {viewingVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setViewingVideo(null)}>
                    <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="aspect-video w-full">
                            <CustomVideoPlayer src={viewingVideo.videoUrl} poster={viewingVideo.videoThumbnail || viewingVideo.images?.[0]} autoPlay={true} />
                        </div>
                        <button onClick={() => setViewingVideo(null)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors z-50">
                            <X size={24} />
                        </button>
                        <div className="p-4 bg-[#1e1e1e] text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold">{viewingVideo.title}</h3>
                            <button
                                onClick={() => {
                                    setViewingVideo(null);
                                    setSelectedRecipeId(viewingVideo._id);
                                }}
                                className="text-sm text-primary hover:underline"
                            >
                                View Full Recipe
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
