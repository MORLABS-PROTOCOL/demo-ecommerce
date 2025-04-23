<script lang="ts">
	import { onMount } from 'svelte';
	import { addToCart, calculateNewPrice, getProductById, refreshCart } from '$lib/controls.svelte';
	import { page } from '$app/state';

	let { data } = $props();
	let product = $state();
	let productId = page.params.productId;
	let quantity: number = $state(1);
	let newPrice = $state(0);
	onMount(async () => {
		product = await getProductById(page.params.productId);
		newPrice = calculateNewPrice(product?.price, product?.discount_percentage);
	});
</script>

<div class="flex flex-col md:flex-row gap-10 p-6">
	<!-- Product Image -->
	<div class=" w-full md:w-1/2 h-[400px] rounded-xl">
		{#if product?.imageUrl}
			<img
				src={product.imageUrl}
				alt={product.name}
				class="w-full h-full object-contain rounded-xl"
			/>
		{/if}
	</div>

	<!-- Product Info -->
	<div class="w-full md:w-1/2 space-y-6">
		<!-- Product Name -->
		<h1 class="text-3xl font-extrabold leading-tight text-gray-900 flex">
			{product?.title}
			{#if product?.discount_percentage}
				<p
					class=" w-fit h-fit text-center font-semibold bg-red-500 text-white px-2 text-xs rounded-full"
				>
					{product?.discount_percentage}% off
				</p>
			{/if}
		</h1>

		<!-- Description -->
		<div>
			<p class="text-gray-600 leading-relaxed text-lg">
				{product?.description}
			</p>
		</div>

		<!-- Price -->{#if product?.discount_percentage}
			<p class="text-2xl font-bold text-black flex items-center gap-x-2">
				₦{newPrice.toLocaleString()}<span class="line-through text-sm font-semibold text-gray-500"
					>{product.price}</span
				>
			</p>
		{:else}
			<p class="text-2xl font-bold text-black">₦{product?.price.toLocaleString()}</p>
		{/if}
		<!-- Quantity Selector -->
		<div>
			<h2 class="text-lg font-semibold text-gray-800 mb-1">Quantity</h2>
			<div class="flex items-center gap-3 mt-2">
				<button class="border px-3 py-1 rounded text-lg" onclick={() => quantity > 1 && quantity--}
					>-</button
				>
				<span class="text-lg font-medium">{quantity}</span>
				<button class="border px-3 py-1 rounded text-lg" onclick={() => quantity++}>+</button>
			</div>
		</div>

		<!-- Add to Cart Button -->
		<button
			onclick={async () => {
				console.log(quantity);
				await addToCart(productId, quantity);
				await refreshCart();
			}}
			class="w-full py-3 bg-black hover:bg-[#224981] text-white font-semibold text-lg rounded-md transition-colors"
		>
			Add to Cart
		</button>

		<!-- Stock Indicator -->
		{#if product?.quantity > 20}
			<div
				class="bg-blue-50 border border-black rounded-md p-3 text-sm text-green-700 flex items-center gap-2"
			>
				<span class="h-2 w-2 rounded-full bg-green-500 inline-block"></span>
				<span>{product?.quantity} items in stock</span>
			</div>
		{:else}
			<div
				class="bg-red-50 border border-black rounded-md p-3 text-sm text-red-700 flex items-center gap-2"
			>
				<span class="h-2 w-2 rounded-full bg-red-500 inline-block"></span>
				<span class="">Hurry, only {product?.quantity} left</span>
			</div>
		{/if}
	</div>
</div>
