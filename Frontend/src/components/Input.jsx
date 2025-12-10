import { forwardRef } from 'react';
import useThemeStore from '../store/useThemeStore';

const Input = forwardRef(({ label, error, ...props }, ref) => {
    const { theme } = useThemeStore();

    return (
        <div className="flex flex-col gap-1 w-full">
            {label && (
                <label
                    className={`text-sm font-medium 
                        ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                    `}
                >
                    {label}
                </label>
            )}

            <input
                ref={ref}
                {...props}
                className={`
                    w-full px-4 py-2 rounded-lg border transition-all
                    focus:outline-none focus:ring-2 focus:ring-[#f97316]/50

                    ${
                        theme === 'dark'
                            ? 'bg-[#1e1e1e] text-white placeholder-gray-400 border-gray-600 focus:border-[#f97316]'
                            : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300 focus:border-[#f97316]'
                    }

                    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-400' : ''}
                `}
            />

            {error && <span className="text-xs text-red-500">{error.message}</span>}
        </div>
    );
});

Input.displayName = 'Input';
export default Input;
