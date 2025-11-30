import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, PlusSquare, Calendar, ShoppingCart, Heart, LogOut, Settings, User, Crown, ChevronDown } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import { authApi } from '../api/auth';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const { isDarkMode } = useThemeStore();
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

    const handleLogout = async () => {
        try {
            await authApi.logout();
            logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const navItems = [
        { name: 'Home', path: '/', icon: <Home size={20} /> },
        { name: 'Create', path: '/create-recipe', icon: <PlusSquare size={20} /> },
        { name: 'Plan', path: '/meal-planner', icon: <Calendar size={20} /> },
        { name: 'Shop', path: '/shopping-list', icon: <ShoppingCart size={20} /> },
        { name: 'Saved', path: '/favorites', icon: <Heart size={20} /> },
    ];

    // Styles
    const navBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-200';
    const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
    const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';
    const hoverBg = isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50';
    const dropdownBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-200';

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
                                `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 font-medium text-sm ${isActive ? 'text-primary' : `${textSecondary} ${hoverBg}`}`
                            }
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className={`flex items-center gap-2 p-1 pr-2 rounded-full border transition-all ${
                                    isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <img src={user.avatar || 'https://via.placeholder.com/40'} alt="User" className="w-8 h-8 rounded-full object-cover" />
                                <ChevronDown size={16} className={textSecondary} />
                            </button>

                            {/* Dropdown Menu */}
                            {showDropdown && (
                                <div className={`absolute right-0 top-12 w-56 rounded-xl shadow-xl border py-2 animate-in fade-in slide-in-from-top-2 ${dropdownBg}`}>
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-2">
                                        <p className={`text-sm font-bold ${textPrimary}`}>{user.username}</p>
                                        <p className={`text-xs ${textSecondary} truncate`}>{user.email}</p>
                                    </div>

                                    <Link to={`/profile/${user.username}`} className={`flex items-center gap-2 px-4 py-2 text-sm ${textSecondary} ${hoverBg}`} onClick={() => setShowDropdown(false)}>
                                        <User size={16} /> Profile
                                    </Link>

                                    <Link to="/settings" className={`flex items-center gap-2 px-4 py-2 text-sm ${textSecondary} ${hoverBg}`} onClick={() => setShowDropdown(false)}>
                                        <Settings size={16} /> Settings
                                    </Link>

                                    <div className="my-1 border-t border-gray-100 dark:border-gray-800"></div>

                                    <Link
                                        to="/premium-recipes"
                                        className={`flex items-center gap-2 px-4 py-2 text-sm text-yellow-600 dark:text-yellow-500 ${hoverBg}`}
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <Crown size={16} /> Premium Recipes
                                    </Link>

                                    <button onClick={handleLogout} className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-left`}>
                                        <LogOut size={16} /> Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
