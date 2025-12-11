import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// api
import { authApi } from '../api/auth';

// stores
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';
 // icons
import { Moon, Sun, LogOut, Shield, Bell, ChevronRight, X, Lock } from 'lucide-react';

const Settings = () => {
    const { theme, toggleTheme } = useThemeStore();
    const isDarkMode = theme === 'dark';
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    // State for Privacy Modal
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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
    const modalBg = isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white';

    return (
        <div className="font-dancing max-w-2xl mx-auto space-y-8 mb-20 relative">
            <h1 className={`text-3xl font-bold ${textColor}`}>Settings</h1>

            <div className={`rounded-xl border overflow-hidden shadow-sm ${cardBg}`}>
                {/* Profile Link */}
                <Link to={`/profile/${user?.username}`} className={`block p-6 border-b ${separator} ${itemHover} transition-colors`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img
                                src={user?.avatar || 'https://via.placeholder.com/50'}
                                alt="User"
                                className={`w-14 h-14 rounded-full object-cover border-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                            />
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
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 focus:ring-offset-2 ${
                                isDarkMode ? 'bg-[#f97316]' : 'bg-gray-300'
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
                        {/* Privacy & Security Button */}
                        <button onClick={() => setShowPrivacyModal(true)} className={`w-full flex items-center justify-between p-3 rounded-lg ${itemHover} transition-colors text-left`}>
                            <div className="flex items-center gap-3">
                                <Shield size={20} className="text-gray-400" />
                                <div>
                                    <p className={`font-medium ${textColor}`}>Privacy & Security</p>
                                </div>
                            </div>
                            <ChevronRight className="text-gray-400" size={16} />
                        </button>

                        {/* Notifications Button (Navigates to Page) */}
                        <button onClick={() => navigate('/notifications')} className={`w-full flex items-center justify-between p-3 rounded-lg ${itemHover} transition-colors text-left`}>
                            <div className="flex items-center gap-3">
                                <Bell size={20} className="text-gray-400" />
                                <div>
                                    <p className={`font-medium ${textColor}`}>Notifications</p>
                                </div>
                            </div>
                            <ChevronRight className="text-gray-400" size={16} />
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="p-6">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-2 text-red-500 font-bold hover:text-red-600 transition-colors w-full justify-center py-3 rounded-lg ${
                            isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                        }`}
                    >
                        <LogOut size={20} /> Log Out
                    </button>
                </div>
            </div>

            <div className="text-center text-xs text-gray-400">YumPlatform Version 1.0.0</div>

            {/* PRIVACY POLICY MODAL */}
            {showPrivacyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${modalBg} border ${separator}`}>
                        {/* Header */}
                        <div className={`px-6 py-4 border-b ${separator} flex items-center justify-between`}>
                            <h3 className={`text-xl font-bold flex items-center gap-2 ${textColor}`}>
                                <Lock size={20} className="text-[#f97316]" /> Privacy Policy
                            </h3>
                            <button onClick={() => setShowPrivacyModal(false)} className={`p-2 rounded-full ${itemHover} ${subText}`}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className={`p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4 ${subText} text-sm leading-relaxed`}>
                            <p>
                                <strong>1. Data Collection:</strong> We collect minimal data necessary to provide our services, including your username, email, and recipe preferences.
                            </p>
                            <p>
                                <strong>2. User Content:</strong> Any recipes, images, or comments you upload remain your intellectual property, but you grant us a license to display them on the
                                platform.
                            </p>
                            <p>
                                <strong>3. Security:</strong> We use industry-standard encryption to protect your data. Your password is hashed and never stored in plain text.
                            </p>
                            <p>
                                <strong>4. Cookies:</strong> We use cookies to maintain your session and preference settings (like Light/Dark mode).
                            </p>
                            <p>
                                <strong>5. Third Parties:</strong> We do not sell your personal data to advertisers. Analytics are used solely to improve app performance.
                            </p>
                            <p>By using Zaika Vault, you agree to these terms.</p>
                        </div>

                        {/* Footer */}
                        <div className={`p-4 border-t ${separator} flex justify-end`}>
                            <button
                                onClick={() => setShowPrivacyModal(false)}
                                className="bg-[#f97316] text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
                            >
                                Okay, I understand
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
