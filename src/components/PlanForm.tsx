
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaTrash, FaImage } from 'react-icons/fa';
import { Plan, Image as PlanImage } from '@prisma/client';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { X } from 'lucide-react';

interface AttributeCategory {
    id: string;
    name: string;
    values: { id: string; value: string }[];
}

interface PlanFormProps {
    initialData?: any;
    isEditing?: boolean;
}

const STYLE_OPTIONS = [
    'Modern', 'Farmhouse', 'Craftsman', 'Coastal', 'Ranch', 'Luxury',
    'Barndominium', 'Colonial', 'Victorian', 'Mediterranean', 'Cottage',
    'Tudor', 'A-Frame', 'Cabin', 'Contemporary'
];

const SPEC_CATEGORIES = ['General', 'Dimensions', 'Area', 'Roof', 'Foundation', 'Exterior', 'Construction', 'Garage'];
const FOUNDATION_OPTIONS = ['Slab', 'Crawlspace', 'Basement', 'Daylight Basement', 'Pier'];

export default function PlanForm({ initialData, isEditing = false }: PlanFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<AttributeCategory[]>([]);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

    // Tags
    const [allTags, setAllTags] = useState<{ id: string; name: string }[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    // Form State
    const [formData, setFormData] = useState<any>({
        planNumber: '', title: '', description: '', price: '',
        sqFt: '', sqFtHeated: '', sqFtMain: '', sqFtUpper: '', sqFtLower: '',
        sqFtGarage: '', sqFtPorch: '', sqFtBonus: '',
        beds: '', baths: '', halfBaths: '0', stories: '', garage: '',
        width: '', depth: '', height: '', style: '',
        isTrending: false, isNewPlan: false,
        foundationTypes: '', roofPitch: '', roofType: '',
        exteriorWall: '', framingType: '',
        priceReverse: '', priceCAD: '', pricePDF: '',
    });

    // Images
    const [images, setImages] = useState<{ url: string; title: string; description: string; isPrimary: boolean; type: string }[]>([
        { url: '', title: '', description: '', isPrimary: true, type: 'IMAGE' }
    ]);

    // Specs
    const [specs, setSpecs] = useState<{ category: string; label: string; value: string }[]>([]);

    // Content Sections
    const [sections, setSections] = useState<{ title: string; content: string; imageUrl: string }[]>([]);

    useEffect(() => {
        fetch('/api/admin/attributes').then(r => r.json()).then(setCategories).catch(console.error);
        fetch('/api/admin/tags').then(r => r.json()).then(setAllTags).catch(console.error);
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                price: Number(initialData.price),
                width: initialData.width || '', depth: initialData.depth || '', height: initialData.height || '',
                sqFtHeated: initialData.sqFtHeated || '', sqFtMain: initialData.sqFtMain || '',
                sqFtUpper: initialData.sqFtUpper || '', sqFtLower: initialData.sqFtLower || '',
                sqFtGarage: initialData.sqFtGarage || '', sqFtPorch: initialData.sqFtPorch || '',
                sqFtBonus: initialData.sqFtBonus || '', halfBaths: initialData.halfBaths || '0',
                foundationTypes: initialData.foundationTypes || '', roofPitch: initialData.roofPitch || '',
                roofType: initialData.roofType || '', exteriorWall: initialData.exteriorWall || '',
                framingType: initialData.framingType || '',
                priceReverse: initialData.priceReverse ? Number(initialData.priceReverse) : '',
                priceCAD: initialData.priceCAD ? Number(initialData.priceCAD) : '',
                pricePDF: initialData.pricePDF ? Number(initialData.pricePDF) : '',
            });
            if (initialData.images?.length > 0) {
                setImages(initialData.images.map((img: any) => ({
                    url: img.url, title: img.title || '', description: img.description || '',
                    isPrimary: img.isPrimary, type: img.type || 'IMAGE'
                })));
            }
            if (initialData.attributes) {
                const attrs: Record<string, string> = {};
                initialData.attributes.forEach((attr: any) => {
                    if (attr.attributeValue?.categoryId) attrs[attr.attributeValue.categoryId] = attr.attributeValue.id;
                });
                setSelectedAttributes(attrs);
            }
            if (initialData.specs) setSpecs(initialData.specs.map((s: any) => ({ category: s.category || 'General', label: s.label, value: s.value })));
            if (initialData.tags) setSelectedTags(initialData.tags.map((t: any) => t.name));
            if (initialData.sections) setSections(initialData.sections.map((s: any) => ({ title: s.title || '', content: s.content, imageUrl: s.imageUrl || '' })));
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleAttributeChange = (categoryId: string, valueId: string) => {
        setSelectedAttributes(prev => ({ ...prev, [categoryId]: valueId }));
    };

    // Tag handlers
    const addTag = (tagName: string) => {
        const name = tagName.trim();
        if (name && !selectedTags.includes(name)) {
            setSelectedTags(prev => [...prev, name]);
        }
        setTagInput('');
    };

    const removeTag = (tagName: string) => {
        setSelectedTags(prev => prev.filter(t => t !== tagName));
    };

    // Image handlers
    const handleImageChange = (index: number, field: string, value: string | boolean) => {
        const newImages: any = [...images];
        if (field === 'isPrimary' && value === true) newImages.forEach((img: any) => img.isPrimary = false);
        newImages[index][field] = value;
        setImages(newImages);
    };
    const addImage = () => setImages([...images, { url: '', title: '', description: '', isPrimary: false, type: 'IMAGE' }]);
    const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

    // Spec handlers
    const addSpec = () => setSpecs([...specs, { category: 'General', label: '', value: '' }]);
    const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));
    const handleSpecChange = (index: number, field: 'category' | 'label' | 'value', value: string) => {
        const n = [...specs]; n[index][field] = value; setSpecs(n);
    };

    // Section handlers
    const addSection = () => setSections([...sections, { title: '', content: '', imageUrl: '' }]);
    const removeSection = (index: number) => setSections(sections.filter((_, i) => i !== index));
    const handleSectionChange = (index: number, field: 'title' | 'content' | 'imageUrl', value: string) => {
        const n = [...sections]; n[index][field] = value; setSections(n);
    };

    // Foundation checkbox handler
    const toggleFoundation = (f: string) => {
        const current = formData.foundationTypes ? formData.foundationTypes.split(',').filter(Boolean) : [];
        const updated = current.includes(f) ? current.filter((x: string) => x !== f) : [...current, f];
        setFormData({ ...formData, foundationTypes: updated.join(',') });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            ...formData, images, specs, sections,
            tags: selectedTags,
            attributes: Object.values(selectedAttributes).filter(Boolean)
        };
        try {
            const url = isEditing && initialData ? `/api/plans/${initialData.id}` : '/api/plans';
            const res = await fetch(url, { method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (res.ok) { toast({ title: "Success", description: "Plan saved." }); router.push('/admin/plans'); router.refresh(); }
            else toast({ title: "Error", description: "Failed to save plan.", variant: "destructive" });
        } catch { toast({ title: "Error", description: "Unexpected error.", variant: "destructive" }); }
        finally { setLoading(false); }
    };

    const inputClass = "w-full p-2 border rounded bg-background text-sm";
    const labelClass = "block text-sm font-medium mb-1";

    return (
        <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-lg border border-border space-y-8">
            <h2 className="text-2xl font-bold">{isEditing ? 'Edit Plan' : 'Add New Plan'}</h2>

            {/* === BASIC INFO === */}
            <fieldset className="border border-border rounded-lg p-6 space-y-4">
                <legend className="text-lg font-semibold px-2">Basic Information</legend>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClass}>Plan Title *</label><input name="title" value={formData.title} onChange={handleChange} required className={inputClass} /></div>
                    <div><label className={labelClass}>Plan Number *</label><input name="planNumber" value={formData.planNumber} onChange={handleChange} required className={inputClass} /></div>
                </div>
                <div><label className={labelClass}>Description *</label><textarea name="description" value={formData.description} onChange={handleChange} rows={4} className={inputClass} /></div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>Architectural Style</label>
                        <select name="style" value={formData.style} onChange={handleChange} className={inputClass}>
                            <option value="">Select Style...</option>
                            {STYLE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="flex items-end gap-4">
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isTrending" checked={formData.isTrending} onChange={handleChange} /> Trending</label>
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isNewPlan" checked={formData.isNewPlan} onChange={handleChange} /> New Plan</label>
                    </div>
                </div>
            </fieldset>

            {/* === PRICING === */}
            <fieldset className="border border-border rounded-lg p-6 space-y-4">
                <legend className="text-lg font-semibold px-2">Pricing</legend>
                <div className="grid grid-cols-4 gap-4">
                    <div><label className={labelClass}>Base Price ($) *</label><input name="price" type="number" value={formData.price} onChange={handleChange} required className={inputClass} /></div>
                    <div><label className={labelClass}>PDF Price ($)</label><input name="pricePDF" type="number" value={formData.pricePDF} onChange={handleChange} className={inputClass} placeholder="Optional" /></div>
                    <div><label className={labelClass}>CAD Price ($)</label><input name="priceCAD" type="number" value={formData.priceCAD} onChange={handleChange} className={inputClass} placeholder="Optional" /></div>
                    <div><label className={labelClass}>Reverse Price ($)</label><input name="priceReverse" type="number" value={formData.priceReverse} onChange={handleChange} className={inputClass} placeholder="Optional" /></div>
                </div>
            </fieldset>

            {/* === DIMENSIONS & AREA === */}
            <fieldset className="border border-border rounded-lg p-6 space-y-4">
                <legend className="text-lg font-semibold px-2">Dimensions & Area</legend>
                <div className="grid grid-cols-4 gap-4">
                    <div><label className={labelClass}>Beds *</label><input name="beds" type="number" value={formData.beds} onChange={handleChange} required className={inputClass} /></div>
                    <div><label className={labelClass}>Full Baths *</label><input name="baths" type="number" value={formData.baths} onChange={handleChange} required className={inputClass} /></div>
                    <div><label className={labelClass}>Half Baths</label><input name="halfBaths" type="number" value={formData.halfBaths} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>Stories *</label><input name="stories" type="number" value={formData.stories} onChange={handleChange} required className={inputClass} /></div>
                    <div><label className={labelClass}>Garage Bays *</label><input name="garage" type="number" value={formData.garage} onChange={handleChange} required className={inputClass} /></div>
                    <div><label className={labelClass}>Width (ft)</label><input name="width" type="number" value={formData.width} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>Depth (ft)</label><input name="depth" type="number" value={formData.depth} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>Height (ft)</label><input name="height" type="number" value={formData.height} onChange={handleChange} className={inputClass} /></div>
                </div>
                <div className="border-t border-border pt-4">
                    <p className="text-sm font-semibold mb-2 text-muted-foreground">Area Breakdown (sq ft)</p>
                    <div className="grid grid-cols-4 gap-4">
                        <div><label className={labelClass}>Total Sq Ft *</label><input name="sqFt" type="number" value={formData.sqFt} onChange={handleChange} required className={inputClass} /></div>
                        <div><label className={labelClass}>Heated Sq Ft</label><input name="sqFtHeated" type="number" value={formData.sqFtHeated} onChange={handleChange} className={inputClass} /></div>
                        <div><label className={labelClass}>Main Floor</label><input name="sqFtMain" type="number" value={formData.sqFtMain} onChange={handleChange} className={inputClass} /></div>
                        <div><label className={labelClass}>Upper Floor</label><input name="sqFtUpper" type="number" value={formData.sqFtUpper} onChange={handleChange} className={inputClass} /></div>
                        <div><label className={labelClass}>Lower/Basement</label><input name="sqFtLower" type="number" value={formData.sqFtLower} onChange={handleChange} className={inputClass} /></div>
                        <div><label className={labelClass}>Garage</label><input name="sqFtGarage" type="number" value={formData.sqFtGarage} onChange={handleChange} className={inputClass} /></div>
                        <div><label className={labelClass}>Porch</label><input name="sqFtPorch" type="number" value={formData.sqFtPorch} onChange={handleChange} className={inputClass} /></div>
                        <div><label className={labelClass}>Bonus Room</label><input name="sqFtBonus" type="number" value={formData.sqFtBonus} onChange={handleChange} className={inputClass} /></div>
                    </div>
                </div>
            </fieldset>

            {/* === CONSTRUCTION DETAILS === */}
            <fieldset className="border border-border rounded-lg p-6 space-y-4">
                <legend className="text-lg font-semibold px-2">Construction Details</legend>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><label className={labelClass}>Roof Pitch</label><input name="roofPitch" value={formData.roofPitch} onChange={handleChange} className={inputClass} placeholder="e.g. 9:12" /></div>
                    <div><label className={labelClass}>Roof Type</label><input name="roofType" value={formData.roofType} onChange={handleChange} className={inputClass} placeholder="e.g. Hip, Gable" /></div>
                    <div><label className={labelClass}>Exterior Wall</label><input name="exteriorWall" value={formData.exteriorWall} onChange={handleChange} className={inputClass} placeholder="e.g. 2x6" /></div>
                    <div><label className={labelClass}>Framing Type</label><input name="framingType" value={formData.framingType} onChange={handleChange} className={inputClass} placeholder="e.g. Stick" /></div>
                </div>
                <div>
                    <label className={labelClass}>Foundation Types Available</label>
                    <div className="flex flex-wrap gap-3 mt-1">
                        {FOUNDATION_OPTIONS.map(f => (
                            <label key={f} className="flex items-center gap-1.5 text-sm bg-card px-3 py-1.5 rounded border cursor-pointer hover:border-primary">
                                <input type="checkbox" checked={(formData.foundationTypes || '').split(',').includes(f)} onChange={() => toggleFoundation(f)} />
                                {f}
                            </label>
                        ))}
                    </div>
                </div>
            </fieldset>

            {/* === TAGS === */}
            <fieldset className="border border-border rounded-lg p-6 space-y-4">
                <legend className="text-lg font-semibold px-2">Tags & Features</legend>
                <div className="flex flex-wrap gap-2 min-h-[32px]">
                    {selectedTags.map(tag => (
                        <span key={tag} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            {tag} <button type="button" onClick={() => removeTag(tag)}><X size={12} /></button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
                        placeholder="Type a tag and press Enter (e.g., Open Floor Plan, Vaulted Ceiling)"
                        className={inputClass + " flex-1"} list="tag-suggestions" />
                    <button type="button" onClick={() => addTag(tagInput)} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm">Add</button>
                </div>
                <datalist id="tag-suggestions">
                    {allTags.filter(t => !selectedTags.includes(t.name)).map(t => <option key={t.id} value={t.name} />)}
                </datalist>
            </fieldset>

            {/* === ATTRIBUTES === */}
            <fieldset className="border border-border rounded-lg p-6 space-y-4">
                <legend className="text-lg font-semibold px-2">Plan Attributes</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categories.map(cat => (
                        <div key={cat.id}>
                            <label className={labelClass}>{cat.name}</label>
                            <select className={inputClass} value={selectedAttributes[cat.id] || ''} onChange={e => handleAttributeChange(cat.id, e.target.value)}>
                                <option value="">Select {cat.name}...</option>
                                {cat.values.map(val => <option key={val.id} value={val.id}>{val.value}</option>)}
                            </select>
                        </div>
                    ))}
                </div>
            </fieldset>

            {/* === CUSTOM SPECS === */}
            <fieldset className="border border-border rounded-lg p-6 space-y-4">
                <legend className="text-lg font-semibold px-2">Custom Specifications</legend>
                {specs.map((spec, i) => (
                    <div key={i} className="flex gap-2 items-center bg-card p-3 rounded border">
                        <select value={spec.category} onChange={e => handleSpecChange(i, 'category', e.target.value)} className="p-2 border rounded bg-background text-sm w-36">
                            {SPEC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input placeholder="Label" value={spec.label} onChange={e => handleSpecChange(i, 'label', e.target.value)} className="p-2 border rounded flex-1 bg-background text-sm" />
                        <input placeholder="Value" value={spec.value} onChange={e => handleSpecChange(i, 'value', e.target.value)} className="p-2 border rounded flex-1 bg-background text-sm" />
                        <button type="button" onClick={() => removeSpec(i)} className="text-red-500 p-2 hover:bg-red-50 rounded"><FaTrash /></button>
                    </div>
                ))}
                <button type="button" onClick={addSpec} className="flex items-center gap-2 text-sm text-primary hover:underline"><FaPlus /> Add Specification</button>
            </fieldset>

            {/* === CONTENT SECTIONS === */}
            <fieldset className="border border-border rounded-lg p-6 space-y-4">
                <legend className="text-lg font-semibold px-2">Content Sections (Rich Detail Blocks)</legend>
                <p className="text-sm text-muted-foreground">Add detailed descriptions with images. These appear as story blocks on the plan page (e.g., "Master Suite", "Kitchen Details").</p>
                {sections.map((sec, i) => (
                    <div key={i} className="bg-card p-4 rounded border space-y-3">
                        <div className="flex gap-2">
                            <input placeholder="Section Title (e.g., Grand Master Suite)" value={sec.title} onChange={e => handleSectionChange(i, 'title', e.target.value)} className={inputClass + " flex-1"} />
                            <button type="button" onClick={() => removeSection(i)} className="text-red-500 p-2 hover:bg-red-50 rounded"><FaTrash /></button>
                        </div>
                        <textarea placeholder="Description paragraph..." value={sec.content} onChange={e => handleSectionChange(i, 'content', e.target.value)} rows={3} className={inputClass} />
                        <input placeholder="Image URL (optional)" value={sec.imageUrl} onChange={e => handleSectionChange(i, 'imageUrl', e.target.value)} className={inputClass} />
                    </div>
                ))}
                <button type="button" onClick={addSection} className="flex items-center gap-2 text-sm text-primary hover:underline"><FaPlus /> Add Content Section</button>
            </fieldset>

            {/* === MEDIA GALLERY === */}
            <fieldset className="border border-border rounded-lg p-6 space-y-4">
                <legend className="text-lg font-semibold px-2">Media Gallery</legend>
                {images.map((img, index) => (
                    <div key={index} className="flex gap-3 items-start p-3 bg-card rounded border">
                        <div className="bg-muted w-[80px] h-[60px] flex items-center justify-center rounded overflow-hidden flex-shrink-0">
                            {img.url ? <img src={img.url} className="w-full h-full object-cover" /> : <FaImage className="text-gray-400" />}
                        </div>
                        <div className="flex-1 grid gap-2">
                            <div className="flex gap-2">
                                <input placeholder="Image URL" value={img.url} onChange={e => handleImageChange(index, 'url', e.target.value)} className={inputClass + " flex-1"} />
                                <select value={img.type} onChange={e => handleImageChange(index, 'type', e.target.value)} className="p-2 border rounded bg-background text-sm w-40">
                                    <option value="IMAGE">Exterior Image</option>
                                    <option value="INTERIOR">Interior Image</option>
                                    <option value="BLUEPRINT">Floor Plan</option>
                                    <option value="ELEVATION">Elevation</option>
                                    <option value="PDF">Blueprint (PDF)</option>
                                    <option value="360_VIEW">360 View</option>
                                    <option value="3D_MODEL">3D Model</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input placeholder="Title (e.g., Main Floor Plan)" value={img.title} onChange={e => handleImageChange(index, 'title', e.target.value)} className={inputClass} />
                                <input placeholder="Description" value={img.description} onChange={e => handleImageChange(index, 'description', e.target.value)} className={inputClass} />
                            </div>
                            <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={img.isPrimary} onChange={e => handleImageChange(index, 'isPrimary', e.target.checked)} /> Primary Image</label>
                        </div>
                        <button type="button" onClick={() => removeImage(index)} className="text-red-500 p-2 hover:bg-red-50 rounded"><FaTrash /></button>
                    </div>
                ))}
                <button type="button" onClick={addImage} className="flex items-center gap-2 text-sm text-primary hover:underline"><FaPlus /> Add Media</button>
            </fieldset>

            {/* === SUBMIT === */}
            <div className="flex gap-4 pt-4 border-t border-border">
                <button type="submit" disabled={loading} className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold disabled:opacity-50">
                    {loading ? 'Saving...' : (isEditing ? 'Update Plan' : 'Create Plan')}
                </button>
                <button type="button" onClick={() => router.back()} className="px-6 py-3 border rounded-lg">Cancel</button>
            </div>
        </form>
    );
}
