import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import useThemeStore from '../store/useThemeStore';
import DateStrip from '../components/DateStrip';
import {
  Calendar as CalendarIcon,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  X,
  Loader2,
  History,
  CalendarDays,
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { useCallback } from 'react';

const MealPlanner = () => {
  const { theme } = useThemeStore();
  const isDarkMode = theme === 'dark';
  const [view, setView] = useState('week');

  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [historyPlan, setHistoryPlan] = useState([]);
  const [allMealsForStrip, setAllMealsForStrip] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState('Dinner');
  const [addingMeal, setAddingMeal] = useState(false);

  // Creates a date object that is safe for display in the current timezone
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  // const fetchPlan = async () => {
  //     try {
  //         const startStr = weekDates[0].toISOString();
  //         const endStr = weekDates[6].toISOString();

  //         const [weekRes, historyRes] = await Promise.all([api.get(`/mealplanner?startDate=${startStr}&endDate=${endStr}`), api.get(`/mealplanner/history`)]);

  //         const weekData = weekRes.data.data || [];
  //         const historyData = historyRes.data.data || [];

  //         setWeeklyPlan(weekData);
  //         setHistoryPlan(historyData);

  //         const combined = [...historyData, ...weekData].sort((a, b) => new Date(a.date) - new Date(b.date));
  //         setAllMealsForStrip(combined);
  //     } catch (error) {
  //         console.error(error);
  //     } finally {
  //         setLoading(false);
  //     }
  // };

  const fetchPlan = useCallback(async () => {
    try {
      const startStr = weekDates[0].toISOString();
      const endStr = weekDates[6].toISOString();

      const [weekRes, historyRes] = await Promise.all([
        api.get(`/mealplanner?startDate=${startStr}&endDate=${endStr}`),
        api.get(`/mealplanner/history`),
      ]);

      const weekData = weekRes.data.data || [];
      const historyData = historyRes.data.data || [];

      setWeeklyPlan(weekData);
      setHistoryPlan(historyData);

      const combined = [...historyData, ...weekData].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setAllMealsForStrip(combined);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [weekDates]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/mealplanner/history`);
      setHistoryPlan(response.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'week') {
      setLoading(true);
      fetchPlan();
    } else {
      fetchHistory();
    }
  }, [currentDate, view, fetchPlan]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await api.get(`/recipes?search=${searchQuery}&limit=5`);
        setSearchResults(res.data.data.recipes);
      } catch (e) {
        console.error(e);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleStripDateClick = (date) => {
    setCurrentDate(new Date(date));
    setView('week');
  };

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate)) setCurrentDate(newDate);
  };

  const handlePrevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };
  const handleNextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const handleDelete = async (planId, isHistory = false) => {
    if (!confirm('Remove this meal?')) return;
    try {
      await api.delete(`/mealplanner/${planId}`);
      const filterFn = (item) => item._id !== planId;
      setWeeklyPlan((prev) => prev.filter(filterFn));
      setHistoryPlan((prev) => prev.filter(filterFn));
      setAllMealsForStrip((prev) => prev.filter(filterFn));
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleAddMeal = async (recipeId) => {
    if (!selectedDay) return;
    setAddingMeal(true);
    try {
      const offset = selectedDay.getTimezoneOffset();
      const localDate = new Date(selectedDay.getTime() - offset * 60 * 1000);
      const dateStr = localDate.toISOString().split('T')[0];

      await api.post('/mealplanner/add', {
        recipeId,
        date: dateStr,
        mealType: selectedMealType,
      });

      await fetchPlan();
      setShowModal(false);
      setSearchQuery('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add meal');
    } finally {
      setAddingMeal(false);
    }
  };

  const openAddModal = (date) => {
    setSelectedDay(date);
    setShowModal(true);
  };

  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const cardBg = isDarkMode
    ? 'bg-[#1e1e1e] border-gray-700'
    : 'bg-white border-gray-200';
  const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const todayBg = isDarkMode
    ? 'bg-orange-900/20 border-orange-900/30'
    : 'bg-orange-50 border-orange-200';
  const modalBg = isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white';
  const inputBg = isDarkMode
    ? 'bg-[#2d2d2d] border-gray-600 text-white'
    : 'bg-gray-50 border-gray-200 text-gray-900';

  const groupedHistory = historyPlan.reduce((groups, meal) => {
    const date = new Date(meal.date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(meal);
    return groups;
  }, {});

  return (
    <div className="max-w-7xl mx-auto space-y-8 mb-20 font-dancing">
      <ToastContainer />
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-6">
        <div className="shrink-0 text-center md:text-left">
          <h1 className={`text-3xl font-bold ${textColor}`}>Meal Planner</h1>
          <div className="flex gap-4 mt-2 justify-center md:justify-start">
            <button
              onClick={() => setView('week')}
              className={`text-sm font-bold flex items-center gap-2 ${view === 'week' ? 'text-[#f97316] border-b-2 border-[#f97316]' : 'text-gray-400'}`}
            >
              <CalendarDays size={16} /> Weekly Plan
            </button>
            <button
              onClick={() => setView('history')}
              className={`text-sm font-bold flex items-center gap-2 ${view === 'history' ? 'text-[#f97316] border-b-2 border-[#f97316]' : 'text-gray-400'}`}
            >
              <History size={16} /> Past History
            </button>
          </div>
        </div>

        <DateStrip
          plans={allMealsForStrip}
          onDateClick={handleStripDateClick}
        />

        {view === 'week' && (
          <div
            className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border ${cardBg}`}
          >
            <button
              onClick={handlePrevWeek}
              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${textColor}`}
            >
              <ChevronLeft />
            </button>

            {/* Local Date Input for accurate picking */}
            <input
              type="date"
              value={currentDate.toISOString().split('T')[0]}
              onChange={handleDateChange}
              className={`bg-transparent border-none outline-none text-sm font-medium text-center w-32 ${textColor}`}
            />

            <button
              onClick={handleNextWeek}
              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${textColor}`}
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className={`text-center py-20 ${textColor}`}>Loading...</div>
      ) : (
        <>
          {/* Week View */}
          {view === 'week' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {weekDates.map((date) => {
                const dateStr = date.toDateString();
                const meals = weeklyPlan.filter(
                  (p) => new Date(p.date).toDateString() === dateStr
                );
                const isSelectedDate = currentDate.toDateString() === dateStr;
                const isToday = new Date().toDateString() === dateStr;

                return (
                  <div
                    key={date.toISOString()}
                    className={`h-[350px] flex flex-col p-3 rounded-xl border transition-all duration-300 ${
                      isSelectedDate
                        ? 'ring-2 ring-[#f97316] border-[#f97316]'
                        : isToday
                          ? todayBg
                          : cardBg
                    }`}
                  >
                    <div
                      className={`text-center pb-2 mb-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}
                    >
                      <span
                        className={`text-sm font-bold block ${isToday ? 'text-[#f97316]' : textColor}`}
                      >
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className={`text-xs ${subText}`}>
                        {date.getDate()}
                      </span>
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {meals.map((plan) => (
                        <div
                          key={plan._id}
                          className={`group relative p-2 rounded-lg border text-left transition-all hover:shadow-md ${
                            isDarkMode
                              ? 'bg-gray-800 border-gray-700'
                              : 'bg-white border-gray-100'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-[#f97316] uppercase tracking-wider">
                              {plan.mealType}
                            </span>
                            <button
                              onClick={() => handleDelete(plan._id)}
                              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <Link
                            to={`/recipes/${plan.recipe?._id}`}
                            className="flex gap-2 items-center"
                          >
                            <img
                              src={
                                plan.recipe?.images?.[0] ||
                                'https://placehold.co/100?text=Food'
                              }
                              className="w-8 h-8 rounded object-cover bg-gray-300"
                              alt="Thumb"
                            />
                            <span
                              className={`text-xs font-medium line-clamp-2 ${textColor}`}
                            >
                              {plan.recipe?.title || 'Unknown Recipe'}
                            </span>
                          </Link>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedDay(date);
                        setShowModal(true);
                      }}
                      className={`mt-2 w-full py-1.5 rounded-lg border-2 border-dashed flex items-center justify-center gap-1 text-xs font-medium transition-colors ${
                        isDarkMode
                          ? 'border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300'
                          : 'border-gray-200 text-gray-400 hover:border-[#f97316] hover:text-[#f97316]'
                      }`}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* History View */}
          {view === 'history' && (
            <div className="space-y-6">
              {Object.keys(groupedHistory).length > 0 ? (
                Object.entries(groupedHistory).map(([date, meals]) => (
                  <div
                    key={date}
                    className={`p-6 rounded-2xl border ${cardBg}`}
                  >
                    <h3 className={`text-lg font-bold mb-4 ${textColor}`}>
                      {date}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {meals.map((plan) => (
                        <div
                          key={plan._id}
                          className={`flex items-center justify-between p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <Link
                            to={`/recipes/${plan.recipe?._id}`}
                            className="flex items-center gap-3"
                          >
                            <img
                              src={plan.recipe?.images?.[0]}
                              className="w-12 h-12 rounded-lg object-cover"
                              alt="Food"
                            />
                            <div>
                              <p
                                className={`text-xs font-bold uppercase text-[#f97316] mb-0.5`}
                              >
                                {plan.mealType}
                              </p>
                              <p
                                className={`text-sm font-medium line-clamp-1 ${textColor}`}
                              >
                                {plan.recipe?.title}
                              </p>
                            </div>
                          </Link>
                          <button
                            onClick={() => handleDelete(plan._id, true)}
                            className="p-2 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className={`text-center py-20 rounded-xl border border-dashed ${cardBg} ${subText}`}
                >
                  No past meal history found.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Add Meal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[80vh] ${modalBg}`}
          >
            <div
              className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}
            >
              <h3 className={`font-bold text-lg ${textColor}`}>
                Add for{' '}
                {selectedDay?.toLocaleDateString('en-US', { weekday: 'long' })}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X className="text-gray-500 hover:text-red-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedMealType(type)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      selectedMealType === type
                        ? 'bg-[#f97316] text-white border-[#f97316]'
                        : `${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-600'}`
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={16}
                />
                <input
                  autoFocus
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 text-sm ${inputBg}`}
                />
              </div>
              <div className="flex-1 overflow-y-auto max-h-60 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {searchResults.map((recipe) => (
                  <button
                    key={recipe._id}
                    onClick={() => handleAddMeal(recipe._id)}
                    disabled={addingMeal}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                  >
                    <img
                      src={recipe.images?.[0]}
                      className="w-10 h-10 rounded object-cover bg-gray-300"
                    />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${textColor}`}>
                        {recipe.title}
                      </p>
                    </div>
                    {addingMeal && (
                      <Loader2
                        className="animate-spin text-[#f97316]"
                        size={16}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;
