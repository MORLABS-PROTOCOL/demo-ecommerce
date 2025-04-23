<script lang="ts">
	import { addToCart, refreshCart } from '$lib/controls.svelte';
	import { Button } from 'carbon-components-svelte';
</script>

<Button
	on:click={async () => {
		await addToCart('dd0d65vf0pfyzua', 1);
		await refreshCart();
	}}
	>Add to cart !
</Button>
