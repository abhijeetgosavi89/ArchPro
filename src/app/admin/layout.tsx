'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, List, ShoppingCart, Users, LogOut, Settings, Tag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

// Auth is now handled by middleware.ts — no cookie check needed here.

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navItems = [
        { href: '/admin', label: 'Analytics Dashboard', icon: Home },
        { href: '/admin/plans', label: 'Manage Plans', icon: List },
        { href: '/admin/plans/new', label: 'Add New Plan', icon: Plus },
        { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/attributes', label: 'Attributes', icon: Tag },
        { href: '/admin/settings', label: 'General Settings', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-muted/40">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-10 w-64 border-r bg-background hidden md:block">
                <div className="flex h-14 items-center border-b px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <span className="text-xl tracking-tight">ARCH<span className="text-primary">PRO</span></span>
                    </Link>
                </div>
                <div className="flex flex-col justify-between h-[calc(100vh-3.5rem)] py-4 overflow-y-auto">
                    <div className="space-y-4">
                        <div className="px-6 py-2">
                            <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
                                Management
                            </h2>
                            <nav className="grid gap-1">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                                isActive ? "bg-muted text-primary" : "text-muted-foreground"
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                    <div className="px-4 mt-auto pb-4">
                        <Button
                            variant="destructive"
                            className="w-full justify-start gap-2"
                            onClick={() => signOut({ callbackUrl: '/' })}
                        >
                            <LogOut className="h-4 w-4" /> Sign Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64">
                <div className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px]">
                    <span className="text-sm text-muted-foreground font-medium">Admin Portal</span>
                </div>
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
