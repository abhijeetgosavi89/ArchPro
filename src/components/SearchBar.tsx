'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, ArrowRight } from 'lucide-react';

export default function SearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/plans?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto">
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative flex items-center bg-background rounded-full shadow-xl border border-border/50 p-2 pl-6">
                    <Search className="w-5 h-5 text-muted-foreground mr-3" />
                    <input
                        type="text"
                        placeholder="Search for 'Modern farmhouse under 2000 sq ft'..."
                        className="flex-grow bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/70"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="flex items-center gap-2 pl-2">
                        {/* Filter trigger could go here */}
                        {/* <Button type="button" variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                            <SlidersHorizontal className="w-4 h-4" />
                        </Button> */}
                        <Button type="submit" size="icon" className="rounded-full bg-primary hover:bg-primary/90 h-10 w-10">
                            <ArrowRight className="w-4 h-4 text-primary-foreground" />
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
