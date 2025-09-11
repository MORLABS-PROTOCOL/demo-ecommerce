<script lang="ts">
	import { page } from "$app/state";
	import ProductViews from "$lib/components/ProductViews.svelte";
	import { getProductsBySearch } from "$lib/controls.svelte";
	import { onMount } from "svelte";
	let products: any[] = $state([]);
	let searchTerm = $state('');

	searchTerm = page.params.searchTerm;
	(async () => {
		products = await getProductsBySearch(page.params.searchTerm);
	})();
</script>

<ProductViews {products} title={searchTerm} />