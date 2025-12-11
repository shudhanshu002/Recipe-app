import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper function to generate random numbers within a range
const random = (min, max) => Math.random() * (max - min) + min;

let heartIdCounter = 0;

export const FloatingHearts = ({ trigger }) => {
    const [hearts, setHearts] = useState([]);

    // This callback removes a specific heart from state when its animation finishes
    const removeHeart = useCallback((idToRemove) => {
        setHearts((prev) => prev.filter((h) => h.id !== idToRemove));
    }, []);

    useEffect(() => {
        if (!trigger) return;

        // Generate a burst of 10 to 16 hearts
        const bubbleCount = Math.floor(random(27, 40));
        const newHearts = [];

        for (let i = 0; i < bubbleCount; i++) {
            heartIdCounter++;
            newHearts.push({
                id: `heart-${trigger}-${heartIdCounter}`, 
                left: random(5, 90), 
                scaleStart: random(0.4, 0.7), 
                scaleEnd: random(0.9, 1.3), 
                duration: random(1.5, 2.8), 
                delay: random(0, 0.3), 
                xDrift: random(-40, 40), 
            });
        }

        // Add the new batch to existing state (allows rapid clicking)
        setHearts((prev) => [...prev, ...newHearts]);
    }, [trigger]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible z-50 font-sans">
            <AnimatePresence>
                {hearts.map((h) => (
                    <motion.div
                        key={h.id}
                        onAnimationComplete={() => removeHeart(h.id)}
                        initial={{
                            opacity: 0,
                            y: 30, 
                            x: 0,
                            scale: h.scaleStart,
                        }}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            y: -180, 
                            x: h.xDrift,
                            scale: h.scaleEnd, 
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: h.duration,
                            delay: h.delay,
                            ease: [0.25, 0.1, 0.25, 1],
                            times: [0, 0.1, 0.8, 1],
                        }}
                        className="absolute text-red-500 drop-shadow-sm"
                        style={{
                            left: `${h.left}%`,
                            bottom: '25px', 
                            fontSize: '20px',
                            willChange: 'transform, opacity',
                        }}
                    >
                        ❤️
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
