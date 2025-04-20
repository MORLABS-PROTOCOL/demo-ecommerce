<script>
	import { onMount } from 'svelte';
	import { validateAuthState } from '$lib/controls.svelte';

	onMount(() => {
		let authState = validateAuthState();
	});
</script>
