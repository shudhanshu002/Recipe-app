import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, PlusSquare, Calendar, ShoppingCart, Heart, LogOut, Settings, User, Crown, ChevronDown, BookOpen, LogIn, Sun, Moon, Bell, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import useNotificationStore from '../store/useNotificationStore';
import { authApi } from '../api/auth';
import { motion } from 'framer-motion';
import logo from '../assets/circular_logo_dark.png';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const { unreadCount, fetchUnreadCount } = useNotificationStore();

    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const [isVisible, setIsVisible] = useState(true);
    const [isShrunk, setIsShrunk] = useState(false);

    const isDarkMode = theme === 'dark';

    // navbar scroll coming and going effect
    useEffect(() => {
        let lastScroll = window.scrollY;
        let timeout = null;

        const handleScroll = () => {
            const current = window.scrollY;

            setIsShrunk(current > 30);
            if (current > lastScroll && current > 80) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            lastScroll = current;

            clearTimeout(timeout);
            timeout = setTimeout(() => setIsVisible(true), 150);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // profile pop-up close effect
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // user notification count fetch
    useEffect(() => {
        if (user) fetchUnreadCount();
    }, [user, fetchUnreadCount]);

    // logout
    const handleLogout = async () => {
        try {
            await authApi.logout();
            logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const handleDropdownClick = (action) => {
        if (action === 'premium-filter') {
            toast.success('Displaying Premium Recipes Only', {
                position: 'top-right',
                autoClose: 1500,
            });
            setTimeout(() => {
                navigate('/recipes?category=premium');
            }, 1000);
        } else if (action === 'all') {
            navigate('/community');
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

    const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';
    const hoverBg = isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-300';
    const activeClass = 'text-primary';
    const dropdownBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-200';
    const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';

    return (
        <motion.header
            layout
            initial={{ y: -60, opacity: 0, width: '94%' }}
            animate={{
                y: isVisible ? 0 : -80,
                opacity: isVisible ? 1 : 0,
                height: isShrunk ? '3.2rem' : '4rem',
                scale: isShrunk ? 0.94 : 1,
                width: isShrunk ? '70%' : '94%',
            }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`fixed top-3 left-1/2 -translate-x-1/2 md:w-[80%] border z-50 backdrop-blur-xl rounded-4xl shadow-lg transition-all duration-300 ${
                theme === 'dark' ? 'bg-[#1e1e1e]/80 border-gray-700' : 'bg-white/70 border-gray-200'
            } font-dancing`}
        >
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <img src={logo} alt="Logo" className="w-8 h-8 object-cover rounded-lg" style={{ imageRendering: 'crisp-edges' }} />
                    <span className={`text-xl font-bold hidden sm:block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} font-cursive italic`}>ZaikaVault</span>
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
                        <Link to="/notifications" className={`relative p-2 rounded-lg ${textSecondary} ${hoverBg}`}>
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#1e1e1e]">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Link>
                    )}


                    <button onClick={toggleTheme} className={`p-2 rounded-lg ${textSecondary} ${hoverBg}`}>
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>


                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className={`flex items-center gap-2 p-1 pr-2 rounded-full border ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                <div className="relative">
                                    <img src={user.avatar || 'https://via.placeholder.com/40'} alt="User" className="w-8 h-8 rounded-full object-cover" />
                                    {user.isPremium && (
                                        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-[2px] border-2 border-white dark:border-[#1e1e1e]">
                                            <Crown size={8} className="text-white fill-white" />
                                        </div>
                                    )}
                                </div>

                                <ChevronDown size={16} className={textSecondary} />
                            </button>


                            {showDropdown && (
                                <div className={`absolute right-0 top-12 w-60 rounded-xl shadow-xl border py-2 ${dropdownBg}`}>
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className={`text-sm font-bold ${textPrimary} truncate max-w-[150px]`}>{user.username}</p>
                                            {user.isPremium && (
                                                <span className="flex items-center gap-1 text-[10px] font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-800">
                                                    <Crown size={10} className="fill-current" /> PRO
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-xs ${textSecondary}`}>{user.email}</p>
                                    </div>

                                    <Link to={`/profile/${user.username}`} className={`flex items-center gap-2 px-4 py-2 text-sm ${textSecondary} ${hoverBg}`}>
                                        <User size={16} /> Profile
                                    </Link>

                                    <Link to="/settings" className={`flex items-center gap-2 px-4 py-2 text-sm ${textSecondary} ${hoverBg}`}>
                                        <Settings size={16} /> Settings
                                    </Link>

                                    <div className="my-1 border-t border-gray-100 dark:border-gray-800"></div>

                                    {user.isPremium ? (
                                        <>
                                            <button onClick={() => handleDropdownClick('all')} className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${textSecondary} ${hoverBg}`}>
                                                <Home size={16} /> All Recipes
                                            </button>

                                            <button
                                                onClick={() => handleDropdownClick('premium-filter')}
                                                className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-yellow-600 dark:text-yellow-500 ${hoverBg}`}
                                            >
                                                <Crown size={16} /> Premium Content
                                            </button>

                                            <Link to="/subscription" className={`flex items-center gap-2 px-4 py-2 text-sm ${textSecondary} ${hoverBg}`}>
                                                <CreditCard size={16} /> Manage Subscription
                                            </Link>
                                        </>
                                    ) : (
                                        <Link
                                            to="/subscription"
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/10 mx-2 rounded-lg mb-1"
                                        >
                                            <Crown size={16} className="fill-current animate-pulse" /> Upgrade to Premium
                                        </Link>
                                    )}

                                    <div className="my-1 border-t border-gray-100 dark:border-gray-800"></div>

                                    <button onClick={handleLogout} className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`}>
                                        <LogOut size={16} /> Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 text-sm flex items-center gap-2">
                            <LogIn size={18} /> Login
                        </Link>
                    )}
                </div>
            </div>
        </motion.header>
    );
};

export default Navbar;
