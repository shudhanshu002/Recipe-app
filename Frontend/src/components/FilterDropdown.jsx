import { useEffect, useRef, useState } from "react";
import {ChevronDown, Check} from 'lucide-react';


export const FilterDropdown = ({ icon: Icon, label, value, options, onChange, isDarkMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper to get display label
    const getDisplayLabel = () => {
        // Handle array of strings (Cuisines) vs array of objects (Others)
        if (typeof options[0] === 'string') return value === 'All' ? label : value;
        const selected = options.find((o) => o.value === value);
        return selected ? selected.label : label;
    };

    // Check if filter is active (not default)
    const isActive = value !== 'all' && value !== '' && value !== 'All';

    const bgClass = isDarkMode ? 'bg-[#1e1e1e] border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700';
    const activeClass = isActive ? 'border-[#f97316]/50 bg-[#f97316]/5 text-[#f97316] ring-1 ring-[#f97316]/20' : 'hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800';

    return (
        <div className="relative " ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 text-sm font-medium w-full md:w-auto justify-between min-w-40 ${bgClass} ${activeClass}`}
            >
                <div className="flex items-center gap-2">
                    <Icon size={16} className={isActive ? 'text-[#f97316]' : 'text-gray-400'} />
                    <span className="truncate max-w-[120px]">{getDisplayLabel()}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#f97316]' : 'opacity-50'}`} />
            </button>

            {isOpen && (
                <div
                    className={`absolute top-full mt-2 left-0 w-56 rounded-xl shadow-xl border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 ${
                        isDarkMode ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-100'
                    }`}
                >
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        <style>{`
                            .scrollbar-hide::-webkit-scrollbar {
                                display: none;
                            }
                        `}</style>

                        {options.map((opt, idx) => {
                            const optLabel = typeof opt === 'string' ? opt : opt.label;
                            const optValue = typeof opt === 'string' ? opt : opt.value;
                            const isSelected = value === optValue;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        onChange(optValue);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors text-left ${
                                        isSelected ? 'bg-[#f97316]/10 text-[#f97316] font-medium' : `  ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'hover:bg-gray-100 text-gray-700'}`
                                    }`}
                                >
                                    {optLabel}
                                    {isSelected && <Check size={14} />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
