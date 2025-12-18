import Skeleton from '../ui/Skeleton';
import useThemeStore from '../../store/useThemeStore';

const NotificationSkeleton = () => {
  const { theme } = useThemeStore();
  const isDarkMode = theme === 'dark';
  const cardBg = isDarkMode
    ? 'bg-[#1e1e1e] border-gray-800'
    : 'bg-white border-gray-100';

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className={`p-4 rounded-xl border flex gap-4 items-center ${cardBg}`}
          >
            {/* Avatar */}
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />

            {/* Content */}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/4 rounded" />
            </div>

            {/* Action/Time */}
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationSkeleton;
