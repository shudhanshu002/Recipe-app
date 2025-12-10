import Skeleton from '../ui/Skeleton';
import useThemeStore from '../../store/useThemeStore';
import RecipeCardSkeleton from './RecipeCardSkeleton';

const ProfileSkeleton = () => {
    const { theme } = useThemeStore();
    const isDarkMode = theme === 'dark';
    const bgClass = isDarkMode ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200';

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-[#121212]' : 'bg-gray-50'} pb-20`}>
            {/* Cover Image */}
            <Skeleton className="h-48 md:h-64 w-full rounded-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
                <div className={`rounded-3xl shadow-xl overflow-hidden border ${bgClass}`}>
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                            {/* Avatar */}
                            <div className="relative">
                                <Skeleton className="w-32 h-32 rounded-full border-4 border-white dark:border-[#1e1e1e]" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 space-y-3 pt-2 w-full md:w-auto flex flex-col items-center md:items-start">
                                <div className="flex flex-col md:flex-row items-center gap-3">
                                    <Skeleton className="h-8 w-48 rounded-lg" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                                <Skeleton className="h-4 w-32 rounded" />
                                <Skeleton className="h-4 w-64 rounded max-w-full" />

                                {/* Stats */}
                                <div className="flex gap-6 pt-2 justify-center md:justify-start">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="text-center space-y-1">
                                            <Skeleton className="h-6 w-8 mx-auto" />
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Button */}
                            <Skeleton className="h-10 w-32 rounded-xl mt-4 md:mt-0" />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className={`flex border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex-1 p-4 flex justify-center">
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Grid */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <RecipeCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfileSkeleton;
