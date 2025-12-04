import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import logo from '../assets/wrriten_dark_logo2.png'; 

const SplashScreen = ({ onFinish }) => {
    const images = [
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&auto=format&fit=crop&q=60',
    ];

    const [index, setIndex] = useState(0);

    
    useEffect(() => {
        if (index < images.length - 1) {
            const timer = setTimeout(() => {
                setIndex((prev) => prev + 1);
            }, 2000);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => onFinish(), 1500);
            return () => clearTimeout(timer);
        }
    }, [index]);

    return (
        <div className="w-screen h-screen flex items-center justify-center bg-black relative overflow-hidden">
            <motion.div className="absolute w-64 h-64 rounded-full border-4 border-purple-500/40" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 6, ease: 'linear' }} />


            <motion.div
                className="absolute w-72 h-72 rounded-full bg-pink-500/20 blur-3xl"
                animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            />

            <AnimatePresence mode="wait">
                <motion.img
                    key={index}
                    src={images[index]}
                    alt="img"
                    className="w-56 h-56 object-cover rounded-full shadow-xl"
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.8 }}
                />
            </AnimatePresence>


            <motion.img
                src={logo}
                alt="Logo"
                className="absolute bottom-20 w-32"
                animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.25, 1],
                }}
                transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: 'easeInOut',
                }}
            />
        </div>
    );
};

export default SplashScreen;
