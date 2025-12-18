import useThemeStore from '../../store/useThemeStore';

const Skeleton = ({ className, ...props }) => {
  const { theme } = useThemeStore();
  const isDarkMode = theme === 'dark';

  const baseClasses = 'animate-pulse rounded-md';
  const themeClasses = isDarkMode ? 'bg-gray-800/80' : 'bg-gray-200';

  return (
    <div className={`${baseClasses} ${themeClasses} ${className}`} {...props} />
  );
};

export default Skeleton;
