import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import useThemeStore from '../store/useThemeStore';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const { theme } = useThemeStore();
    const isDarkMode = theme === 'dark';

    return (
        <div className={`font-dancing min-h-screen flex flex-col items-center justify-center p-4 ${isDarkMode ? 'bg-[#121212] text-white' : 'bg-gray-50 text-gray-900'}`}>
            <CheckCircle className="w-24 h-24 text-green-500 mb-6" />
            <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-lg text-gray-500 mb-8">Welcome to YumPlatform Premium. You can now access all exclusive content.</p>

            <button onClick={() => navigate('/')} className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-orange-600 transition-colors">
                Go to Home
            </button>
        </div>
    );
};

export default PaymentSuccess;
