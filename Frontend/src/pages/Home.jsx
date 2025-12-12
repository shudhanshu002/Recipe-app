import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import {motion} from 'framer-motion'

// apis
import { newsletterApi } from '../api/newsletter';
import { recipeApi } from '../api/recipes';

// stores
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';

// components to be used
import FounderSection from '../components/FounderSection';  // -- founder section 
import RecipeCard from '../components/RecipeCard'; // -- recipe card
import RecipeDetailPanel from '../components/RecipeDetailPanel'; // -- side panel
import CustomVideoPlayer from '../components/CustomVideoPlayer'; // -- videoPlayer

// skeletons
import RecipeCardSkeleton from '../components/skeletons/RecipeCardSkeleton';
import { CategoryCardSkeleton, VideoCardSkeleton, ChefCardSkeleton } from '../components/skeletons/HomeSkeletons';
import Skeleton from '../components/ui/Skeleton';

// icons and toast
import 'react-toastify/dist/ReactToastify.css';
import { Search, PlayCircle, Star, ChevronRight, X, Flame, Clock, ChefHat, Heart, Mail, ArrowRight, Zap } from 'lucide-react';




const POPULAR_CATEGORIES = [
    { id: 'veg', label: 'Vegetarian', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80', filter: 'veg' },
    { id: 'non-veg', label: 'Non-Vegetarian', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80', filter: 'non-veg' },
    { id: 'dessert', label: 'Desserts', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGVzc2VydHxlbnwwfHwwfHx8MA%3D%3D', filter: 'dessert' },
    { id: 'healthy', label: 'Healthy', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80', filter: 'healthy' },
];

const TIME_CARDS = [
    { label: 'Speedy Meals', sub: '< 15 Mins', val: 15, light: 'bg-green-100 text-green-600', dark: 'bg-green-900/30 text-green-400', icon: <Zap size={24} /> },
    { label: 'Casual Cooking', sub: '30 Mins', val: 30, light: 'bg-blue-100 text-blue-600', dark: 'bg-blue-900/30 text-blue-400', icon: <Clock size={24} /> },
    { label: 'Gourmet Prep', sub: '60 Mins', val: 60, light: 'bg-orange-100 text-orange-600', dark: 'bg-orange-900/30 text-orange-400', icon: <ChefHat size={24} /> },
    { label: 'Slow Food', sub: '1 Hr+', val: 120, light: 'bg-purple-100 text-purple-600', dark: 'bg-purple-900/30 text-purple-400', icon: <Flame size={24} /> },
];


const CUISINE_CARDS = [
    { label: 'Indian', image: 'https://images.unsplash.com/photo-1659716307017-dc91342ec2b8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kaWFuZm9vZHxlbnwwfHwwfHx8MA%3D%3D' },
    { label: 'Italian', image: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=500&q=80' },
    { label: 'Chinese', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpbmVzZSUyMGZvb2R8ZW58MHx8MHx8fDA%3D' },
    { label: 'Mexican', image: 'https://images.unsplash.com/photo-1626808642875-0aa545482dfb?w=500&q=80' },
    { label: 'American', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80' },
    { label: 'Japanese', image: 'https://plus.unsplash.com/premium_photo-1664205766166-6751c4c65f53?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8amFwYW5lc2Vmb29kfGVufDB8fDB8fHww' },
    { label: 'Mediterranean', image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8TWVkaXRlcnJhbmVhbiUyMGZvb2R8ZW58MHx8MHx8fDA%3D' },
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
    const { theme } = useThemeStore();
    const isDarkMode = theme === 'dark';
    const { user } = useAuthStore();


    // --- STATE ---
    const [trendingRecipes, setTrendingRecipes] = useState([]);
    const [latestRecipes, setLatestRecipes] = useState([]);
    const [favoriteVideos, setFavoriteVideos] = useState([]);
    const [topChefs, setTopChefs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [recipeOfTheDay, setRecipeOfTheDay] = useState(null); 

    const [selectedRecipeId, setSelectedRecipeId] = useState(null);
    const [viewingVideo, setViewingVideo] = useState(null);
    const [newsletterEmail, setNewsletterEmail] = useState('');

    // fetching favorite and chefs
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

                    if (recipes.length > 0) {
                        const today = new Date();
                        const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
                        const dailyIndex = dateSeed % recipes.length;
                        setRecipeOfTheDay(recipes[dailyIndex]);
                    }
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

    // premium recipe check
    const handleRecipeClick = (recipe) => {
        const isUserPremium = user?.subscriptionStatus === 'premium' || user?.isPremium === true;
        if (recipe.isPremium && !isUserPremium) {
            toast.error('👑 Premium recipe! Upgrade to unlock.', { position: 'top-right' });
            return;
        }
        setSelectedRecipeId(recipe._id);
    };

    const handleVideoClick = (recipe) => {
        const isUserPremium = user?.subscriptionStatus === 'premium' || user?.isPremium === true;
        if (recipe.isPremium && !isUserPremium) {
            toast.error('Premium Content! Upgrade to watch.', { position: 'top-right' });
            return;
        }
        setViewingVideo(recipe);
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/recipes?search=${encodeURIComponent(search)}`);
        }
    };

    const MotionCard = ({ children, className = '', onClick }) => (
        <motion.div
            onClick={onClick}
            className={`${className} relative`}
            initial={{ opacity: 1, y: 30, scale: 0.96 }}
            transition={{
                type: 'spring',
                stiffness: 140,
                damping: 18,
            }}
            whileHover={{
                y: -10,
                scale: 1.03,
                rotateX: 6,
                rotateY: -6,
                boxShadow: '0px 20px 40px rgba(0,0,0,0.15)',
                transition: {
                    type: 'spring',
                    stiffness: 260,
                    damping: 18,
                },
            }}
            viewport={{ once: true }}
        >
            {children}
        </motion.div>
    );

    const scrollRef = useRef(null);

    //  Helper function to handle scroll
    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 300; 
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };


    const getChefId = (userField) => {
        if (!userField) return null;
        return typeof userField === 'object' ? userField._id : userField;
    };


    
    const handleFilterClick = (type, value) => {
        let query = '';
        if (type === 'category') query = `category=${value}`;
        else if (type === 'time') query = `maxTime=${value}`;
        else if (type === 'cuisine') query = `cuisine=${value}`;
        else if (type === 'quick') query = value; 

        if (query) navigate(`/recipes?${query}`);
    };

    const handleSubscribe = async () => {
        if (!newsletterEmail || !newsletterEmail.includes('@')) {
            return toast.error('Please enter a valid email address.');
        }

        try {
            const toastId = toast.loading('Subscribing...');

            // Call Backend API
            await newsletterApi.subscribe(newsletterEmail);

            toast.update(toastId, {
                render: 'Welcome to the club! 🍳 Check your email.',
                type: 'success',
                isLoading: false,
                autoClose: 3000,
            });
            setNewsletterEmail('');
        } catch (error) {
            toast.dismiss();
            const msg = error.response?.data?.message || 'Subscription failed.';
            if (msg.toLowerCase().includes('already')) {
                toast.info(msg);
            } else {
                toast.error(msg);
            }
        }
    };

    // --- STYLES ---
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const subText = isDarkMode ? 'text-gray-400' : 'text-gray-700';
    const cardBg = isDarkMode ? 'bg-[#252525] border-gray-800' : 'bg-white border-gray-100';
    const inputBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-600';

    return (
        <div className="min-h-screen pb-20 relative">
            <ToastContainer />
            {/* HERO */}
            <div className="text-center py-16 px-4 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-linear-to-b from-[#f97316]/5 to-transparent -z-10 pointer-events-none" />
                <h1 className={`text-4xl md:text-6xl font-black ${textColor} tracking-tight leading-tight`}>
                    Taste the <span className={`font-recur ${isDarkMode ? 'text-gray-400' : 'text-blue-900'} `}>Extraordinary</span>
                </h1>
                <p className={`font-recur font-bold text-4xl md:text-xl max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-black'}`}>
                    Discover thousands of premium recipes , curated for the home chef
                </p>
                <div className="max-w-2xl mx-auto relative mt-8 group">
                    <input
                        type="text"
                        placeholder="What are you craving today?"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearch}
                        className={`w-full pl-6 pr-14 py-4 rounded-full text-lg shadow-xl border outline-none focus:ring-4 focus:ring-[#f97316]/20 transition-all ${inputBg}`}
                    />
                    <button
                        onClick={() => navigate(`/recipes?search=${search}`)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#f97316] text-white p-3 rounded-full bg-[#f97316] transition shadow-lg"
                    >
                        <Search size={20} />
                    </button>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 space-y-24">
                {/* 1. POPULAR CATEGORIES */}
                <section>
                    <div className="flex justify-between items-end mb-6">
                        <h2 className={`font-dancing text-2xl md:text-3xl font-bold ${textColor}`}>Popular Categories</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {loading
                            ? [1, 2, 3, 4].map((i) => <CategoryCardSkeleton key={i} />)
                            : POPULAR_CATEGORIES.map((cat) => (
                                  <MotionCard
                                      key={cat.id}
                                      onClick={() => handleFilterClick('category', cat.filter)}
                                      className="relative h-48 rounded-3xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all"
                                  >
                                      <img src={cat.image} alt={cat.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                      <div className="absolute bottom-6 left-6">
                                          <h3 className="font-dancing text-2xl font-bold text-white group-hover:text-[#f97316] transition-colors">{cat.label}</h3>
                                      </div>
                                  </MotionCard>
                              ))}
                    </div>
                </section>
                {/* 2. WATCH MY FAVORITES */}
                {loading ? (
                    // UPDATE: Skeleton for Videos
                    <div className="flex gap-6 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                            <VideoCardSkeleton key={i} />
                        ))}
                    </div>
                ) : user && favoriteVideos.length > 0 ? (
                    <section className={`py-8 -mx-4 px-4 font-dancing`}>
                        <div className="max-w-7xl mx-auto">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2 rounded-lg text-red-500 ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                                    <PlayCircle size={24} />
                                </div>
                                <h2 className={`text-2xl font-bold ${textColor}`}>Watch My Favorites</h2>
                            </div>
                            <div className="relative w-full">
                                <div className="flex gap-4 overflow-x-auto pb-6 px-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
                                    {favoriteVideos.map((recipe) => (
                                        <div
                                            key={recipe._id}
                                            onClick={() => handleVideoClick(recipe)}
                                            className="relative shrink-0 mt-4 w-80 h-48 rounded-xl overflow-hidden cursor-pointer snap-center shadow-lg group hover:ring-2 hover:ring-[#f97316] transition-all"
                                        >
                                            <img
                                                src={recipe.videoThumbnail || recipe.images[0]}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                alt={recipe.title}
                                            />

                                            {/* Dark Overlay with Play Button */}
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-all">
                                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/50 group-hover:scale-110 transition-transform">
                                                    <PlayCircle size={24} fill="currentColor" />
                                                </div>
                                            </div>

                                            {/* Title at bottom */}
                                            <div className="absolute bottom-2 left-2 right-2">
                                                <p className="text-white text-sm font-bold truncate drop-shadow-md">{recipe.title}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                ) : (
                    <div className={`p-10 rounded-3xl border-2 border-dashed text-center ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                        <p className={subText}>No favorite videos yet. Like a recipe with a video to see it here!</p>
                    </div>
                )}
                {/* 3. TRENDING RECIPES */}
                <section className="font-dancing">
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`p-2 rounded-lg text-yellow-600 ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
                            <Flame size={24} fill="currentColor" />
                        </div>
                        <h2 className={`text-2xl font-bold ${textColor}`}>Trending Now</h2>
                    </div>
                    <div className="flex overflow-x-auto pb-4 px-3 gap-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible">
                        {(loading ? [1, 2, 3, 4] : trendingRecipes).map((recipe, idx) => (
                            <div key={recipe._id || idx} className="min-w-[280px] md:min-w-0">
                                {loading ? <RecipeCardSkeleton /> : <RecipeCard recipe={recipe} onClick={() => handleRecipeClick(recipe)} isActive={selectedRecipeId === recipe._id} />}
                            </div>
                        ))}
                    </div>
                </section>
                {/* 4. COOK BY TIME */}
                <section className="font-dancing">
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
                <section className="font-dancing">
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
                <section className="relative rounded-[2.5rem] overflow-hidden shadow-2xl h-[500px] group cursor-pointer">
                    {loading ? (
                        <Skeleton className="w-full h-full rounded-[2.5rem]" />
                    ) : recipeOfTheDay ? (
                        <>
                            <img
                                src={recipeOfTheDay.images?.[0] || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1600&q=80'}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                alt="Featured"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent flex flex-col justify-center px-10 md:px-20">
                                <span className="bg-yellow-500 text-black font-extrabold px-4 py-1.5 rounded-full text-xs w-fit mb-6 animate-pulse uppercase tracking-wide">⭐ Recipe of the Day</span>
                                <h2 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight max-w-2xl">{recipeOfTheDay.title}</h2>
                                <p className="text-gray-200 mb-8 max-w-lg text-lg leading-relaxed line-clamp-2">{recipeOfTheDay.description}</p>

                                {/* LINK TO NEW CHEF PAGE */}
                                <div className="flex gap-4">
                                    <button onClick={() => handleRecipeClick(recipeOfTheDay)} className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition">
                                        View Recipe
                                    </button>
                                    <Link
                                        to={`/chef/${getChefId(recipeOfTheDay.createdBy)}`}
                                        className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition flex items-center gap-2"
                                    >
                                        Meet the Chef <ArrowRight size={20} />
                                    </Link>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center text-gray-500 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>No recipe of the day available.</div>
                    )}
                </section>
                {/* 7. LATEST RECIPES */}
                <section className="font-dancing">
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`p-2 rounded-lg text-green-600 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
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

                <section className={`py-16 -mx-4 px-4 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-gray-100'} font-dancing rounded-4xl relative group`}>
                    <div className="max-w-7xl mx-auto">
                        <h2 className={`text-3xl font-bold mb-10 text-center ${textColor}`}>Meet Our Top Chefs</h2>

                        {topChefs.length > 0 ? (
                            <div className="relative">
                                {/* LEFT BUTTON (Only show if many chefs, or always visible on hover) */}
                                {topChefs.length > 4 && (
                                    <button
                                        onClick={() => scroll('left')}
                                        className={`absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10  p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30 ${
                                            isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
                                        }`}
                                    >
                                        <ChevronLeft size={24} className={textColor} />
                                    </button>
                                )}
                                <div
                                    ref={scrollRef}
                                    className={`flex items-center gap-6 overflow-x-auto pb-4 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
                                        topChefs.length < 5 ? 'justify-center' : ''
                                    } `}
                                >
                                    {topChefs.map((chef, i) => (
                                        <Link
                                            to={`/profile/${chef.username}`}
                                            key={i}
                                            className={`min-w-[180px] w-[180px] p-6 rounded-3xl flex flex-col items-center gap-4 text-center shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 snap-center shrink-0  ${
                                                isDarkMode ? 'bg-gray-800' : 'bg-gray-300'
                                            }`}
                                        >
                                            <div className="relative">
                                                <img
                                                    src={chef.avatar || `https://ui-avatars.com/api/?name=${chef.username}&background=random`}
                                                    className="w-24 h-24 rounded-full object-cover border-4 border-[#f97316] p-1"
                                                    alt={chef.username}
                                                />
                                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-rose-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm whitespace-nowrap">
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

                                {/* RIGHT BUTTON */}
                                {topChefs.length > 4 && (
                                    <button
                                        onClick={() => scroll('right')}
                                        className={`absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10  p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                                            isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
                                        }`}
                                    >
                                        <ChevronRight size={24} className={textColor} />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className={`text-center  py-10 ${isDarkMode ? 'text-gray-500' : 'text-gray-900'}`}>
                                <p>No top chefs found yet. Start creating recipes to be here!</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 9. NEWSLETTER - SPLIT LAYOUT (CONNECTED) */}
                <section className="py-16 px-4 font-dancing">
                    <div className={`max-w-6xl mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
                        <div className="flex-1 p-10 md:p-16 flex flex-col justify-center text-left relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-orange-500/5 opacity-50 z-0"></div>
                            <div className="relative z-10">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-orange-500 mb-6 ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
                                    <Mail size={24} />
                                </div>
                                <h2 className={`text-4xl font-bold mb-4 font-sans ${textColor}`}>Hungry for updates?</h2>
                                <p className={`text-lg mb-8 ${subText}`}>Get our "Chef's Special" newsletter delivered every Friday.</p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="email"
                                        value={newsletterEmail}
                                        onChange={(e) => setNewsletterEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className={`flex-1 px-5 py-4 rounded-xl border-2 border-transparent focus:border-orange-500 outline-none transition-all ${
                                            isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                                        }`}
                                    />
                                    <button
                                        onClick={handleSubscribe}
                                        className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange-500/30"
                                    >
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 relative min-h-[300px] md:min-h-full">
                            <img
                                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
                                className="absolute inset-0 w-full h-full object-cover"
                                alt="Food"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r md:from-black/50 md:to-transparent"></div>
                            <div className="absolute bottom-8 left-8 text-white z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex text-yellow-400">★★★★★</div>
                                    <span className="text-sm font-medium">5k+ Reviews</span>
                                </div>
                                <p className="font-bold text-xl">"Best recipes I've ever found!"</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* founder section  */}
                <FounderSection />
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
                                className="text-sm text-[#f97316] hover:underline"
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