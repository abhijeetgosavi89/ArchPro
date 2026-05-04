'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, ShoppingCart, User, Phone, Heart, Menu, X,
    ChevronDown, LogOut, Settings, Package, LayoutDashboard
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from './ui/dropdown-menu';
import { useRouter, usePathname } from 'next/navigation';

const NAV_LINKS = [
    { href: '/plans', label: 'All Plans' },
    { href: '/plans?style=Modern', label: 'Modern' },
    { href: '/plans?style=Farmhouse', label: 'Farmhouse' },
    { href: '/plans?style=Luxury', label: 'Luxury' },
    { href: '/plans?style=Coastal', label: 'Coastal' },
];

export default function Header() {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Only the homepage has a full-screen hero, so only there do we use transparent header
    const isHomepage = pathname === '/';
    // When transparent (homepage, not scrolled), text should be white
    const isTransparent = isHomepage && !isScrolled;

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/plans?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isTransparent
                    ? 'bg-black/20 backdrop-blur-md'
                    : 'bg-background/95 backdrop-blur-xl shadow-lg border-b border-border/50'
                }`}
        >
            {/* Top utility bar */}
            <div className={`border-b transition-all duration-300 ${isTransparent ? 'border-white/10' : 'border-border/30'
                } ${isScrolled ? 'h-0 overflow-hidden opacity-0' : 'h-10 opacity-100'}`}>
                <div className="container h-full flex items-center justify-between text-sm">
                    <div className={`flex items-center gap-2 ${isTransparent ? 'text-white/90' : 'text-muted-foreground'}`}>
                        <Phone className="w-3.5 h-3.5" />
                        <span className="font-medium">1-800-555-ARCH</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`hidden sm:inline ${isTransparent ? 'text-white/70' : 'text-muted-foreground'}`}>
                            Free shipping on orders over $500
                        </span>
                        <ThemeToggle />
                    </div>
                </div>
            </div>

            {/* Main navigation */}
            <div className="container">
                <div className="flex items-center justify-between h-16 md:h-[72px]">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-1 group">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="text-2xl md:text-3xl font-black tracking-tight"
                        >
                            <span className={isTransparent ? 'text-white' : 'text-foreground'}>ARCH</span>
                            <span className="text-primary">PRO</span>
                        </motion.div>
                    </Link>

                    {/* Desktop Search Bar */}
                    <form
                        onSubmit={handleSearch}
                        className={`hidden md:flex items-center flex-1 max-w-md mx-8 relative ${isSearchFocused ? 'z-50' : ''
                            }`}
                    >
                        <div className={`relative w-full transition-all duration-200 ${isSearchFocused ? 'scale-105' : ''
                            }`}>
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search plans..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                className={`pl-10 pr-4 h-11 rounded-full border-transparent transition-all ${isTransparent
                                        ? 'bg-white/15 text-white placeholder:text-white/60 hover:bg-white/20 focus:bg-white focus:text-slate-900 focus:placeholder:text-slate-400'
                                        : 'bg-secondary/50 hover:bg-secondary focus:bg-background focus:border-primary/50'
                                    }`}
                            />
                        </div>
                    </form>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${isTransparent
                                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        {/* Wishlist */}
                        <Link href="/wishlist">
                            <Button variant="ghost" size="icon" className={`hidden md:flex rounded-full ${isTransparent ? 'text-white hover:bg-white/10' : 'hover:bg-secondary/50'
                                }`}>
                                <Heart className="w-5 h-5" />
                            </Button>
                        </Link>

                        {/* Cart */}
                        <Link href="/cart">
                            <Button variant="ghost" size="icon" className={`relative rounded-full ${isTransparent ? 'text-white hover:bg-white/10' : 'hover:bg-secondary/50'
                                }`}>
                                <ShoppingCart className="w-5 h-5" />
                            </Button>
                        </Link>

                        {/* User Menu */}
                        {session ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className={`relative h-10 w-10 rounded-full ${isTransparent ? 'hover:bg-white/10' : 'hover:bg-secondary/50'
                                        }`}>
                                        <Avatar className="h-9 w-9 border-2 border-primary/30">
                                            <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                {session.user?.name?.[0] || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{session.user?.name}</span>
                                            <span className="text-xs text-muted-foreground">{session.user?.email}</span>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/orders" className="cursor-pointer">
                                            <Package className="mr-2 h-4 w-4" />
                                            My Orders
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/wishlist" className="cursor-pointer">
                                            <Heart className="mr-2 h-4 w-4" />
                                            Wishlist
                                        </Link>
                                    </DropdownMenuItem>
                                    {session.user?.role === 'ADMIN' && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link href="/admin" className="cursor-pointer">
                                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                                    Admin Dashboard
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => signOut()} className="text-destructive cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/auth/signin">
                                <Button
                                    variant={isTransparent ? 'outline' : 'default'}
                                    size="sm"
                                    className={`rounded-full px-5 ${isTransparent
                                            ? 'border-white/40 text-white hover:bg-white/10 hover:border-white/60'
                                            : ''
                                        }`}
                                >
                                    Sign In
                                </Button>
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`lg:hidden rounded-full ${isTransparent ? 'text-white hover:bg-white/10' : ''
                                }`}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-background border-t border-border overflow-hidden"
                    >
                        <div className="container py-6 space-y-6">
                            {/* Mobile Search */}
                            <form onSubmit={handleSearch}>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search plans..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 h-12 rounded-xl"
                                    />
                                </div>
                            </form>

                            {/* Mobile Nav Links */}
                            <nav className="space-y-1">
                                {NAV_LINKS.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center px-4 py-3 text-lg font-medium hover:bg-secondary rounded-xl transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>

                            <div className="border-t border-border pt-4 space-y-1">
                                <Link
                                    href="/wishlist"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-lg font-medium hover:bg-secondary rounded-xl"
                                >
                                    <Heart className="w-5 h-5" /> Wishlist
                                </Link>
                                <Link
                                    href="/cart"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-lg font-medium hover:bg-secondary rounded-xl"
                                >
                                    <ShoppingCart className="w-5 h-5" /> Cart
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
