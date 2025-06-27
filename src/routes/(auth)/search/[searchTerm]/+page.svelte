<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { page } from '$app/state';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import { fuzzySearchProducts } from '$lib/controls.svelte'; // Adjust the import path as needed
	import { onMount } from 'svelte';

	let searchTerm = $state('');
	let products: any[] = $state([]);

	// Get searchTerm from page params and fetch products
	onMount(async () => {
		searchTerm = page.params.searchTerm || '';
		products = await fuzzySearchProducts(searchTerm);
	});
</script>

<Seo title="Vixstores | Search" description="search" keywords="vixstores, search" />
<div class="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
	<h1 class="text-sm pt-6">Search results for: <b class="font-semibold">"{searchTerm}"</b></h1>

	{#if products.length > 0}
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
			{#each products as product (product.id)}
				<div class="flex justify-center">
					<ProductCard
						price={product.price}
						title={product.title}
						quantity={product.quantity}
						flashSale={product.flashSale}
						image={product.imageUrl}
						discountPercentage={product.discountPercentage}
						productId={product.productId}
						dateCreated={product.dateCreated}
						threshold={product.threshold}
					/>
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-gray-500 text-center mt-10">No products found.</p>
	{/if}
</div>
