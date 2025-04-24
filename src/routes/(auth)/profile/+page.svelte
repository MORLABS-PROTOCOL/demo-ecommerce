<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { pocketbase, validateAuthState } from '$lib/controls.svelte';
	import { Button } from 'carbon-components-svelte';
	import { onMount } from 'svelte';

	onMount(async () => {
		validateAuthState();
	});
</script>

<Seo title="Vikstores | Profile" description="vikstores profile" keywords="vikstores, profile" />

<Button
	on:click={async () => {
		pocketbase.authStore.clear();
		window.location.reload();
	}}>Logout</Button
>
