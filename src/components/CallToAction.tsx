'use client';

import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ArrowRight } from "lucide-react";

export default function CallToAction() {
    return (
        <section className="py-20 bg-slate-900 text-white">
            <div className="container relative z-10 text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Build Your Dream Home?</h2>
                <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                    Join thousands of happy homeowners who found their perfect plan with ArchPro.
                    Get started today and turn your vision into reality.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/plans">
                        <Button size="lg" className="text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90">
                            Browse All Plans <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="/contact">
                        <Button size="lg" variant="outline" className="text-lg px-8 py-6 text-white border-white hover:bg-white hover:text-slate-900">
                            Contact Support
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
