<script lang="ts">
	import {
		clearWishList,
		currency,
		getWishList,
		modifyWishList,
		notify,
		pocketbase,
		wishList
	} from '$lib/controls.svelte';
</script>

<div class="max-w-6xl mx-auto p-6 text-center">
	{#if wishList.items.length === 0}
		<p class="text-gray-500 font-bold">Your wishlist is empty.</p>
	{:else}
		<table class="w-full text-left border-collapse">
			<thead class="border-b font-semibold text-gray-500 uppercase text-sm">
				<tr class="border-b-gray-200 border-2-black">
					<th class="pb-3">Product</th>
					<th>Color</th>

					<th>Size</th>

					<th>Price</th>
					<th></th>
				</tr>
			</thead>

			<tbody>
				{#each wishList.items as item}
					<tr class="border-b">
						<td class="py-4 flex items-center gap-4">
							<a href="/products/{item.id}" class="text-black flex items-center gap-4">
								<img src={item.productImage} alt="product" class="w-14 h-14 object-cover rounded" />
								<span>{item.name}</span>
							</a>
						</td>
						<td>
							<div class={`w-4 h-4 rounded-full ${item.color} mx-auto`}></div>
						</td>
						<td class="text-center text-gray-500">{item.size}</td>
						<td class="text-center text-gray-500">{currency()}{item.price}</td>

						<td class="text-center">
							<button
								class="text-gray-500 hover:text-red-500"
								onclick={async () => {
									modifyWishList(item.id);
									notify('Success', 'Product removed from wishlist', 'success');
									// window.location.reload();
								}}>×</button
							>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<div class="mt-6 flex justify-between items-center">
			<button
				class="text-red-500 hover:underline"
				onclick={async () => {
					if (confirm('Are you sure you want to clean your wishlist?')) {
						await clearWishList();
						notify('Success', 'Wishlist cleaned successfully', 'success');
					}
				}}
			>
				Clean Wishlist
			</button>
		</div>
	{/if}
</div>
