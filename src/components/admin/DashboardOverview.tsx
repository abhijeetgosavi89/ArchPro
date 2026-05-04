'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingCart, Users, Activity, List, Tag, Plus, Settings } from "lucide-react";
import { RecentSales } from "./RecentSales";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

interface DashboardProps {
    stats: {
        revenue: number;
        orders: number;
        customers: number;
        growth: number;
    };
    chartData: { name: string; total: number }[];
    popularPlans: any[];
    recentUsers: any[];
}

export default function DashboardOverview({ stats, chartData, popularPlans, recentUsers }: DashboardProps) {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.orders}</div>
                        <p className="text-xs text-muted-foreground">+19% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.customers}</div>
                        <p className="text-xs text-muted-foreground">+201 since last hour</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.growth}</div>
                        <p className="text-xs text-muted-foreground">+1 since last hour</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="total" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentSales users={recentUsers} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Popular Plans</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {popularPlans.map(plan => (
                                <div key={plan.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                    <div>
                                        <p className="font-medium text-sm">{plan.title}</p>
                                        <p className="text-xs text-muted-foreground">Plan #{plan.planNumber}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm">{plan.views} views</p>
                                        <Link href={`/admin/plans/${plan.id}`} className="text-xs text-primary hover:underline">
                                            Edit Plan
                                        </Link>
                                    </div>
                                </div>
                            ))}
                            {popularPlans.length === 0 && <p className="text-sm text-muted-foreground">No data available.</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <Link href="/admin/plans/new">
                            <Button className="w-full justify-start gap-2" variant="outline">
                                <Plus className="h-4 w-4" /> Add New Plan
                            </Button>
                        </Link>
                        <Link href="/admin/plans">
                            <Button className="w-full justify-start gap-2" variant="outline">
                                <List className="h-4 w-4" /> Modify Existing Plans
                            </Button>
                        </Link>
                        <Link href="/admin/attributes">
                            <Button className="w-full justify-start gap-2" variant="outline">
                                <Tag className="h-4 w-4" /> Manage Attributes
                            </Button>
                        </Link>
                        <Link href="/admin/settings">
                            <Button className="w-full justify-start gap-2" variant="outline">
                                <Settings className="h-4 w-4" /> Site Settings
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
