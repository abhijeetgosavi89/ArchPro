'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useCallback, useTransition } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterOption { value: string; label: string; count?: number; }

interface PlanFiltersProps {
    styles: FilterOption[];
    tags: FilterOption[];
    attributeCategories: { name: string; values: FilterOption[] }[];
    totalCount: number;
    filteredCount: number;
}

export default function PlanFilters({ styles, tags, attributeCategories, totalCount, filteredCount }: PlanFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        style: true, beds: true, baths: true, price: true, sqft: false, stories: false, garage: false, tags: false
    });

    // Read current filter values from URL
    const currentStyle = searchParams.get('style') || '';
    const currentBeds = searchParams.get('beds') || '';
    const currentBaths = searchParams.get('baths') || '';
    const currentMinPrice = searchParams.get('minPrice') || '';
    const currentMaxPrice = searchParams.get('maxPrice') || '';
    const currentSqFtMin = searchParams.get('sqFtMin') || '';
    const currentSqFtMax = searchParams.get('sqFtMax') || '';
    const currentStories = searchParams.get('stories') || '';
    const currentGarage = searchParams.get('garage') || '';
    const currentTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const currentSort = searchParams.get('sort') || 'newest';
    const currentQ = searchParams.get('q') || '';

    // Local state for range inputs (debounced)
    const [minPrice, setMinPrice] = useState(currentMinPrice);
    const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
    const [sqFtMin, setSqFtMin] = useState(currentSqFtMin);
    const [sqFtMax, setSqFtMax] = useState(currentSqFtMax);

    const hasFilters = currentStyle || currentBeds || currentBaths || currentMinPrice ||
        currentMaxPrice || currentSqFtMin || currentSqFtMax || currentStories ||
        currentGarage || currentTags.length > 0 || currentQ;

    const updateFilter = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value);
        else params.delete(key);
        startTransition(() => router.push(`${pathname}?${params.toString()}`, { scroll: false }));
    }, [searchParams, pathname, router]);

    const clearAll = () => {
        startTransition(() => router.push(pathname, { scroll: false }));
    };

    const toggleSection = (key: string) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const applyRangeFilter = (minKey: string, maxKey: string, minVal: string, maxVal: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (minVal) params.set(minKey, minVal); else params.delete(minKey);
        if (maxVal) params.set(maxKey, maxVal); else params.delete(maxKey);
        startTransition(() => router.push(`${pathname}?${params.toString()}`, { scroll: false }));
    };

    const toggleTag = (tag: string) => {
        const newTags = currentTags.includes(tag) ? currentTags.filter(t => t !== tag) : [...currentTags, tag];
        updateFilter('tags', newTags.join(','));
    };

    const toggleStyle = (style: string) => {
        const currentStyles = currentStyle ? currentStyle.split(',') : [];
        const newStyles = currentStyles.includes(style) ? currentStyles.filter(s => s !== style) : [...currentStyles, style];
        updateFilter('style', newStyles.join(','));
    };

    // Active filter pills
    const activeFilters: { label: string; onRemove: () => void }[] = [];
    if (currentQ) activeFilters.push({ label: `"${currentQ}"`, onRemove: () => updateFilter('q', '') });
    if (currentStyle) currentStyle.split(',').forEach(s => activeFilters.push({ label: s, onRemove: () => { const n = currentStyle.split(',').filter(x => x !== s); updateFilter('style', n.join(',')); } }));
    if (currentBeds) activeFilters.push({ label: `${currentBeds}+ Beds`, onRemove: () => updateFilter('beds', '') });
    if (currentBaths) activeFilters.push({ label: `${currentBaths}+ Baths`, onRemove: () => updateFilter('baths', '') });
    if (currentMinPrice || currentMaxPrice) activeFilters.push({ label: `$${currentMinPrice || '0'} - $${currentMaxPrice || '∞'}`, onRemove: () => { updateFilter('minPrice', ''); updateFilter('maxPrice', ''); } });
    if (currentSqFtMin || currentSqFtMax) activeFilters.push({ label: `${currentSqFtMin || '0'} - ${currentSqFtMax || '∞'} sqft`, onRemove: () => { updateFilter('sqFtMin', ''); updateFilter('sqFtMax', ''); } });
    if (currentStories) activeFilters.push({ label: `${currentStories} Stories`, onRemove: () => updateFilter('stories', '') });
    if (currentGarage) activeFilters.push({ label: `${currentGarage}+ Garage`, onRemove: () => updateFilter('garage', '') });
    currentTags.forEach(t => activeFilters.push({ label: t, onRemove: () => toggleTag(t) }));

    const SectionHeader = ({ id, title }: { id: string; title: string }) => (
        <button onClick={() => toggleSection(id)} className="w-full flex items-center justify-between py-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
            {title}
            {expandedSections[id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
    );

    const inputClass = "w-full p-2 text-sm border border-border rounded-lg bg-background focus:ring-1 focus:ring-primary outline-none";

    return (
        <aside className="w-full lg:w-72 shrink-0 space-y-4">
            <div className={`bg-card border border-border/50 rounded-xl p-5 shadow-sm lg:sticky lg:top-24 max-h-[calc(100vh-120px)] overflow-y-auto ${isPending ? 'opacity-60' : ''}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
                    <div className="flex items-center gap-2 font-bold text-lg">
                        <Filter className="w-5 h-5" /> Filters
                    </div>
                    {hasFilters && (
                        <button onClick={clearAll} className="text-xs text-primary hover:underline font-medium">Clear All</button>
                    )}
                </div>

                {/* Results count */}
                <p className="text-xs text-muted-foreground mb-4">
                    Showing <span className="font-semibold text-foreground">{filteredCount}</span> of {totalCount} plans
                </p>

                {/* Active Filter Pills */}
                {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4 pb-4 border-b border-border/50">
                        {activeFilters.map((f, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                {f.label}
                                <button onClick={f.onRemove} className="hover:bg-primary/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                            </span>
                        ))}
                    </div>
                )}

                {/* STYLE */}
                <div className="border-b border-border/30 pb-3">
                    <SectionHeader id="style" title="Style" />
                    {expandedSections.style && (
                        <div className="space-y-1 mt-1 max-h-48 overflow-y-auto">
                            {styles.map(s => (
                                <label key={s.value} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-muted/50 cursor-pointer text-sm">
                                    <input type="checkbox" checked={(currentStyle || '').split(',').includes(s.value)}
                                        onChange={() => toggleStyle(s.value)} className="rounded border-border accent-primary" />
                                    <span className="flex-1">{s.label}</span>
                                    {s.count !== undefined && <span className="text-xs text-muted-foreground">({s.count})</span>}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* BEDROOMS */}
                <div className="border-b border-border/30 pb-3">
                    <SectionHeader id="beds" title="Bedrooms" />
                    {expandedSections.beds && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {['', '1', '2', '3', '4', '5'].map(v => (
                                <button key={v} onClick={() => updateFilter('beds', v)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${currentBeds === v ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}>
                                    {v ? `${v}+` : 'Any'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* BATHROOMS */}
                <div className="border-b border-border/30 pb-3">
                    <SectionHeader id="baths" title="Bathrooms" />
                    {expandedSections.baths && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {['', '1', '2', '3', '4'].map(v => (
                                <button key={v} onClick={() => updateFilter('baths', v)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${currentBaths === v ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}>
                                    {v ? `${v}+` : 'Any'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* PRICE RANGE */}
                <div className="border-b border-border/30 pb-3">
                    <SectionHeader id="price" title="Price Range" />
                    {expandedSections.price && (
                        <div className="space-y-2 mt-1">
                            <div className="flex gap-2 items-center">
                                <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className={inputClass} />
                                <span className="text-muted-foreground text-xs">to</span>
                                <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className={inputClass} />
                            </div>
                            <button onClick={() => applyRangeFilter('minPrice', 'maxPrice', minPrice, maxPrice)}
                                className="w-full text-xs py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 font-medium">Apply Price</button>
                        </div>
                    )}
                </div>

                {/* SQ FT */}
                <div className="border-b border-border/30 pb-3">
                    <SectionHeader id="sqft" title="Square Feet" />
                    {expandedSections.sqft && (
                        <div className="space-y-2 mt-1">
                            <div className="flex gap-2 items-center">
                                <input type="number" placeholder="Min" value={sqFtMin} onChange={e => setSqFtMin(e.target.value)} className={inputClass} />
                                <span className="text-muted-foreground text-xs">to</span>
                                <input type="number" placeholder="Max" value={sqFtMax} onChange={e => setSqFtMax(e.target.value)} className={inputClass} />
                            </div>
                            <button onClick={() => applyRangeFilter('sqFtMin', 'sqFtMax', sqFtMin, sqFtMax)}
                                className="w-full text-xs py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 font-medium">Apply Sq Ft</button>
                        </div>
                    )}
                </div>

                {/* STORIES */}
                <div className="border-b border-border/30 pb-3">
                    <SectionHeader id="stories" title="Stories" />
                    {expandedSections.stories && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {['', '1', '2', '3'].map(v => (
                                <button key={v} onClick={() => updateFilter('stories', v)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${currentStories === v ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}>
                                    {v ? (v === '3' ? '3+' : v) : 'Any'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* GARAGE */}
                <div className="border-b border-border/30 pb-3">
                    <SectionHeader id="garage" title="Garage Bays" />
                    {expandedSections.garage && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {['', '1', '2', '3'].map(v => (
                                <button key={v} onClick={() => updateFilter('garage', v)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${currentGarage === v ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}>
                                    {v ? `${v}+` : 'Any'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* TAGS */}
                {tags.length > 0 && (
                    <div className="border-b border-border/30 pb-3">
                        <SectionHeader id="tags" title="Features & Tags" />
                        {expandedSections.tags && (
                            <div className="space-y-1 mt-1 max-h-48 overflow-y-auto">
                                {tags.map(t => (
                                    <label key={t.value} className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-muted/50 cursor-pointer text-sm">
                                        <input type="checkbox" checked={currentTags.includes(t.value)} onChange={() => toggleTag(t.value)} className="rounded border-border accent-primary" />
                                        <span className="flex-1 truncate">{t.label}</span>
                                        {t.count !== undefined && <span className="text-xs text-muted-foreground">({t.count})</span>}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* DYNAMIC ATTRIBUTES */}
                {attributeCategories.map(cat => (
                    <div key={cat.name} className="border-b border-border/30 pb-3">
                        <SectionHeader id={`attr_${cat.name}`} title={cat.name} />
                        {expandedSections[`attr_${cat.name}`] && (
                            <div className="space-y-1 mt-1 max-h-40 overflow-y-auto">
                                {cat.values.map(v => {
                                    const paramKey = `attr_${cat.name.toLowerCase().replace(/\s+/g, '_')}`;
                                    const currentAttrVals = (searchParams.get(paramKey) || '').split(',').filter(Boolean);
                                    const isChecked = currentAttrVals.includes(v.value);
                                    return (
                                        <label key={v.value} className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-muted/50 cursor-pointer text-sm">
                                            <input type="checkbox" checked={isChecked} onChange={() => {
                                                const newVals = isChecked ? currentAttrVals.filter(x => x !== v.value) : [...currentAttrVals, v.value];
                                                updateFilter(paramKey, newVals.join(','));
                                            }} className="rounded border-border accent-primary" />
                                            <span className="flex-1 truncate">{v.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}

                {/* SORT */}
                <div className="pt-2">
                    <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Sort By</label>
                    <select value={currentSort} onChange={e => updateFilter('sort', e.target.value)}
                        className="w-full p-2 text-sm border border-border rounded-lg bg-background">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="popular">Most Popular</option>
                        <option value="sqft_desc">Largest First</option>
                        <option value="sqft_asc">Smallest First</option>
                    </select>
                </div>
            </div>
        </aside>
    );
}
