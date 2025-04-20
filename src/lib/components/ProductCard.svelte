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
	class="w-[250px] h-[350px] duration-300 hover:shadow-xl hover:scale-100 border-solid border-2 hover:shadow-blue-500 bg-white p-3 mt-2 border-gray-300"
>
	<div class="flex flex-col gap-y-3 h-full w-full">
		<div class="relative w-full h-[50%]">
			<img src={image} class="w-full h-full object-cover" />
			{#if discountPercentage}
				<p
					class="absolute top-2 left-1 w-[80px] text-center font-semibold bg-red-500 text-white p-2 text-xs rounded-full"
				>
					{discountPercentage}% off
				</p>
			{/if}
		</div>
		<div class="font-semibold text-xl">{title}</div>
		<StarFilled size={20} fill="gold" />
		{#if discountPercentage}
			<div class="font-bold flex items-center text-lg gap-x-2">
				<p class="text-lg font-semibold">{currency()}{newPrice.toLocaleString()}</p>
				<p class="text-sm font-normal line-through text-gray-300">
					{price.toLocaleString()}
				</p>
			</div>
		{:else}
			<div class="font-semibold flex text-lg">{currency()}{price.toLocaleString()}</div>
		{/if}
		{#if quantity < 1}
			<div class="flex justify-between items-center">
				<p
					class="bg-red-400 flex items-center gap-x-2 text-center text-red-700 rounded-full px-3 py-1 text-sm font-semibold"
				>
					<Exit />Out of stock
				</p>
				<p></p>
			</div>
		{:else}
			<div class="flex justify-between items-center">
				<p
					class="bg-green-400 flex items-center gap-x-2 text-green-700 rounded-full px-3 py-1 text-sm font-semibold"
				>
					<CheckmarkOutline />In stock
				</p>

				<p
					class="text-black text-right font-semibold p-2 w-[50%] rounded-md hover:scale-100 duration-300"
				>
					{quantity} left
				</p>
			</div>
		{/if}
	</div>
</div>
