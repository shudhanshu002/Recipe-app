import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Heart, ChefHat } from 'lucide-react';
import useThemeStore from '../store/useThemeStore';

const Footer = () => {
    const { theme } = useThemeStore();
    const isDarkMode = theme === 'dark';

    // Theme Variables
    const bgClass = isDarkMode ? 'bg-[#111] text-gray-400' : 'bg-white text-gray-600';
    const headingColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const iconBg = isDarkMode ? 'bg-gray-800 hover:bg-[#f97316] text-white' : 'bg-gray-100 hover:bg-[#f97316] hover:text-white text-gray-600';
    const inputBg = isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900';

    return (
        <footer className={`mt-auto relative pt-16 pb-8 px-6 overflow-hidden ${bgClass} rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]`}>
            {/* Decorative Background Blob */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-[#f97316]/20 blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    {/* 1. BRAND SECTION */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 mb-2 group">
                            <div className="w-10 h-10 bg-linear-to-br from-[#f97316] to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                                <ChefHat className="text-white w-6 h-6" />
                            </div>
                            <span className={`text-2xl font-bold font-dancing ${headingColor}`}>Zaika Vault</span>
                        </Link>
                        <p className="text-sm leading-relaxed max-w-xs">Discover, share, and organize your favorite recipes. We are building a community where flavor meets friendship.</p>
                        <div className="flex items-center gap-2 pt-2">
                            <div className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                <Mail size={16} className="text-[#f97316]" />
                            </div>
                            <span className="text-sm font-medium">sudhanshu6073@gmail.com</span>
                        </div>
                    </div>

                    {/* 2. DISCOVER LINKS */}
                    <div>
                        <h4 className={`text-xl font-bold mb-6 font-dancing ${headingColor}`}>Discover</h4>
                        <ul className="space-y-3 text-sm">
                            <FooterLink to="/" label="Home" />
                            <FooterLink to="/community" label="Community Feed" />
                            <FooterLink to="/blogs" label="Food Articles" />
                            <FooterLink to="/subscription" label="Premium Plans" />
                        </ul>
                    </div>

                    {/* 3. CATEGORIES LINKS */}
                    <div>
                        <h4 className={`text-xl font-bold mb-6 font-dancing ${headingColor}`}>Cuisines</h4>
                        <ul className="space-y-3 text-sm">
                            <FooterLink to="/?cuisine=Italian" label="Italian Delights" />
                            <FooterLink to="/?cuisine=Mexican" label="Mexican Spicy" />
                            <FooterLink to="/?cuisine=Indian" label="Indian Curry" />
                            <FooterLink to="/?filter=premium" label="Chef's Specials" />
                        </ul>
                    </div>

                    {/* 4. CONNECT / NEWSLETTER MINI */}
                    <div>
                        <h4 className={`text-xl font-bold mb-6 font-dancing ${headingColor}`}>Stay Connected</h4>
                        <p className="text-sm mb-4">Follow us on social media for daily recipes and behind the scenes.</p>

                        <div className="flex gap-3">
                            <SocialButton href="#" icon={<Facebook size={18} />} classes={iconBg} />
                            <SocialButton href="#" icon={<Instagram size={18} />} classes={iconBg} />
                            <SocialButton href="#" icon={<Twitter size={18} />} classes={iconBg} />
                            <SocialButton href="#" icon={<Youtube size={18} />} classes={iconBg} />
                        </div>
                    </div>
                </div>

                {/* DIVIDER */}
                <div className={`h-px w-full bg-linear-to-r  mb-8 ${isDarkMode ? 'from-transparent via-gray-700 to-transparent' : 'from-transparent via-gray-300 to-transparent'}`}></div>

                {/* BOTTOM BAR */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
                    <p>© 2024 YumPlatform. All rights reserved.</p>

                    <div className="flex items-center gap-6">
                        <Link to="/privacy" className="hover:text-[#f97316] transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="hover:text-[#f97316] transition-colors">
                            Terms of Service
                        </Link>
                    </div>

                    <p className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        Made with <Heart size={12} className="text-red-500 fill-red-500 animate-pulse" /> by <span className={headingColor}>Sudhanshu</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

// Helper Component for Links with Hover Effect
const FooterLink = ({ to, label }) => (
    <li>
        <Link to={to} className="group flex items-center gap-2 hover:text-[#f97316] transition-all duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] opacity-0 group-hover:opacity-100 transition-opacity"></span>
            <span className="group-hover:translate-x-1 transition-transform">{label}</span>
        </Link>
    </li>
);

// Helper Component for Social Icons
const SocialButton = ({ href, icon, classes }) => (
    <a href={href} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm ${classes}`} aria-label="Social Link">
        {icon}
    </a>
);

export default Footer;
