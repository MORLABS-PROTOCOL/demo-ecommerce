<script lang="ts">
	import Carousel from '$lib/components/Carousel.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import ProductCardHorizontal from '$lib/components/ProductCardHorizontal.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import {
		getAllProducts,
		getLogo,
		getProductsByCategory,
		pullAds,
		categories
	} from '$lib/controls.svelte';
	import { onMount } from 'svelte';
	let adImages: any[] = $state([]);

	let busy = $state(false);
	let products: any[] = $state([]);
	let productsByCategory: {
		category: string;
		items: any[];
	}[] = $state([]);
	let electronics = $state([]);
	let fashion = $state([]);
	let groceries = $state([]);

	onMount(async () => {
		electronics = await getProductsByCategory('electronics', 8);
		fashion = await getProductsByCategory('fashion', 4);
		console.log('Electronics:', electronics);
		for (const category of categories) {
			const prods = await getProductsByCategory(category);

			productsByCategory = [
				...productsByCategory,
				{
					category,
					items: prods
				}
			];
		}

		adImages = await pullAds();
		await getLogo();
		products = await getAllProducts();
		console.log(products);
		// busy = true;
		// busy = false;
	});
</script>

<Seo title="Vixstores | Home" description="home" keywords="vixstores" />
<Carousel images={adImages} />
<main class="mx-auto bg-[#eeeeee] min-h-screen">
	<div class="mt-10">
		<div class="max-w-7xl mx-auto">
			<!-- {#each adImages as ad}
				<div class="flex justify-center items-center">
					<img src={ad.imageUrl} alt="Ad Image" class="w-full h-full" />
				</div>
			{/each} -->

			<div class="flex flex-col gap-y-6">
				<div
					class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 w-full items-center py-6 border-t border-b border-gray-200"
				>
					{#each [{ src: '/google-logo.png', alt: 'Google' }, { src: '/facebook-logo.png', alt: 'Facebook' }, { src: '/tesla-logo.png', alt: 'Tesla' }, { src: '/oneplus-logo.png', alt: 'OnePlus' }, { src: '/nexus-logo.png', alt: 'Nexus' }, { src: '/apple-logo.png', alt: 'Apple' }, { src: '/microsoft-logo.png', alt: 'Microsoft' }, { src: '/lenovo-logo.png', alt: 'Lenovo' }, { src: '/huwawei-logo.png', alt: 'Huwawei' }, { src: '/firefox-logo.png', alt: 'Firefox' }, { src: '/brave-logo.png', alt: 'Brave' }, { src: '/tencent-logo.png', alt: 'Tencent' }] as logo, i}
						<div
							class="flex justify-center items-center bg-white h-24 border-gray-200 border-r last:border-r-0"
						>
							<img src={logo.src} alt={logo.alt} class="max-h-16 max-w-full object-contain" />
						</div>
					{/each}
				</div>
				<div class="mb-10">
					<div class="flex justify-between items-center font-bold p-3">
						<p class="uppercase text-2xl font-semibold">New Arrivals</p>
						<a href="/products/category/new-arrivals" class="text-black">View More {'>'}</a>
					</div>
					<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden w-full">
						{#each products as product}
							<ProductCard
								threshold={product.threshold}
								dateCreated={product.created}
								discountPercentage={product.discount_percentage}
								title={product.title}
								image={product.imageUrl}
								price={product.price}
								quantity={product.quantity}
								flashSale={product.flash_sale}
								productId={product.id}
							/>
						{/each}
					</div>
				</div>

				<div>
					<!--Get Products by Category-->

					<div class="mb-10">
						<div class="">
							<div class="flex justify-between items-center font-bold p-3">
								<p class="uppercase text-2xl font-semibold">Electronics</p>
								<a href="/products/category/electronics" class="text-black">View More {'>'}</a>
							</div>
							<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full md:overflow-hidden">
								{#each electronics as product}
									<!-- <img src="./80off.png" class="w-2/4 h-[350px] bottom-0 py-1" /> -->
									<ProductCard
										threshold={product.threshold}
										dateCreated={product.created}
										productId={product.id}
										discountPercentage={product.discount_percentage}
										title={product.title}
										image={product.imageUrl}
										price={product.price}
										quantity={product.quantity}
										flashSale={product.flash_sale}
									/>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<img src="/ads-3.png" alt="Ad" class="w-full h-full object-cover rounded mb-10" />

				<div class="mb-10">
					<div class="flex justify-between items-center font-bold p-3">
						<p class="uppercase text-2xl font-semibold">Top Selling Products</p>
						<a href="/products/category/new-arrivals" class="text-black">View More {'>'}</a>
					</div>
					<div class="md:grid grid-cols-2 gap-4 overflow-hidden w-full hidden">
						{#each electronics as product}
							<ProductCardHorizontal
								dateCreated={product.created}
								discountPercentage={product.discount_percentage}
								title={product.title}
								image={product.imageUrl}
								price={product.price}
								quantity={product.quantity}
								flashSale={product.flash_sale}
								productId={product.id}
							/>
						{/each}
					</div>
					<div class="grid grid-cols-2 gap-4 overflow-hidden w-full md:hidden">
						{#each electronics as product}
							<ProductCard
								threshold={product.threshold}
								dateCreated={product.created}
								discountPercentage={product.discount_percentage}
								title={product.title}
								image={product.imageUrl}
								price={product.price}
								quantity={product.quantity}
								flashSale={product.flash_sale}
								productId={product.id}
							/>
						{/each}
					</div>
				</div>

				<div class="bg-pink-300 flex justify-center items-center mb-10 p-12">
					<div class="max-w-5xl">
						<div class="flex md:flex-row gap-x-4 md:gap-x-10 justify-evenly items-center py-6">
							<div
								class="bg-white rounded-full flex flex-col justify-center items-center w-20 h-20 text-3xl font-bold shadow"
							>
								<span>12</span>
								<span class="block text-xs font-normal mt-1">Days</span>
							</div>
							<div
								class="bg-white rounded-full flex flex-col justify-center items-center w-20 h-20 text-3xl font-bold shadow"
							>
								<span>05</span>
								<span class="block text-xs font-normal mt-1">Hours</span>
							</div>
							<div
								class="bg-white rounded-full flex flex-col justify-center items-center w-20 h-20 text-3xl font-bold shadow"
							>
								<span>34</span>
								<span class="block text-xs font-normal mt-1">Minutes</span>
							</div>
							<div
								class="bg-white rounded-full flex flex-col justify-center items-center w-20 h-20 text-3xl font-bold shadow"
							>
								<span>56</span>
								<span class="block text-xs font-normal mt-1">Seconds</span>
							</div>
						</div>
						<div class="flex justify-center mt-4">
							<button
								class="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition"
							>
								Flash Sales
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>
