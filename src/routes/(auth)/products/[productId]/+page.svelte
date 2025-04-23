<script lang="ts">
	import { onMount } from 'svelte';
	import {
		addToCart,
		calculateNewPrice,
		categories,
		currency,
		getProductById,
		getProductsByCategory,
		refreshCart,
		validateAuthState
	} from '$lib/controls.svelte';
	import { page } from '$app/state';
	import ProductCard from '$lib/components/ProductCard.svelte';

	let { data } = $props();
	let product = $state();
	let productId = page.params.productId;
	let quantity: number = $state(1);
	let newPrice = $state(0);
	let products: any[] = $state([]);
	let productsByCategory: {
		category: string;
		items: any[];
	}[] = $state([]);

	onMount(async () => {
		product = await getProductById(page.params.productId);
		newPrice = calculateNewPrice(product?.price, product?.discount_percentage);
		productsByCategory = await getProductsByCategory(product.category);
		products = productsByCategory;
		console.log(productsByCategory);
		// busy = true;
		// busy = false;
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
			<p class="text-2xl font-bold text-black">{currency()}{product?.price.toLocaleString()}</p>
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
				let authState = validateAuthState();
				if (!authState) {
					return;
				}
				await addToCart(productId, quantity);
				await refreshCart();
				quantity = 1;
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
<div class="flex flex-col gap-y-6 mx-auto max-w-7xl">
	<div class="">
		{#if products.length > 0}
			<div class="flex justify-between mx-auto font-bold bg-white p-3">
				<p class="uppercase font-bold">You may be interested in</p>
			</div>
		{/if}
		{#each productsByCategory as product, index}
			{#if products.length < 5}
				<div
					class="lg:flex px-5 mb-3 overflow-hidden grid grid-cols-[200px,200px,200px] items-start w-fit gap-0"
				>
					<!-- <img src="./80off.png" class="w-2/4 h-[350px] bottom-0 py-1" /> -->
					<a href="/products/{product.id}" class="text-black">
						<ProductCard
							discountPercentage={product.discount_percentage}
							title={product.title}
							image={product.imageUrl}
							price={product.price}
							quantity={product.quantity}
							flashSale={product.flash_sale}
						/>
					</a>
				</div>
			{:else}
				<div class="lg:flex px-5 overflow-hidden grid grid-cols-[200px,200px,200px] w-fit gap-0">
					<!-- <img src="./80off.png" class="w-2/4 h-[350px] bottom-0 py-1" /> -->
					<a href="/products/{product.id}" class="text-black">
						<ProductCard
							discountPercentage={product.discount_percentage}
							title={product.title}
							image={product.imageUrl}
							price={product.price}
							quantity={product.quantity}
							flashSale={product.flash_sale}
						/>
					</a>
				</div>
			{/if}
		{/each}
	</div>
</div>
