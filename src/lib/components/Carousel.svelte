<script lang="ts">
	import { getRandomNumber } from '$lib/controls.svelte';
	let layoutIndex = getRandomNumber();
	export let images: any[] = [];
</script>

{#if images && images.length > 0}
	<div class="grid grid-cols-1 md:grid-cols-3 gap-2 w-full h-fit text-center">
		<div class="md:col-span-2 hidden md:block md:row-span-2 w-full h-64 md:h-full">
			<img
				src={images[0].imageUrl}
				alt="Banner Image 2"
				class="w-full h-full object-cover sm:block hidden"
			/>
		</div>

		<img
			src={images[1].imageUrl}
			alt="Banner Image 2"
			class="w-full h-auto object-cover sm:hidden block"
		/>

		<img src={images[1].imageUrl} alt="Banner Image 2" class="w-full h-auto object-cover" />
		<img src={images[2].imageUrl} alt="Banner Image 3" class="w-full h-auto object-cover" />
	</div>
{:else}
	<p>Loading ads...</p>
{/if}
