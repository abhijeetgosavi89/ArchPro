'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, Home, Award } from "lucide-react";

const stats = [
    {
        label: "Plans Sold",
        value: "1,000+",
        icon: FileText,
        color: "text-blue-500"
    },
    {
        label: "Happy Clients",
        value: "500+",
        icon: Users,
        color: "text-green-500"
    },
    {
        label: "Built Homes",
        value: "350+",
        icon: Home,
        color: "text-orange-500"
    },
    {
        label: "Design Awards",
        value: "25+",
        icon: Award,
        color: "text-purple-500"
    },
];

export default function StatsSection() {
    return (
        <section className="py-12 bg-slate-50 dark:bg-slate-900/50">
            <div className="container">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <Card key={index} className="border-none shadow-none bg-transparent text-center">
                            <CardContent className="pt-6">
                                <div className={`mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                                <p className="text-muted-foreground">{stat.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
