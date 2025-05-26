<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { pocketbase, validateAuthState } from '$lib/controls.svelte';
	import { Button, FormGroup } from 'carbon-components-svelte';
	import { onMount } from 'svelte';

	onMount(async () => {
		validateAuthState();
	});
</script>

<Seo title="Vixstores | Profile" description="vixstores profile" keywords="vixstores, profile" />

<FormGroup>
	<Button
		on:click={async () => {
			pocketbase.authStore.clear();
			window.location.reload();
		}}>Logout</Button
	>
</FormGroup>
