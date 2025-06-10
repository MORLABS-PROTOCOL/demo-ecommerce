<script lang="ts">
	import { calculateNewPrice, currency } from '$lib/controls.svelte';
	import { CheckmarkOutline, StarFilled } from 'carbon-icons-svelte';
	import { onMount } from 'svelte';
	import Exit from './Icons/Exit-sm.svelte';
	import Heart from './Icons/Heart.svelte';

	let { price, title, quantity, flashSale, image, discountPercentage, productId, dateCreated } =
		$props();
	let newPrice: number = $state(0);

	onMount(() => {
		newPrice = calculateNewPrice(price, discountPercentage);
	});
</script>

<div
	class="relative group flex space-x-5 items-center w-full h-full lg:p-[30px] sm:p-5 p-2 bg-white"
>
	<!-- Heart Icon (hidden by default, slides in on hover) -->
	<div
		class="absolute top-2 right-2 transition-transform duration-300 ease-in-out -translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 z-10"
	>
		<Heart />
	</div>

	<!-- Product Image -->
	<div class="w-[50%] flex items-center justify-center">
		<img src={image} alt={title} class="object-contain h-32 md:h-40" />
	</div>

	<!-- Product Info -->
	<div class="w-[50%] flex flex-col gap-y-4">
		<!-- Ratings -->
		<div class="flex items-center mb-1">
			{#each Array(5) as _, i}
				<StarFilled size={17} fill="gold" class="mr-0.5" />
			{/each}
		</div>

		<!-- Title -->
		<h3 class="text-sm md:text-base font-semibold text-gray-900 mb-1 leading-snug">
			{title}
		</h3>

		<!-- Pricing -->
		<div class="flex items-center gap-2 mb-2">
			{#if discountPercentage > 0}
				<p class="text-sm md:text-base line-through text-gray-400">
					{currency()}{price.toLocaleString()}
				</p>
				<p class="text-sm md:text-base font-bold">
					{currency()}{newPrice.toLocaleString()}
				</p>
			{:else}
				<p class="text-sm md:text-base text-black font-bold">
					{currency()}{price.toLocaleString()}
				</p>
			{/if}
		</div>

		<!-- Add to Cart Button -->
		<button
			class="self-start bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-semibold px-4 py-2"
		>
			Add To Cart
		</button>
	</div>
</div>
