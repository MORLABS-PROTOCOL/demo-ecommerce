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

		<!-- Image with sliding effect -->
		{#key current}
			<div class="absolute w-1/2 mx-auto flex justify-start pl-12 items-center">
				<div class="flex-col gap-y-4">
					<h2 class="text-xl sm:text-2xl md:text-3xl font-semibold text-blue-600 py-4 sm:py-6">
						Welcome to Vixstores!
					</h2>
					<div class="text-3xl sm:text-5xl md:text-7xl font-extrabold pb-4 sm:pb-6 text-black">
						Explore our tech collection perfect gadgets
					</div>
					<div>
						<button
							class="bg-blue-600 px-4 sm:px-6 text-base sm:text-lg py-2 sm:py-3 flex items-center rounded-md text-white font-semibold"
						>
							Shop Now !
						</button>
					</div>
				</div>
			</div>
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
