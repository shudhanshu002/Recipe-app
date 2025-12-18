import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// debounce book for better and user friendly searching
import { useDebounce } from '../hooks/useDebounce';

// recipe api -- all
import { recipeApi } from '../api/recipes';

// stores
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';

// usefull components
import { FilterDropdown } from '../components/FilterDropdown'; // better ui friendly dropdown
import RecipeDetailPanel from '../components/RecipeDetailPanel'; // side panel for quick recipe view
import RecipeCard from '../components/RecipeCard'; // recipe card
import RecipeCardSkeleton from '../components/skeletons/RecipeCardSkeleton'; // skeleton

// icons & login
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Search,
  Filter,
  X,
  Leaf,
  Drumstick,
  Clock,
  ChefHat,
  ArrowUpDown,
} from 'lucide-react';

// --- FILTER OPTIONS ---  based on differnt types
const CUISINES = [
  'All',
  'Indian',
  'Italian',
  'Mexican',
  'Chinese',
  'American',
  'Thai',
  'Japanese',
  'Mediterranean',
];
const DIETS = [
  { label: 'All', value: 'all' },
  { label: 'Vegetarian', value: 'veg' },
  { label: 'Non-Veg', value: 'non-veg' },
];

const TIMES = [
  { label: 'Any Time', value: '' },
  { label: '< 15 Mins', value: '15' },
  { label: '< 30 Mins', value: '30' },
  { label: '< 1 Hour', value: '60' },
];

const SORTS = [
  { label: 'Newest First', value: '' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'A-Z', value: 'name_asc' },
];

