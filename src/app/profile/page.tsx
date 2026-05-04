'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    User, Mail, Package, Heart, LogOut,
    Settings, Home, ChevronRight, Edit3, Loader2
} from 'lucide-react';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin?callbackUrl=/profile');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!session?.user) {
        return null; // Will redirect in useEffect
    }

    // Determine initials for avatar
    const name = session.user.name || session.user.email || 'User';
    const initials = name.substring(0, 2).toUpperCase();
    const role = session.user.role === 'ADMIN' ? 'Administrator' : 'Customer';

    return (
        <div className="min-h-screen bg-background pt-28 pb-16 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <Link href="/" className="hover:text-primary flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Home</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="font-medium text-foreground">My Profile</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Profile Card */}
                    <div className="md:col-span-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card border border-border rounded-2xl p-6 shadow-sm text-center"
                        >
                            <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-4 border-4 border-background shadow-md">
                                {initials}
                            </div>
                            <h2 className="text-xl font-bold truncate">{session.user.name || 'User'}</h2>
                            <p className="text-sm text-muted-foreground truncate">{session.user.email}</p>
                            
                            <div className="mt-4 inline-block px-3 py-1 bg-muted rounded-full text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {role}
                            </div>

                            <div className="mt-6 pt-6 border-t border-border space-y-3">
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start gap-2"
                                    onClick={() => alert("Edit profile functionality coming soon!")}
                                >
                                    <Edit3 className="w-4 h-4" /> Edit Profile
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    className="w-full justify-start gap-2 bg-red-50 hover:bg-red-100 text-red-600 border-red-200 dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                >
                                    <LogOut className="w-4 h-4" /> Sign Out
                                </Button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Quick Links & Info */}
                    <div className="md:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h3 className="text-xl font-bold mb-4">Account Overview</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Link href="/orders">
                                    <div className="bg-card hover:bg-muted/30 border border-border rounded-2xl p-5 transition-colors group cursor-pointer h-full flex flex-col justify-between">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 flex items-center justify-center">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">My Orders</h4>
                                            <p className="text-sm text-muted-foreground mt-1">Track your purchases and download plans</p>
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/wishlist">
                                    <div className="bg-card hover:bg-muted/30 border border-border rounded-2xl p-5 transition-colors group cursor-pointer h-full flex flex-col justify-between">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 flex items-center justify-center">
                                                <Heart className="w-5 h-5" />
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">Wishlist</h4>
                                            <p className="text-sm text-muted-foreground mt-1">View your saved architectural plans</p>
                                        </div>
                                    </div>
                                </Link>

                                {session.user.role === 'ADMIN' && (
                                    <Link href="/admin">
                                        <div className="bg-card hover:bg-muted/30 border border-border rounded-2xl p-5 transition-colors group cursor-pointer h-full flex flex-col justify-between sm:col-span-2">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 flex items-center justify-center">
                                                    <Settings className="w-5 h-5" />
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-lg">Admin Dashboard</h4>
                                                <p className="text-sm text-muted-foreground mt-1">Manage plans, orders, and platform settings</p>
                                            </div>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-card border border-border rounded-2xl p-6 shadow-sm"
                        >
                            <h3 className="text-lg font-bold mb-4">Personal Information</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 py-3 border-b border-border">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Full Name</p>
                                        <p className="text-sm text-muted-foreground">{session.user.name || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 py-3 border-b border-border">
                                    <Mail className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Email Address</p>
                                        <p className="text-sm text-muted-foreground">{session.user.email}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
