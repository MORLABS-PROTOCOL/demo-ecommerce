<script lang="ts">
	import Carousel from '$lib/components/Carousel.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import ProductTile from '$lib/components/ProductCard.svelte';
	import { getAllProducts, getProductsByCategory, pocketbase, pullAds } from '$lib/controls.svelte';
	import { onMount } from 'svelte';
	let adImages: any[] = [];
	let categories: string[] = [
		'Electronics',
		'Fashion',
		'Home & Kitchen',
		'Beauty & Personal Care',
		'Sports & Outdoors',
		'Toys & Games',
		'Books',
		'Automotive',
		'Health & Wellness',
		'Groceries',
		'Office Supplies',
		'Pet Supplies'
	];
	onMount(async () => {
		adImages = await pullAds();
	});
</script>

<main class="mx-auto bg-gray-50 max-w-7xl">
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
				{#await getAllProducts() then products}
					<div class="flex px-5">
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
				{/await}
			</div>

			<div>
				<!--Get Products by Category-->
				{#each categories as category}
					<div class="mb-4">
						<div class="flex flex-col">
							{#await getProductsByCategory(category, 8) then products}
								{#if products.length > 0}
									<div class="flex justify-between items-center font-bold bg-white p-3 mx-5">
										<p class="uppercase font-bold">{category}</p>
										<p>View More {'>'}</p>
									</div>
								{/if}

								<div class="flex px-5">
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
							{/await}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</main>
