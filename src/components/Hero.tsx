'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import Link from 'next/link';

const heroImages = [
    '/images/hero-modern-house.svg', // Placeholder
    'https://images.unsplash.com/photo-1600596542815-6ad4c7213aa5?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000'
];

export default function Hero() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-slate-900">
            {/* Background Slideshow */}
            <AnimatePresence mode='popLayout'>
                <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 0.5, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{ backgroundImage: `url("${heroImages[currentImageIndex]}")` }}
                />
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-0" />

            <div className="container relative z-10 text-center px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-md">
                        Find Your Dream <span className="text-primary italic">Home Plan</span>
                    </h1>
                    <p className="text-lg md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-sm">
                        Browse thousands of architectural designs, from modern farmhouses to luxury estates.
                        Ready to build? Start here.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="max-w-xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20 flex gap-2 shadow-2xl"
                >
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by plan #, style, or feature..."
                            className="w-full h-12 pl-12 pr-4 rounded-full bg-transparent text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium"
                        />
                    </div>
                    <Button size="lg" className="rounded-full px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                        Search
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 flex flex-wrap justify-center gap-4"
                >
                    {['Modern', 'Farmhouse', 'Small House', 'Luxury', 'Ranch'].map((style, i) => (
                        <Link key={style} href={`/plans?style=${style}`}>
                            <Button
                                variant="outline"
                                className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white hover:text-slate-900 transition-all backdrop-blur-sm"
                            >
                                {style}
                            </Button>
                        </Link>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
