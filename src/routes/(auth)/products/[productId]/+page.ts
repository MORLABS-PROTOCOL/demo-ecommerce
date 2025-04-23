// src/routes/products/[productId]/+page.ts
import { getProductById } from '$lib/controls.svelte';

export async function load({ params }) {
    const product = await getProductById(params.productId);
    return { product };
}
