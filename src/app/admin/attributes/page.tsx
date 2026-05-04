'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';

type AttributeCategory = {
    id: string;
    name: string;
    slug: string;
    values: AttributeValue[];
};

type AttributeValue = {
    id: string;
    value: string;
    categoryId: string;
};

export default function AttributesPage() {
    const [categories, setCategories] = useState<AttributeCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');
    const { toast } = useToast();

    // Helper to fetch data
    const fetchAttributes = async () => {
        try {
            const res = await fetch('/api/admin/attributes');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to fetch attributes', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttributes();
    }, []);

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;

        try {
            const res = await fetch('/api/admin/attributes/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName })
            });

            if (res.ok) {
                toast({ title: "Category Created", description: `Added ${newCategoryName}` });
                setNewCategoryName('');
                fetchAttributes();
            } else {
                toast({ title: "Error", description: "Failed to create category", variant: "destructive" });
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Sub-component for managing values within a category card
    const CategoryCard = ({ category }: { category: AttributeCategory }) => {
        const [newValue, setNewValue] = useState('');
        const [isAdding, setIsAdding] = useState(false);

        const handleAddValue = async () => {
            if (!newValue.trim()) return;
            try {
                const res = await fetch(`/api/admin/attributes/values`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value: newValue, categoryId: category.id })
                });

                if (res.ok) {
                    toast({ title: "Value Added", description: `Added ${newValue} to ${category.name}` });
                    setNewValue('');
                    setIsAdding(false);
                    fetchAttributes(); // Refresh all to see new value
                }
            } catch (error) {
                console.error(error);
            }
        };

        const handleDeleteValue = async (valueId: string) => {
            if (!confirm('Are you sure? This will remove this attribute from all plans.')) return;
            try {
                const res = await fetch(`/api/admin/attributes/values/${valueId}`, { method: 'DELETE' });
                if (res.ok) fetchAttributes();
            } catch (error) { console.error(error); }
        };

        return (
            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="text-lg font-bold">{category.name}</CardTitle>
                        <CardDescription>Slug: {category.slug}</CardDescription>
                    </div>
                    {/* Add edit/delete category buttons here later */}
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {category.values.map(val => (
                            <div key={val.id} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                {val.value}
                                <button onClick={() => handleDeleteValue(val.id)} className="hover:text-destructive">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                        {category.values.length === 0 && <span className="text-muted-foreground text-sm italic">No values yet</span>}
                    </div>

                    <div className="flex gap-2 items-center">
                        <Input
                            placeholder={`Add ${category.name}...`}
                            value={newValue}
                            onChange={e => setNewValue(e.target.value)}
                            className="max-w-xs h-8 text-sm"
                            onKeyDown={e => e.key === 'Enter' && handleAddValue()}
                        />
                        <Button size="sm" variant="outline" onClick={handleAddValue} disabled={!newValue.trim()}>
                            <Plus size={14} className="mr-1" /> Add
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (loading) return <div className="p-8">Loading attributes...</div>;

    return (
        <div className="container py-8 max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Attributes & Filters</h1>
                    <p className="text-muted-foreground mt-1">Manage global attributes used for filtering plans (e.g., Styles, Foundation).</p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> New Category</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Attribute Category</DialogTitle>
                            <DialogDescription>
                                Examples: "Architectural Style", "Roof Type", "View".
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Input
                                placeholder="Category Name"
                                value={newCategoryName}
                                onChange={e => setNewCategoryName(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateCategory}>Create Category</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map(cat => (
                    <CategoryCard key={cat.id} category={cat} />
                ))}
            </div>

            {categories.length === 0 && (
                <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                    No attribute categories found. Create one to get started.
                </div>
            )}
        </div>
    );
}
