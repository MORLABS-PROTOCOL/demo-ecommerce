<script lang="ts">
	import Inventory from '$lib/components/Inventory.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import {
		pocketbase,
		validateAuthState,
		notify,
		uploadProduct,
		getMyProducts,
		currency
	} from '$lib/controls.svelte';
	import { onMount } from 'svelte';
	let darkmode = $state(false);
	let sidebarCollapsed = $state(true);
	let selectedTab = $state('dashboard');

	const handleDarkMode = () => {
		darkmode = !darkmode;
	};
	let show: boolean = $state(false);
	let showUploadModal: boolean = $state(false);
	let payload = $state({
		productName: '',
		productStock: '',
		productPrice: '',
		category: '',
		fileInput: null as HTMLInputElement | null,
		description: ''
	});

	let productName = $state('');
	let productStock: number = $state(0);
	let productPrice: number | '' = $state('');
	let fileInput: HTMLInputElement | null = $state(null);
	let inventoryProducts: any[] = $state([]);
	let showEditModal = $state(false);
	type VendorEditPayload = {
		store_name: string;
		store_niche: string;
		store_address: string;
		store_description: string;
		store_phone: string;
		[key: string]: any;
	};
	let editPayload = $state<VendorEditPayload>({
		store_name: '',
		store_niche: '',
		store_address: '',
		store_description: '',
		store_phone: ''
	});

	function openEditModal() {
		editPayload = { ...user };
		showEditModal = true;
	}

	async function handleEditSubmit(e: Event) {
		e.preventDefault();
		const updateData = { ...editPayload, kys_status: 'pending' };
		try {
			await pocketbase.collection('vendors').update(user.id, updateData);
			notify('Success', 'Your changes have been submitted and are pending approval.', 'success');
			showEditModal = false;
			window.location.reload();
		} catch (err) {
			notify('Error', 'Failed to update vendor info.', 'error');
		}
	}

	async function handleProductUpload() {
		if (!productName || !productPrice || !fileInput?.files?.[0]) {
			notify('Error', 'Please fill all required fields.', 'error');
			return;
		}
		try {
			await uploadProduct({
				title: productName,
				description: payload.description, // Add description if you have a field for it
				price: Number(productPrice),
				category: payload.category, // Replace with actual category if you have a field
				product_image: fileInput.files[0],
				quantity: Number(productStock)
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
	const setTab = (tab: string) => {
		if (tab === 'toggleSidebar') {
			sidebarCollapsed = !sidebarCollapsed;
		} else {
			selectedTab = tab;
		}
	};
	let valid: any = $state(false);
	let user: any = $state({});
	onMount(async () => {
		valid = validateAuthState();
		if (!valid) {
			window.location.href = '/login';
		} else {
			let vendor: any = $state({});
			try {
				const userId = pocketbase.authStore?.record?.id;
				const result = await pocketbase.collection('vendors').getFullList({
					filter: `user_id="${userId}"`
				});
				vendor = result[0];
			} catch (e) {
				// Vendor does not exist, just return silently
				return;
			}
			if (!vendor) {
				console.log('No vendor');

				return;
			}
			user = vendor;
			// console.log('User: ', user);
			// console.log('Vendor: ', user);
			if (user.kys_status !== 'verified') {
				window.location.href = '/vendor/kys';
				return;
			}
			show = true;
			inventoryProducts = await getMyProducts(4);
		}
	});
</script>

<Seo
	title="Vixstores | Vendor Dashboard"
	description="Vendor dashboard for managing orders, inventory, and finances."
	keywords="vixstores, vendor, dashboard, orders, inventory, finance"
/>

{#if show === true}
	<div class={`flex min-h-screen h-auto ${darkmode ? 'bg-gray-900' : 'bg-gray-100'}`}>
		<!-- Sidebar -->
		<aside
			class={`fixed top-0 left-0 h-screen transition-all duration-300 z-20 ${sidebarCollapsed ? 'w-[90px]' : 'w-[300px]'} ${darkmode ? 'bg-gray-800' : 'bg-white'} shadow
			
					`}
			style="width: ${sidebarCollapsed ? '95px' : '300px'}"
		>
			<nav
				class={`flex flex-col h-full border-r ${darkmode ? 'border-gray-700' : 'border-gray-200'} p-4`}
			>
				<!-- Toggle Sidebar -->
				<div
					class="flex {sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-6 items-center"
				>
					<div
						class="{sidebarCollapsed ? 'hidden' : 'md:block'}  text-lg font-semibold {darkmode
							? 'text-white'
							: 'text-gray-800'}"
					>
						Hello, {pocketbase.authStore.record?.username || 'Vendor'}
					</div>
					<div class="">
						<button onclick={() => setTab('toggleSidebar')}>
							<svg
								class="h-6 w-6 text-gray-500 hover:text-indigo-600 transition"
								viewBox="0 0 24 24"
								stroke="currentColor"
								fill="none"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d={sidebarCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
								/>
							</svg>
						</button>
					</div>
				</div>

				<!-- Navigation -->
				<ul class="flex-1 space-y-2">
					<li>
						<button
							onclick={() => setTab('dashboard')}
							class={`flex items-center w-full px-4 py-2 rounded-md text-left ${darkmode ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-indigo-100'} transition`}
						>
							🏠 {sidebarCollapsed ? '' : 'Dashboard'}
						</button>
					</li>

					<li>
						<button
							onclick={() => setTab('orders')}
							class={`flex items-center w-full px-4 py-2 rounded-md text-left ${darkmode ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-indigo-100'} transition`}
						>
							📑 {sidebarCollapsed ? '' : 'Manage Orders'}
						</button>
					</li>

					<li>
						<button
							onclick={() => setTab('inventory')}
							class={`flex items-center w-full px-4 py-2 rounded-md text-left ${darkmode ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-indigo-100'} transition`}
						>
							📦 {sidebarCollapsed ? '' : 'Inventory'}
						</button>
					</li>

					<li>
						<button
							onclick={() => setTab('finance')}
							class={`flex items-center w-full px-4 py-2 rounded-md text-left ${darkmode ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-indigo-100'} transition`}
						>
							💰 {sidebarCollapsed ? '' : 'Finance'}
						</button>
					</li>

					<!-- Edit Store Info Sidebar Item -->
					<li>
						<button
							onclick={openEditModal}
							class={`flex items-center w-full px-4 py-2 rounded-md text-left ${darkmode ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-indigo-100'} transition`}
						>
							✏️ {sidebarCollapsed ? '' : 'Edit Store Info'}
						</button>
					</li>
				</ul>

				<!-- Dark mode toggle -->
				<div
					class={`flex items-center w-full px-4 py-2 rounded-md text-left ${darkmode ? 'text-white' : 'text-gray-800'} transition cursor-pointer`}
					onclick={handleDarkMode}
				>
					<span class="relative inline-block w-10 align-middle select-none transition">
						<span
							class={`block w-10 h-6 rounded-full ${darkmode ? 'bg-indigo-600' : 'bg-gray-300'}`}
						></span>
						<span
							class={`absolute left-0 top-0 w-6 h-6 bg-white border rounded-full shadow transform ${darkmode ? 'translate-x-4' : ''}`}
						></span>
					</span>
					{#if !sidebarCollapsed}
						<span class="ml-2">{darkmode ? 'Dark mode' : 'Light mode'}</span>
					{/if}
				</div>

				<p class={`mt-6 text-sm text-center ${darkmode ? 'text-gray-400' : 'text-gray-500'}`}>
					&copy; {new Date().getFullYear()} Vixstores
				</p>
			</nav>
			<style>
				@media (max-width: 640px) {
					aside {
						position: static !important;
						width: 100vw !important;
						height: auto !important;
						z-index: 10 !important;
					}
					main {
						margin-left: 0 !important;
					}
				}
			</style>
		</aside>

		<!-- Main Content -->
		<main
			class="p-4 sm:p-6 w-full transition-all duration-300"
			style="margin-left: {sidebarCollapsed ? '95px' : '300px'}"
		>
			<div class="max-w-full">
				{#if selectedTab === 'dashboard'}
					<h1 class={`text-2xl font-semibold mb-4 ${darkmode ? 'text-white' : 'text-gray-800'}`}>
						Dashboard
					</h1>
					<p class={`${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
						Welcome to your vendor dashboard. Here you can get an overview of your store's
						performance, recent activity, and quick actions.
					</p>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
						<div
							class={`p-4 rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
						>
							<h2 class="text-lg font-semibold mb-2">Today's Orders</h2>
							<p class="text-3xl font-bold">12</p>
						</div>
						<div
							class={`p-4 rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
						>
							<h2 class="text-lg font-semibold mb-2">Inventory</h2>
							<p class="text-3xl font-bold">245</p>
						</div>
						<div
							class={`p-4 rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
						>
							<h2 class="text-lg font-semibold mb-2">Revenue</h2>
							<p class="text-3xl font-bold">{currency()}1,230</p>
						</div>
						<div
							class={`md:col-span-3 p-4 rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
						>
							<h2 class="text-lg font-semibold mb-2">Pending Orders</h2>
							<ul class="divide-y divide-gray-200 dark:divide-gray-700">
								<li class="py-2 flex justify-between items-center flex-wrap">
									<span>Order #1023</span>
									<span
										class="text-sm px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
										>Pending</span
									>
								</li>
								<li class="py-2 flex justify-between items-center flex-wrap">
									<span>Order #1024</span>
									<span
										class="text-sm px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
										>Pending</span
									>
								</li>
								<li class="py-2 flex justify-between items-center flex-wrap">
									<span>Order #1025</span>
									<span
										class="text-sm px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
										>Pending</span
									>
								</li>
							</ul>
						</div>
					</div>
					<div
						class={`md:col-span-3 p-4 rounded-lg shadow mt-6 ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
					>
						<h2 class="text-lg font-semibold mb-2">Your Inventory</h2>
						<div class="overflow-x-auto">
							<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
								<thead>
									<tr>
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
									</tr>
								</thead>
								<tbody>
									{#if inventoryProducts.length > 0}
										{#each inventoryProducts as product}
											<tr>
												<td class="px-4 py-2">{product.title}</td>
												<td class="px-4 py-2">{product.quantity}</td>
												<td class="px-4 py-2">{currency()}{product.price.toLocaleString()}</td>
												<td class="px-4 py-2">
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
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
						<!-- Finance History -->
						<div
							class={`p-4 rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
						>
							<h2 class="text-lg font-semibold mb-2">Finance History</h2>
							<ul class="divide-y divide-gray-200 dark:divide-gray-700">
								<li class="py-2 flex justify-between flex-wrap">
									<span>2024-06-01</span>
									<span class="text-green-600 dark:text-green-400">+ {currency()}500.00</span>
								</li>
								<li class="py-2 flex justify-between flex-wrap">
									<span>2024-05-28</span>
									<span class="text-green-600 dark:text-green-400">+ {currency()}320.00</span>
								</li>
								<li class="py-2 flex justify-between flex-wrap">
									<span>2024-05-20</span>
									<span class="text-red-600 dark:text-red-400">- {currency()}50.00 (Refund)</span>
								</li>
								<li class="py-2 flex justify-between flex-wrap">
									<span>2024-05-15</span>
									<span class="text-green-600 dark:text-green-400">+ {currency()}200.00</span>
								</li>
							</ul>
						</div>
						<!-- Expected Payouts -->
						<div
							class={`p-4 rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
						>
							<h2 class="text-lg font-semibold mb-2">Expected Payouts</h2>
							<ul class="divide-y divide-gray-200 dark:divide-gray-700">
								<li class="py-2 flex justify-between flex-wrap">
									<span>2024-06-10</span>
									<span class="text-green-600 dark:text-green-400">{currency()}400.00</span>
								</li>
								<li class="py-2 flex justify-between flex-wrap">
									<span>2024-06-17</span>
									<span class="text-green-600 dark:text-green-400">{currency()}350.00</span>
								</li>
								<li class="py-2 flex justify-between flex-wrap">
									<span>2024-06-24</span>
									<span class="text-green-600 dark:text-green-400">{currency()}600.00</span>
								</li>
							</ul>
						</div>
					</div>
					<div
						class={`md:col-span-3 p-4 rounded-lg shadow mt-6 ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
					>
						<h2 class="text-lg font-semibold mb-2">Your Rating</h2>
						<div class="flex items-center space-x-1 text-yellow-400 text-2xl">
							<span>★</span>
							<span>★</span>
							<span>★</span>
							<span>★</span>
							<span class={`${darkmode ? 'text-gray-500' : 'text-gray-300'}`}>★</span>
							<span class={`ml-2 text-base ${darkmode ? 'text-gray-300' : 'text-gray-600'}`}
								>4.0/5</span
							>
						</div>
					</div>
					{#if showEditModal}
						<div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
							<div class="bg-white p-6 rounded shadow max-w-lg w-full">
								<h2 class="text-lg font-bold mb-4">Edit Store Information</h2>
								<form onsubmit={handleEditSubmit}>
									<label class="block mb-2">Store Name
										<input class="w-full border px-2 py-1" bind:value={editPayload.store_name} required />
									</label>
									<label class="block mb-2">Store Niche
										<input class="w-full border px-2 py-1" bind:value={editPayload.store_niche} required />
									</label>
									<label class="block mb-2">Store Address
										<input class="w-full border px-2 py-1" bind:value={editPayload.store_address} required />
									</label>
									<label class="block mb-2">Store Description
										<textarea class="w-full border px-2 py-1" bind:value={editPayload.store_description} required></textarea>
									</label>
									<label class="block mb-2">Store Phone
										<input class="w-full border px-2 py-1" bind:value={editPayload.store_phone} required />
									</label>
									<!-- Add more fields as needed -->
									<div class="flex gap-2 mt-4">
										<button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">Save Changes</button>
										<button type="button" class="bg-gray-400 text-white px-4 py-2 rounded" onclick={() => showEditModal = false}>Cancel</button>
									</div>
								</form>
							</div>
						</div>
					{/if}
				{:else if selectedTab === 'orders'}
					<h1 class={`text-2xl font-semibold mb-4 ${darkmode ? 'text-white' : 'text-gray-800'}`}>
						Orders
					</h1>
					<p class={`${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
						Here are your recent orders and status.
					</p>
				{:else if selectedTab === 'inventory'}
					<!-- Upload Product Button and Modal -->
					<Inventory {darkmode} />
				{:else if selectedTab === 'finance'}
					<h1 class={`text-2xl font-semibold mb-4 ${darkmode ? 'text-white' : 'text-gray-800'}`}>
						Vendor Dashboard
					</h1>
					<p class={`${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
						Manage your store, products, and analytics here.
					</p>
				{/if}
			</div>
		</main>

		<style>
			@media (max-width: 640px) {
				main {
					margin-left: 0 !important;
				}
			}
		</style>
	</div>
{:else}
	<p class="max-w-5xl mx-auto flex justify-center items-center italic">Loading...</p>
{/if}
