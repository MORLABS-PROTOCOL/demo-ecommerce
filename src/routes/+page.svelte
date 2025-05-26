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

	onMount(async () => {
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

<main class="mx-auto bg-[#f8f8f8]">
	<div class="max-w-7xl mx-auto">
		<!-- {#each adImages as ad}
			<div class="flex justify-center items-center">
				<img src={ad.imageUrl} alt="Ad Image" class="w-full h-full" />
			</div>
		{/each} -->
		<Carousel images={adImages} />
		<div class="  p-5 w-full">
			<div class="flex justify-evenly items-center">
				<div></div>
			</div>
		</div>

		<div class="flex flex-col gap-y-6">
			<div class="">
				<div class="flex px-5 overflow-x-auto w-full gap-0">
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
										<p class="uppercase text-2xl font-semibold">{products.category}</p>
										<a href="/products/category/{categories[index].toLowerCase()}"
											>View More {'>'}</a
										>
									</div>
								{/if}
								{#if products.items.length < 5}
									<div class="flex px-5 overflow-x-auto w-full md:overflow-hidden gap-0">
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
									<div class="flex px-5 overflow-x-auto w-full gap-0">
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
