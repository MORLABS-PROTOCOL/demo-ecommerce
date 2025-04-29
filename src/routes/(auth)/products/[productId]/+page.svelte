<script lang="ts">
	import { onMount } from 'svelte';
	import {
		addToCart,
		addToWishList,
		calculateNewPrice,
		categories,
		currency,
		getCart,
		getProductById,
		getProductsByCategory,
		pocketbase,
		refreshCart,
		refreshWishList,
		validateAuthState,
		wishList
	} from '$lib/controls.svelte';
	import { page } from '$app/state';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import Heart from '$lib/components/Icons/Heart.svelte';
	import { StarFilled } from 'carbon-icons-svelte';
	import Seo from '$lib/components/Seo.svelte';

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
		productsByCategory = await getProductsByCategory(product.category, 5);
		products = productsByCategory;
		console.log(productsByCategory);
		await refreshWishList();
		let cartItems = await getCart();
		console.log(
			'Cart Items: ',
			cartItems[0].items.find((item) => item.product.id === productId)
		);
	});
</script>

<Seo
	title={product?.title}
	description={product?.description}
	keywords="vikstores, {product?.description}"
/>

<div class="flex flex-col md:flex-row gap-10 p-6">
	<!-- Product Image -->
	<div class=" w-full md:w-1/2 h-[400px] rounded-xl">
		{#if product?.imageUrl}
			<img
				src={product.imageUrl}
				alt={product.title}
				class="w-full h-full object-contain rounded-xl"
			/>
		{/if}
	</div>

	<!-- Product Info -->
	<div class="w-full md:w-1/2 space-y-6">
		<!-- Product Name -->
		<div
			class="text-3xl font-extrabold leading-tight text-gray-900 flex justify-between items-center"
		>
			<h1 class="flex gap-x-2">
				{product?.title}
				{#if product?.discount_percentage}
					<p
						class=" w-fit h-fit text-center font-semibold bg-red-500 text-white py-1 px-2 text-xs rounded-full"
					>
						{product?.discount_percentage}% off
					</p>
				{/if}
			</h1>
			<button
				onclick={async () => {
					console.log(pocketbase.authStore.record);
					validateAuthState();
					let wishlist = await addToWishList(productId);
					console.log(wishlist);
				}}
				class="relative inline-block duration-300 hover:shadow-xl hover:scale-100 rounded-full hover:shadow-blue-500 hover:border hover:border-blue-700"
			>
				<div class="relative p-2 rounded-full">
					{#if wishList.items.includes(productId)}
						<Heart color="red" />
					{:else}
						<Heart color="none" />
					{/if}
				</div>
			</button>
		</div>

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
			<div class="block md:flex gap-4 justify-between items-center">
				<div class="flex items-center gap-3 mt-2">
					<button
						class="border px-3 py-1 rounded text-lg"
						onclick={() => {
							quantity > 1 && quantity--;
						}}>-</button
					>
					<span class="text-lg font-medium">{quantity}</span>
					<button class="border px-3 py-1 rounded text-lg" onclick={() => quantity++}>+</button>
				</div>
			</div>
			<!-- Stock Indicator -->
			{#if product?.quantity > 20}
				<div
					class="bg-blue-50 border mt-2 border-black rounded-md p-3 text-sm text-green-700 flex items-center gap-2"
				>
					<span class="h-2 w-2 rounded-full bg-green-500 inline-block"></span>
					<span class="flex justify-between items-center w-full"
						><div>
							{product?.quantity} items in stock
						</div>
						<div class="flex items-center gap-2">
							<StarFilled fill="gold" />
							<StarFilled fill="gold" />
							<StarFilled fill="gold" />
							<StarFilled fill="gold" />
							<StarFilled fill="gold" />
						</div>
					</span>
				</div>
			{:else}
				<div
					class="bg-red-50 border mt-2 border-black rounded-md p-3 text-sm text-red-700 flex items-center gap-2"
				>
					<span class="h-2 w-2 rounded-full bg-red-500 inline-block"></span>
					<span class="flex justify-between items-center w-full">
						<div>
							Hurry, only {product?.quantity} left in stock!
						</div>
						<div class="flex items-center gap-2">
							<StarFilled fill="gold" />
							<StarFilled fill="gold" />
							<StarFilled fill="gold" />
							<StarFilled fill="gold" />
							<StarFilled fill="gold" />
						</div>
					</span>
				</div>
			{/if}
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
	</div>
</div>
<div class="flex flex-col gap-y-6 mx-auto max-w-7xl mb-4">
	<div class="">
		{#if products.length > 0}
			<div class="flex justify-between mx-auto font-bold bg-white p-3">
				<p class="uppercase font-bold">You may be interested in</p>
			</div>
		{/if}
		{#if products.length < 5}
			<div
				class="lg:flex px-5 mb-3 overflow-hidden grid grid-cols-[200px,200px,200px] items-start w-fit gap-0"
			>
				{#each products as product, index}
					<!-- <img src="./80off.png" class="w-2/4 h-[350px] bottom-0 py-1" /> -->
					<a
						onclick={() => {
							window.location.href = `/products/${product.id}`;
						}}
						class="text-black"
					>
						<ProductCard
							discountPercentage={product.discount_percentage}
							title={product.title}
							image={product.imageUrl}
							price={product.price}
							quantity={product.quantity}
							flashSale={product.flash_sale}
						/>
					</a>
				{/each}
			</div>
		{:else}
			<div class="lg:flex px-5 overflow-hidden grid grid-cols-[200px,200px] w-fit gap-0">
				<!-- <img src="./80off.png" class="w-2/4 h-[350px] bottom-0 py-1" /> -->
				{#each products as product, index}
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
				{/each}
			</div>
		{/if}
	</div>
</div>
