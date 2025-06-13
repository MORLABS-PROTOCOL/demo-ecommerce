<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	let { images } = $props();

	let current = $state(0);
	let direction = 1;

	function prev() {
		direction = -1;
		current = (current - 1 + images.length) % images.length;
	}

	function next() {
		direction = 1;
		current = (current + 1) % images.length;
	}

	$effect(() => {
		if (images && images.length > 0) {
			current = 0; // Start with the first image
		}
		setTimeout(() => {
			if (current >= images.length) {
				current = 0; // Reset to the first image if out of bounds
			} else {
				next();
			}
		}, 1000);
	});
</script>

{#if images && images.length > 0}
	<div class="relative w-screen flex items-center h-screen">
		<!-- Prev Button -->
		<button
			class="absolute left-2 z-10 bg-white/70 hover:bg-white rounded-full p-2 shadow"
			onclick={prev}
			aria-label="Previous"
		>
			&#8592;
		</button>
		<div class="absolute w-1/2 mx-auto flex justify-start pl-12 items-center">
			<div class="flex-col gap-y-4">
				<h2 class="">Welcome to Vixstores!</h2>
				<div class="text-5xl font-extrabold">Shop Now!</div>
			</div>
		</div>
		<!-- Image with sliding effect -->
		{#key current}
			<img
				src={images[current].imageUrl}
				alt={images[current].alt || `Image_${current + 1}`}
				class="w-full h-full object-cover"
				in:fly={{ x: 100 * direction, duration: 300 }}
				out:fly={{ x: -100 * direction, duration: 300 }}
			/>
		{/key}

		<!-- Next Button -->
		<button
			class="absolute right-2 z-10 bg-white/70 hover:bg-white rounded-full p-2 shadow"
			onclick={next}
			aria-label="Next"
		>
			&#8594;
		</button>
	</div>
{:else}
	<p class="text-center h-64 flex items-center justify-center">...</p>
{/if}