const Community = () => {
  const { theme } = useThemeStore();
  const isDarkMode = theme === 'dark';
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // --- STATE ---
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedDiet, setSelectedDiet] = useState('all');
  const [selectedTime, setSelectedTime] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  //  INITIALIZE FROM URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('search')) setSearch(params.get('search'));
    if (params.get('cuisine')) setSelectedCuisine(params.get('cuisine'));
    if (params.get('category')) setSelectedDiet(params.get('category'));
    if (params.get('maxTime')) setSelectedTime(params.get('maxTime'));
    if (params.get('sort')) setSortBy(params.get('sort'));
  }, [location.search]);

  //  RESET LIST ON FILTER CHANGE
  useEffect(() => {
    setRecipes([]);
    setPage(1);
    setHasMore(true);
  }, [debouncedSearch, selectedCuisine, selectedDiet, selectedTime, sortBy]);

  // --- FETCH DATA ---
  useEffect(() => {
    let isMounted = true;

    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const params = {
          limit: 12, //
          page: page,
          search: debouncedSearch,
        };

        if (selectedCuisine !== 'All') params.cuisine = selectedCuisine;
        if (selectedDiet !== 'all') params.category = selectedDiet;
        if (selectedTime) params.maxTime = selectedTime;
        if (sortBy) params.sort = sortBy;

        const data = await recipeApi.getAll(params);
        const newRecipes = data.recipes || [];

        if (isMounted) {
          setRecipes((prev) => {
            return page === 1 ? newRecipes : [...prev, ...newRecipes];
          });
          setHasMore(newRecipes.length > 0);
        }
      } catch (error) {
        console.error('Fetch error', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRecipes();

    return () => {
      isMounted = false;
    };
  }, [
    page,
    debouncedSearch,
    selectedCuisine,
    selectedDiet,
    selectedTime,
    sortBy,
  ]);

  // --- INFINITE SCROLL behaviour ---
  const lastRecipeRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // handler for recipe click
  const handleRecipeClick = (recipe) => {
    const isUserPremium =
      user?.subscriptionStatus === 'premium' || user?.isPremium === true;
    if (recipe.isPremium && !isUserPremium) {
      toast.error('👑 Premium recipe! Upgrade to unlock.', {
        position: 'top-center',
      });
      return;
    }
    setSelectedRecipeId(recipe._id);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCuisine('All');
    setSelectedDiet('all');
    setSelectedTime('');
    setSortBy('');
    navigate('/community');
  };

  // --- STYLES ---
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const subText = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const bgClass = isDarkMode ? 'bg-[#121212]' : 'bg-gray-300';
  const inputBg = isDarkMode
    ? 'bg-[#1e1e1e] border-gray-700 text-white'
    : 'bg-white border-gray-200 text-gray-900';

  return (
    <div className={`min-h-screen ${bgClass} flex flex-col relative pb-20`}>
      <ToastContainer />

      {/* HEADER & FILTERS */}
      <div
        className={`font-dancing sticky top-16 z-30 px-4 py-4 border-b backdrop-blur-md transition-colors ${isDarkMode ? 'bg-[#121212]/95 border-gray-800' : 'bg-gray-100 border-gray-200'}`}
      >
        <div className={`max-w-7xl mx-auto space-y-4 `}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className={`text-2xl font-bold ${textColor}`}>
                Community Recipes
              </h1>
              <p className={`text-xs ${subText}`}>
                Discover what others are cooking
              </p>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  placeholder="Search recipes, chefs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 transition-all ${inputBg}`}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`md:hidden p-2.5 rounded-xl border ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-gray-700'}`}
              >
                <Filter size={20} />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div
            className={`${showFilters ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-3 md:items-center pb-2 flex-wrap`}
          >
            {/* Diet Dropdown */}
            <FilterDropdown
              icon={
                selectedDiet === 'veg'
                  ? Leaf
                  : selectedDiet === 'non-veg'
                    ? Drumstick
                    : Filter
              }
              label="Diet"
              value={selectedDiet}
              options={DIETS}
              onChange={setSelectedDiet}
              isDarkMode={isDarkMode}
            />

            {/* Cuisine Dropdown */}
            <FilterDropdown
              icon={ChefHat}
              label="Cuisine"
              value={selectedCuisine}
              options={CUISINES}
              onChange={setSelectedCuisine}
              isDarkMode={isDarkMode}
            />

            {/* Time Dropdown */}
            <FilterDropdown
              icon={Clock}
              label="Cooking Time"
              value={selectedTime}
              options={TIMES}
              onChange={setSelectedTime}
              isDarkMode={isDarkMode}
            />

            {/* Sort Dropdown */}
            <FilterDropdown
              icon={ArrowUpDown}
              label="Sort By"
              value={sortBy}
              options={SORTS}
              onChange={setSortBy}
              isDarkMode={isDarkMode}
            />

            {/* Clear Button */}
            {(search ||
              selectedCuisine !== 'All' ||
              selectedDiet !== 'all' ||
              selectedTime ||
              sortBy) && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-500 hover:underline flex items-center gap-1 ml-auto md:ml-0"
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        <div className="flex flex-1 overflow-hidden gap-6 relative h-full">
          {/* LIST */}
          <div
            className={`flex-1 transition-all duration-300 ${selectedRecipeId ? 'hidden md:block md:w-1/2 lg:w-3/5' : 'w-full'}`}
          >
            {recipes.length === 0 && !loading ? (
              <div
                className={`flex flex-col items-center justify-center py-40 rounded-3xl border-2 border-dashed ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}
              >
                <Filter className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className={`text-xl font-bold mb-2 ${textColor}`}>
                  No recipes found
                </h3>
                <p className={subText}>Try adjusting your filters.</p>
                <button
                  onClick={clearFilters}
                  className="mt-6 text-[#f97316] font-bold hover:underline"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${selectedRecipeId ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}
              >
                {recipes.map((recipe, index) => {
                  // Use ref on the last element to trigger infinite scroll
                  if (recipes.length === index + 1) {
                    return (
                      <div
                        ref={lastRecipeRef}
                        key={recipe._id}
                        className="contents"
                      >
                        <RecipeCard
                          recipe={recipe}
                          onClick={() => handleRecipeClick(recipe)}
                          isActive={selectedRecipeId === recipe._id}
                        />
                      </div>
                    );
                  } else {
                    return (
                      <RecipeCard
                        key={recipe._id}
                        recipe={recipe}
                        onClick={() => handleRecipeClick(recipe)}
                        isActive={selectedRecipeId === recipe._id}
                      />
                    );
                  }
                })}
              </div>
            )}

            {loading && (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <RecipeCardSkeleton key={i} />
                ))}
              </div>
            )}
          </div>

          {/* DETAIL PANEL */}
          {selectedRecipeId && (
            <div
              className={`fixed inset-0 z-40 md:static md:z-0 md:block md:w-1/2 lg:w-2/5 h-full shadow-2xl rounded-2xl overflow-hidden border ${
                isDarkMode
                  ? 'bg-[#1e1e1e] border-gray-800'
                  : 'bg-white border-gray-200'
              }`}
            >
              <RecipeDetailPanel
                recipeId={selectedRecipeId}
                onClose={() => setSelectedRecipeId(null)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;
