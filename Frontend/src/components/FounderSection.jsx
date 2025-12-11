import { Quote, Github, Twitter, Linkedin, Instagram } from 'lucide-react';
import useThemeStore from '../store/useThemeStore';

const FounderSection = () => {
    const { theme } = useThemeStore();
    const isDarkMode = theme === 'dark';

    // styles based on theme
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const cardBg = isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white';

    return (
        <section className="py-2 px-4 font-dancing">
            <div className={`max-w-4xl mx-auto ${cardBg} rounded-[2.5rem] p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center gap-10 relative overflow-hidden transition-colors duration-300`}>
                {/* Decorative Background Blob */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#f97316]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                {/* LEFT: Image with "One Point" (Teardrop Shape) */}
                <div className="relative shrink-0 group">
                    {/* The Shape: Rounded full, but Top-Right is sharp (rounded-tr-none) */}
                    <div
                        className="w-48 h-48 md:w-56 md:h-56 bg-linear-to-br from-orange-400 to-red-500 p-1.5 shadow-lg 
                        rounded-full rounded-tr-none rotate-[-10deg] group-hover:rotate-0 transition-all duration-500 ease-out"
                    >
                        <div className="w-full h-full bg-white rounded-full rounded-tr-none overflow-hidden relative">
                            <img
                                src="https://avatars.githubusercontent.com/u/1?v=4"
                                alt="Sudhanshu"
                                className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-500"
                            />
                        </div>
                    </div>

                    {/* Decorative emoji */}
                    <div className={`absolute -top-2 -right-2 p-2 rounded-full shadow-sm text-2xl animate-bounce z-20 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>👨‍💻</div>
                </div>

                {/* RIGHT: Content */}
                <div className="flex-1 text-center md:text-left space-y-4 z-10">
                    <div>
                        <h5 className="text-[#f97316] font-bold tracking-wider uppercase text-sm mb-1">The Chef Behind the Code</h5>
                        <h3 className={`text-4xl font-bold ${textColor}`}>Sudhanshu</h3>
                        <p className={`text-lg font-medium ${subText} mt-1`}>Founder & Developer</p>
                    </div>

                    <div className="relative">
                        <Quote className="absolute -top-2 -left-4 w-8 h-8 text-[#f97316] -scale-x-100 hidden md:block" />
                        <p className={`text-lg leading-relaxed italic ${textColor} opacity-80 md:pl-6`}>
                            "Building YumPlatform to connect food lovers across the globe. I believe that good code is like a good recipe—it requires patience, passion, and the right ingredients."
                        </p>
                    </div>

                    {/* Social / Contact Links */}
                    <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
                        <SocialLink icon={<Github size={20} />} href="https://github.com/yourusername" isDarkMode={isDarkMode} />
                        <SocialLink icon={<Linkedin size={20} />} href="#" isDarkMode={isDarkMode} />
                        <SocialLink icon={<Twitter size={20} />} href="#" isDarkMode={isDarkMode} />
                        <SocialLink icon={<Instagram size={20} />} href="#" isDarkMode={isDarkMode}  />
                    </div>
                </div>
            </div>
        </section>
    );
};

// Helper Sub-component
const SocialLink = ({ icon, href , isDarkMode}) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`p-3 rounded-full hover:bg-orange-500 hover:text-white transition-all hover:-translate-y-1 ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
    >
        {icon}
    </a>
);

export default FounderSection;
