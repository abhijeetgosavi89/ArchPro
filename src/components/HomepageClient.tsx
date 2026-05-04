'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search, ArrowRight, Star, Users, Home, Sparkles,
    ChevronDown, Building2, Ruler, TrendingUp,
    Shield, Award, Clock, Heart, ExternalLink, CheckCircle2
} from 'lucide-react';

// Hero background images
const HERO_IMAGES = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=2000',
];

// Dynamic stats will be passed from server

interface Plan {
    id: string;
    title: string;
    price: number;
    sqFt: number;
    beds: number;
    baths: number;
    images: { url: string; isPrimary?: boolean }[];
    isTrending?: boolean;
}

interface StyleCategory {
    title: string;
    subtitle: string;
    style: string;
    image: string;
    count: number;
}

interface SiteStats {
    totalPlans: number;
    totalOrders: number;
    avgRating: string;
    totalReviews: number;
}

interface HomepageClientProps {
    trendingPlans: Plan[];
    styleCategories: StyleCategory[];
    stats: SiteStats;
}

// Features with icons
const FEATURES = [
    { icon: Ruler, title: 'Precise Blueprints', desc: 'CAD-ready plans' },
    { icon: Building2, title: '3D Visualization', desc: 'Interactive models' },
    { icon: Shield, title: 'Quality Guaranteed', desc: 'Money back promise' },
    { icon: Clock, title: 'Instant Download', desc: 'Get plans immediately' },
];

