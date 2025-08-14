<script lang="ts">
	import { page } from '$app/state';
	import ProductViews from '$lib/components/ProductViews.svelte';
	import { getProductsByCategory } from '$lib/controls.svelte';
	import { onMount } from 'svelte';
	let products: any[] = $state([]);
	onMount(async () => {
		products = await getProductsByCategory(page.params.categoryName);
	});
</script>

<ProductViews {products} />
