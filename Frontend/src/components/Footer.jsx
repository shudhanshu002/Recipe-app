import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Heart } from 'lucide-react';
import useThemeStore from '../store/useThemeStore';

const Footer = () => {
    const { isDarkMode } = useThemeStore();

    const bgClass = isDarkMode ? 'bg-[#1a1a1a] border-t border-gray-800' : 'bg-white border-t border-gray-100';
    const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
    const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';

    return (
        <footer className={`${bgClass} mt-auto`}>
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">Y</span>
                            </div>
                            <span className={`text-xl font-bold ${textMain}`}>YumPlatform</span>
                        </Link>
                        <p className={`text-sm ${textSub} leading-relaxed`}>Discover, share, and organize your favorite recipes. Join our community of food lovers today.</p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className={`font-bold mb-4 ${textMain}`}>Discover</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/" className={`${textSub} hover:text-primary`}>
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/community" className={`${textSub} hover:text-primary`}>
                                    Community
                                </Link>
                            </li>
                            <li>
                                <Link to="/blogs" className={`${textSub} hover:text-primary`}>
                                    Food Blog
                                </Link>
                            </li>
                            <li>
                                <Link to="/subscription" className={`${textSub} hover:text-primary`}>
                                    Premium Plans
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className={`font-bold mb-4 ${textMain}`}>Categories</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/?cuisine=Italian" className={`${textSub} hover:text-primary`}>
                                    Italian
                                </Link>
                            </li>
                            <li>
                                <Link to="/?cuisine=Mexican" className={`${textSub} hover:text-primary`}>
                                    Mexican
                                </Link>
                            </li>
                            <li>
                                <Link to="/?cuisine=Indian" className={`${textSub} hover:text-primary`}>
                                    Indian
                                </Link>
                            </li>
                            <li>
                                <Link to="/?filter=premium" className={`${textSub} hover:text-primary`}>
                                    Premium Only
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Socials */}
                    <div>
                        <h4 className={`font-bold mb-4 ${textMain}`}>Connect</h4>
                        <div className="flex gap-4 mb-4">
                            <a href="#" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-primary hover:text-white transition-colors">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-primary hover:text-white transition-colors">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-primary hover:text-white transition-colors">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-primary hover:text-white transition-colors">
                                <Youtube size={18} />
                            </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Mail size={16} className={textSub} />
                            <span className={textSub}>hello@yumplatform.com</span>
                        </div>
                    </div>
                </div>

                <div className={`pt-8 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'} flex flex-col md:flex-row items-center justify-between gap-4`}>
                    <p className={`text-sm ${textSub}`}>© 2024 YumPlatform. All rights reserved.</p>
                    <p className={`text-sm ${textSub} flex items-center gap-1`}>
                        Made with <Heart size={14} className="text-red-500 fill-current" /> by Sudhanshu
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
