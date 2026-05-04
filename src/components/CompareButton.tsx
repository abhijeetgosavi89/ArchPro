'use client';

import { useCompare } from '@/context/CompareContext';
import { Button } from '@/components/ui/button';
import { Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompareButtonProps {
    planId: string;
    variant?: 'icon' | 'full';
    className?: string;
}

export default function CompareButton({ planId, variant = 'icon', className }: CompareButtonProps) {
    const { isInCompare, addToCompare, removeFromCompare } = useCompare();
    const isSelected = isInCompare(planId);

    const toggleCompare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isSelected) {
            removeFromCompare(planId);
        } else {
            addToCompare(planId);
        }
    };

    if (variant === 'full') {
        return (
            <Button
                variant="outline"
                className={cn("w-full gap-2", isSelected && "bg-primary/10 border-primary text-primary", className)}
                onClick={toggleCompare}
            >
                <Scale className="w-4 h-4" />
                {isSelected ? 'Remove from Compare' : 'Add to Compare'}
            </Button>
        );
    }

    return (
        <button
            onClick={toggleCompare}
            className={cn(
                "p-2 rounded-full transition-all duration-300 backdrop-blur-md shadow-sm border",
                isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white/90 text-muted-foreground border-white/20 hover:bg-white hover:text-primary hover:scale-110",
                className
            )}
            title={isSelected ? "Remove from Compare" : "Add to Compare"}
        >
            <Scale className="w-4 h-4" />
        </button>
    );
}
