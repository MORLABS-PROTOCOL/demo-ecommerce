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
	let orders: any[] = $state([]);
	let loading = $state(false);
	let orderStats = $state({
		totalOrders: 0,
		pendingOrders: 0,
		acceptedOrders: 0,
		rejectedOrders: 0,
		totalRevenue: 0
	});
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

	async function loadOrders() {
		const userId = pocketbase.authStore?.record?.id;
		if (!userId) return;
		
		loading = true;
		try {
			// Fetch orders for this vendor using the vendor's ID (not the user's ID)
			console.log('Loading orders for vendor_id:', user.id);
			orders = await pocketbase.collection('orders').getFullList({
				filter: `vendor_id="${user.id}"`,
				sort: '-created',
				requestKey: Date.now().toString()
			});
			console.log('Found orders:', orders.length);

			// Calculate statistics
			orderStats = {
				totalOrders: orders.length,
				pendingOrders: orders.filter(o => o.status !== 'accepted' && o.status !== 'rejected').length,
				acceptedOrders: orders.filter(o => o.status === 'accepted').length,
				rejectedOrders: orders.filter(o => o.status === 'rejected').length,
				totalRevenue: orders
					.filter(o => o.status === 'accepted')
					.reduce((sum, order) => {
						const productDetails = order.product_details || {};
						return sum + ((productDetails.price || 0) * (order.quantity || 0));
					}, 0)
			};
		} catch (error) {
			console.error('Error loading orders:', error);
			notify('Error', 'Failed to load orders data.', 'error');
		}
		loading = false;
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'accepted':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'rejected':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			default:
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
		}
	}

	function getStatusText(status: string) {
		switch (status) {
			case 'accepted':
				return 'Accepted';
			case 'rejected':
				return 'Rejected';
			default:
				return 'Pending';
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
			if (!vendor || vendor.kys_status !== 'verified') {
				console.log('No vendor');
				window.location.href = '/vendor/kys';
				return;
			}

			user = vendor;
			show = true;
			inventoryProducts = await getMyProducts(4);
			await loadOrders();
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
					<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
						<div
							class={`p-4 rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
						>
							<h2 class="text-lg font-semibold mb-2">Total Orders</h2>
							<p class="text-3xl font-bold">{loading ? '...' : orderStats.totalOrders}</p>
						</div>
						<div
							class={`p-4 rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
						>
							<h2 class="text-lg font-semibold mb-2">Pending Orders</h2>
							<p class="text-3xl font-bold text-yellow-600">{loading ? '...' : orderStats.pendingOrders}</p>
						</div>
						<div
							class={`p-4 rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
						>
							<h2 class="text-lg font-semibold mb-2">Accepted Orders</h2>
							<p class="text-3xl font-bold text-green-600">{loading ? '...' : orderStats.acceptedOrders}</p>
						</div>
						<div
							class={`p-4 rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
						>
							<h2 class="text-lg font-semibold mb-2">Total Revenue</h2>
							<p class="text-3xl font-bold text-green-600">{loading ? '...' : formatCurrency(orderStats.totalRevenue)}</p>
						</div>
						<div
							class={`md:col-span-4 p-4 rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
						>
							<h2 class="text-lg font-semibold mb-4">Recent Orders</h2>
							{#if loading}
								<div class="flex justify-center py-8">
									<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
								</div>
							{:else if orders.length === 0}
								<div class="text-center py-8 text-gray-500">
									<p>No orders found</p>
								</div>
							{:else}
								<div class="overflow-x-auto">
									<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
										<thead>
											<tr>
												<th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${darkmode ? 'text-gray-300' : 'text-gray-700'}">Order ID</th>
												<th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${darkmode ? 'text-gray-300' : 'text-gray-700'}">Product</th>
												<th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${darkmode ? 'text-gray-300' : 'text-gray-700'}">Quantity</th>
												<th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${darkmode ? 'text-gray-300' : 'text-gray-700'}">Amount</th>
												<th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${darkmode ? 'text-gray-300' : 'text-gray-700'}">Status</th>
												<th class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${darkmode ? 'text-gray-300' : 'text-gray-700'}">Date</th>
											</tr>
										</thead>
										<tbody>
											{#each orders.slice(0, 10) as order}
												{@const productDetails = order.product_details || {}}
												{@const totalAmount = (productDetails.price || 0) * (order.quantity || 0)}
												<tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
													<td class="px-4 py-2 text-sm font-medium">#{order.id.slice(0, 8)}</td>
													<td class="px-4 py-2 text-sm">
														<div class="flex items-center">
															<img class="h-8 w-8 rounded-full object-cover mr-3" src={productDetails.image || '/placeholder.jpg'} alt={productDetails.title} />
															<span class="truncate max-w-32">{productDetails.title || 'Unknown Product'}</span>
														</div>
													</td>
													<td class="px-4 py-2 text-sm">{order.quantity || 0}</td>
													<td class="px-4 py-2 text-sm font-medium">{formatCurrency(totalAmount)}</td>
													<td class="px-4 py-2 text-sm">
														<span class="px-2 py-1 rounded text-xs ${getStatusColor(order.status)}">
															{getStatusText(order.status)}
														</span>
													</td>
													<td class="px-4 py-2 text-sm text-gray-500">{formatDate(order.created)}</td>
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							{/if}
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
									<label class="block mb-2"
										>Store Name
										<input
											class="w-full border px-2 py-1"
											bind:value={editPayload.store_name}
											required
										/>
									</label>
									<label class="block mb-2"
										>Store Niche
										<input
											class="w-full border px-2 py-1"
											bind:value={editPayload.store_niche}
											required
										/>
									</label>
									<label class="block mb-2"
										>Store Address
										<input
											class="w-full border px-2 py-1"
											bind:value={editPayload.store_address}
											required
										/>
									</label>
									<label class="block mb-2"
										>Store Description
										<textarea
											class="w-full border px-2 py-1"
											bind:value={editPayload.store_description}
											required
										></textarea>
									</label>
									<label class="block mb-2"
										>Store Phone
										<input
											class="w-full border px-2 py-1"
											bind:value={editPayload.store_phone}
											required
										/>
									</label>
									<!-- Add more fields as needed -->
									<div class="flex gap-2 mt-4">
										<button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded"
											>Save Changes</button
										>
										<button
											type="button"
											class="bg-gray-400 text-white px-4 py-2 rounded"
											onclick={() => (showEditModal = false)}>Cancel</button
										>
									</div>
								</form>
							</div>
						</div>
					{/if}
				{:else if selectedTab === 'orders'}
					<div class="flex justify-between items-center mb-6">
						<div>
							<h1 class={`text-2xl font-semibold ${darkmode ? 'text-white' : 'text-gray-800'}`}>
								Orders Management
					</h1>
					<p class={`${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
								Manage and track all your orders
							</p>
						</div>
						<button 
							onclick={loadOrders}
							class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
							disabled={loading}
						>
							{loading ? 'Refreshing...' : 'Refresh Orders'}
						</button>
					</div>

					<!-- Order Statistics Cards -->
					<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
						<div class={`p-4 rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
							<div class="flex items-center">
								<div class="p-2 bg-blue-100 rounded-lg">
									<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
									</svg>
								</div>
								<div class="ml-4">
									<p class="text-sm font-medium text-gray-600">Total Orders</p>
									<p class="text-2xl font-semibold">{orderStats.totalOrders}</p>
								</div>
							</div>
						</div>

						<div class={`p-4 rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
							<div class="flex items-center">
								<div class="p-2 bg-yellow-100 rounded-lg">
									<svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
									</svg>
								</div>
								<div class="ml-4">
									<p class="text-sm font-medium text-gray-600">Pending</p>
									<p class="text-2xl font-semibold text-yellow-600">{orderStats.pendingOrders}</p>
								</div>
							</div>
						</div>

						<div class={`p-4 rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
							<div class="flex items-center">
								<div class="p-2 bg-green-100 rounded-lg">
									<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
									</svg>
								</div>
								<div class="ml-4">
									<p class="text-sm font-medium text-gray-600">Accepted</p>
									<p class="text-2xl font-semibold text-green-600">{orderStats.acceptedOrders}</p>
								</div>
							</div>
						</div>

						<div class={`p-4 rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
							<div class="flex items-center">
								<div class="p-2 bg-green-100 rounded-lg">
									<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
									</svg>
								</div>
								<div class="ml-4">
									<p class="text-sm font-medium text-gray-600">Revenue</p>
									<p class="text-2xl font-semibold text-green-600">{formatCurrency(orderStats.totalRevenue)}</p>
								</div>
							</div>
						</div>
					</div>

					<!-- Orders Table -->
					<div class={`rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
						<div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
							<h3 class="text-lg font-semibold">All Orders</h3>
						</div>
						<div class="overflow-x-auto">
							{#if loading}
								<div class="flex justify-center py-12">
									<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
								</div>
							{:else if orders.length === 0}
								<div class="text-center py-12 text-gray-500">
									<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
									</svg>
									<p class="mt-2 text-lg">No orders found</p>
									<p class="text-sm">Orders will appear here when customers add your products to their cart</p>
								</div>
							{:else}
								<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
									<thead class="bg-gray-50 dark:bg-gray-700">
										<tr>
											<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order ID</th>
											<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
											<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
											<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unit Price</th>
											<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Amount</th>
											<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
											<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
										</tr>
									</thead>
									<tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
										{#each orders as order}
											{@const productDetails = order.product_details || {}}
											{@const totalAmount = (productDetails.price || 0) * (order.quantity || 0)}
											<tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
												<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
													#{order.id.slice(0, 8)}
												</td>
												<td class="px-6 py-4 whitespace-nowrap">
													<div class="flex items-center">
														<div class="h-10 w-10 flex-shrink-0">
															<img class="h-10 w-10 rounded-full object-cover" src={productDetails.image || '/placeholder.jpg'} alt={productDetails.title} />
														</div>
														<div class="ml-4">
															<div class="text-sm font-medium text-gray-900 dark:text-white">{productDetails.title || 'Unknown Product'}</div>
															<div class="text-sm text-gray-500 dark:text-gray-400">{productDetails.category || ''}</div>
														</div>
													</div>
												</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
													{order.quantity || 0}
												</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
													{formatCurrency(productDetails.price || 0)}
												</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
													{formatCurrency(totalAmount)}
												</td>
												<td class="px-6 py-4 whitespace-nowrap">
													<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}">
														{getStatusText(order.status)}
													</span>
												</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
													{formatDate(order.created)}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							{/if}
						</div>
					</div>
				{:else if selectedTab === 'inventory'}
					<!-- Upload Product Button and Modal -->
					<Inventory {darkmode} />
				{:else if selectedTab === 'finance'}
					<div class="mb-6">
						<h1 class={`text-2xl font-semibold ${darkmode ? 'text-white' : 'text-gray-800'}`}>
							Finance & Analytics
					</h1>
					<p class={`${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
							Track your revenue, earnings, and financial performance
						</p>
					</div>

					<!-- Financial Overview Cards -->
					<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
						<div class={`p-6 rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
							<div class="flex items-center">
								<div class="p-3 bg-green-100 rounded-lg">
									<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
									</svg>
								</div>
								<div class="ml-4">
									<p class="text-sm font-medium text-gray-600">Total Revenue</p>
									<p class="text-3xl font-bold text-green-600">{formatCurrency(orderStats.totalRevenue)}</p>
									<p class="text-xs text-gray-500">From accepted orders</p>
								</div>
							</div>
						</div>

						<div class={`p-6 rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
							<div class="flex items-center">
								<div class="p-3 bg-blue-100 rounded-lg">
									<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
									</svg>
								</div>
								<div class="ml-4">
									<p class="text-sm font-medium text-gray-600">Average Order Value</p>
									<p class="text-3xl font-bold text-blue-600">
										{orderStats.acceptedOrders > 0 ? formatCurrency(orderStats.totalRevenue / orderStats.acceptedOrders) : '$0.00'}
									</p>
									<p class="text-xs text-gray-500">Per accepted order</p>
								</div>
							</div>
						</div>

						<div class={`p-6 rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
							<div class="flex items-center">
								<div class="p-3 bg-purple-100 rounded-lg">
									<svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
									</svg>
								</div>
								<div class="ml-4">
									<p class="text-sm font-medium text-gray-600">Acceptance Rate</p>
									<p class="text-3xl font-bold text-purple-600">
										{orderStats.totalOrders > 0 ? Math.round((orderStats.acceptedOrders / orderStats.totalOrders) * 100) : 0}%
									</p>
									<p class="text-xs text-gray-500">Orders accepted</p>
								</div>
							</div>
						</div>
					</div>

					<!-- Revenue Chart Placeholder -->
					<div class={`rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
						<div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
							<h3 class="text-lg font-semibold">Revenue Overview</h3>
						</div>
						<div class="p-6">
							<div class="text-center py-12 text-gray-500">
								<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
								</svg>
								<p class="mt-2 text-lg">Revenue Chart</p>
								<p class="text-sm">Chart visualization will be implemented here</p>
							</div>
						</div>
					</div>

					<!-- Recent Financial Activity -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
						<div class={`rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
							<div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
								<h3 class="text-lg font-semibold">Recent Earnings</h3>
							</div>
							<div class="p-6">
								{#if orders.filter(o => o.status === 'accepted').length === 0}
									<div class="text-center py-8 text-gray-500">
										<p>No earnings yet</p>
									</div>
								{:else}
									<div class="space-y-4">
										{#each orders.filter(o => o.status === 'accepted').slice(0, 5) as order}
											{@const productDetails = order.product_details || {}}
											{@const totalAmount = (productDetails.price || 0) * (order.quantity || 0)}
											<div class="flex justify-between items-center">
												<div>
													<p class="text-sm font-medium">{productDetails.title || 'Unknown Product'}</p>
													<p class="text-xs text-gray-500">{formatDate(order.created)}</p>
												</div>
												<span class="text-green-600 font-semibold">+{formatCurrency(totalAmount)}</span>
											</div>
										{/each}
									</div>
								{/if}
							</div>
						</div>

						<div class={`rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
							<div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
								<h3 class="text-lg font-semibold">Order Status Breakdown</h3>
							</div>
							<div class="p-6">
								<div class="space-y-4">
									<div class="flex justify-between items-center">
										<span class="text-sm">Accepted Orders</span>
										<div class="flex items-center">
											<div class="w-24 bg-gray-200 rounded-full h-2 mr-3">
												<div class="bg-green-600 h-2 rounded-full" style="width: {orderStats.totalOrders > 0 ? (orderStats.acceptedOrders / orderStats.totalOrders) * 100 : 0}%"></div>
											</div>
											<span class="text-sm font-medium">{orderStats.acceptedOrders}</span>
										</div>
									</div>
									<div class="flex justify-between items-center">
										<span class="text-sm">Pending Orders</span>
										<div class="flex items-center">
											<div class="w-24 bg-gray-200 rounded-full h-2 mr-3">
												<div class="bg-yellow-600 h-2 rounded-full" style="width: {orderStats.totalOrders > 0 ? (orderStats.pendingOrders / orderStats.totalOrders) * 100 : 0}%"></div>
											</div>
											<span class="text-sm font-medium">{orderStats.pendingOrders}</span>
										</div>
									</div>
									<div class="flex justify-between items-center">
										<span class="text-sm">Rejected Orders</span>
										<div class="flex items-center">
											<div class="w-24 bg-gray-200 rounded-full h-2 mr-3">
												<div class="bg-red-600 h-2 rounded-full" style="width: {orderStats.totalOrders > 0 ? (orderStats.rejectedOrders / orderStats.totalOrders) * 100 : 0}%"></div>
											</div>
											<span class="text-sm font-medium">{orderStats.rejectedOrders}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
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
