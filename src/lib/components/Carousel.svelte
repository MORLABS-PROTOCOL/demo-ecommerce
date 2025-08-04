<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	let { images } = $props();

	let current = $state(0);
	let direction = $state(1);

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
				current = 0;
			} else {
				next();
			}
		}, 1000);
	});
</script>

{#if images && images.length > 0}
	<div class="relative w-screen flex items-center h-full md:h-screen">
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
			<div
				class="absolute inset-0 flex items-center justify-start px-4 sm:px-8 pt-8 pb-4 text-left md:p-12"
			>
				<div class="w-full space-y-3 max-w-[95%] md:w-2/3 lg:w-1/2">
					<h2 class="text-blue-600 text-xl sm:text-3xl font-semibold">
						Welcome to Vixstores!
					</h2>
					<div class="text-black text-2xl sm:text-5xl font-extrabold leading-tight break-words max-w-full">
						Explore our tech collection perfect gadgets
					</div>
					<div>
						<button class="bg-blue-600 text-white text-sm sm:text-base font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-md w-fit hover:bg-blue-700 transition">
							Shop Now
						</button>
					</div>
				</div>
			</div>

			<img
				src={images[current].imageUrl}
				alt={images[current].alt || `Image_${current + 1}`}
				class="w-[100%] md:w-full h-[50vh] md:h-full object-cover"
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
