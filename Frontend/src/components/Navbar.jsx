import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, PlusSquare, Calendar, ShoppingCart, Heart, LogOut, Sun, Moon, LogIn, User, Bell, Crown } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import { authApi } from '../api/auth';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const { isDarkMode, toggleTheme } = useThemeStore();

    const handleLogout = async () => {
        try {
            await authApi.logout();
            logout();
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

    
    const navBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-200';
    const textPrimary = isDarkMode ? 'text-white' : 'text-gray-800';
    const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';
    const hoverBg = isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50';
    const activeClass = isDarkMode ? 'text-black' : 'text-black';

    return (
        <header className={`fixed top-0 left-0 w-full h-16 border-b z-50 transition-colors duration-300 ${navBg}`}>
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">Y</span>
                    </div>
                    <span className={`text-xl font-bold hidden sm:block ${textPrimary}`}>YumPlatform</span>
                </Link>

                {/* Navigation*/}
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

                {/* Right Section: Theme & User */}
                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors ${textSecondary} ${hoverBg}`} title="Toggle Theme">
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {user ? (
                        <div className="flex items-center gap-3">
                            {!user.isSubscriptionActive && (
                                <Link to="/subscription" className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold hover:bg-yellow-200">
                                    <Crown size={14} /> Upgrade
                                </Link>
                            )}

                            <Link to="/notifications" className={`p-2 rounded-lg ${textSecondary} ${hoverBg}`}>
                                <Bell size={20} />
                            </Link>

                            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                                <Link to={`/profile/${user.username}`} className="flex items-center gap-2">
                                    <img src={user.avatar || 'https://via.placeholder.com/40'} alt="User" className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" />
                                </Link>
                                <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 rounded p-1.5" title="Logout">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <NavLink to="/login" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg bg-orange-600 transition font-medium text-sm">
                            <LogIn size={18} /> Login
                        </NavLink>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
