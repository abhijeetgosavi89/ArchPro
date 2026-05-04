'use client';

import { useEffect, useState } from 'react';
import DashboardOverview from '@/components/admin/DashboardOverview';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0,
        customers: 0,
        growth: 0
    });
    const [chartData, setChartData] = useState([]);
    const [popularPlans, setPopularPlans] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/analytics')
            .then(res => {
                if (res.status === 401) {
                    throw new Error('Unauthorized');
                }
                return res.json();
            })
            .then(data => {
                if (data.stats) {
                    setStats(data.stats);
                    setChartData(data.chartData || []);
                    setPopularPlans(data.popularPlans || []);
                    setRecentUsers(data.recentUsers || []);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
                if (err.message === 'Unauthorized') {
                    // Optional: Redirect to login if needed, or just show empty state
                    // window.location.href = '/auth/signin';
                }
            });
    }, []);

    if (loading) return <div className="p-8">Loading dashboard...</div>;

    return (
        <div className="container py-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <Link href="/admin/plans/import">
                    <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Bulk Import Plans
                    </Button>
                </Link>
            </div>
            <DashboardOverview
                stats={stats}
                chartData={chartData}
                popularPlans={popularPlans}
                recentUsers={recentUsers}
            />
        </div>
    );
}
