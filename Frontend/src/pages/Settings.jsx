import React from 'react';
import { Moon, Sun, LogOut, User, Shield, Bell, ChevronRight } from 'lucide-react';
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';
import { authApi } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';

const Settings = () => {
    const { isDarkMode, toggleTheme } = useThemeStore();
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await authApi.logout();
            logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    // Styles
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const cardBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-200';
    const subText = isDarkMode ? 'text-gray-400' : 'text-gray-600';
    const itemHover = isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50';
    const separator = isDarkMode ? 'border-gray-800' : 'border-gray-100';

    return (
        <div className="max-w-2xl mx-auto space-y-8 mb-20">
            <h1 className={`text-3xl font-bold ${textColor}`}>Settings</h1>

            <div className={`rounded-xl border overflow-hidden shadow-sm ${cardBg}`}>
                {/* Profile Link */}
                <Link to={`/profile/${user?.username}`} className={`block p-6 border-b ${separator} ${itemHover} transition-colors`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img src={user?.avatar || 'https://via.placeholder.com/50'} alt="User" className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" />
                            <div>
                                <h2 className={`text-lg font-bold ${textColor}`}>{user?.username}</h2>
                                <p className={`text-sm ${subText}`}>{user?.email}</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-400" />
                    </div>
                </Link>

                {/* Appearance Section */}
                <div className={`p-6 border-b ${separator}`}>
                    <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 text-gray-500`}>Appearance</h2>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {isDarkMode ? <Moon className="text-blue-400" size={20} /> : <Sun className="text-orange-500" size={20} />}
                            <div>
                                <p className={`font-medium ${textColor}`}>Dark Mode</p>
                                <p className={`text-xs ${subText}`}>Adjust the appearance of the app</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${
                                isDarkMode ? 'bg-primary' : 'bg-gray-300'
                            }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                {/* Account Section */}
                <div className={`p-6 border-b ${separator}`}>
                    <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 text-gray-500`}>Account</h2>
                    <div className="space-y-1">
                        <button className={`w-full flex items-center justify-between p-3 rounded-lg ${itemHover} transition-colors text-left`}>
                            <div className="flex items-center gap-3">
                                <Shield size={20} className="text-gray-400" />
                                <div>
                                    <p className={`font-medium ${textColor}`}>Privacy & Security</p>
                                </div>
                            </div>
                        </button>
                        <button className={`w-full flex items-center justify-between p-3 rounded-lg ${itemHover} transition-colors text-left`}>
                            <div className="flex items-center gap-3">
                                <Bell size={20} className="text-gray-400" />
                                <div>
                                    <p className={`font-medium ${textColor}`}>Notifications</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="p-6">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-500 font-bold hover:text-red-600 transition-colors w-full justify-center py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <LogOut size={20} /> Log Out
                    </button>
                </div>
            </div>

            <div className="text-center text-xs text-gray-400">YumPlatform Version 1.0.0</div>
        </div>
    );
};

export default Settings;
