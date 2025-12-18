import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// store
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';

// componemts
import RecipeCard from '../components/RecipeCard';
import RecipeDetailPanel from '../components/RecipeDetailPanel';

// to fetch api
import api from '../lib/axios'; // Use your real API

// icons & toasts
import {
  MapPin,
  Grid,
  Loader2,
  UserPlus,
  UserCheck,
  Share2,
  ChefHat,
  AlertCircle,
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ChefSpotlight = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const isDarkMode = theme === 'dark';
  const { user: currentUser } = useAuthStore();

  const [chef, setChef] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  // fetching data
  useEffect(() => {
    if (!id || id === 'undefined') {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Chef Profile by ID (Make sure backend has /users/c/id/:id route)
        const profileRes = await api.get(`/users/c/id/${id}`);
        const chefData = profileRes.data.data;

        setChef(chefData);
        setIsSubscribed(chefData.isSubscribed);

        // Fetch Chef's Recipes
        const recipesRes = await api.get(`/recipes`);
        const allRecipes = recipesRes.data.data.recipes;

        // Filter to find recipes where createdBy ID matches the chef ID
        const chefRecipes = allRecipes.filter((r) => {
          const creatorId =
            typeof r.createdBy === 'object' ? r.createdBy._id : r.createdBy;
          return creatorId === id;
        });
        setRecipes(chefRecipes);
      } catch (error) {
        console.error('Error loading chef:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // handlers
  const handleSubscribe = async () => {
    if (!currentUser) return toast.error('Please login to follow chefs');

    // Optimistic UI Update
    const previousState = isSubscribed;
    setIsSubscribed(!isSubscribed);
    setChef((prev) => ({
      ...prev,
      subscribersCount: prev.subscribersCount + (previousState ? -1 : 1),
    }));

    try {
      await api.post(`/subscriptions/c/${id}`);
      toast.success(previousState ? 'Unfollowed' : 'Following!');
    } catch (error) {
      // Revert on error
      setIsSubscribed(previousState);
      setChef((prev) => ({
        ...prev,
        subscribersCount: prev.subscribersCount + (previousState ? 1 : -1),
      }));
      toast.error('Something went wrong');
    }
  };

  const handleRecipeClick = (recipe) => {
    const isUserPremium =
      currentUser?.subscriptionStatus === 'premium' ||
      currentUser?.isPremium === true;
    if (recipe.isPremium && !isUserPremium) {
      toast.error('👑 Premium recipe! Upgrade to unlock.');
      return;
    }
    setSelectedRecipeId(recipe._id);
  };

  // styles
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const subText = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDarkMode
    ? 'bg-[#1e1e1e] border-gray-800'
    : 'bg-white border-gray-200';

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#121212]' : 'bg-gray-50'}`}
      >
        <Loader2 className="animate-spin text-orange-500 w-12 h-12" />
      </div>
    );
  }

  if (!chef) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-[#121212]' : 'bg-gray-50'}`}
      >
        <AlertCircle size={48} className="text-gray-400 mb-4" />
        <p className={subText}>Chef profile not found.</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pb-20 ${isDarkMode ? 'bg-[#121212]' : 'bg-gray-50'}`}
    >
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/*  MEET THE CHEF HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`p-2 rounded-lg text-orange-600 ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-100'}`}
          >
            <ChefHat size={24} />
          </div>
          <h1 className={`text-2xl font-bold font-dancing ${textColor}`}>
            Meet the Chef
          </h1>
        </div>

        {/*  PROFILE CARD (MATCHING PROFILE UI)  */}
        <div
          className={`relative rounded-[2.5rem] overflow-hidden shadow-2xl mb-16 ${cardBg} border transition-colors`}
        >
          {/* A. Cover Image */}
          <div className="h-64 md:h-80 w-full relative bg-gray-300">
            <img
              src={
                chef.coverImage ||
                'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=2000'
              }
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-90" />
          </div>

          {/* B. Profile Content */}
          <div className="relative px-6 pb-8 md:px-12 flex flex-col md:flex-row items-start md:items-end gap-6 -mt-20">
            {/* Rectangular Cornered Image (Avatar) */}
            <div className="relative z-10 shrink-0">
              <img
                src={chef.avatar}
                alt={chef.username}
                className={`w-40 h-40 md:w-48 md:h-48 rounded-3xl object-cover shadow-2xl ${isDarkMode ? 'border-4 border-[#1e1e1e]' : 'border-4 border-white'}`}
              />
            </div>

            {/* Chef Info */}
            <div className="flex-1 pt-2 w-full">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                {/* Name & Location */}
                <div>
                  <h2
                    className={`text-4xl md:text-5xl font-black ${textColor} mb-2 drop-shadow-md`}
                  >
                    {chef.username}
                  </h2>
                  {chef.location && (
                    <div className="flex items-center gap-2 text-gray-300 md:text-gray-400 font-medium mb-1">
                      <MapPin size={18} className="text-orange-500" />{' '}
                      {chef.location}
                    </div>
                  )}
                  <p
                    className={`text-sm md:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-200 md:text-gray-500'} max-w-2xl mt-4 leading-relaxed`}
                  >
                    {chef.bio ||
                      'This chef prefers to let their food do the talking.'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mb-1">
                  {currentUser?._id !== chef._id && (
                    <button
                      onClick={handleSubscribe}
                      className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95 ${
                        isSubscribed
                          ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          : 'bg-orange-600 text-white hover:bg-orange-700'
                      } `}
                    >
                      {isSubscribed ? (
                        <>
                          <UserCheck size={20} /> Following
                        </>
                      ) : (
                        <>
                          <UserPlus size={20} /> Follow
                        </>
                      )}
                    </button>
                  )}
                  <button
                    className={`p-3 rounded-xl border ${
                      isDarkMode
                        ? 'border-gray-700 hover:bg-gray-800 text-white'
                        : 'border-gray-300 hover:bg-gray-100 text-gray-800'
                    } transition`}
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* C. Stats Bar */}
          <div
            className={`grid grid-cols-3 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'} divide-x ${isDarkMode ? 'divide-gray-800' : 'divide-gray-100'} mt-6`}
          >
            <div
              className={`p-6 text-center transition cursor-pointer ${isDarkMode ? 'hover:bg-gray-50' : 'hover:bg-white/5'}`}
            >
              <span
                className={`block text-3xl font-black ${textColor} group-hover:text-orange-500 transition`}
              >
                {recipes.length}
              </span>
              <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                Recipes
              </span>
            </div>
            <div
              className={`p-6 text-center transition cursor-pointer ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
            >
              <span
                className={`block text-3xl font-black ${textColor} group-hover:text-orange-500 transition`}
              >
                {chef.subscribersCount}
              </span>
              <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                Followers
              </span>
            </div>
            <div
              className={`p-6 text-center ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition cursor-pointer`}
            >
              <span
                className={`block text-3xl font-black ${textColor} group-hover:text-orange-500 transition`}
              >
                {chef.channelsSubscribedToCount}
              </span>
              <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                Following
              </span>
            </div>
          </div>
        </div>

        {/* --- 3. RECIPES GRID --- */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <Grid className="text-orange-500" size={28} />
            <h2 className={`text-3xl font-bold ${textColor}`}>
              Culinary Creations
            </h2>
          </div>
          {recipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  onClick={() => handleRecipeClick(recipe)}
                  isActive={selectedRecipeId === recipe._id}
                />
              ))}
            </div>
          ) : (
            <div
              className={`text-center py-24 rounded-4xl border-2 border-dashed ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}
            >
              <ChefHat
                className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`}
              />
              <p className={`text-xl font-medium ${textColor}`}>
                No recipes yet
              </p>
              <p className={subText}>
                This chef is preparing something delicious.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipeId && (
        <div
          className={`fixed inset-0 z-50 md:static md:z-50 md:block md:w-full lg:w-full h-full shadow-2xl overflow-hidden`}
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setSelectedRecipeId(null)}
          />
          <div
            className={`fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 z-50 shadow-2xl border-l ${isDarkMode ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'}`}
          >
            <RecipeDetailPanel
              recipeId={selectedRecipeId}
              onClose={() => setSelectedRecipeId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChefSpotlight;
