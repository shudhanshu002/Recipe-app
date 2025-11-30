import React, { useEffect, useRef } from 'react';
import useThemeStore from '../store/useThemeStore';
import { Calendar } from 'lucide-react';

const DateStrip = ({ plans, onDateClick }) => {
    const { isDarkMode } = useThemeStore();
    const scrollRef = useRef(null);
    const todayRef = useRef(null);

    // 1. Group plans by date to find the first recipe image for each active day
    const dateMap = plans.reduce((acc, plan) => {
        const dateKey = new Date(plan.date).toDateString();
        if (!acc[dateKey]) {
            acc[dateKey] = {
                date: new Date(plan.date),
                image: plan.recipe?.images?.[0] || null,
                title: plan.recipe?.title,
                recipeId: plan.recipe?._id,
            };
        }
        return acc;
    }, {});

    // Sort dates chronologically (Oldest -> Newest)
    const sortedDates = Object.values(dateMap).sort((a, b) => a.date - b.date);

    // 2. Determine which item is "Today" or the nearest Future date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the first date that is Today or in the Future
    const initialIndex = sortedDates.findIndex((item) => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate >= today;
    });

    // If no future meals found, default to the last item (most recent past)
    const scrollToIndex = initialIndex !== -1 ? initialIndex : Math.max(0, sortedDates.length - 1);

    // 3. Fill with empty squares if we don't have enough to fill the visual space
    const totalSlots = Math.max(14, sortedDates.length + 4);
    const slots = [...sortedDates];
    while (slots.length < totalSlots) {
        slots.push({ empty: true, id: `empty-${slots.length}` });
    }

    // 4. Auto-Scroll Effect
    useEffect(() => {
        if (scrollRef.current && sortedDates.length > 0) {
            // Calculate position: (Index of Today * Width of Card) - (Some Padding)
            // Assuming card width ~60px (w-14 = 3.5rem = 56px) + Gap
            const cardWidth = 68; // Approx width + gap
            const scrollPos = scrollToIndex * cardWidth;

            scrollRef.current.scrollTo({
                left: scrollPos,
                behavior: 'smooth',
            });
        }
    }, [plans, scrollToIndex, sortedDates.length]);

    // Styles
    const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
    const emptyBg = isDarkMode ? 'bg-gray-800/30' : 'bg-gray-100';
    const todayBorder = 'ring-2 ring-primary ring-offset-2 ' + (isDarkMode ? 'ring-offset-[#121212]' : 'ring-offset-white');

    const isToday = (date) => {
        const t = new Date();
        return date && date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
    };

    return (
        <div className="flex-1 w-full overflow-hidden px-4 relative">
            {/* Left fade mask */}
            <div className={`absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r ${isDarkMode ? 'from-[#121212]' : 'from-secondary'} to-transparent pointer-events-none`} />

            <div
                ref={scrollRef}
                // CLASSES TO HIDE SCROLLBAR
                className="w-full overflow-x-auto pb-4 pt-2 flex gap-3 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
                {slots.map((item, index) => {
                    const isCurrentDay = !item.empty && isToday(item.date);

                    return (
                        <div
                            key={item.date ? item.date.toISOString() : item.id}
                            // Attach ref if this is the target scroll item
                            ref={index === scrollToIndex ? todayRef : null}
                            onClick={() => !item.empty && onDateClick && onDateClick(item.date)}
                            className={`
                                relative w-14 h-14 rounded-lg border ${borderColor} overflow-hidden flex-shrink-0 
                                transition-all duration-300 hover:scale-110 hover:shadow-lg group cursor-pointer 
                                ${item.empty ? emptyBg : 'bg-gray-200'} 
                                ${isCurrentDay ? todayBorder : ''}
                            `}
                            title={item.date ? item.date.toLocaleDateString() : 'No meal'}
                        >
                            {!item.empty && item.image ? (
                                <>
                                    <img src={item.image} alt="Meal" className="w-full h-full object-cover" />
                                    {/* Hover Date Overlay */}
                                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <span className="text-[10px] font-bold text-white leading-tight">{item.date.getDate()}</span>
                                        <span className="text-[8px] font-medium text-gray-300 uppercase">{item.date.toLocaleDateString('en-US', { month: 'short' })}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-20">
                                    {!item.empty ? (
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-bold text-gray-500">{item.date?.getDate()}</span>
                                        </div>
                                    ) : (
                                        <Calendar size={14} className={isDarkMode ? 'text-gray-600' : 'text-gray-400'} />
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Right fade mask */}
            <div className={`absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l ${isDarkMode ? 'from-[#121212]' : 'from-secondary'} to-transparent pointer-events-none`} />
        </div>
    );
};

export default DateStrip;
