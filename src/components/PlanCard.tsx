import Link from 'next/link';
import Image from 'next/image';
import { Plan, Image as PlanImage } from '@prisma/client';
import WishlistButton from './WishlistButton';
import CompareButton from './CompareButton';

// Simple interface manually defined to avoid import issues if Prisma types aren't perfect yet
interface PlanCardProps {
    plan: Plan & { images: PlanImage[] };
}

export default function PlanCard({ plan }: PlanCardProps) {
    const mainImage = plan.images.find(img => img.isPrimary) || plan.images[0];

    return (
        <div className="group relative bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <Link href={`/plans/${plan.id}`}>
                    <Image
                        src={mainImage?.url || '/placeholder.svg'}
                        alt={plan.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </Link>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {plan.isTrending && (
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
                            TRENDING
                        </span>
                    )}
                    {plan.style && (
                        <span className="bg-black/60 text-white backdrop-blur-md text-xs font-semibold px-3 py-1 rounded-full border border-white/10">
                            {plan.style}
                        </span>
                    )}
                </div>

                <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
                    <WishlistButton planId={plan.id} />
                    <CompareButton planId={plan.id} />
                </div>

                {/* Quick Actions overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 pointer-events-none">
                    {/* Buttons could go here, currently just a visual overlay */}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Plan #{plan.planNumber}</p>
                        <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                            <Link href={`/plans/${plan.id}`}>
                                {plan.title}
                            </Link>
                        </h3>
                    </div>
                    <div className="text-right">
                        <span className="block text-2xl font-extrabold text-primary">
                            ${Number(plan.price).toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-border/50 text-sm text-muted-foreground">
                    <div className="flex flex-col items-center p-2 bg-secondary/50 rounded-lg">
                        <span className="font-bold text-foreground">{plan.sqFt}</span>
                        <span className="text-[10px] uppercase">Sq Ft</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-secondary/50 rounded-lg">
                        <span className="font-bold text-foreground">{plan.beds}</span>
                        <span className="text-[10px] uppercase">Beds</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-secondary/50 rounded-lg">
                        <span className="font-bold text-foreground">{plan.baths}</span>
                        <span className="text-[10px] uppercase">Baths</span>
                    </div>
                </div>

                <Link href={`/plans/${plan.id}`} className="mt-4 w-full">
                    <button className="w-full bg-foreground text-background font-bold py-3 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors uppercase tracking-wide text-sm">
                        View Details
                    </button>
                </Link>
            </div>
        </div>
    );
}
