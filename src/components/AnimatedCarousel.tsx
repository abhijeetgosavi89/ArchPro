'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Image as PlanImage } from '@prisma/client';
import Image from 'next/image';

interface CarouselProps {
    images: PlanImage[];
    isTrending?: boolean;
}

export default function AnimatedCarousel({ images, isTrending }: CarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            paginate(1);
        }, 5000);
        return () => clearInterval(timer);
    }, [currentIndex]);

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        let newIndex = currentIndex + newDirection;
        if (newIndex < 0) newIndex = images.length - 1;
        if (newIndex >= images.length) newIndex = 0;
        setCurrentIndex(newIndex);
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 1.1
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.9
        })
    };

    if (!images || images.length === 0) return null;

    const currentImage = images[currentIndex];

    return (
        <div style={{ position: 'relative', width: '100%', height: '500px', overflow: 'hidden', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)' }}>
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.4 },
                        scale: { duration: 0.4 }
                    }}
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                >
                    <Image
                        src={currentImage.url || '/placeholder.svg'}
                        alt="House Plan"
                        fill
                        className="object-cover"
                        priority={true}
                    />

                    {/* Text Overlay */}
                    {(currentImage.title || currentImage.description) && (
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            padding: '3rem 2rem',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                        }}>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                {currentImage.title && <h3 style={{ color: 'white', fontSize: '2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>{currentImage.title}</h3>}
                                {currentImage.description && <p style={{ color: '#e2e8f0', fontSize: '1.1rem', maxWidth: '600px' }}>{currentImage.description}</p>}
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <button
                onClick={() => paginate(-1)}
                style={{
                    position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)',
                    zIndex: 2, background: 'rgba(255,255,255,0.2)', color: 'white',
                    border: 'none', borderRadius: '50%', width: '50px', height: '50px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    backdropFilter: 'blur(4px)'
                }}
            >
                <FaChevronLeft size={20} />
            </button>
            <button
                onClick={() => paginate(1)}
                style={{
                    position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)',
                    zIndex: 2, background: 'rgba(255,255,255,0.2)', color: 'white',
                    border: 'none', borderRadius: '50%', width: '50px', height: '50px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    backdropFilter: 'blur(4px)'
                }}
            >
                <FaChevronRight size={20} />
            </button>

            {/* Indicators */}
            <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 2 }}>
                {images.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setDirection(idx > currentIndex ? 1 : -1);
                            setCurrentIndex(idx);
                        }}
                        style={{
                            width: '10px', height: '10px', borderRadius: '50%', border: 'none',
                            background: idx === currentIndex ? 'var(--accent)' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.3s'
                        }}
                    />
                ))}
            </div>

            {isTrending && (
                <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 2, background: 'var(--accent)', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>
                    TRENDING
                </div>
            )}
        </div>
    );
}
