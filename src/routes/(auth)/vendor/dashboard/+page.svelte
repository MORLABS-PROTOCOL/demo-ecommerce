<script>
	import Seo from '$lib/components/Seo.svelte';
	import { pocketbase } from '$lib/controls.svelte';

	let darkmode = $state(false);
	let sidebarCollapsed = $state(false);
	let selectedTab = $state('dashboard');

	const handleDarkMode = () => {
		darkmode = !darkmode;
	};
	const setTab = (tab) => {
		if (tab === 'toggleSidebar') {
			sidebarCollapsed = !sidebarCollapsed;
		} else {
			selectedTab = tab;
		}
	};
</script>

<Seo
	title="Vixstores | Vendor Dashboard"
	description="Vendor dashboard for managing orders, inventory, and finances."
	keywords="vixstores, vendor, dashboard, orders, inventory, finance"
/>

<div class={`flex min-h-screen h-auto ${darkmode ? 'bg-gray-900' : 'bg-gray-100'}`}>
	<!-- Sidebar -->
	<aside
		class={`fixed top-0 left-0 h-screen transition-all duration-300 z-20 ${sidebarCollapsed ? 'w-[95px]' : 'w-[300px]'} ${darkmode ? 'bg-gray-800' : 'bg-white'} shadow`}
	>
		<nav
			class={`flex flex-col h-full border-r ${darkmode ? 'border-gray-700' : 'border-gray-200'} p-4`}
		>
			<!-- Toggle Sidebar -->
			<div class="flex {sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-6 items-center">
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
			</ul>

			<!-- Dark mode toggle -->
			<div
				class={`flex items-center w-full px-4 py-2 rounded-md text-left ${darkmode ? 'text-white' : 'text-gray-800'} transition cursor-pointer`}
				onclick={handleDarkMode}
			>
				<span class="relative inline-block w-10 align-middle select-none transition">
					<span class={`block w-10 h-6 rounded-full ${darkmode ? 'bg-indigo-600' : 'bg-gray-300'}`}
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
	</aside>

	<!-- Main Content -->
	<main
		class="p-6 w-full transition-all duration-300"
		style="margin-left: {sidebarCollapsed ? '95px' : '300px'}"
	>
		{#if selectedTab === 'dashboard'}
			<h1 class={`text-2xl font-semibold mb-4 ${darkmode ? 'text-white' : 'text-gray-800'}`}>
				Dashboard
			</h1>
			<p class={`${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
				Welcome to your vendor dashboard. Here you can get an overview of your store's performance,
				recent activity, and quick actions.
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
					<p class="text-3xl font-bold">$1,230</p>
				</div>
				<div
					class={`md:col-span-3 p-4 rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
				>
					<h2 class="text-lg font-semibold mb-2">Pending Orders</h2>
					<ul class="divide-y divide-gray-200 dark:divide-gray-700">
						<li class="py-2 flex justify-between items-center">
							<span>Order #1023</span>
							<span
								class="text-sm px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
								>Pending</span
							>
						</li>
						<li class="py-2 flex justify-between items-center">
							<span>Order #1024</span>
							<span
								class="text-sm px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
								>Pending</span
							>
						</li>
						<li class="py-2 flex justify-between items-center">
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
					<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
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
							<tr>
								<td class="px-4 py-2">Red T-shirt</td>
								<td class="px-4 py-2">32</td>
								<td class="px-4 py-2">$15.00</td>
								<td class="px-4 py-2">
									<span
										class="px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
										>Active</span
									>
								</td>
							</tr>
							<tr>
								<td class="px-4 py-2">Blue Jeans</td>
								<td class="px-4 py-2">12</td>
								<td class="px-4 py-2">$40.00</td>
								<td class="px-4 py-2">
									<span
										class="px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
										>Low Stock</span
									>
								</td>
							</tr>
							<tr>
								<td class="px-4 py-2">Sneakers</td>
								<td class="px-4 py-2">0</td>
								<td class="px-4 py-2">$60.00</td>
								<td class="px-4 py-2">
									<span
										class="px-2 py-1 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
										>Out of Stock</span
									>
								</td>
							</tr>
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
						<li class="py-2 flex justify-between">
							<span>2024-06-01</span>
							<span class="text-green-600 dark:text-green-400">+ $500.00</span>
						</li>
						<li class="py-2 flex justify-between">
							<span>2024-05-28</span>
							<span class="text-green-600 dark:text-green-400">+ $320.00</span>
						</li>
						<li class="py-2 flex justify-between">
							<span>2024-05-20</span>
							<span class="text-red-600 dark:text-red-400">- $50.00 (Refund)</span>
						</li>
						<li class="py-2 flex justify-between">
							<span>2024-05-15</span>
							<span class="text-green-600 dark:text-green-400">+ $200.00</span>
						</li>
					</ul>
				</div>
				<!-- Expected Payouts -->
				<div
					class={`p-4 rounded-lg shadow ${darkmode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
				>
					<h2 class="text-lg font-semibold mb-2">Expected Payouts</h2>
					<ul class="divide-y divide-gray-200 dark:divide-gray-700">
						<li class="py-2 flex justify-between">
							<span>2024-06-10</span>
							<span class="text-green-600 dark:text-green-400">$400.00</span>
						</li>
						<li class="py-2 flex justify-between">
							<span>2024-06-17</span>
							<span class="text-green-600 dark:text-green-400">$350.00</span>
						</li>
						<li class="py-2 flex justify-between">
							<span>2024-06-24</span>
							<span class="text-green-600 dark:text-green-400">$600.00</span>
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
					<span class={`ml-2 text-base ${darkmode ? 'text-gray-300' : 'text-gray-600'}`}>4.0/5</span
					>
				</div>
			</div>
		{:else if selectedTab === 'orders'}
			<h1 class={`text-2xl font-semibold mb-4 ${darkmode ? 'text-white' : 'text-gray-800'}`}>
				Orders
			</h1>
			<p class={`${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
				Here are your recent orders and status.
			</p>
		{:else if selectedTab === 'inventory'}
			<h1 class={`text-2xl font-semibold mb-4 ${darkmode ? 'text-white' : 'text-gray-800'}`}>
				Wishlist
			</h1>
			<p class={`${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
				These are the products you love!
			</p>
		{:else if selectedTab === 'finance'}
			<h1 class={`text-2xl font-semibold mb-4 ${darkmode ? 'text-white' : 'text-gray-800'}`}>
				Vendor Dashboard
			</h1>
			<p class={`${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
				Manage your store, products, and analytics here.
			</p>
		{/if}
	</main>
</div>
