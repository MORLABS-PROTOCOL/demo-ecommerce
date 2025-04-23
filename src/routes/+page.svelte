<script lang="ts">
	import Carousel from '$lib/components/Carousel.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
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

	onMount(async () => {
		for (const category of categories) {
			const prods = await getProductsByCategory(category);
			console.log('Prods:', prods);

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
		// busy = true;
		// busy = false;
	});
</script>

<main class="mx-auto bg-gray-300 max-w-7xl">
	<div>
		<!-- {#each adImages as ad}
			<div class="flex justify-center items-center">
				<img src={ad.imageUrl} alt="Ad Image" class="w-full h-full" />
			</div>
		{/each} -->
		<Carousel images={adImages} />
		<div class=" bg-white p-5 w-full">
			<div class="flex justify-evenly items-center">
				<div></div>
			</div>
		</div>

		<div class="flex flex-col gap-y-6">
			<div class="">
				<div
					class="lg:flex px-5 overflow-hidden mx-auto items-center grid grid-cols-[200px,200px,200px] w-fit gap-0"
				>
					<!-- <img src="./80off.png" class="w-2/4 h-[350px] bottom-0 py-1" /> -->
					{#each products as product}
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
			</div>

			<div>
				<!--Get Products by Category-->

				<div class="mb-4">
					<div class="flex flex-col gap-y-6">
						{#each productsByCategory as products, index}
							<div class="">
								{#if products.items.length > 0}
									<div class="flex justify-between mx-auto items-center font-bold bg-white p-3">
										<p class="uppercase font-bold">{products.category}</p>
										<p>View More {'>'}</p>
									</div>
								{/if}
								{#if products.items.length < 5}
									<div
										class="lg:flex px-5 overflow-hidden grid grid-cols-[200px,200px,200px] w-fit gap-0"
									>
										{#each products.items as product}
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
										{/each}
									</div>
								{:else}
									<div
										class="lg:flex px-5 overflow-hidden grid grid-cols-[200px,200px,200px] w-fit gap-0"
									>
										{#each products.items as product}
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
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</main>
