import Skeleton from '../ui/Skeleton';
import useThemeStore from '../../store/useThemeStore';

const RecipeCardSkeleton = () => {
    const { theme } = useThemeStore();
    const isDarkMode = theme === 'dark';
    const cardBg = isDarkMode ? 'bg-[#252525] border-gray-800' : 'bg-white border-gray-100';

    return (
        <div className={`rounded-2xl overflow-hidden border p-0 ${cardBg}`}>
            {/* Image*/}
            <Skeleton className="w-full h-48 rounded-none" />

            <div className="p-4 space-y-3">
                {/* Title */}
                <Skeleton className="h-6 w-3/4 rounded-lg" />

                {/* Author detail*/}
                <div className="flex items-center gap-2">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="h-3 w-1/3 rounded" />
                </div>

                {/* Divider */}
                <div className={`border-t border-dashed my-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />

                {/* Meta Tags (Cuisine & Difficulty)--fields */}
                <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-4 w-12 rounded-md" />
                </div>
            </div>
        </div>
    );
};

export default RecipeCardSkeleton;
