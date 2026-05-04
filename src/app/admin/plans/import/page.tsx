'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Upload, AlertCircle, CheckCircle, FileJson } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function BulkImportPage() {
    const [jsonInput, setJsonInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ count: number; errors: any[] } | null>(null);
    const { toast } = useToast();

    const handleImport = async () => {
        setLoading(true);
        setResult(null);

        try {
            let plans;
            try {
                plans = JSON.parse(jsonInput);
                if (!Array.isArray(plans)) throw new Error('Root must be an array');
            } catch (e) {
                toast({
                    title: "Invalid JSON",
                    description: "Please check your JSON format.",
                    variant: "destructive"
                });
                setLoading(false);
                return;
            }

            const res = await fetch('/api/admin/plans/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plans })
            });

            const data = await res.json();

            if (res.ok) {
                setResult({ count: data.count, errors: data.errors });
                toast({
                    title: "Import Complete",
                    description: `Successfully imported ${data.count} plans.`
                });
                if (data.count > 0) setJsonInput('');
            } else {
                toast({
                    title: "Import Failed",
                    description: data.error || "Something went wrong",
                    variant: "destructive"
                });
            }

        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to import plans", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const loadSample = () => {
        const sample = [
            {
                "title": "Modern Lake House",
                "planNumber": "LAKE-2024",
                "price": 2499,
                "sqFt": 3200,
                "beds": 4,
                "baths": 3.5,
                "style": "Modern",
                "imageUrl": "https://images.unsplash.com/photo-1600596542815-e328713182d3?auto=format&fit=crop&q=80&w=800"
            },
            {
                "title": "Cozy Cottage",
                "planNumber": "COT-55",
                "price": 1200,
                "sqFt": 1500,
                "beds": 2,
                "baths": 2,
                "style": "Cottage"
            }
        ];
        setJsonInput(JSON.stringify(sample, null, 2));
    };

    return (
        <div className="container max-w-4xl py-10 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Bulk Plan Import</h1>
                <p className="text-muted-foreground">
                    Import multiple plans using JSON format.
                    This tool creates plans and optionally links a primary image URL.
                </p>
            </div>

            <div className="grid gap-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">JSON Data</label>
                        <Button variant="outline" size="sm" onClick={loadSample}>
                            <FileJson className="mr-2 h-4 w-4" />
                            Load Sample
                        </Button>
                    </div>
                    <Textarea
                        placeholder="Paste your JSON array here..."
                        className="font-mono min-h-[300px]"
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                    />
                </div>

                <Button onClick={handleImport} disabled={loading || !jsonInput} className="w-full sm:w-auto">
                    {loading ? "Importing..." : (
                        <>
                            <Upload className="mr-2 h-4 w-4" /> Import Plans
                        </>
                    )}
                </Button>

                {result && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <Alert variant={result.count > 0 ? "default" : "destructive"}>
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Import Summary</AlertTitle>
                            <AlertDescription>
                                Successfully created {result.count} plans.
                            </AlertDescription>
                        </Alert>

                        {result.errors.length > 0 && (
                            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4">
                                <h4 className="flex items-center text-destructive font-medium mb-2">
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Errors ({result.errors.length})
                                </h4>
                                <ul className="text-sm space-y-1 text-destructive/90 max-h-[200px] overflow-auto">
                                    {result.errors.map((err, i) => (
                                        <li key={i}>
                                            <span className="font-semibold">{err.plan}:</span> {err.error}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
