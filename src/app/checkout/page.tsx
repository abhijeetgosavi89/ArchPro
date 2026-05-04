'use client';

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ShieldCheck, CreditCard, Lock, ChevronRight,
    Home, Loader2, ArrowLeft, CheckCircle2
} from 'lucide-react';

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');

    // Billing form state
    const [billing, setBilling] = useState({
        fullName: session?.user?.name || '',
        email: session?.user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: 'US',
    });

    // Dummy card state
    const [card, setCard] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: '',
    });

    const [orderId, setOrderId] = useState<string | null>(null);
    const [orderNumber, setOrderNumber] = useState<string | null>(null);

    if (items.length === 0 && step !== 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center p-8">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                    <p className="text-muted-foreground mb-6">Add some plans before checking out.</p>
                    <Link href="/plans">
                        <Button className="rounded-full px-8">Browse Plans</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const formatCardNumber = (val: string) => {
        return val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    };

    const formatExpiry = (val: string) => {
        const clean = val.replace(/\D/g, '').slice(0, 4);
        if (clean.length >= 3) return clean.slice(0, 2) + '/' + clean.slice(2);
        return clean;
    };

    const handleBillingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('payment');
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: billing.fullName,
                    customerEmail: billing.email,
                    phone: billing.phone,
                    address: `${billing.address}, ${billing.city}, ${billing.state} ${billing.zip}, ${billing.country}`,
                    items: items.map(item => ({
                        planId: item.id,
                        price: item.price,
                    })),
                    total: cartTotal,
                    paymentMethod: 'DUMMY_CARD',
                    cardLastFour: card.number.replace(/\s/g, '').slice(-4),
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to place order');
            }

            const data = await res.json();
            setOrderId(data.id);
            setOrderNumber(data.orderNumber);
            clearCart();
            setStep('success');
        } catch (err: any) {
            alert(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-28 pb-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-lg w-full text-center"
                >
                    <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-black mb-3">Order Placed!</h1>
                    <p className="text-muted-foreground text-lg mb-2">
                        Your order <span className="font-bold text-foreground">#{orderNumber}</span> has been received.
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 mt-6 mb-8 text-left">
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">⏳ Awaiting Admin Approval</p>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                            Your order is pending review. Once approved by our team, you'll be able to download your plans from the <strong>My Orders</strong> section. This typically takes a short while.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/orders">
                            <Button size="lg" className="rounded-full px-8 w-full sm:w-auto">
                                View My Orders
                            </Button>
                        </Link>
                        <Link href="/plans">
                            <Button size="lg" variant="outline" className="rounded-full px-8 w-full sm:w-auto">
                                Browse More Plans
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-28 pb-16 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <Link href="/" className="hover:text-primary flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Home</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Link href="/cart" className="hover:text-primary">Cart</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="font-medium text-foreground">Checkout</span>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-4 mb-10">
                    <div className={`flex items-center gap-2 text-sm font-semibold ${step === 'info' ? 'text-primary' : 'text-emerald-500'}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${step === 'info' ? 'bg-primary' : 'bg-emerald-500'}`}>
                            {step === 'info' ? '1' : '✓'}
                        </div>
                        Billing Info
                    </div>
                    <div className="flex-1 h-px bg-border" />
                    <div className={`flex items-center gap-2 text-sm font-semibold ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 'payment' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                            2
                        </div>
                        Payment
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Forms */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* STEP 1: Billing Info */}
                        {step === 'info' && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <div className="bg-card border border-border rounded-2xl p-6">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</span>
                                        Billing Information
                                    </h2>
                                    <form onSubmit={handleBillingSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="fullName">Full Name *</Label>
                                                <Input id="fullName" value={billing.fullName} onChange={e => setBilling({ ...billing, fullName: e.target.value })} placeholder="John Smith" required className="mt-1" />
                                            </div>
                                            <div>
                                                <Label htmlFor="email">Email Address *</Label>
                                                <Input id="email" type="email" value={billing.email} onChange={e => setBilling({ ...billing, email: e.target.value })} placeholder="john@example.com" required className="mt-1" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input id="phone" type="tel" value={billing.phone} onChange={e => setBilling({ ...billing, phone: e.target.value })} placeholder="+1 (555) 000-0000" className="mt-1" />
                                        </div>
                                        <div>
                                            <Label htmlFor="address">Street Address *</Label>
                                            <Input id="address" value={billing.address} onChange={e => setBilling({ ...billing, address: e.target.value })} placeholder="123 Main Street" required className="mt-1" />
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            <div className="col-span-2 sm:col-span-1">
                                                <Label htmlFor="city">City *</Label>
                                                <Input id="city" value={billing.city} onChange={e => setBilling({ ...billing, city: e.target.value })} placeholder="Los Angeles" required className="mt-1" />
                                            </div>
                                            <div>
                                                <Label htmlFor="state">State *</Label>
                                                <Input id="state" value={billing.state} onChange={e => setBilling({ ...billing, state: e.target.value })} placeholder="CA" required className="mt-1" />
                                            </div>
                                            <div>
                                                <Label htmlFor="zip">ZIP Code *</Label>
                                                <Input id="zip" value={billing.zip} onChange={e => setBilling({ ...billing, zip: e.target.value })} placeholder="90210" required className="mt-1" />
                                            </div>
                                        </div>
                                        <Button type="submit" size="lg" className="w-full rounded-xl mt-2 h-12 text-base font-semibold">
                                            Continue to Payment <ChevronRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </form>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Payment */}
                        {step === 'payment' && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <button
                                    onClick={() => setStep('info')}
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Billing Info
                                </button>

                                <div className="bg-card border border-border rounded-2xl p-6">
                                    <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</span>
                                        Payment Details
                                    </h2>
                                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2 mb-6">
                                        <Lock className="w-4 h-4 flex-shrink-0" />
                                        <span>This is a <strong>test/demo checkout</strong>. No real payment is processed. Use any dummy card details.</span>
                                    </div>

                                    {/* Dummy Card Visual */}
                                    <div className="relative w-full max-w-sm mx-auto h-44 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-6 mb-8 shadow-xl overflow-hidden select-none">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-16" />
                                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-20 -translate-x-10" />
                                        <div className="relative z-10 flex flex-col h-full justify-between">
                                            <div className="flex justify-between items-start">
                                                <CreditCard className="w-8 h-8 text-white/70" />
                                                <span className="text-white/50 text-xs font-semibold tracking-widest uppercase">Demo Card</span>
                                            </div>
                                            <div>
                                                <p className="text-white/90 font-mono text-lg tracking-widest mb-3">
                                                    {card.number || '•••• •••• •••• ••••'}
                                                </p>
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-white/40 text-xs mb-0.5 uppercase tracking-wider">Card Holder</p>
                                                        <p className="text-white font-medium text-sm">{card.name || billing.fullName || 'YOUR NAME'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-white/40 text-xs mb-0.5 uppercase tracking-wider">Expires</p>
                                                        <p className="text-white font-mono text-sm">{card.expiry || 'MM/YY'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="cardNumber">Card Number *</Label>
                                            <div className="relative mt-1">
                                                <Input
                                                    id="cardNumber"
                                                    value={card.number}
                                                    onChange={e => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                                                    placeholder="4242 4242 4242 4242"
                                                    maxLength={19}
                                                    required
                                                    className="pl-4 pr-10 font-mono"
                                                />
                                                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="cardName">Cardholder Name *</Label>
                                            <Input
                                                id="cardName"
                                                value={card.name}
                                                onChange={e => setCard({ ...card, name: e.target.value })}
                                                placeholder="John Smith"
                                                required
                                                className="mt-1"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="expiry">Expiry Date *</Label>
                                                <Input
                                                    id="expiry"
                                                    value={card.expiry}
                                                    onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                                                    placeholder="MM/YY"
                                                    maxLength={5}
                                                    required
                                                    className="mt-1 font-mono"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="cvv">CVV *</Label>
                                                <Input
                                                    id="cvv"
                                                    value={card.cvv}
                                                    onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                                                    placeholder="123"
                                                    maxLength={4}
                                                    required
                                                    className="mt-1 font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                                            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                            Your information is encrypted and secure. This is a demo — no real charges.
                                        </div>

                                        <Button
                                            type="submit"
                                            size="lg"
                                            disabled={loading}
                                            className="w-full rounded-xl h-12 text-base font-bold mt-2 bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            {loading ? (
                                                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>
                                            ) : (
                                                <><Lock className="w-4 h-4 mr-2" /> Place Order — ${cartTotal.toFixed(2)}</>
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border border-border rounded-2xl p-6 sticky top-28">
                            <h3 className="text-lg font-bold mb-5">Order Summary</h3>
                            <div className="space-y-4 mb-6">
                                {items.map(item => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.title} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Home className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">Plan #{item.planNumber}</p>
                                        </div>
                                        <span className="font-bold text-sm flex-shrink-0">${item.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-border pt-4 space-y-2">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Processing Fee</span>
                                    <span className="text-emerald-500 font-medium">FREE</span>
                                </div>
                                <div className="flex justify-between text-lg font-black pt-2 border-t border-border">
                                    <span>Total</span>
                                    <span className="text-primary">${cartTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-6 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                <p className="text-xs text-emerald-700 dark:text-emerald-400 text-center font-medium">
                                    🏠 Plans available for download after admin approval
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
