<script lang="ts">
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
</script>

{#if images && images.length > 0}
	<div class="relative w-full flex items-center justify-center h-64">
		<!-- Prev Button -->
		<button
			class="absolute left-2 z-10 bg-white/70 hover:bg-white rounded-full p-2 shadow"
			onclick={prev}
			aria-label="Previous"
		>
			&#8592;
		</button>

		<!-- Image with sliding effect -->
		{#key current}
			<img
				src={images[current].imageUrl}
				alt={images[current].alt || `Image ${current + 1}`}
				class="w-full h-64 object-cover rounded"
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
