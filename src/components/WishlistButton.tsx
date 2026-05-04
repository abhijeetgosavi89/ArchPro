'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from './ui/button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from './ui/use-toast';

interface WishlistButtonProps {
    planId: string;
    variant?: 'icon' | 'full';
    className?: string;
}

export default function WishlistButton({ planId, variant = 'icon', className }: WishlistButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [loading, setLoading] = useState(false);

    // Ideally, we'd check initial state from a passed prop or context, 
    // but fetching for now is simpler for prototype
    useEffect(() => {
        if (session) {
            fetch('/api/wishlist')
                .then(res => res.json())
                .then((data: any[]) => {
                    if (data.some(item => item.planId === planId)) {
                        setIsInWishlist(true);
                    }
                })
                .catch(err => console.error(err));
        }
    }, [session, planId]);

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent linking if inside a Link component
        e.stopPropagation();

        if (!session) {
            router.push('/auth/signin');
            return;
        }

        setLoading(true);
        try {
            if (isInWishlist) {
                await fetch(`/api/wishlist/${planId}`, { method: 'DELETE' });
                setIsInWishlist(false);
                toast({ title: "Removed from wishlist" });
            } else {
                await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ planId }),
                });
                setIsInWishlist(true);
                toast({ title: "Added to wishlist" });
            }
            router.refresh();
        } catch (error) {
            console.error(error);
            toast({ title: "Something went wrong", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (variant === 'full') {
        return (
            <Button
                variant="outline"
                className={cn("w-full gap-2", className)}
                onClick={toggleWishlist}
                disabled={loading}
            >
                <Heart className={cn("w-4 h-4", isInWishlist ? "fill-red-500 text-red-500" : "")} />
                {isInWishlist ? 'Saved to Wishlist' : 'Add to Wishlist'}
            </Button>
        );
    }

    return (
        <button
            onClick={toggleWishlist}
            disabled={loading}
            className={cn(
                "p-2 rounded-full transition-all duration-300",
                isInWishlist
                    ? "bg-red-50 text-red-500 hover:bg-red-100"
                    : "bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm",
                className
            )}
        >
            <Heart className={cn("w-5 h-5", isInWishlist ? "fill-current" : "")} />
        </button>
    );
}
