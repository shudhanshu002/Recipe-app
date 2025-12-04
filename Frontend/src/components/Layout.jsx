import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import AIChatbot from '../pages/AIChatbot';
import useThemeStore from '../store/useThemeStore';

const Layout = () => {
    const { theme } = useThemeStore();
    const isDarkMode = theme === 'dark'; 

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        <div className={`flex flex-col min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#121212] text-white' : 'bg-secondary text-gray-800'}`}>
            {/* Top Navigation */}
            <Navbar />

            {/* Main Content - Added padding top (pt-20) so content isn't hidden behind fixed Navbar */}
            {/* Removed ml-64 since there is no sidebar */}
            <main className="flex-1 w-full pt-20 px-4 pb-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
            <AIChatbot/>
        </div>
    );
};

export default Layout;
