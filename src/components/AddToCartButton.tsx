
'use client';

import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ plan }: { plan: any }) {
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart({
            id: plan.id,
            planNumber: plan.planNumber,
            title: plan.title,
            price: Number(plan.price),
            image: plan.images.find((img: any) => img.isPrimary)?.url || '/placeholder.jpg'
        });
        alert('Added to cart!');
    };

    return (
        <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.5rem' }}
            onClick={handleAddToCart}
        >
            Add to Cart
        </button>
    );
}
