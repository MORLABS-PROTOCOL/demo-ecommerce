<script lang="ts">
	import { currency, user } from '$lib/controls.svelte';
	import { CheckmarkOutline, Star, StarFilled } from 'carbon-icons-svelte';
	import { onMount } from 'svelte';
	import Exit from './Icons/Exit-sm.svelte';

	let { price, title, quantity, flashSale, image, discountPercentage } = $props();
	let newPrice: number = $state(0);
	function calculateNewPrice(price: number, discountPercentage: number): number {
		return price - (price * discountPercentage) / 100;
	}
	onMount(() => {
		calculateNewPrice(price, discountPercentage);
	});
	newPrice = calculateNewPrice(price, discountPercentage);
</script>

<div
	class="w-[600px] h-[150px] duration-300 hover:shadow-xl hover:scale-100 border-solid border-2 hover:shadow-blue-500 bg-white p-3 mt-2 border-gray-300 flex flex-row items-center gap-x-4"
>
	<div class="relative w-[150px] h-[100px]">
		<img src={image} class="w-full h-full object-cover" />
		{#if flashSale}
			<p class="absolute top-2 left-1 bg-red-500 text-white p-2 text-xs rounded-full">
				Flash Sale - {discountPercentage}% off
			</p>
		{/if}
	</div>
	<div class="flex flex-col justify-center flex-grow">
		<div class="font-semibold text-xl">{title}</div>
		<div class="flex items-center gap-x-1">
			<StarFilled size={20} fill="gold" />
			<StarFilled size={20} fill="gold" />
			<StarFilled size={20} fill="gold" />
			<StarFilled size={20} fill="gold" />
			<Star size={20} fill="gold" />
		</div>
		{#if discountPercentage}
			<div class="font-bold flex items-center text-lg gap-x-2">
				<p class="text-lg font-bold">{currency()}{newPrice.toLocaleString()}</p>
				<p class="text-sm font-semibold line-through text-gray-300">
					{price.toLocaleString()}
				</p>
			</div>
		{:else}
			<div class="font-bold flex text-lg">{currency()}{price.toLocaleString()}</div>
		{/if}
	</div>
	<div class="flex flex-col justify-end items-end h-full">
		{#if quantity < 1}
			<p
				class="bg-red-400 flex items-center gap-x-2 text-center text-red-700 rounded-full px-3 py-1 text-sm font-semibold"
			>
				<Exit />Out of stock
			</p>
		{:else}
			<p
				class="bg-green-400 flex items-center gap-x-2 text-green-700 rounded-full px-3 py-1 text-sm font-semibold mb-2"
			>
				<CheckmarkOutline />In stock
			</p>

			<button
				class="bg-blue-900 text-white p-2 rounded-md hover:scale-100 duration-300"
				onclick={() => {
					// Add to cart logic here
					alert('Added to cart');
				}}
			>
				Add to Cart
			</button>
		{/if}
	</div>
</div>
