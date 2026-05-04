'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PlanCard from '@/components/PlanCard';
import { Loader2, Heart, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        } else if (status === 'authenticated') {
            fetch('/api/wishlist')
                .then(res => res.json())
                .then(data => {
                    setWishlist(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [status, router]);

    if (status === 'loading' || loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-red-100 p-3 rounded-full">
                    <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Your Wishlist</h1>
                    <p className="text-muted-foreground">{wishlist.length} saved plans</p>
                </div>
            </div>

            {wishlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border text-center">
                    <FolderOpen className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                    <h2 className="text-xl font-bold mb-2">No Saved Plans Yet</h2>
                    <p className="text-muted-foreground max-w-md mb-6">
                        Browse our collection of premium architectural plans and save your favorites to view them later.
                    </p>
                    <Link href="/plans">
                        <Button size="lg">Browse Plans</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlist.map((item) => (
                        <PlanCard key={item.id} plan={item.plan} />
                    ))}
                </div>
            )}
        </div>
    );
}
