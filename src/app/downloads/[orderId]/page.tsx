'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    CheckCircle2, Download, FileText, Package,
    Home, ChevronRight, Loader2, Lock, ArrowLeft
} from 'lucide-react';

interface PlanItem {
    id: string;
    price: number;
    plan: {
        id: string;
        title: string;
        planNumber: string;
        sqFt: number;
        beds: number;
        baths: number;
        stories: number;
        style: string;
        images: { url: string; isPrimary: boolean }[];
        specs: { label: string; value: string }[];
    };
}

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    items: PlanItem[];
}

const DOWNLOADABLE_FILES = [
    { label: 'Complete Blueprint Set (PDF)', ext: 'PDF', size: '24.5 MB', icon: '📄', color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
    { label: 'CAD Drawing Files (DWG)', ext: 'DWG', size: '12.8 MB', icon: '📐', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Foundation Plans (PDF)', ext: 'PDF', size: '8.2 MB', icon: '🏗️', color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Electrical Layout (PDF)', ext: 'PDF', size: '5.1 MB', icon: '⚡', color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' },
];

export default function DownloadsPage() {
    const { orderId } = useParams() as { orderId: string };
    const { data: session, status } = useSession();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/auth/signin');
    }, [status, router]);

    useEffect(() => {
        if (!session || !orderId) return;

        fetch(`/api/orders/${orderId}`)
            .then(res => {
                if (!res.ok) throw new Error('Access denied or order not approved');
                return res.json();
            })
            .then(data => setOrder(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [session, orderId]);

    const handleDownload = (label: string) => {
        setDownloading(label);
        // In production: trigger a real file download from your storage
        // For demo, simulate a delay then show a toast
        setTimeout(() => {
            setDownloading(null);
            alert(`Demo: "${label}" would start downloading here. Connect your file storage (e.g., S3/Cloudflare R2) to enable real downloads.`);
        }, 1500);
    };

    if (loading || status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-28">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-3">Access Restricted</h1>
                    <p className="text-muted-foreground mb-6">{error}. Only approved orders can be downloaded.</p>
                    <div className="flex gap-3 justify-center">
                        <Link href="/orders">
                            <Button variant="outline" className="gap-2 rounded-full">
                                <ArrowLeft className="w-4 h-4" /> My Orders
                            </Button>
                        </Link>
                        <Link href="/plans">
                            <Button className="rounded-full">Browse Plans</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="min-h-screen bg-background pt-28 pb-16 px-4">
            <div className="container mx-auto max-w-3xl">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <Link href="/" className="hover:text-primary flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Home</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Link href="/orders" className="hover:text-primary">My Orders</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="font-medium text-foreground">Downloads</span>
                </div>

                {/* Success Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl mb-8"
                >
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <p className="font-bold text-emerald-800 dark:text-emerald-300">Order {order.orderNumber} — Approved</p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400">Your plans are ready. Download all files below.</p>
                    </div>
                </motion.div>

                {/* Plans in this order */}
                {order.items.map((item, i) => {
                    const img = item.plan.images.find(im => im.isPrimary) || item.plan.images[0];
                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-card border border-border rounded-2xl overflow-hidden mb-6 shadow-sm"
                        >
                            {/* Plan Header */}
                            <div className="flex items-center gap-4 p-5 border-b border-border">
                                <div className="relative w-24 h-18 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                                    {img && <Image src={img.url} alt={item.plan.title} fill className="object-cover" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-lg truncate">{item.plan.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Plan #{item.plan.planNumber} · {item.plan.beds} Beds · {item.plan.baths} Baths · {item.plan.sqFt.toLocaleString()} sq ft · {item.plan.stories} {item.plan.stories === 1 ? 'Story' : 'Stories'}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{item.plan.style}</p>
                                </div>
                            </div>

                            {/* Download Files */}
                            <div className="p-5">
                                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Available Downloads</h3>
                                <div className="space-y-3">
                                    {DOWNLOADABLE_FILES.map(file => (
                                        <div key={file.label} className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${file.color}`}>
                                                    {file.icon}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{file.label}</p>
                                                    <p className="text-xs text-muted-foreground">{file.ext} · {file.size}</p>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-2 rounded-lg h-8 flex-shrink-0"
                                                onClick={() => handleDownload(file.label)}
                                                disabled={downloading === file.label}
                                            >
                                                {downloading === file.label ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Download className="w-3.5 h-3.5" />
                                                )}
                                                Download
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-5 p-3 bg-muted/30 rounded-xl flex items-start gap-2">
                                    <Package className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-muted-foreground">
                                        Files are available for download for 12 months from the purchase date. 
                                        Need help? Contact support at <span className="text-primary">support@archpro.com</span>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                <div className="text-center mt-6">
                    <Link href="/orders">
                        <Button variant="outline" className="rounded-full gap-2 px-6">
                            <ArrowLeft className="w-4 h-4" /> Back to My Orders
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
