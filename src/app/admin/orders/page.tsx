'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import {
    CheckCircle2, XCircle, Eye, FileText,
    MoreHorizontal, Clock, Loader2, Package
} from "lucide-react";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface OrderItem {
    id: string;
    price: number;
    plan: {
        id: string;
        title: string;
        planNumber: string;
        images: { url: string; isPrimary: boolean }[];
    };
}

interface OrderEvent {
    id: string;
    status: string;
    description: string;
    createdAt: string;
}

interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    status: string;
    total: number;
    createdAt: string;
    items: OrderItem[];
    events: OrderEvent[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: {
        label: 'Pending Approval',
        color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700',
        icon: <Clock className="w-3 h-3" />,
    },
    COMPLETED: {
        label: 'Approved',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700',
        icon: <CheckCircle2 className="w-3 h-3" />,
    },
    CANCELLED: {
        label: 'Rejected',
        color: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
        icon: <XCircle className="w-3 h-3" />,
    },
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const { toast } = useToast();

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders');
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleAction = async (orderId: string, action: 'approve' | 'reject') => {
        setActionLoading(orderId + action);
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });

            if (!res.ok) throw new Error('Failed to update order');

            const updated = await res.json();
            setOrders(prev => prev.map(o => o.id === orderId ? updated : o));

            if (selectedOrder?.id === orderId) {
                setSelectedOrder(updated);
            }

            toast({
                title: action === 'approve' ? '✅ Order Approved' : '❌ Order Rejected',
                description: `Order ${updated.orderNumber} has been ${action === 'approve' ? 'approved — customer can now download their plans.' : 'rejected.'}`,
            });
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to update order status.', variant: 'destructive' });
        } finally {
            setActionLoading(null);
        }
    };

    const pendingCount = orders.filter(o => o.status === 'PENDING').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground mt-1">Review and approve customer orders to grant download access.</p>
                </div>
                {pendingCount > 0 && (
                    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">{pendingCount} pending</span>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30">
                            <TableHead className="font-semibold">Order #</TableHead>
                            <TableHead className="font-semibold">Customer</TableHead>
                            <TableHead className="font-semibold">Plans</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Total</TableHead>
                            <TableHead className="font-semibold">Date</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    No orders yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => {
                                const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                                return (
                                    <TableRow key={order.id} className="hover:bg-muted/20 transition-colors">
                                        <TableCell className="font-mono font-medium text-sm">{order.orderNumber}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-semibold text-sm">{order.customerName}</p>
                                                <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {order.items.slice(0, 2).map(item => {
                                                    const img = item.plan.images.find(i => i.isPrimary) || item.plan.images[0];
                                                    return (
                                                        <div key={item.id} className="relative w-10 h-8 rounded overflow-hidden bg-muted border">
                                                            {img ? <Image src={img.url} alt={item.plan.title} fill className="object-cover" /> : null}
                                                        </div>
                                                    );
                                                })}
                                                {order.items.length > 2 && (
                                                    <span className="text-xs text-muted-foreground ml-1">+{order.items.length - 2}</span>
                                                )}
                                                <span className="text-xs text-muted-foreground ml-2">{order.items.length} plan{order.items.length > 1 ? 's' : ''}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`border flex items-center gap-1.5 w-fit text-xs font-semibold ${statusCfg.color}`}>
                                                {statusCfg.icon}
                                                {statusCfg.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-bold">${Number(order.total).toLocaleString()}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {order.status === 'PENDING' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-lg"
                                                            onClick={() => handleAction(order.id, 'approve')}
                                                            disabled={!!actionLoading}
                                                        >
                                                            {actionLoading === order.id + 'approve' ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                            )}
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 gap-1.5 rounded-lg"
                                                            onClick={() => handleAction(order.id, 'reject')}
                                                            disabled={!!actionLoading}
                                                        >
                                                            {actionLoading === order.id + 'reject' ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <XCircle className="w-3.5 h-3.5" />
                                                            )}
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                                        </DropdownMenuItem>
                                                        {order.status === 'PENDING' && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    className="text-emerald-600"
                                                                    onClick={() => handleAction(order.id, 'approve')}
                                                                >
                                                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Approve Order
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={() => handleAction(order.id, 'reject')}
                                                                >
                                                                    <XCircle className="mr-2 h-4 w-4" /> Reject Order
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Order Detail Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3">
                                    <FileText className="w-5 h-5" />
                                    Order {selectedOrder.orderNumber}
                                </DialogTitle>
                                <DialogDescription>
                                    Placed {formatDistanceToNow(new Date(selectedOrder.createdAt), { addSuffix: true })} by {selectedOrder.customerName}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 mt-2">
                                {/* Status */}
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Current Status</p>
                                        <Badge variant="outline" className={`border flex items-center gap-1.5 w-fit font-semibold ${(STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.PENDING).color}`}>
                                            {(STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.PENDING).icon}
                                            {(STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.PENDING).label}
                                        </Badge>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground mb-1">Total</p>
                                        <p className="text-2xl font-black text-primary">${Number(selectedOrder.total).toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Customer */}
                                <div>
                                    <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Customer</h4>
                                    <div className="p-3 border border-border rounded-lg text-sm space-y-1">
                                        <p className="font-semibold">{selectedOrder.customerName}</p>
                                        <p className="text-muted-foreground">{selectedOrder.customerEmail}</p>
                                    </div>
                                </div>

                                {/* Items */}
                                <div>
                                    <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Plans Ordered ({selectedOrder.items.length})</h4>
                                    <div className="space-y-3">
                                        {selectedOrder.items.map(item => {
                                            const img = item.plan.images.find(i => i.isPrimary) || item.plan.images[0];
                                            return (
                                                <div key={item.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                                                    <div className="relative w-16 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                                        {img && <Image src={img.url} alt={item.plan.title} fill className="object-cover" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm truncate">{item.plan.title}</p>
                                                        <p className="text-xs text-muted-foreground">Plan #{item.plan.planNumber}</p>
                                                    </div>
                                                    <p className="font-bold text-sm">${Number(item.price).toFixed(2)}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Activity Timeline */}
                                {selectedOrder.events.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Activity Log</h4>
                                        <div className="space-y-3">
                                            {selectedOrder.events.map(event => (
                                                <div key={event.id} className="flex gap-3 text-sm">
                                                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-semibold">{event.status.replace(/_/g, ' ')}</p>
                                                        <p className="text-muted-foreground text-xs">{event.description}</p>
                                                        <p className="text-muted-foreground text-xs mt-0.5">
                                                            {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {selectedOrder.status === 'PENDING' && (
                                    <div className="flex gap-3 pt-2 border-t border-border">
                                        <Button
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2"
                                            onClick={() => handleAction(selectedOrder.id, 'approve')}
                                            disabled={!!actionLoading}
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Approve & Grant Download Access
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 text-red-600 border-red-300 hover:bg-red-50 gap-2"
                                            onClick={() => handleAction(selectedOrder.id, 'reject')}
                                            disabled={!!actionLoading}
                                        >
                                            <XCircle className="w-4 h-4" /> Reject Order
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
    );
}
