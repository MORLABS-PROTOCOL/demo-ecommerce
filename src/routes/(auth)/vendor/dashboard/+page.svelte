<script>
	let darkmode = $state(false);
	let sidebarCollapsed = $state(false);
	let selectedTab = $state('profile');

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

<div class={`flex min-h-screen h-auto ${darkmode ? 'bg-gray-900' : 'bg-gray-100'}`}>
	<!-- Sidebar -->
	<aside
		class={`transition-all duration-300 ${sidebarCollapsed ? 'w-[95px]' : 'w-[300px]'} ${darkmode ? 'bg-gray-800' : 'bg-white'} shadow`}
	>
		<nav
			class={`flex flex-col h-full border-r ${darkmode ? 'border-gray-700' : 'border-gray-200'} p-4`}
		>
			<!-- Toggle Sidebar -->
			<div class="flex justify-end mb-6">
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

			<!-- Navigation -->
			<ul class="flex-1 space-y-2">
				<li>
					<button
						onclick={() => setTab('profile')}
						class={`flex items-center w-full px-4 py-2 rounded-md text-left ${darkmode ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-indigo-100'} transition`}
					>
						👤 {sidebarCollapsed ? '' : 'Dashboard'}
					</button>
				</li>

				<li>
					<button
						onclick={() => setTab('orders')}
						class={`flex items-center w-full px-4 py-2 rounded-md text-left ${darkmode ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-indigo-100'} transition`}
					>
						📦 {sidebarCollapsed ? '' : 'Manage Orders'}
					</button>
				</li>

				<li>
					<button
						onclick={() => setTab('wishlist')}
						class={`flex items-center w-full px-4 py-2 rounded-md text-left ${darkmode ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-indigo-100'} transition`}
					>
						❤️ {sidebarCollapsed ? '' : 'Inventory'}
					</button>
				</li>

				<li>
					<button
						onclick={() => setTab('vendor')}
						class={`flex items-center w-full px-4 py-2 rounded-md text-left ${darkmode ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-indigo-100'} transition`}
					>
						🛍️ {sidebarCollapsed ? '' : 'Finance'}
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
	<main class="mx-auto p-6 w-full">
		{#if selectedTab === 'profile'}
			<h1 class={`text-2xl font-semibold mb-4 ${darkmode ? 'text-white' : 'text-gray-800'}`}>
				Profile Page
			</h1>
			<p class={`${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
				Welcome to your account. Here you can view and update your profile.
			</p>
		{:else if selectedTab === 'orders'}
			<h1 class={`text-2xl font-semibold mb-4 ${darkmode ? 'text-white' : 'text-gray-800'}`}>
				Orders
			</h1>
			<p class={`${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
				Here are your recent orders and status.
			</p>
		{:else if selectedTab === 'wishlist'}
			<h1 class={`text-2xl font-semibold mb-4 ${darkmode ? 'text-white' : 'text-gray-800'}`}>
				Wishlist
			</h1>
			<p class={`${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
				These are the products you love!
			</p>
		{:else if selectedTab === 'vendor'}
			<h1 class={`text-2xl font-semibold mb-4 ${darkmode ? 'text-white' : 'text-gray-800'}`}>
				Vendor Dashboard
			</h1>
			<p class={`${darkmode ? 'text-gray-300' : 'text-gray-700'}`}>
				Manage your store, products, and analytics here.
			</p>
		{/if}
	</main>
</div>
