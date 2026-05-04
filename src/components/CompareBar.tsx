'use client';

import { useCompare } from '@/context/CompareContext';
import { Button } from '@/components/ui/button';
import { X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CompareBar() {
    const { selectedPlans, clearCompare } = useCompare();

    if (selectedPlans.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
            >
                <div className="bg-foreground text-background rounded-full shadow-2xl p-4 flex items-center justify-between border border-border/20 backdrop-blur-md bg-opacity-95">
                    <div className="flex items-center gap-4 px-2">
                        <span className="font-bold whitespace-nowrap">
                            {selectedPlans.length} plan{selectedPlans.length !== 1 ? 's' : ''} selected
                        </span>
                        <button
                            onClick={clearCompare}
                            className="text-xs underline text-muted-foreground hover:text-background transition-colors"
                        >
                            Clear
                        </button>
                    </div>

                    <Link href="/compare">
                        <Button size="sm" className="rounded-full px-6 font-bold bg-primary text-primary-foreground hover:bg-primary/90">
                            Compare <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
