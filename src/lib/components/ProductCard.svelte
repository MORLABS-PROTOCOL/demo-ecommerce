<script lang="ts">
	import { calculateNewPrice, currency, modifyWishList } from '$lib/controls.svelte';
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
	class="group relative md:w-[310px] w-[200px] flex flex-col gap-y-2 mb-2 mx-auto gap-5 min-h-[420px] md:h-[502px] bg-white p-5 border transition-shadow duration-300"
>
	<!-- Product Image with NEW Badge -->
	<div class="relative aspect-square w-full mb-1 flex items-center justify-center">
		<div class="w-[100%] flex justify-center items-center">
			<img src={image} alt={title} class=" " />
		</div>
		{#if Date.now() - new Date(dateCreated).getTime() <= 7 * 24 * 60 * 60 * 1000}
			<p
				class="absolute px-3 top-1 left-2 text-xs font-semibold text-white bg-green-500 py-1 rounded-full z-10"
			>
				NEW
			</p>
		{/if}
		{#if discountPercentage > 0}
			<p
				class="absolute top-2 right-2 text-xs font-semibold text-white bg-red-500 px-3 py-1 rounded-full z-10"
			>
				-{discountPercentage}%
			</p>
		{/if}
	</div>

	<!-- Heart Wishlist Button -->
	<div
		class="absolute top-[10%] right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
	>
		<button
			class="bg-white shadow-md p-2 rounded-full hover:bg-gray-50 transition-colors"
			aria-label="Add to wishlist"
			onclick={() => modifyWishList(productId)}
		>
			<Heart />
		</button>
	</div>

	<div class="my-auto">
		<!-- Title -->

		<!-- Rating -->
		<div class="flex items-center mt-[26%]">
			{#each Array(5) as _, i}
				<StarFilled size={17} fill="gold" class="mr-0.5" />
			{/each}
		</div>

		<a href="/products/{productId}" class="block truncate pr-2">
			<h3 class="text-base md:text-lg font-medium text-gray-900 flex transition-colors">
				{title}
			</h3>
		</a>

		<!-- Pricing -->
		{#if quantity > 0}
			<div class="flex flex-wrap items-center gap-2">
				{#if discountPercentage > 0}
					<p class="text-xl font-bold">{currency()}{newPrice.toLocaleString()}</p>
					<p class="text-xl text-gray-400 line-through">{currency()}{price.toLocaleString()}</p>
				{:else}
					<p class="text-lg font-bold text-gray-900">{currency()}{price.toLocaleString()}</p>
				{/if}
			</div>
		{:else}
			<p
				class="inline-flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 rounded-full"
			>
				<Exit /> Out of stock
			</p>
		{/if}
	</div>
	<div class="w-full mt-2">
		{#if quantity > 0}
			<div class="flex justify-between text-xs mb-1">
				<span class="text-gray-500">Stock</span>
				<span class="text-gray-700 font-medium">{quantity} left</span>
			</div>
			<div class="w-full bg-gray-200 rounded-full h-2">
				<div
					class="
						h-2 rounded-full transition-all duration-300
						{quantity < 20 ? 'bg-yellow-400' : 'bg-blue-500'}
					"
					style="width: {Math.min(100, (quantity / 100) * 100)}%;"
				></div>
			</div>
		{/if}
	</div>
	<!-- Add to Cart Button -->
	<div
		class="absolute inset-x-0 bottom-0 p-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
	>
		<button
			class="w-full bg-blue-700 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 transition-colors"
		>
			Add to Cart
		</button>
	</div>
</div>
