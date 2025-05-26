<script lang="ts">
	import '../app.css';
	import {
		currency,
		getCart,
		pocketbase,
		pullAds,
		user,
		userData,
		validateAuthState,
		refreshCart,
		cart,
		getLogo,
		pageSettings,
		wishList,
		refreshWishList
	} from '$lib/controls.svelte';
	import Carousel from '$lib/components/Carousel.svelte';
	import 'carbon-components-svelte/css/white.css';
	import HamburgerMenu from '$lib/components/Icons/Hamburger-Menu.svelte';
	import Heart from '$lib/components/Icons/Heart.svelte';
	import User from '$lib/components/Icons/User.svelte';
	import Search from '$lib/components/Icons/Search.svelte';
	import { fly } from 'svelte/transition';
	import { page } from '$app/state';

	import {
		CustomerService,
		LocationHeart,
		ShoppingBag,
		ShoppingCart,
		TrainHeart,
		UserAccessUnlocked,
		UserCertification,
		UserOnline,
		UserProfile
	} from 'carbon-icons-svelte';
	import Exit from '$lib/components/Icons/Exit.svelte';
	import { onMount } from 'svelte';
	import { Form } from 'carbon-components-svelte';
	import { browser } from '$app/environment';
	import CustomerCare from '$lib/components/Icons/CustomerCare.svelte';
	import Orders from '$lib/components/Icons/Orders.svelte';
	let { children } = $props();
	let showCategories = $state(false);
	let showSearchBar = $state(false);
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
	let userCartTotals: any;
	let queryCategory: string = $state('All');
	if (browser) {
		(async () => {
			await refreshCart();
			await getLogo();
			await refreshWishList();
		})();
	}
	let loginState: boolean = $state(false);
	onMount(() => {
		loginState = pocketbase.authStore.isValid;
	});
	let formData: HTMLFormElement | undefined = $state();
	let searchTerm: string = $state('');
</script>

