'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface CompareContextType {
    selectedPlans: string[];
    addToCompare: (planId: string) => void;
    removeFromCompare: (planId: string) => void;
    clearCompare: () => void;
    isInCompare: (planId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
    const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
    const { toast } = useToast();

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('archpro_compare');
        if (saved) {
            setSelectedPlans(JSON.parse(saved));
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('archpro_compare', JSON.stringify(selectedPlans));
    }, [selectedPlans]);

    const addToCompare = (planId: string) => {
        if (selectedPlans.length >= 3) {
            toast({
                title: "Limit Reached",
                description: "You can compare up to 3 plans at a time.",
                variant: "destructive"
            });
            return;
        }
        if (!selectedPlans.includes(planId)) {
            setSelectedPlans([...selectedPlans, planId]);
            toast({
                title: "Added to Compare",
                description: "Plan added to your comparison list."
            });
        }
    };

    const removeFromCompare = (planId: string) => {
        setSelectedPlans(selectedPlans.filter(id => id !== planId));
    };

    const clearCompare = () => {
        setSelectedPlans([]);
    };

    const isInCompare = (planId: string) => selectedPlans.includes(planId);

    return (
        <CompareContext.Provider value={{ selectedPlans, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    const context = useContext(CompareContext);
    if (context === undefined) {
        throw new Error('useCompare must be used within a CompareProvider');
    }
    return context;
}
