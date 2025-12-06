import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, PlusSquare, Calendar, ShoppingCart, Heart, LogOut, Settings, User, Crown, ChevronDown, BookOpen, LogIn, Sun, Moon, Bell, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify'; // ✅ IMPORT TOAST
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import useNotificationStore from '../store/useNotificationStore';
import { authApi } from '../api/auth';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const { isDarkMode, toggleTheme } = useThemeStore();
    const { unreadCount, fetchUnreadCount } = useNotificationStore();

    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
        }
    }, [user, fetchUnreadCount]);

    const handleLogout = async () => {
        try {
            await authApi.logout();
            logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    // ✅ NEW: Handle Dropdown Filter Clicks
    const handleDropdownClick = (action) => {
        if (action === 'premium-filter') {
            // Navigate to Home with filter param
            navigate('/?filter=premium');
            toast.success('Displaying Premium Recipes Only', {
                position: 'top-center',
                autoClose: 2000,
            });
        } else if (action === 'all') {
            // Reset filter
            navigate('/?filter=all');
        }
        setShowDropdown(false);
    };

    const navItems = [
        { name: 'Home', path: '/', icon: <Home size={20} /> },
        { name: 'Community', path: '/community', icon: <User size={20} /> },
        { name: 'Create', path: '/create-recipe', icon: <PlusSquare size={20} /> },
        { name: 'Plan', path: '/meal-planner', icon: <Calendar size={20} /> },
        { name: 'Shop', path: '/shopping-list', icon: <ShoppingCart size={20} /> },
        { name: 'Blog', path: '/blogs', icon: <BookOpen size={20} /> },
    ];

    const navBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-200';
    const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';
    const hoverBg = isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50';
    const activeClass = 'text-primary';
    const dropdownBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-200';
    const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';

    return (
        <header className={`fixed top-0 left-0 w-full h-16 border-b z-50 transition-colors duration-300 ${navBg}`}>
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">Y</span>
                    </div>
                    <span className={`text-xl font-bold hidden sm:block ${textPrimary}`}>YumPlatform</span>
                </Link>

                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 font-medium text-sm ${isActive ? activeClass : `${textSecondary} ${hoverBg}`}`
                            }
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    {user && (
                        <Link to="/notifications" className={`relative p-2 rounded-lg transition-colors ${textSecondary} ${hoverBg}`} title="Notifications">
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#1e1e1e]">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Link>
                    )}

                    <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors ${textSecondary} ${hoverBg}`}>
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className={`flex items-center gap-2 p-1 pr-2 rounded-full border transition-all ${
                                    isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <div className="relative">
                                    <img src={user.avatar || 'https://via.placeholder.com/40'} alt="User" className="w-8 h-8 rounded-full object-cover" />
                                    {/* Small Crown Badge on Avatar if Premium */}
                                    {user.isPremium && (
                                        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-[2px] border-2 border-white dark:border-[#1e1e1e]">
                                            <Crown size={8} className="text-white fill-white" />
                                        </div>
                                    )}
                                </div>
                                <ChevronDown size={16} className={textSecondary} />
                            </button>

                            {showDropdown && (
                                <div className={`absolute right-0 top-12 w-60 rounded-xl shadow-xl border py-2 animate-in fade-in slide-in-from-top-2 ${dropdownBg}`}>
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className={`text-sm font-bold ${textPrimary} truncate max-w-[150px]`}>{user.username}</p>
                                            {user.isPremium && (
                                                <span className="flex items-center gap-1 text-[10px] font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-800">
                                                    <Crown size={10} className="fill-current" /> PRO
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-xs ${textSecondary} truncate`}>{user.email}</p>
                                    </div>

                                    <Link to={`/profile/${user.username}`} className={`flex items-center gap-2 px-4 py-2 text-sm ${textSecondary} ${hoverBg}`} onClick={() => setShowDropdown(false)}>
                                        <User size={16} /> Profile
                                    </Link>
                                    <Link to="/settings" className={`flex items-center gap-2 px-4 py-2 text-sm ${textSecondary} ${hoverBg}`} onClick={() => setShowDropdown(false)}>
                                        <Settings size={16} /> Settings
                                    </Link>

                                    <div className="my-1 border-t border-gray-100 dark:border-gray-800"></div>

                                    {/* --- Premium Section Update --- */}
                                    {user.isPremium ? (
                                        <>
                                            {/* ✅ ADDED: Option to view All Recipes */}
                                            <button onClick={() => handleDropdownClick('all')} className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${textSecondary} ${hoverBg} text-left`}>
                                                <Home size={16} /> All Recipes
                                            </button>

                                            {/* ✅ MODIFIED: Filters for Premium instead of navigating away */}
                                            <button
                                                onClick={() => handleDropdownClick('premium-filter')}
                                                className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-yellow-600 dark:text-yellow-500 ${hoverBg} text-left`}
                                            >
                                                <Crown size={16} /> Premium Content
                                            </button>

                                            <Link to="/subscription" className={`flex items-center gap-2 px-4 py-2 text-sm ${textSecondary} ${hoverBg}`} onClick={() => setShowDropdown(false)}>
                                                <CreditCard size={16} /> Manage Subscription
                                            </Link>
                                        </>
                                    ) : (
                                        <Link
                                            to="/subscription"
                                            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/10 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-colors mx-2 rounded-lg mb-1`}
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            <Crown size={16} className="fill-current animate-pulse" /> Upgrade to Premium
                                        </Link>
                                    )}
                                    {/* ----------------------------- */}

                                    <div className="my-1 border-t border-gray-100 dark:border-gray-800"></div>

                                    <button onClick={handleLogout} className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-left`}>
                                        <LogOut size={16} /> Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition text-sm flex items-center gap-2">
                            <LogIn size={18} /> Login
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
