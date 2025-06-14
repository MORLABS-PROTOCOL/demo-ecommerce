<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { pocketbase, validateAuthState } from '$lib/controls.svelte';
	import { onMount } from 'svelte';
	let selectedTab: 'profile' | 'orders' | 'vendor' = 'profile';
	let sidebarCollapsed = false;
	let editProfile: boolean = $state(false);
	onMount(async () => {
		validateAuthState();
	});
</script>

<Seo title="Vixstores | Profile" description="vixstores profile" keywords="vixstores, profile" />

<div class="flex min-h-screen h-auto bg-gray-100 dark:bg-gray-900">
	<!-- Sidebar -->
	<aside
		class={`transition-all duration-300 ${sidebarCollapsed ? 'w-[95px]' : 'w-[300px]'} bg-white dark:bg-gray-800 shadow`}
	>
		<nav class="flex flex-col h-full border-r border-gray-200 dark:border-gray-700 p-4">
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
						class="flex items-center w-full px-4 py-2 rounded-md text-left text-gray-800 dark:text-white hover:bg-indigo-100 dark:hover:bg-gray-700 transition"
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
						{#if !sidebarCollapsed}Settings{/if}
					</button>
				</li>
				<li>
					<button
						onclick={() => (selectedTab = 'orders')}
						class="flex items-center w-full px-4 py-2 rounded-md text-left text-gray-800 dark:text-white hover:bg-indigo-100 dark:hover:bg-gray-700 transition"
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
						onclick={() => (selectedTab = 'vendor')}
						class="flex items-center w-full px-4 py-2 rounded-md text-left text-gray-800 dark:text-white hover:bg-indigo-100 dark:hover:bg-gray-700 transition"
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

			<p class="mt-6 text-sm text-center text-gray-400 dark:text-gray-500">
				&copy; {new Date().getFullYear()} Vixstores
			</p>
		</nav>
	</aside>

	<!-- Main Content -->
	<main class="mx-auto p-6 w-full transition-all duration-300">
		{#if selectedTab === 'profile'}
			<section class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-3xl mx-auto">
				<div class="flex justify-between items-center">
					<h2 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Your Profile</h2>
					<button
						onclick={() => {
							editProfile = !editProfile;
						}}
						class="border dark:border-gray-700 p-3 border-black flex justify-end items-center"
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
				<p class="text-gray-600 dark:text-gray-400 mb-6">
					Manage your account information and settings
				</p>

				<div class="grid gap-4">
					<div>
						<label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
							>Full Name</label
						>
						<input
							type="text"
							placeholder="John Doe"
							disabled={!editProfile}
							class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
					<div>
						<label class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
							>Email Address</label
						>
						<input
							type="email"
							placeholder="john@example.com"
							disabled={!editProfile}
							class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
				</div>
				<button class="bg-blue-700 mt-4 px-4 py-2 rounded-sm" hidden={!editProfile}>Save</button>
			</section>
		{:else if selectedTab === 'orders'}
			<section class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-3xl mx-auto">
				<h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Your Orders</h2>
				<p class="text-gray-600 dark:text-gray-400">You have no recent orders.</p>
			</section>
		{:else if selectedTab === 'vendor'}
			<section class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-3xl mx-auto">
				<h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Vendor Dashboard</h2>
				<p class="text-gray-600 dark:text-gray-400">Manage your store settings here.</p>
			</section>
		{/if}
	</main>
</div>