<div class="font-jost overflow-hidden">
	<main class=" mx-auto">
		{#if page.url.pathname !== '/login' && page.url.pathname !== '/signup' && page.url.pathname !== '/login/forgot-password'}
			<!-- Top Info Bar -->
			<div
				class="bg-[#f8f8f8] text-xs max-w-7xl mx-auto text-gray-500 font-semibold py-2 px-4 flex justify-between items-center"
			>
				<div>{user.country} | {user.preferred_currency}</div>
				<div class="flex gap-x-2 items-center text-black">
					<ShoppingBag class="w-4 h-4" />
					<span>Become a seller</span>
				</div>
			</div>

			<!-- Main Header Section -->
			<div class="flex max-w-7xl mx-auto justify-between items-center py-4 gap-4">
				<!-- Logo -->
				<a href="/" class="flex-shrink-0">
					<img src={pageSettings.logoUrl} alt="logo" class="h-[80px] w-auto object-contain" />
				</a>

				<!-- Search Bar (Desktop) -->
				<Form
					class="w-full max-w-xl hidden md:flex items-center"
					bind:ref={formData}
					on:submit={() => {
						window.location.href = `/search/${searchTerm}`;
					}}
				>
					<select
						class="h-10 px-2 border border-gray-300 bg-gray-100 text-sm text-black"
						onchange={(e) => {
							queryCategory = e?.target.value;
						}}
					>
						<option>All</option>
						{#each categories as category}
							<option>{category}</option>
						{/each}
					</select>

					<input
						type="text"
						required
						bind:value={searchTerm}
						placeholder="Search..."
						class="flex-grow h-10 px-3 border-t border-b border-gray-300 focus:outline-none"
					/>

					<button
						type="submit"
						class="h-10 px-4 bg-blue-900 text-white font-semibold hover:bg-blue-800 border border-blue-900"
					>
						Search
					</button>
				</Form>

				<!-- User/Cart Section -->
				<div class="flex items-center gap-3 px-3">
					{#if loginState}
						<!-- Mobile Search Toggle -->
						<button class=" block md:hidden" onclick={() => (showSearchBar = !showSearchBar)}>
							<Search />
						</button>
						<!-- Profile -->
						<a
							href="/profile"
							class="flex items-center gap-2 px-4 py-2 hover:shadow hover:rounded-full border hover:border-blue-700 transition"
						>
							<UserCertification size={20} />
							<p class="text-sm hidden md:flex">{`${userData?.username}`}</p>
						</a>

						<!-- Wishlist -->
						<a href="/wishlist" class="relative">
							<div>
								<button class="p-2 rounded-full hover:shadow hover:border-blue-700">
									<Heart />
									<span
										class="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
									>
										{wishList.items.length}
									</span>
								</button>
							</div>
						</a>
						<!-- Cart -->
						<a href="/cart" class="relative text-black">
							<button class="p-2 rounded-full hover:shadow hover:border-blue-700">
								<ShoppingCart size={24} />
								<span
									class="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
								>
									{cart?.length}
								</span>
							</button>
						</a>
					{:else}
						<!-- Mobile Search Toggle -->
						<button class="block md:hidden" onclick={() => (showSearchBar = !showSearchBar)}>
							<Search />
						</button>
						<!-- Login -->
						<a
							href="/login"
							class="flex text-black items-center gap-2 px-4 py-2 hover:shadow hover:rounded-full border hover:border-blue-700 transition"
						>
							<User />
							<p class="text-sm hidden md:block">Login</p>
						</a>

						<!-- Wishlist -->
						<div class="relative">
							<button
								onclick={() => {
									window.location.href = '/login';
								}}
								class="p-2 rounded-full hover:shadow hover:border-blue-700"
							>
								<Heart color="red" />
								<span
									class="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
									>0</span
								>
							</button>
						</div>

						<!-- Cart -->
						<a
							href="/login"
							class="relative text-black flex items-center gap-1 p-3 font-semibold hover:shadow hover:border-blue-700 rounded-full cursor-pointer"
						>
							<ShoppingCart size={20} />
							<span
								class="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
								>0</span
							>
						</a>
					{/if}
					{#if showCategories}
						<div
							transition:fly={{ x: -300, duration: 300 }}
							class="fixed top-0 left-0 z-50 min-h-screen w-full sm:w-1/4 bg-[#224981] transition-transform transform translate-x-0 sm:translate-x-0 ease-in-out"
						>
							<div class="p-3 w-full h-full overflow-y-auto">
								<!-- Close button for large screens -->
								<div class="hidden sm:flex justify-end pb-5 px-2">
									<button class="font-bold text-white" onclick={() => (showCategories = false)}>
										<Exit />
									</button>
								</div>

								<!-- Header for small screens -->
								<h3
									class="sm:hidden font-bold text-xl flex justify-between items-center pb-5 text-white"
								>
									Browse all categories
									<button onclick={() => (showCategories = false)}><Exit /></button>
								</h3>

								<hr class="border-gray-600" />

								<!-- Categories list -->
								{#each categories as category}
									<div class="flex justify-start items-center gap-x-2 p-3">
										<a
											href="/products/category/{category.toLowerCase()}"
											onclick={() => (showCategories = false)}
											class="text-white font-semibold text-sm">{category}</a
										>
									</div>
									<hr class="border-gray-700" />
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Mobile Search Bar -->
			{#if showSearchBar}
				<Form
					class="w-full sm:hidden px-3 pb-3"
					bind:ref={formData}
					on:submit={() => {
						window.location.href = `/search/${searchTerm}`;
					}}
				>
					<div class="flex items-center gap-2">
						<select
							class="h-10 w-[90px] border border-gray-300 text-sm bg-gray-100"
							onchange={(e) => {
								queryCategory = e?.target.value;
							}}
						>
							<option>All</option>
							{#each categories as category}
								<option>{category}</option>
							{/each}
						</select>
						<input
							bind:value={searchTerm}
							placeholder="Search..."
							class="flex-grow h-10 px-3 border border-gray-300 focus:outline-none"
						/>
						<button type="submit" class="h-10 px-3 bg-blue-900 text-white font-semibold rounded">
							Search
						</button>
					</div>
				</Form>
			{/if}
			<div
				class="md:flex md:justify-between block w-full font-semibold ax-w-screen h-[50px] mb-2 text-white bg-[#1e3a8a]"
			>
				<button
					onclick={() => {
						showCategories = !showCategories;
					}}
					class="flex w-full items-center justify-start px-5 gap-x-3"
				>
					<HamburgerMenu />Browse all categories
				</button>
				<div class="hidden px-4 w-full md:flex justify-end">
					<ul class="md:flex hidden items-center gap-x-4">
						<li class="flex justify-center items-center gap-x-2"><Orders /> Orders</li>
						<li class="flex justify-center items-center gap-x-2"><CustomerCare /> Support</li>
					</ul>
				</div>
			</div>
		{/if}
		<div class="bg-[#f8f8f8]">
			{@render children()}
		</div>

		{#if page.url.pathname !== '/login' && page.url.pathname !== '/signup' && page.url.pathname !== '/login/forgot-password'}
			<footer class="min-h-screen h-full bg-blue-700 bottom-0"></footer>
		{/if}
	</main>
</div>
