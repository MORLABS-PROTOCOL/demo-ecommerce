<script lang="ts">
	import { calculateNewPrice, currency } from '$lib/controls.svelte';
	import { CheckmarkOutline, StarFilled } from 'carbon-icons-svelte';
	import { onMount } from 'svelte';
	import Exit from './Icons/Exit-sm.svelte';
	import Heart from './Icons/Heart.svelte';

	let { price, title, quantity, flashSale, image, discountPercentage, productId } = $props();
	let newPrice: number = 0;

	onMount(() => {
		newPrice = calculateNewPrice(price, discountPercentage);
	});
</script>

<div
	class="group relative md:w-[310px] w-[518px] h-auto md:h-[442px] bg-white p-4 border transition-shadow duration-300"
>
	<!-- Product Image with NEW Badge -->
	<div class="relative aspect-square w-full mb-4 flex items-center justify-center">
		<img src={image} alt={title} class="w-full h-full object-contain" />
		{#if flashSale}
			<p
				class="absolute top-2 left-2 text-xs font-semibold text-white bg-yellow-400 px-3 py-1 rounded-full z-10"
			>
				NEW
			</p>
			{#if discountPercentage}
				<p
					class="absolute top-2 right-2 text-xs font-semibold text-white bg-red-500 px-3 py-1 rounded-full z-10"
				>
					-{discountPercentage}%
				</p>
			{/if}
		{/if}
	</div>

	<!-- Heart Wishlist Button -->
	<div
		class="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
	>
		<button
			class="bg-white shadow-md p-2 rounded-full hover:bg-gray-50 transition-colors"
			aria-label="Add to wishlist"
		>
			<Heart />
		</button>
	</div>

	<div class="space-y-2">
		<!-- Title -->
		<a href="/product/{productId}" class="block">
			<h3 class="text-sm font-medium text-gray-900 line-clamp-2 transition-colors">
				{title}
			</h3>
		</a>

		<!-- Rating -->
		<div class="flex items-center">
			{#each Array(5) as _, i}
				<StarFilled size={16} fill="gold" class="mr-0.5" />
			{/each}
		</div>

		<!-- Pricing -->
		<div class="flex items-center gap-2">
			{#if discountPercentage}
				<p class="text-lg font-bold text-red-600">{currency()}{newPrice.toLocaleString()}</p>
				<p class="text-sm text-gray-400 line-through">{currency()}{price.toLocaleString()}</p>
			{:else}
				<p class="text-lg font-bold text-gray-900">{currency()}{price.toLocaleString()}</p>
			{/if}
		</div>

		<!-- Stock Info -->
		{#if quantity < 1}
			<p
				class="inline-flex items-center text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full"
			>
				<Exit class="mr-1" /> Out of stock
			</p>
		{/if}
	</div>

	<!-- Add to Cart Button -->
	<div
		class="absolute inset-x-0 bottom-0 p-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
	>
		<button
			class="w-full bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
		>
			Add to Cart
		</button>
	</div>
</div>
