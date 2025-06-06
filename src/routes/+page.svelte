<script lang="ts">
	import Carousel from '$lib/components/Carousel.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
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
		electronics = await getProductsByCategory('electronics');
		fashion = await getProductsByCategory('fashion');
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
				<div class="">
					<div
						class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-hidden w-full"
					>
						{#each products as product}
							<a href="/products/{product.id}" class="text-black flex-shrink-0">
								<ProductCard
									discountPercentage={product.discount_percentage}
									title={product.title}
									image={product.imageUrl}
									price={product.price}
									quantity={product.quantity}
									flashSale={product.flash_sale}
									productId={product.id}
								/>
							</a>
						{/each}
					</div>
				</div>

				<div>
					<!--Get Products by Category-->

					<div class="mb-4">
						<div class="flex flex-col gap-y-6">
							{#each electronics as products, index}
								<div class="">
									{#if products.items.length > 0}
										<div class="flex justify-between items-center font-bold p-3">
											<p class="uppercase text-2xl font-semibold">Electronics</p>
											<a
												href="/products/category/{categories[index].toLowerCase()}"
												class="text-black">View More {'>'}</a
											>
										</div>
									{/if}

									<div
										class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full md:overflow-hidden"
									>
										{#each products.items as product}
											<!-- <img src="./80off.png" class="w-2/4 h-[350px] bottom-0 py-1" /> -->
											<a href="/products/{product.id}" class="text-black">
												<ProductCard
													productId={product.id}
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
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>
