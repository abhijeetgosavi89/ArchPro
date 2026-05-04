'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Star, Loader2, User, Camera } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from './ui/use-toast';

interface Review {
    id: string;
    rating: number;
    title: string;
    content: string;
    createdAt: string;
    user: {
        name: string | null;
        image: string | null;
    };
}

export default function Reviews({ planId }: { planId: string }) {
    const { data: session } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/plans/${planId}/reviews`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [planId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            router.push('/auth/signin');
            return;
        }
        if (rating === 0) {
            toast({ title: "Please select a rating", variant: "destructive" });
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/plans/${planId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, title, content }),
            });

            if (res.ok) {
                toast({ title: "Review submitted successfully!" });
                setRating(0);
                setTitle('');
                setContent('');
                fetchReviews(); // Refresh list
                router.refresh(); // Refresh page data (aggregates)
            } else {
                const data = await res.json();
                toast({ title: data.error || "Failed to submit review", variant: "destructive" });
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast({ title: "Something went wrong", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    return (
        <div className="space-y-10">
            {/* Header / Summary */}
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between border-b border-border/50 pb-8">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Customer Reviews</h2>
                    <div className="flex items-center gap-2">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={cn(
                                        "w-5 h-5",
                                        star <= Number(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                    )}
                                />
                            ))}
                        </div>
                        <span className="font-bold text-lg">{averageRating}</span>
                        <span className="text-muted-foreground">({reviews.length} reviews)</span>
                    </div>
                </div>

                {session ? (
                    <div className="w-full md:w-auto">
                        {/* Usually hidden behind a button but showing inline for now */}
                    </div>
                ) : (
                    <div className="bg-muted/30 p-4 rounded-lg text-center w-full md:w-auto">
                        <p className="text-sm text-muted-foreground mb-2">Have you built this plan?</p>
                        <Button variant="outline" onClick={() => router.push('/auth/signin')}>
                            Log in to write a review
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground italic">
                            No reviews yet. Be the first to review this plan!
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="bg-card p-6 rounded-xl border border-border/50 shadow-sm transition-shadow hover:shadow-md">
                                <div className="flex justify-between item-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={review.user.image || ''} />
                                            <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-sm">{review.user.name || 'Anonymous'}</p>
                                            <div className="flex text-xs text-yellow-400">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={cn("w-3 h-3", i < review.rating ? "fill-current" : "text-muted-foreground")}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                {review.title && <h3 className="font-bold mb-2">{review.title}</h3>}
                                <p className="text-muted-foreground leading-relaxed text-sm">
                                    {review.content}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* Review Form */}
                {session && (
                    <div className="lg:col-span-1">
                        <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm sticky top-24">
                            <h3 className="font-bold text-lg mb-4">Write a Review</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Rating</label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="focus:outline-none transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    className={cn(
                                                        "w-6 h-6",
                                                        star <= (hoverRating || rating)
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-muted-foreground"
                                                    )}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Great plan!"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="content" className="block text-sm font-medium mb-1">Review</label>
                                    <Textarea
                                        id="content"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Share your experience building this plan..."
                                        rows={4}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={submitting}>
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Submit Review'}
                                </Button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
