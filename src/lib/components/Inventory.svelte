<script lang="ts">
	import {
		getMyProducts,
		notify,
		pocketbase,
		uploadProduct,
		updateProductById,
		currency
	} from '$lib/controls.svelte';
	import type { RecordModel } from 'pocketbase';
	import { onMount } from 'svelte';

	let showUploadModal = $state(false);
	let productName = $state('');
	let productStock: number | '' = $state('');
	let productPrice: number | '' = $state('');
	let fileInput: HTMLInputElement;
	let { darkmode } = $props();

	let payload = $state({
		category: '',
		stock: 0,
		price: 0,
		image: '',
		description: '',
		threshold: 0
	});

	let showEditModal = $state(false);
	let editProductId = $state('');
	let editProductName = $state('');
	let editProductStock: number | '' = $state('');
	let editProductPrice: number | '' = $state('');
	let editFileInput: HTMLInputElement;
	let editPayload = $state({
		category: '',
		description: ''
	});
	let editProductThreshold: number | '' = $state('');

	async function handleProductUpload() {
		if (!productName || !productPrice || !fileInput?.files?.[0]) {
			notify('Error', 'Please fill all required fields.', 'error');
			return;
		}
		try {
			await uploadProduct({
				title: productName,
				description: payload.description,
				price: Number(productPrice),
				category: payload.category,
				product_image: fileInput.files[0],
				quantity: productStock ? Number(productStock) : undefined,
				threshold: payload.threshold ? Number(payload.threshold) : undefined
			});
			showUploadModal = false;
			productName = '';
			productStock = 0;
			productPrice = '';
			if (fileInput) fileInput.value = '';
		} catch (e) {
			// Error notification handled in uploadProduct
		}
	}
	let result: RecordModel[] = $state([]);
	pocketbase.collection('products').subscribe('*', async function (e) {
		result = await getMyProducts();
		console.log(result);
	});
	onMount(async () => {
		result = await getMyProducts();
	});

	function handleEditProduct(product: RecordModel) {
		editProductId = product.id;
		editProductName = product.title;
		editProductStock = product.quantity;
		editProductPrice = product.price;
		editPayload.category = product.category;
		editPayload.description = product.description;
		editProductThreshold = product.threshold;
		showEditModal = true;
	}

	async function handleProductEditSubmit(e: Event) {
		e.preventDefault();
		if (!editProductName || !editProductPrice) {
			notify('Error', 'Please fill all required fields.', 'error');
			return;
		}
		try {
			await updateProductById(editProductId, {
				title: editProductName,
				description: editPayload.description,
				price: Number(editProductPrice),
				category: editPayload.category,
				product_image: editFileInput?.files?.[0],
				quantity: editProductStock ? Number(editProductStock) : undefined,
				threshold: editProductThreshold ? Number(editProductThreshold) : undefined
			});
			showEditModal = false;
			// Refresh product list
			result = await getMyProducts();
		} catch (e) {
			// Error notification handled in updateProductById
		}
	}
</script>

<div class="flex items-center justify-between mb-4">
	<div class="text-2xl font-semibold {darkmode ? 'text-white' : 'text-black'}">Inventory</div>
	<button
		class="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
		onclick={() => (showUploadModal = true)}
	>
		<svg
			class="w-5 h-5 mr-2"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
		</svg>
		Add Product
	</button>
</div>

