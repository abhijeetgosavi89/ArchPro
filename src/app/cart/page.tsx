
'use client';

// Prevent static generation - this page uses context providers
export const dynamic = 'force-dynamic';

import { useCart } from "@/context/CartContext";
import Link from 'next/link';

export default function CartPage() {
    const { items, removeFromCart, cartTotal } = useCart();

    if (items.length === 0) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h2>Your cart is empty</h2>
                <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Plans</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h1>Shopping Cart</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', marginTop: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {items.map(item => (
                        <div key={item.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid #eee', borderRadius: '4px' }}>
                            <img src={item.image} alt={item.title} style={{ width: '100px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                            <div style={{ flex: 1 }}>
                                <h3>{item.title}</h3>
                                <p style={{ color: '#666' }}>Plan #{item.planNumber}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>${item.price.toFixed(2)}</div>
                                <button onClick={() => removeFromCart(item.id)} style={{ color: 'red', background: 'none', border: 'none', fontSize: '0.875rem' }}>Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '4px', height: 'fit-content' }}>
                    <h3>Summary</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0' }}>
                        <span>Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ borderTop: '1px solid #ddd', paddingTop: '1rem', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                    </div>
                    <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', textAlign: 'center' }}>
                        Checkout
                    </Link>
                </div>
            </div>
        </div>
    );
}
