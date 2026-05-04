'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Save, Globe, Mail, Phone, MapPin, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SettingsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        siteName: 'ArchPro',
        contactEmail: 'contact@archpro.com',
        contactPhone: '+1-800-555-ARCH',
        address: '123 Architecture Lane, Design City, DC 20001',
        footerText: '© 2026 ArchPro. All rights reserved.',
        currency: 'USD',
        aiEngine: 'gemini', // default
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Mock save
        setTimeout(() => {
            setLoading(false);
            toast({
                title: 'Settings Saved',
                description: 'General settings have been updated successfully.',
            });
        }, 1000);
    };

    return (
        <div className="container py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your website configuration and general settings.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" /> General Settings
                        </CardTitle>
                        <CardDescription>Basic information about your platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="siteName">Site Name</Label>
                            <Input id="siteName" name="siteName" value={settings.siteName} onChange={handleChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="footerText">Footer Copyright Text</Label>
                            <Input id="footerText" name="footerText" value={settings.footerText} onChange={handleChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="currency">Default Currency Code</Label>
                            <Input id="currency" name="currency" value={settings.currency} onChange={handleChange} placeholder="e.g. USD, EUR" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" /> AI Visualization Setting
                        </CardTitle>
                        <CardDescription>Select your preferred AI engine for photorealistic renders.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="aiEngine">Default AI Engine</Label>
                            <Select
                                value={settings.aiEngine}
                                onValueChange={(value) => setSettings({ ...settings, aiEngine: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select AI Engine" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gemini">Gemini AI (High Performance)</SelectItem>
                                    <SelectItem value="roomsgpt">RoomsGPT / ControlNet (Architectural Focus)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                This engine will be used when generating photorealistic screenshots from the 3D editor.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" /> Contact Information
                        </CardTitle>
                        <CardDescription>How customers can reach you.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="contactEmail">Support Email</Label>
                            <Input id="contactEmail" name="contactEmail" type="email" value={settings.contactEmail} onChange={handleChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contactPhone">Phone Number</Label>
                            <Input id="contactPhone" name="contactPhone" value={settings.contactPhone} onChange={handleChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Physical Address</Label>
                            <Textarea id="address" name="address" value={settings.address} onChange={handleChange} rows={3} />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={loading} className="gap-2">
                        <Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
