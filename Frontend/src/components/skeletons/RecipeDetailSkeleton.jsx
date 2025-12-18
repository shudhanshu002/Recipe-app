import Skeleton from '../ui/Skeleton';
import useThemeStore from '../../store/useThemeStore';

const RecipeDetailSkeleton = () => {
  const { theme } = useThemeStore();
  const isDarkMode = theme === 'dark';
  const dividerColor = isDarkMode ? 'border-gray-800' : 'border-gray-200';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Media Area */}
      <Skeleton className="w-full aspect-video rounded-xl" />

      {/* Header*/}
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 w-2/3">
            <Skeleton className="h-4 w-24 rounded-full" /> {/* Diet Badge */}
            <Skeleton className="h-8 w-full rounded-lg" /> {/* Title */}
          </div>
          <Skeleton className="h-6 w-16 rounded-full" /> {/* Difficulty */}
        </div>

        {/* Author & Meta */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Meta Row */}
        <div className={`flex gap-4 py-4 border-y ${dividerColor}`}>
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Ingredients */}
        <div className="col-span-1 space-y-4">
          <Skeleton className="h-6 w-32" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-2 h-2 rounded-full mt-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
          <Skeleton className="h-10 w-full rounded-xl mt-4" />{' '}
          {/* Cart Button */}
        </div>

        {/* Instructions */}
        <div className="col-span-2 space-y-4">
          <Skeleton className="h-6 w-32" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2 mb-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailSkeleton;
