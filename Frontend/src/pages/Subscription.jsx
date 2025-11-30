import React from 'react';
import { Crown, Check } from 'lucide-react';
import api from '../lib/axios';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';

const Subscription = () => {
    const { user, updateUser } = useAuthStore();
    const { isDarkMode } = useThemeStore();

    const upgrade = async () => {
        await api.post('/payment/subscribe');
        updateUser({ isSubscriptionActive: true });
        alert('Upgraded!');
    };

    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const cardBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-200';

    if (user?.isSubscriptionActive)
        return (
            <div className={`text-center py-20 ${textColor}`}>
                <Crown size={60} className="mx-auto text-yellow-500 mb-4" />
                You are Premium!
            </div>
        );

    return (
        <div className="max-w-4xl mx-auto text-center py-10 space-y-8">
            <h1 className={`text-4xl font-bold ${textColor}`}>Upgrade to Premium</h1>
            <div className={`p-8 rounded-2xl border-2 border-primary shadow-xl max-w-sm mx-auto ${cardBg}`}>
                <h3 className={`text-xl font-bold ${textColor}`}>Premium Chef</h3>
                <p className="text-3xl font-bold mt-2 text-primary">$9.99</p>
                <ul className="mt-6 space-y-4 text-left mx-auto max-w-xs text-gray-500">
                    <li className="flex gap-2">
                        <Check className="text-green-500" /> Exclusive Recipes
                    </li>
                    <li className="flex gap-2">
                        <Check className="text-green-500" /> Support Creators
                    </li>
                </ul>
                <button onClick={upgrade} className="w-full mt-8 py-3 bg-primary text-white font-bold rounded-xl">
                    Get Premium
                </button>
            </div>
        </div>
    );
};
export default Subscription;