{#if showUploadModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
		<div
			class={`${darkmode ? ' bg-gray-800' : 'bg-white '} rounded-lg shadow-lg p-6 w-full max-w-md`}
		>
			<h2 class={`text-lg font-semibold mb-4 ${darkmode ? 'text-white' : ''}`}>
				Upload New Product
			</h2>
			<form onsubmit={handleProductUpload}>
				<div class="mb-3">
					<label class={`block mb-1 text-sm font-medium ${darkmode ? 'text-gray-200' : ''}`}
						>Product Name</label
					>
					<input
						type="text"
						bind:value={productName}
						required
						class={`w-full px-3 py-2 border rounded ${darkmode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
					/>
				</div>
				<div class="mb-3">
					<label class={`block mb-1 text-sm font-medium ${darkmode ? 'text-gray-200' : ''}`}>
						Category
					</label>
					<select
						bind:value={payload.category}
						required
						class={`w-full px-3 py-2 border rounded ${darkmode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
					>
						<option value="" disabled selected>Select category</option>
						<option value="electronics">Electronics</option>
						<option value="fashion">Fashion</option>
						<option value="home">Home & Kitchen</option>
						<option value="beauty">Beauty & Personal Care</option>
						<option value="sports">Sports & Outdoors</option>
						<option value="toys">Toys & Games</option>
						<option value="books">Books</option>
						<option value="automotive">Automotive</option>
						<option value="health">Health & Wellness</option>
						<option value="groceries">Groceries</option>
						<option value="office">Office Supplies</option>
						<option value="pet">Pet Supplies</option>
					</select>
				</div>
				<div class="mb-3">
					<label class={`block mb-1 text-sm font-medium ${darkmode ? 'text-gray-200' : ''}`}
						>Stock</label
					>
					<input
						type="number"
						min="0"
						bind:value={productStock}
						required
						class={`w-full px-3 py-2 border rounded ${darkmode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
					/>
				</div>
				<div class="mb-3">
					<label class={`block mb-1 text-sm font-medium ${darkmode ? 'text-gray-200' : ''}`}
						>Price</label
					>
					<input
						type="number"
						min="0"
						step="0.01"
						bind:value={productPrice}
						required
						class={`w-full px-3 py-2 border rounded ${darkmode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
					/>
				</div>
				<div class="mb-3">
					<label class={`block mb-1 text-sm font-medium ${darkmode ? 'text-gray-200' : ''}`}
						>Image</label
					>
					<input
						type="file"
						accept="image/*"
						bind:this={fileInput}
						class={`w-full ${darkmode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
					/>
				</div>
				<label class={`block mb-1 text-sm font-medium ${darkmode ? 'text-gray-200' : ''}`}
					>Description</label
				>
				<textarea
					bind:value={payload.description}
					class={`w-full px-3 py-2 border rounded ${darkmode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
				></textarea>
				<div class="mb-3">
					<label class={`block mb-1 text-sm font-medium ${darkmode ? 'text-gray-200' : ''}`}
						>Threshold</label
					>
					<input
						type="number"
						min="0"
						bind:value={payload.threshold}
						required
						class={`w-full px-3 py-2 border rounded ${darkmode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
					/>
					<p class="text-xs text-gray-500 mt-1">
						If the product stock falls below this number, it will be marked as low stock.
					</p>
				</div>
				<div class="flex justify-end space-x-2 mt-4">
					<button
						type="button"
						class={`px-4 py-2 rounded ${darkmode ? 'bg-gray-700 text-white' : 'bg-gray-200'}`}
						onclick={() => (showUploadModal = false)}>Cancel</button
					>
					<button
						type="submit"
						class="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Upload</button
					>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if showEditModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
		<div
			class={`${darkmode ? ' bg-gray-800' : 'bg-white '} rounded-lg shadow-lg p-6 w-full max-w-md`}
		>
			<h2 class={`text-lg font-semibold mb-4 ${darkmode ? 'text-white' : ''}`}>Edit Product</h2>
			<form onsubmit={handleProductEditSubmit}>
				<div class="mb-3">
					<label class={`block mb-1 text-sm font-medium ${darkmode ? 'text-gray-200' : ''}`}
						>Product Name</label
					>
					<input
						type="text"
						bind:value={editProductName}
						required
						class={`w-full px-3 py-2 border rounded ${darkmode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
					/>
				</div>
				<div class="mb-3">
					<label class={`block mb-1 text-sm font-medium ${darkmode ? 'text-gray-200' : ''}`}
						>Category</label>
					<select
						bind:value={editPayload.category}
						required
						class={`w-full px-3 py-2 border rounded ${darkmode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
					>
						<option value="" disabled>Select category</option>
						<option value="electronics">Electronics</option>
						<option value="fashion">Fashion</option>
						<option value="home">Home & Kitchen</option>
						<option value="beauty">Beauty & Personal Care</option>
						<option value="sports">Sports & Outdoors</option>
						<option value="toys">Toys & Games</option>
						<option value="books">Books</option>
						<option value="automotive">Automotive</option>
						<option value="health">Health & Wellness</option>
						<option value="groceries">Groceries</option>
						<option value="office">Office Supplies</option>
						<option value="pet">Pet Supplies</option>
					</select>
				</div>
				<div class="mb-3">
					<label class={`block mb-1 text-sm font-medium ${darkmode ? 'text-gray-200' : ''}`
						>Stock</label
					>
					<input
						type="number"
						min="0"
						bind:value={editProductStock}
						required
						class={`w-full px-3 py-2 border rounded ${darkmode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
					/>
				</div>
				<div class="mb-3">
					<label class={`block mb-1 text-sm font-medium ${darkmode ? 'text-gray-200' : ''}`
						>Price</label
					>
					<input
						type="number"
						min="0"
						step="0.01"
						bind:value={editProductPrice}
						required
						class={`w-full px-3 py-2 border rounded ${darkmode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
					/>
				</div>
				<div class="mb-3">
					<label class={`block mb-1 text-sm font-medium ${darkmode ? 'text-gray-200' : ''}`
						>Image</label
					>
					<input
						type="file"
						accept="image/*"
						bind:this={editFileInput}
						class={`w-full ${darkmode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
					/>
				</div>
				<label class={`block mb-1 text-sm font-medium ${darkmode ? 'text-gray-200' : ''}`
					>Description</label
				>
				<textarea
					bind:value={editPayload.description}
					class={`w-full px-3 py-2 border rounded ${darkmode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
				></textarea>
				<div class="mb-3">
					<label class={`block mb-1 text-sm font-medium ${darkmode ? 'text-gray-200' : ''}`
						>Threshold</label
					>
					<input
						type="number"
						min="0"
						bind:value={editProductThreshold}
						required
						class={`w-full px-3 py-2 border rounded ${darkmode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
					/>
					<p class="text-xs text-gray-500 mt-1">
						If the product stock falls below this number, it will be marked as low stock.
					</p>
				</div>
				<div class="flex justify-end space-x-2 mt-4">
					<button
						type="button"
						class={`px-4 py-2 rounded ${darkmode ? 'bg-gray-700 text-white' : 'bg-gray-200'}`}
						onclick={() => (showEditModal = false)}>Cancel</button
					>
					<button
						type="submit"
						class="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Save</button
					>
				</div>
			</form>
		</div>
	</div>
{/if}

<div
	class={`md:col-span-3 p-4 rounded-lg shadow mt-6 ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
>
	<div class="overflow-x-auto">
		<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm align-middle">
			<thead>
				<tr>
					<th
						class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${darkmode
							? 'text-gray-300'
							: 'text-gray-700'}">Image</th
					>
					<th
						class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${darkmode
							? 'text-gray-300'
							: 'text-gray-700'}">Product</th
					>
					<th
						class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${darkmode
							? 'text-gray-300'
							: 'text-gray-700'}">Stock</th
					>
					<th
						class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${darkmode
							? 'text-gray-300'
							: 'text-gray-700'}">Price</th
					>
					<th
						class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${darkmode
							? 'text-gray-300'
							: 'text-gray-700'}">Status</th
					>
					<th
						class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${darkmode
							? 'text-gray-300'
							: 'text-gray-700'}">Actions</th
					>
				</tr>
			</thead>
			<tbody>
				{#if result.length > 0}
					{#each result as product}
						<tr class="align-middle">
							<td class="px-4 py-2">
								{#if product.imageUrl}
									<img
										src={product.imageUrl}
										alt={product.title}
										class="w-12 h-12 object-cover rounded"
									/>
								{:else}
									<span class="text-gray-400 italic">No image</span>
								{/if}
							</td>
							<td class="px-4 py-2 align-middle">{product.title}</td>
							<td class="px-4 py-2 align-middle">{product.quantity}</td>
							<td class="px-4 py-2 align-middle">{currency()}{product.price.toLocaleString()}</td>
							<td class="px-4 py-2 align-middle">
								{#if product.quantity > product.threshold}
									<span
										class="px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
										>Active</span
									>
								{:else if product.quantity === 0}
									<span
										class="px-2 py-1 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
										>Out of Stock</span
									>
								{:else}
									<span
										class="px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
										>Low Stock</span
									>
								{/if}
							</td>
							<td class="px-4 py-2 align-middle">
								<button
									class="px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
									onclick={() => handleEditProduct(product)}
								>
									Edit
								</button>
							</td>
						</tr>
					{/each}
				{:else}
					<tr>
						<td class="px-4 py-2 italic" colspan="4">No products found</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
