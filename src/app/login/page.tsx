
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock Auth
        if (email === 'admin@archpro.com' && password === 'password123') {
            document.cookie = "auth=true; path=/";
            router.push('/admin');
        } else {
            alert('Invalid credentials');
        }
    };

    return (
        <div className="container" style={{ padding: '4rem 1rem', maxWidth: '400px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Admin Login</h1>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <button className="btn btn-primary" type="submit">Log In</button>
            </form>
            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem', color: '#666' }}>
                Hint: admin@archpro.com / password123
            </div>
        </div>
    );
}
