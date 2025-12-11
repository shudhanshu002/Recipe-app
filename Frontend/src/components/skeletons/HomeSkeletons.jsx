import Skeleton from '../ui/Skeleton';
import useThemeStore from '../../store/useThemeStore';

export const CategoryCardSkeleton = () => (
    <div className="relative h-48 rounded-3xl overflow-hidden">
        <Skeleton className="w-full h-full rounded-3xl" />
    </div>
);

export const VideoCardSkeleton = () => (
    <div className="relative shrink-0 w-80 h-48 rounded-xl overflow-hidden">
        <Skeleton className="w-full h-full rounded-xl" />
    </div>
);

export const ChefCardSkeleton = () => {
    const { theme } = useThemeStore();
    const isDarkMode = theme === 'dark';
    const cardBg = isDarkMode ? 'bg-[#252525]' : 'bg-white';

    return (
        <div className={`p-6 rounded-4xl flex flex-col items-center gap-4 ${cardBg} shadow-sm border border-transparent`}>
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="space-y-2 w-full flex flex-col items-center">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
            </div>
        </div>
    );
};
