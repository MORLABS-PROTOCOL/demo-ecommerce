<script lang="ts">
	import Heart from '$lib/components/Icons/Heart.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { currency, pocketbase, validateAuthState } from '$lib/controls.svelte';
	import { onMount } from 'svelte';
	let selectedTab: 'profile' | 'orders' | 'vendor' | 'wishlist' = $state('profile');
	let sidebarCollapsed = $state(true);
	let editProfile: boolean = $state(false);
	let editShippingInfo: boolean = $state(false);
	onMount(async () => {
		validateAuthState();
	});
	let darkmode: boolean = $state(false);
	function handleDarkMode() {
		darkmode = darkmode ? false : true;
	}
</script>

<Seo title="Vixstores | Profile" description="vixstores profile" keywords="vixstores, profile" />

<div class="flex min-h-screen h-auto {darkmode ? 'bg-gray-900' : 'bg-gray-100'}">
	<!-- Sidebar -->
	<aside
		class={`transition-all duration-300 ${sidebarCollapsed ? 'w-[95px]' : 'w-[300px]'}  ${darkmode ? 'bg-gray-800' : 'bg-white'} shadow`}
	>
		<nav
			class="flex flex-col h-full border-r {darkmode ? 'border-gray-700' : 'border-gray-200'} p-4"
		>
			<div class="flex justify-end mb-6">
				<button onclick={() => (sidebarCollapsed = !sidebarCollapsed)} aria-label="Toggle sidebar">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 text-gray-500 hover:text-indigo-600 transition"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
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

			<ul class="flex-1 space-y-2">
				<li>
					<button
						onclick={() => (selectedTab = 'profile')}
						class={`flex items-center w-full px-4 py-2 rounded-md text-left  ${darkmode ? 'text-white' : 'text-gray-800'}  ${darkmode ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} transition`}
						class:selected={selectedTab === 'profile'}
					>
						<svg
							class="w-5 h-5 mr-2"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
						{#if !sidebarCollapsed}My Account{/if}
					</button>
				</li>
				<li>
					<button
						onclick={() => (selectedTab = 'orders')}
						class="flex items-center w-full px-4 py-2 rounded-md text-left {darkmode
							? 'text-white'
							: 'text-gray-800'} {darkmode
							? 'hover:bg-gray-700'
							: 'hover:bg-indigo-100'} transition"
						class:selected={selectedTab === 'orders'}
					>
						<svg
							class="w-5 h-5 mr-2"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							viewBox="0 0 24 24"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M3 7h18M3 12h18M3 17h18" />
						</svg>
						{#if !sidebarCollapsed}Track Orders{/if}
					</button>
				</li>
				<li>
					<button
						onclick={() => (window.location.href = '/wishlist')}
						class="flex items-center w-full px-4 py-2 rounded-md text-left {darkmode
							? 'text-white'
							: 'text-gray-800'} {darkmode
							? 'hover:bg-gray-700'
							: 'hover:bg-indigo-100'} transition"
						class:selected={selectedTab === 'wishlist'}
					>
						<Heart /> &nbsp;
						{#if !sidebarCollapsed}Wishlist{/if}
					</button>
				</li>
				<li>
					<button
						onclick={() => (selectedTab = 'vendor')}
						class="flex items-center w-full px-4 py-2 rounded-md text-left text-gray-800 {darkmode
							? 'text-white'
							: 'text-black'}  {darkmode ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'} transition"
						class:selected={selectedTab === 'vendor'}
					>
						<svg
							class="w-5 h-5 mr-2"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M20 21V7a2 2 0 00-2-2H6a2 2 0 00-2 2v14M9 17v-6h6v6"
							/>
						</svg>
						{#if !sidebarCollapsed}
							Dashboard{/if}
					</button>
				</li>
			</ul>
			<div
				class={`flex items-center w-full px-4 py-2 rounded-md text-left ${darkmode ? 'hover:text-black' : 'hover:text-white'}  ${darkmode ? 'text-white' : 'text-gray-800'}  transition cursor-pointer`}
				role="button"
				tabindex="0"
			>
				<span class="mr-2" onclick={handleDarkMode}>
					<!-- Sliding toggle switch -->
					<span
						class="relative inline-block w-10 align-middle select-none transition duration-200 ease-in"
					>
						<span
							class={`block w-10 h-6 rounded-full transition-colors duration-200 ${
								darkmode ? 'bg-indigo-600' : 'bg-gray-300'
							}`}
						></span>
						<span
							class={`absolute left-0 top-0 w-6 h-6 bg-white border border-gray-300 rounded-full shadow transform transition-transform duration-200 ${
								darkmode ? 'translate-x-4' : ''
							}`}
						></span>
					</span>
				</span>
				{#if !sidebarCollapsed}
					{darkmode ? 'Dark mode' : 'Light mode'}
				{/if}
			</div>

			<p class={`mt-6 text-sm text-center ${darkmode ? 'text-gray-400' : 'text-gray-500'}`}>
				&copy; {new Date().getFullYear()} Vixstores
			</p>
		</nav>
	</aside>

	<!-- Main Content -->
	<main class="mx-auto p-6 w-full transition-all duration-300">
		{#if selectedTab === 'profile'}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<!--Account Details-->
				<section
					class={`${darkmode ? 'bg-gray-800' : 'bg-white'} w-full rounded-lg shadow p-6 max-w-3xl mx-auto`}
				>
					<div class="flex justify-between items-center">
						<h2 class={`text-2xl font-bold mb-4 ${darkmode ? 'text-white' : 'text-gray-800'}`}>
							Account Details
						</h2>
						<button
							onclick={() => {
								editProfile = !editProfile;
							}}
							class={`border ${darkmode ? 'border-gray-700' : 'border-black'} p-3  flex justify-end items-center`}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"
								><path
									fill="#f9f8f8"
									d="M5 19h1.098L16.796 8.302l-1.098-1.098L5 17.902zm-1 1v-2.52L17.18 4.288q.155-.137.34-.212T17.907 4t.39.064q.19.063.35.228l1.067 1.074q.165.159.226.35q.06.19.06.38q0 .204-.068.39q-.069.185-.218.339L6.519 20zM19.02 6.092l-1.112-1.111zm-2.782 1.67l-.54-.558l1.098 1.098z"
									stroke-width="0.5"
									stroke="#000"
								/></svg
							></button
						>
					</div>
					<p class={`${darkmode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
						Manage your account information and settings
					</p>

					<div class="grid gap-4">
						<div>
							<label
								class="block mb-1 text-sm font-medium {darkmode
									? 'text-gray-300'
									: 'text-gray-700'}">Full Name</label
							>
							<input
								type="text"
								placeholder="John Doe"
								disabled={!editProfile}
								class="w-full px-4 py-2 {darkmode ? 'bg-gray-700' : 'bg-gray-50'} {darkmode
									? 'text-white'
									: 'text-gray-900'} rounded border {darkmode
									? 'border-gray-300'
									: 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-indigo-500"
							/>
						</div>
						<div>
							<label
								class="block mb-1 text-sm font-medium {darkmode
									? 'text-gray-300'
									: 'text-gray-700'}">Email Address</label
							>
							<input
								type="email"
								placeholder="john@example.com"
								disabled={!editProfile}
								class="w-full px-4 py-2 {darkmode ? 'bg-gray-700' : 'bg-gray-50'} {darkmode
									? 'text-gray-900'
									: 'text-white'} rounded border {darkmode
									? 'border-gray-300'
									: 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-indigo-500"
							/>
						</div>
					</div>
					<button
						class="bg-blue-600 mt-4 px-6 py-4 font-bold text-white text-md rounded-lg"
						hidden={!editProfile}>Save</button
					>
				</section>
				<!--Shipping Details-->
				<section
					class="{darkmode
						? 'bg--gray-800'
						: 'bg-white'} rounded-lg w-full shadow p-6 max-w-3xl mx-auto"
				>
					<div class="flex justify-between items-center">
						<h2 class="text-2xl font-bold mb-4 {darkmode ? 'text-white' : 'text-gray-800'}">
							Shipping Details
						</h2>
						<button
							onclick={() => {
								editShippingInfo = !editShippingInfo;
							}}
							class="border {darkmode
								? 'border-gray-700'
								: 'border-black'} p-3 flex justify-end items-center"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"
								><path
									fill="#f9f8f8"
									d="M5 19h1.098L16.796 8.302l-1.098-1.098L5 17.902zm-1 1v-2.52L17.18 4.288q.155-.137.34-.212T17.907 4t.39.064q.19.063.35.228l1.067 1.074q.165.159.226.35q.06.19.06.38q0 .204-.068.39q-.069.185-.218.339L6.519 20zM19.02 6.092l-1.112-1.111zm-2.782 1.67l-.54-.558l1.098 1.098z"
									stroke-width="0.5"
									stroke="#000"
								/></svg
							></button
						>
					</div>
					<p class={`${darkmode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>Delivery Address:</p>

					{#if editShippingInfo}
						<input
							type="text"
							placeholder="Enter new delivery address"
							class="w-full px-4 py-2 {darkmode ? 'bg-gray-700' : 'bg-gray-50'} {darkmode
								? 'text-white'
								: 'text-gray-900'} rounded border {darkmode
								? 'border-gray-300'
								: 'border-gray-600'} focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-2"
						/>
					{:else}
						<p class="font-semibold {darkmode ? 'text-white' : 'text-black'}">
							No. 12 Ettagbor Layout
						</p>
					{/if}
					<button
						class="bg-blue-600 mt-4 px-6 py-4 font-bold text-white text-md rounded-lg"
						hidden={!editShippingInfo}>Save</button
					>
				</section>
				<!--Wallet Details-->
				<section
					class="cols-span-1 md:col-span-2 w-full {darkmode
						? 'bg-gray-800'
						: 'bg-white'} rounded-lg shadow p-6"
				>
					<h2 class="text-2xl font-bold mb-4 {darkmode ? 'text-white' : 'text-gray-800'}">
						Wallet
					</h2>
					<p class="{darkmode ? 'text-gray-400' : 'text-gray-600'} mb-2">Balance:</p>
					<h2 class="font-bold {darkmode ? 'text-white' : 'text-black'}">{currency()}0.00</h2>
					<button class="bg-blue-600 mt-4 px-6 py-4 font-bold text-white text-md rounded-lg"
						>Top up</button
					>
				</section>
			</div>
		{:else if selectedTab === 'orders'}
			<section
				class=" {darkmode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 max-w-3xl mx-auto"
			>
				<h2 class="text-xl font-semibold {darkmode ? 'text-white' : 'text-gray-800'} mb-4">
					Your Orders
				</h2>
				<p class={darkmode ? 'text-gray-400' : 'text-gray-600'}>You have no recent orders.</p>
			</section>
		{:else if selectedTab === 'vendor'}
			<section
				class="{darkmode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 max-w-3xl mx-auto"
			>
				<h2 class="text-xl font-semibold {darkmode ? 'text-white' : 'text-gray-800'} mb-4">
					Vendor Dashboard
				</h2>
				<p class={darkmode ? 'text-gray-400' : 'text-gray-600'}>
					Manage your store <a
						href="/vendor/dashboard"
						class={darkmode ? 'text-white' : 'text-blue'}
					>
						here</a
					>.
				</p>
			</section>
		{/if}
	</main>
</div>
