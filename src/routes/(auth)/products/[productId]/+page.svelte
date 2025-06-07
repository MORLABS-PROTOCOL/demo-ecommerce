<script lang="ts">
	import { onMount } from 'svelte';
	import {
		addToCart,
		modifyWishList,
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
		wishList,
		cart
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
	let selectedImage = $state('');
	let viewingInfo = $state('Description');
	let cartItems = $state([]);
	onMount(async () => {
		product = await getProductById(page.params.productId);
		newPrice = calculateNewPrice(product?.price, product?.discount_percentage);
		productsByCategory = await getProductsByCategory(product.category, 5);
		products = productsByCategory;
		await refreshWishList();

		cartItems = await getCart();
		console.log('Cart Items:', cartItems);
	});
</script>

<Seo
	title={product?.title}
	description={product?.description}
	keywords="vixstores, {product?.description}"
/>

<div class="p-6 md:p-10 bg-gray-100 min-h-screen">
	<div class="bg-white rounded-lg shadow-md overflow-hidden">
		<div class="flex flex-col md:flex-row gap-8 p-6">
			<div class="w-full md:w-1/2 flex flex-col items-center">
				<div
					class="relative w-full max-w-[400px] h-[400px] rounded-xl flex items-center justify-center overflow-hidden"
				>
					{#if product?.discount_percentage}
						<div
							class="absolute top-4 left-4 bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full z-10"
						>
							-{product?.discount_percentage}%
						</div>
					{/if}

					<img
						src={product?.imageUrl || selectedImage}
						alt={product?.title}
						class="w-full h-full object-contain rounded-xl"
					/>
				</div>
			</div>

			<div class="w-full md:w-1/2 space-y-4">
				<h2 class="text-sm text-gray-500 font-semibold uppercase">Mobile Phones</h2>
				<h1 class="text-2xl font-bold text-gray-900 leading-tight">
					{product?.title}
				</h1>

				<div class="flex items-center gap-1">
					{#each Array(5) as _, i}
						<StarFilled fill="gold" class="w-4 h-4" />
					{/each}
					<span class="text-sm text-gray-600">(6 Reviews)</span>
				</div>

				<div class="flex items-baseline gap-2">
					{#if product?.discount_percentage}
						<p class="text-xl font-bold text-gray-900">{currency()}{newPrice.toLocaleString()}</p>
						<p class="line-through text-md font-medium text-gray-500">
							{currency()}{product.price.toLocaleString()}
						</p>
					{:else}
						<p class="text-xl font-bold text-gray-900">
							{currency()}{product?.price.toLocaleString()}
						</p>
					{/if}
				</div>
				{console.log(cartItems)}
				{#if cartItems && cartItems.find((item) => item.productId === productId)}
					<!-- Product is already in cart: show quantity controls only -->
					<div class="flex items-center gap-4 py-4">
						<div class="flex items-center border border-gray-300 rounded-md">
							<button
								class="px-4 py-2 text-lg text-gray-700 hover:bg-gray-100 rounded-l-md"
								onclick={async () => {
									let item = cartItems.find((item) => item.productId === productId);
									if (item && item.quantity > 1) {
										item.quantity--;
										quantity = item.quantity;
										if (pocketbase.authStore.isValid) {
											await addToCart(productId, quantity); // true = update
											await refreshCart();
										} else {
											localStorage.setItem('cartItems', JSON.stringify(cartItems));
										}
									}
								}}>-</button
							>
							<span class="px-4 py-2 text-lg font-medium">
								{cartItems.find((item) => item.productId === productId)?.quantity}
							</span>
							<button
								class="px-4 py-2 text-lg text-gray-700 hover:bg-gray-100 rounded-r-md"
								onclick={async () => {
									let item = cartItems.find((item) => item.productId === productId);
									if (item) {
										item.quantity++;
										quantity = item.quantity;
										if (pocketbase.authStore.isValid) {
											await addToCart(productId, quantity, true);
											await refreshCart();
										} else {
											localStorage.setItem('cartItems', JSON.stringify(cartItems));
										}
									}
								}}>+</button
							>
						</div>
					</div>
				{:else}
					<!-- Product not in cart: show add to cart button and quantity controls -->
					<div class="flex items-center gap-4 py-4">
						<div class="flex items-center border border-gray-300 rounded-md">
							<button
								class="px-4 py-2 text-lg text-gray-700 hover:bg-gray-100 rounded-l-md"
								onclick={() => {
									quantity > 1 && quantity--;
								}}>-</button
							>
							<span class="px-4 py-2 text-lg font-medium">{quantity}</span>
							<button
								class="px-4 py-2 text-lg text-gray-700 hover:bg-gray-100 rounded-r-md"
								onclick={() => quantity++}>+</button
							>
						</div>
						<button
							onclick={async () => {
								let authState = pocketbase.authStore.isValid;
								if (!authState) {
									let cartItemsLocal: any = localStorage.getItem('cartItems');
									if (!cartItemsLocal) {
										cartItemsLocal = [];
									} else {
										cartItemsLocal = JSON.parse(cartItemsLocal);
									}
									cartItemsLocal.push({ productId, quantity });
									localStorage.setItem('cartItems', JSON.stringify(cartItemsLocal));
									cartItems = cartItemsLocal;
								}
								await addToCart(productId, quantity);
								await refreshCart();
								quantity = 1;
							}}
							class="flex-1 py-3 bg-black hover:bg-[#224981] text-white font-semibold text-md rounded-md transition-colors"
						>
							Add To Cart
						</button>
					</div>
				{/if}

				<div class="text-sm text-gray-600 space-y-1 pt-2 border-t border-gray-200">
					<p>Category: <span class="font-semibold">{product?.category.toUpperCase()}</span></p>
				</div>

				<div class="flex items-center gap-3 text-sm text-gray-600">
					<span>Report This Item</span>
					<div class="flex gap-2">
						<a href="#" class="text-blue-600 hover:text-blue-800"
							><img
								src="https://img.icons8.com/ios-filled/24/000000/facebook-new.png"
								alt="Facebook"
								class="w-5 h-5"
							/></a
						>
						<a href="#" class="text-blue-400 hover:text-blue-600"
							><img
								src="https://img.icons8.com/ios-filled/24/000000/twitter.png"
								alt="Twitter"
								class="w-5 h-5"
							/></a
						>
						<a href="#" class="text-red-600 hover:text-red-800"
							><img
								src="https://img.icons8.com/ios-filled/24/000000/pinterest--v1.png"
								alt="Pinterest"
								class="w-5 h-5"
							/></a
						>
					</div>
				</div>
			</div>
		</div>

		<div class="border-t border-gray-200 mt-6">
			<div class="flex border-b border-gray-200">
				{#if viewingInfo === 'Description'}
					<button class="py-3 px-6 text-md font-semibold text-gray-700 border-b-2 border-black">
						Description
					</button>
				{:else}
					<button
						onclick={() => {
							viewingInfo = 'Description';
							console.log(viewingInfo);
						}}
						class="py-3 px-6 text-md font-semibold text-gray-700"
					>
						Description
					</button>
				{/if}
				{#if viewingInfo === 'Reviews'}
					<button class="py-3 px-6 text-md font-semibold text-gray-700 border-b-2 border-black">
						Reviews
					</button>
				{:else}
					<button
						onclick={() => {
							viewingInfo = 'Reviews';
							console.log(viewingInfo);
						}}
						class="py-3 px-6 text-md font-semibold text-gray-700"
					>
						Reviews
					</button>
				{/if}
				{#if viewingInfo === 'Seller Info'}
					<button class="py-3 px-6 text-md font-semibold text-gray-700 border-b-2 border-black">
						Seller Info
					</button>
				{:else}
					<button
						onclick={() => {
							viewingInfo = 'Seller Info';
						}}
						class="py-3 px-6 text-md font-semibold text-gray-700"
					>
						Seller Info
					</button>
				{/if}
			</div>
			{#if viewingInfo === 'Description'}
				<div class="p-6 text-gray-700 space-y-4">
					<h3 class="text-lg font-bold">Introduction</h3>
					<p class="text-sm leading-relaxed">
						{product?.description}
					</p>
					<h3 class="text-lg font-bold">Features:</h3>
					<ul class="list-disc list-inside text-sm space-y-1">
						<li>Slim body with metal cover</li>
						<li>latest intel Core i5-1135G7 processor (4 cores / 8 threads)</li>
					</ul>
				</div>
			{/if}
			{#if viewingInfo === 'Reviews'}
				<div class="p-6 text-gray-700 space-y-4">
					<div class="text-sm leading-relaxed">
						<h5>Marvelous Won:</h5>
						<p>Great Product</p>
					</div>
					<div class="text-sm leading-relaxed">
						<h5>Thomas Agba:</h5>
						<p>Will recommend !!!</p>
					</div>
				</div>
			{/if}
			{#if viewingInfo === 'Seller Info'}
				<div class="p-6 text-gray-700 space-y-4">
					<div class="text-sm leading-relaxed">
						<h5>Phone No. :</h5>
						<p>080123456789</p>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
