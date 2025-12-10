import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

// store
import useThemeStore from '../store/useThemeStore';

// start
import Navbar from './Navbar';
// end
import Footer from './Footer';
// chatbot
import AIChatbot from '../pages/AIChatbot';

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
        <div className={`flex flex-col min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#121212] text-white' : 'bg-gray-400 text-gray-800'}`}>
            <Navbar />
            <main className="flex-1 w-full pt-20 px-4 pb-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
            <AIChatbot/>
            <Footer/>
        </div>
    );
};

export default Layout;
