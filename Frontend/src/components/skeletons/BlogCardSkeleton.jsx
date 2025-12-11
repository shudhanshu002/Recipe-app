import Skeleton from '../ui/Skeleton';
import useThemeStore from '../../store/useThemeStore';

const BlogCardSkeleton = () => {
    const { theme } = useThemeStore();
    const isDarkMode = theme === 'dark';
    const cardBg = isDarkMode ? 'bg-[#252525] border-gray-800' : 'bg-white border-gray-100';

    return (
        <div className={`rounded-2xl overflow-hidden border ${cardBg} h-full flex flex-col`}>
            <Skeleton className="w-full h-48 rounded-none" />

            <div className="p-5 flex-1 flex flex-col space-y-3">
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                </div>

                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-2/3" />

                <div className="space-y-2 pt-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                </div>

                <div className="pt-4 mt-auto flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
        </div>
    );
};

export default BlogCardSkeleton;
