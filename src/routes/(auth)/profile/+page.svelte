<script lang="ts">
	import { pocketbase, validateAuthState } from '$lib/controls.svelte';
	import { Button } from 'carbon-components-svelte';
	import { onMount } from 'svelte';

	onMount(async () => {
		validateAuthState();
	});
</script>

<Button
	on:click={async () => {
		pocketbase.authStore.clear();
		window.location.reload();
	}}>Logout</Button
>
