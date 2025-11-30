import React from 'react';
import { Moon, Sun, LogOut, User, Shield, Bell } from 'lucide-react';
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';
import { authApi } from '../api/auth';
import { useNavigate } from 'react-router-dom';

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

    return (
        <div className="max-w-2xl mx-auto space-y-8 mb-10">
            <h1 className={`text-3xl font-bold ${textColor}`}>Settings</h1>

            <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
                {/* Appearance Section */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className={`text-lg font-semibold mb-4 ${textColor}`}>Appearance</h2>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {isDarkMode ? <Moon className="text-blue-400" /> : <Sun className="text-orange-500" />}
                            <div>
                                <p className={`font-medium ${textColor}`}>Dark Mode</p>
                                <p className={`text-sm ${subText}`}>Adjust the appearance of the app</p>
                            </div>
                        </div>
                        <button onClick={toggleTheme} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-gray-200'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                {/* Account Section */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className={`text-lg font-semibold mb-4 ${textColor}`}>Account</h2>
                    <div className="space-y-4">
                        <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${itemHover}`}>
                            <User size={20} className="text-gray-400" />
                            <div>
                                <p className={`font-medium ${textColor}`}>Edit Profile</p>
                                <p className={`text-sm ${subText}`}>Change your name, bio, and avatar</p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${itemHover}`}>
                            <Shield size={20} className="text-gray-400" />
                            <div>
                                <p className={`font-medium ${textColor}`}>Privacy & Security</p>
                                <p className={`text-sm ${subText}`}>Manage your password and visibility</p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${itemHover}`}>
                            <Bell size={20} className="text-gray-400" />
                            <div>
                                <p className={`font-medium ${textColor}`}>Notifications</p>
                                <p className={`text-sm ${subText}`}>Choose what alerts you receive</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="p-6">
                    <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-medium hover:text-red-600 transition-colors w-full">
                        <LogOut size={20} /> Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