export default function HomepageClient({ trendingPlans, styleCategories, stats }: HomepageClientProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const { scrollYProgress } = useScroll();
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);

    // Auto-rotate hero images
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const scrollToContent = () => {
        window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Animated Background */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 1.5 }}
                        style={{ scale: heroScale }}
                        className="absolute inset-0"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${HERO_IMAGES[currentImageIndex]})` }}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />

                {/* Content */}
                <motion.div
                    style={{ opacity: heroOpacity }}
                    className="relative z-10 container mx-auto px-4 text-center pt-20"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-sm font-medium"
                    >
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        Trusted by 50,000+ Homeowners
                    </motion.div>

                    {/* Main heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight"
                    >
                        Find Your Perfect
                        <span className="block bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                            Home Plan
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10"
                    >
                        Browse 5,000+ premium architectural plans. From modern minimalist
                        to luxury estates — your dream home starts here.
                    </motion.p>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="max-w-2xl mx-auto mb-8"
                    >
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                            <div className="relative flex items-center bg-white rounded-xl overflow-hidden shadow-2xl">
                                <Search className="w-5 h-5 text-slate-400 ml-5" />
                                <Input
                                    type="text"
                                    placeholder="Search by style, beds, sq ft..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent border-0 text-slate-900 placeholder:text-slate-400 h-14 focus-visible:ring-0 text-base"
                                />
                                <Link href={`/plans${searchQuery ? `?q=${searchQuery}` : ''}`}>
                                    <Button className="m-2 h-10 px-6 bg-emerald-500 hover:bg-emerald-600 text-white border-0 rounded-lg font-semibold">
                                        Search
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick style filters */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 1 }}
                        className="flex flex-wrap justify-center gap-3"
                    >
                        {['Modern', 'Farmhouse', 'Luxury', 'Coastal', 'Cottage'].map((style) => (
                            <Link key={style} href={`/plans?style=${style.toLowerCase()}`}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/20 hover:bg-white/20 transition-all"
                                >
                                    {style}
                                </motion.button>
                            </Link>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.button
                    onClick={scrollToContent}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors"
                >
                    <ChevronDown className="w-8 h-8" />
                </motion.button>

                {/* Image indicators */}
                <div className="absolute bottom-8 right-8 flex gap-2">
                    {HERO_IMAGES.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentImageIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex
                                    ? 'w-8 bg-white'
                                    : 'bg-white/40 hover:bg-white/60'
                                }`}
                        />
                    ))}
                </div>
            </section>

            {/* Features Strip */}
            <section className="py-6 bg-slate-900 border-y border-slate-800">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {FEATURES.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-3 text-white"
                            >
                                <div className="p-2.5 bg-emerald-500/20 rounded-xl">
                                    <feature.icon className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{feature.title}</p>
                                    <p className="text-xs text-slate-400">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Style Collections */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12"
                    >
                        <div>
                            <span className="text-primary font-bold text-sm tracking-widest uppercase">Collections</span>
                            <h2 className="text-3xl md:text-5xl font-black mt-2">
                                Browse By Style
                            </h2>
                            <p className="text-muted-foreground mt-3 max-w-xl">
                                Find the perfect architectural style that matches your vision.
                            </p>
                        </div>
                        <Link href="/plans">
                            <Button variant="outline" className="group rounded-full px-6">
                                View All
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {styleCategories.map((style, i) => (
                            <motion.div
                                key={style.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -8 }}
                                className={`group relative overflow-hidden rounded-2xl cursor-pointer ${i === 0 ? 'md:col-span-2 md:row-span-2 aspect-square md:aspect-auto' : 'aspect-[3/4]'
                                    }`}
                                suppressHydrationWarning
                            >
                                <Link href={`/plans?style=${style.style.toLowerCase()}`}>
                                    <div className="absolute inset-0">
                                        <Image
                                            src={style.image}
                                            alt={style.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-5">
                                        <p className="text-white/70 text-sm">{style.subtitle}</p>
                                        <h3 className="text-white text-lg md:text-xl font-bold">{style.title}</h3>
                                        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white/80 text-sm">{style.count} Plans</span>
                                            <ExternalLink className="w-4 h-4 text-white/80" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-10">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-2xl md:text-3xl font-bold text-white"
                        >
                            Trusted by Builders Worldwide
                        </motion.h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {[
                            { value: stats.totalPlans > 1000 ? `${(stats.totalPlans/1000).toFixed(1)}k+` : `${stats.totalPlans}+`, label: 'Premium Plans', icon: Home },
                            { value: stats.totalOrders > 1000 ? `${(stats.totalOrders/1000).toFixed(1)}k+` : `${stats.totalOrders}+`, label: 'Happy Customers', icon: Users },
                            { value: stats.avgRating, label: 'Rating', icon: Star },
                            { value: '#1', label: 'In Architecture', icon: Award },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
                                suppressHydrationWarning
                            >
                                <stat.icon className="w-7 h-7 text-emerald-400 mx-auto mb-3" />
                                <div className="text-3xl md:text-4xl font-black text-white mb-1" suppressHydrationWarning>{stat.value}</div>
                                <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trending Plans */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm mb-4">
                            <TrendingUp className="w-4 h-4" />
                            Trending Now
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black">
                            Most Popular This Week
                        </h2>
                        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                            Discover the designs that are capturing imaginations right now.
                        </p>
                    </motion.div>

                    {/* Plans Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trendingPlans.map((plan, i) => {
                            const mainImage = plan.images.find(img => img.isPrimary) || plan.images[0];
                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -6 }}
                                    className="group"
                                >
                                    <Link href={`/plans/${plan.id}`}>
                                        <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-xl transition-all">
                                            <div className="relative aspect-[4/3]">
                                                <Image
                                                    src={mainImage?.url || '/placeholder.svg'}
                                                    alt={plan.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute top-3 right-3 flex gap-2">
                                                    {plan.isTrending && (
                                                        <span className="px-2.5 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                                                            TRENDING
                                                        </span>
                                                    )}
                                                </div>
                                                <button className="absolute top-3 left-3 p-2 bg-white/90 dark:bg-slate-900/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                                    <Heart className="w-4 h-4 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors" />
                                                </button>
                                            </div>
                                            <div className="p-5">
                                                <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">{plan.title}</h3>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                                                    <span>{plan.beds} Beds</span>
                                                    <span className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
                                                    <span>{plan.baths} Baths</span>
                                                    <span className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
                                                    <span>{plan.sqFt.toLocaleString()} sqft</span>
                                                </div>
                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                                    <span className="text-xl font-black text-primary">${plan.price.toLocaleString()}</span>
                                                    <Button variant="ghost" size="sm" className="rounded-full group-hover:bg-primary group-hover:text-white">
                                                        View
                                                        <ArrowRight className="ml-1 w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mt-12"
                    >
                        <Link href="/plans">
                            <Button size="lg" className="rounded-full px-8 h-12 text-base font-bold shadow-lg">
                                Explore All Plans
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 to-teal-900/30" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl" />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                            Ready to Build Your Dream?
                        </h2>
                        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
                            Start exploring thousands of premium house plans today.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/plans">
                                <Button size="lg" className="h-12 px-8 font-bold rounded-full bg-white text-slate-900 hover:bg-slate-100">
                                    Browse Plans
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button size="lg" variant="outline" className="h-12 px-8 font-bold rounded-full border-slate-600 text-white hover:bg-white/10">
                                    Contact Us
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
