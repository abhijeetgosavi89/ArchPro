'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AddToCartButton from '@/components/AddToCartButton';
import WishlistButton from '@/components/WishlistButton';
import Reviews from '@/components/Reviews';
import { StatsStrip, AreaBreakdown, SpecsTable, TrustBadges, WhatsIncluded, TagsDisplay } from '@/components/PlanDetailParts';
import {
    ChevronRight, Home, Phone, Share2, Maximize2, ArrowRight,
    Star, ChevronLeft, Building2, FlipHorizontal, Eye, Check
} from 'lucide-react';

interface PlanDetailClientProps { plan: any; relatedPlans: any[]; }

export default function PlanDetailClient({ plan, relatedPlans }: PlanDetailClientProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [floorPlanTab, setFloorPlanTab] = useState('all');
    const [isReversed, setIsReversed] = useState(false);

    const mainImage = plan.images[selectedImage]?.url || '/placeholder.svg';

    // Separate images by type
    const exteriorImages = plan.images.filter((img: any) => img.type === 'IMAGE' || img.type === 'INTERIOR');
    const floorPlanImages = plan.images.filter((img: any) => img.type === 'BLUEPRINT');
    const elevationImages = plan.images.filter((img: any) => img.type === 'ELEVATION');
    const hasFloorPlans = floorPlanImages.length > 0 || elevationImages.length > 0;

    return (
        <div className="bg-background min-h-screen pt-[120px]">
            {/* Breadcrumb */}
            <div className="border-b border-border/50 py-3 bg-muted/30">
                <div className="container mx-auto px-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary flex items-center gap-1"><Home className="w-4 h-4" /> Home</Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link href="/plans" className="hover:text-primary">Plans</Link>
                    {plan.style && <><ChevronRight className="w-4 h-4" /><Link href={`/plans?style=${plan.style}`} className="hover:text-primary">{plan.style}</Link></>}
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-medium text-foreground truncate max-w-[200px]">{plan.title}</span>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Hero Grid: Images + Purchase Card */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left: Images (3 cols) */}
                    <div className="lg:col-span-3">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted group cursor-pointer"
                            onClick={() => setIsLightboxOpen(true)}>
                            <Image src={mainImage} alt={plan.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" priority />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            <button className="absolute top-4 right-4 p-3 bg-white/90 dark:bg-slate-900/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <Maximize2 className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-4 left-4 flex gap-2">
                                {plan.style && <Badge variant="secondary" className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">{plan.style}</Badge>}
                                {plan.isNewPlan && <Badge className="bg-emerald-500 text-white">New</Badge>}
                            </div>
                            {plan.views > 0 && (
                                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 rounded-full text-white text-xs">
                                    <Eye className="w-3.5 h-3.5" /> {plan.views.toLocaleString()} views
                                </div>
                            )}
                        </motion.div>

                        {/* Thumbnails */}
                        {plan.images.length > 1 && (
                            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                                {plan.images.map((img: any, i: number) => (
                                    <button key={img.id} onClick={() => setSelectedImage(i)}
                                        className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${i === selectedImage ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'}`}>
                                        <Image src={img.url} alt="" fill className="object-cover" />
                                        {img.type === 'BLUEPRINT' && <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center"><span className="text-[9px] font-bold text-white bg-blue-600 px-1 rounded">FP</span></div>}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Stats Strip */}
                        <StatsStrip plan={plan} />

                        {/* Tags */}
                        {plan.tags?.length > 0 && (
                            <div className="mt-4">
                                <TagsDisplay tags={plan.tags} />
                            </div>
                        )}
                    </div>

                    {/* Right: Purchase Card (2 cols) */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-24 space-y-5">
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-2xl border border-border p-6">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground font-medium">Plan #{plan.planNumber}</p>
                                        <h1 className="text-2xl font-bold mt-1">{plan.title}</h1>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" className="rounded-full"><Share2 className="w-4 h-4" /></Button>
                                        <WishlistButton planId={plan.id} variant="icon" />
                                    </div>
                                </div>

                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-4xl font-black text-primary">${plan.price.toLocaleString()}</span>
                                    <span className="text-muted-foreground">USD</span>
                                </div>

                                {/* Pricing Options */}
                                {(plan.pricePDF || plan.priceCAD || plan.priceReverse) && (
                                    <div className="mb-4 space-y-1.5 text-sm bg-muted/50 rounded-lg p-3">
                                        <p className="font-semibold text-xs uppercase text-muted-foreground mb-2">Also Available</p>
                                        {plan.pricePDF && <div className="flex justify-between"><span>PDF Set</span><span className="font-semibold">${plan.pricePDF.toLocaleString()}</span></div>}
                                        {plan.priceCAD && <div className="flex justify-between"><span>CAD Files</span><span className="font-semibold">${plan.priceCAD.toLocaleString()}</span></div>}
                                        {plan.priceReverse && <div className="flex justify-between"><span>Reversed/Mirror</span><span className="font-semibold">${plan.priceReverse.toLocaleString()}</span></div>}
                                    </div>
                                )}

                                <TrustBadges />

                                <div className="space-y-3 mt-5">
                                    <AddToCartButton plan={{ ...plan, price: plan.price, baths: plan.baths }} />
                                    <Link href={`/plans/${plan.id}/customize`} className="block">
                                        <Button variant="outline" className="w-full h-12 text-base font-semibold gap-2 border-2">
                                            <Building2 className="w-5 h-5" /> Customize in 3D
                                        </Button>
                                    </Link>
                                </div>

                                <div className="mt-5 pt-5 border-t border-border text-center">
                                    <p className="text-sm text-muted-foreground mb-1">Need help? Call us</p>
                                    <a href="tel:1-800-555-ARCH" className="flex items-center justify-center gap-2 font-bold text-lg hover:text-primary"><Phone className="w-4 h-4" /> 1-800-555-ARCH</a>
                                </div>
                            </motion.div>

                            {/* Rating */}
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}</div>
                                    <span className="font-bold">4.9</span>
                                    <span className="text-muted-foreground text-sm">(128 reviews)</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Floor Plans & Elevations Section */}
                {hasFloorPlans && (
                    <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-14">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Floor Plans & Elevations</h2>
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsReversed(!isReversed)}>
                                <FlipHorizontal className="w-4 h-4" /> {isReversed ? 'Original View' : 'Reverse/Mirror'}
                            </Button>
                        </div>
                        <div className="flex gap-2 mb-4">
                            <Button variant={floorPlanTab === 'all' ? 'default' : 'ghost'} size="sm" onClick={() => setFloorPlanTab('all')}>All ({floorPlanImages.length + elevationImages.length})</Button>
                            {floorPlanImages.length > 0 && <Button variant={floorPlanTab === 'floor' ? 'default' : 'ghost'} size="sm" onClick={() => setFloorPlanTab('floor')}>Floor Plans ({floorPlanImages.length})</Button>}
                            {elevationImages.length > 0 && <Button variant={floorPlanTab === 'elevation' ? 'default' : 'ghost'} size="sm" onClick={() => setFloorPlanTab('elevation')}>Elevations ({elevationImages.length})</Button>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(floorPlanTab === 'all' ? [...floorPlanImages, ...elevationImages] : floorPlanTab === 'floor' ? floorPlanImages : elevationImages).map((img: any) => (
                                <div key={img.id} className="bg-card rounded-xl border border-border overflow-hidden">
                                    <div className={`relative aspect-[4/3] bg-white ${isReversed ? 'scale-x-[-1]' : ''}`}>
                                        <Image src={img.url} alt={img.title || 'Floor Plan'} fill className="object-contain p-4" />
                                    </div>
                                    {img.title && <div className="px-4 py-3 border-t border-border"><p className="font-semibold text-sm">{img.title}</p>{img.description && <p className="text-xs text-muted-foreground">{img.description}</p>}</div>}
                                </div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Content: Description, Sections, Specs, Reviews */}
                <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-10">
                        {/* About */}
                        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <h2 className="text-2xl font-bold mb-4">About This Plan</h2>
                            <p className="text-muted-foreground leading-relaxed text-lg">{plan.description}</p>
                        </motion.section>

                        {/* Rich Content Sections */}
                        {plan.sections?.length > 0 && plan.sections.map((sec: any) => (
                            <motion.section key={sec.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                className={`${sec.imageUrl ? 'grid grid-cols-1 md:grid-cols-2 gap-6 items-center' : ''}`}>
                                <div>
                                    {sec.title && <h3 className="text-xl font-bold mb-3">{sec.title}</h3>}
                                    <p className="text-muted-foreground leading-relaxed">{sec.content}</p>
                                </div>
                                {sec.imageUrl && (
                                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                                        <Image src={sec.imageUrl} alt={sec.title || ''} fill className="object-cover" />
                                    </div>
                                )}
                            </motion.section>
                        ))}

                        {/* Key Features */}
                        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <h2 className="text-2xl font-bold mb-4">Key Features</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[...(plan.tags || []), ...(plan.attributes?.map((a: any) => a.value) || [])].map((feature: string) => (
                                    <div key={feature} className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                                        <span className="font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.section>

                        {/* Specifications */}
                        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <h2 className="text-2xl font-bold mb-4">Specifications</h2>
                            <SpecsTable plan={plan} />
                        </motion.section>

                        {/* Reviews */}
                        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <Reviews planId={plan.id} />
                        </motion.section>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <WhatsIncluded />
                        <AreaBreakdown plan={plan} />
                    </div>
                </div>

                {/* Related Plans */}
                {relatedPlans.length > 0 && (
                    <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 pt-16 border-t border-border">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold">Similar Plans</h2>
                            <Link href={`/plans?style=${plan.style}`}><Button variant="ghost" className="gap-2">View All <ArrowRight className="w-4 h-4" /></Button></Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedPlans.map((related: any) => {
                                const img = related.images.find((i: any) => i.isPrimary) || related.images[0];
                                return (
                                    <Link key={related.id} href={`/plans/${related.id}`}>
                                        <motion.div whileHover={{ y: -6 }} className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
                                            <div className="relative aspect-[4/3]"><Image src={img?.url || '/placeholder.svg'} alt={related.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" /></div>
                                            <div className="p-4">
                                                <h3 className="font-bold group-hover:text-primary transition-colors">{related.title}</h3>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                    <span>{related.beds} Beds</span><span>•</span><span>{related.baths} Baths</span><span>•</span><span>{related.sqFt.toLocaleString()} sqft</span>
                                                </div>
                                                <p className="text-lg font-bold text-primary mt-2">${related.price.toLocaleString()}</p>
                                            </div>
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.section>
                )}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setIsLightboxOpen(false)}>
                        <button className="absolute top-4 right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20" onClick={() => setIsLightboxOpen(false)}>✕</button>
                        <button className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full text-white hover:bg-white/20"
                            onClick={e => { e.stopPropagation(); setSelectedImage(prev => (prev - 1 + plan.images.length) % plan.images.length); }}><ChevronLeft className="w-6 h-6" /></button>
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full text-white hover:bg-white/20"
                            onClick={e => { e.stopPropagation(); setSelectedImage(prev => (prev + 1) % plan.images.length); }}><ChevronRight className="w-6 h-6" /></button>
                        <div className="relative max-w-5xl w-full aspect-video"><Image src={mainImage} alt={plan.title} fill className="object-contain" /></div>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/60 px-4 py-2 rounded-full">
                            {selectedImage + 1} / {plan.images.length} {plan.images[selectedImage]?.title && `— ${plan.images[selectedImage].title}`}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
