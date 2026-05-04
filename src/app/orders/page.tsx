'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Package, Clock, CheckCircle2, XCircle,
    Download, ChevronRight, Home, Loader2, ShoppingCart
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OrderItem {
    id: string;
    price: number;
    plan: {
        id: string;
        title: string;
        planNumber: string;
        sqFt: number;
        beds: number;
        baths: number;
        images: { url: string; isPrimary: boolean }[];
    };
}

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    items: OrderItem[];
    events: { id: string; status: string; description: string; createdAt: string }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; desc: string }> = {
    PENDING: {
        label: 'Pending Approval',
        color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700',
        icon: <Clock className="w-3 h-3" />,
        desc: 'Your order is being reviewed. We\'ll notify you once approved.',
    },
    COMPLETED: {
        label: 'Approved — Ready to Download',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700',
        icon: <CheckCircle2 className="w-3 h-3" />,
        desc: 'Your order has been approved. Download your plans below.',
    },
    CANCELLED: {
        label: 'Rejected',
        color: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
        icon: <XCircle className="w-3 h-3" />,
        desc: 'This order was not approved. Please contact support.',
    },
};

export default function MyOrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin?callbackUrl=/orders');
        }
    }, [status, router]);

    useEffect(() => {
        if (session) {
            fetch('/api/orders')
                .then(res => res.json())
                .then(data => setOrders(Array.isArray(data) ? data : []))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [session]);

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-28 pb-16 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <Link href="/" className="hover:text-primary flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Home</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="font-medium text-foreground">My Orders</span>
                </div>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black">My Orders</h1>
                        <p className="text-muted-foreground mt-1">Track your orders and download approved plans.</p>
                    </div>
                    <Link href="/plans">
                        <Button variant="outline" className="rounded-full gap-2">
                            <ShoppingCart className="w-4 h-4" /> Browse Plans
                        </Button>
                    </Link>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-border rounded-2xl">
                        <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">No orders yet</h3>
                        <p className="text-muted-foreground mb-6">Start browsing and add plans to your cart.</p>
                        <Link href="/plans">
                            <Button className="rounded-full px-8">Explore Plans</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, i) => {
                            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                            const isApproved = order.status === 'COMPLETED';

                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
                                >
                                    {/* Order Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-border bg-muted/20">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Order</p>
                                                <p className="font-mono font-bold">{order.orderNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Date</p>
                                                <p className="text-sm font-medium">{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Total</p>
                                                <p className="font-bold text-primary">${Number(order.total).toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={`border flex items-center gap-1.5 w-fit text-xs font-semibold ${cfg.color}`}>
                                            {cfg.icon}
                                            {cfg.label}
                                        </Badge>
                                    </div>

                                    {/* Status Message */}
                                    <div className={`px-6 py-3 text-sm ${isApproved ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400' : order.status === 'CANCELLED' ? 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400'}`}>
                                        {cfg.desc}
                                    </div>

                                    {/* Plans */}
                                    <div className="px-6 py-4 space-y-4">
                                        {order.items.map(item => {
                                            const img = item.plan.images.find(i => i.isPrimary) || item.plan.images[0];
                                            return (
                                                <div key={item.id} className="flex items-center gap-4">
                                                    <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                                                        {img && <Image src={img.url} alt={item.plan.title} fill className="object-cover" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold truncate">{item.plan.title}</p>
                                                        <p className="text-xs text-muted-foreground">Plan #{item.plan.planNumber} · {item.plan.beds} Beds · {item.plan.baths} Baths · {item.plan.sqFt.toLocaleString()} sqft</p>
                                                    </div>
                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                        <span className="font-bold">${Number(item.price).toFixed(2)}</span>
                                                        {isApproved ? (
                                                            <Link href={`/downloads/${order.id}`}>
                                                                <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg h-8">
                                                                    <Download className="w-3.5 h-3.5" /> Download
                                                                </Button>
                                                            </Link>
                                                        ) : (
                                                            <Button size="sm" variant="outline" disabled className="rounded-lg h-8 gap-1.5">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {order.status === 'CANCELLED' ? 'Unavailable' : 'Pending'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
