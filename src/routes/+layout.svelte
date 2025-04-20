<script lang="ts">
	import '../app.css';
	import { pocketbase, pullAds, user, userData, validateAuthState } from '$lib/controls.svelte';
	import Carousel from '$lib/components/Carousel.svelte';
	import 'carbon-components-svelte/css/white.css';
	import HamburgerMenu from '$lib/components/Icons/Hamburger-Menu.svelte';
	import Heart from '$lib/components/Icons/Heart.svelte';
	import User from '$lib/components/Icons/User.svelte';
	import { fly } from 'svelte/transition';
	import { page } from '$app/state';

	import {
		LocationHeart,
		Search,
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
</script>

<div class="font-jost overflow-hidden">
	<main class="max-w-7xl mx-auto">
		{#if page.url.pathname !== '/login' && page.url.pathname !== '/signup'}
			<div class="">
				<div class="flex justify-between items-center py-2">
					<div class="text-xs text-gray-500 font-semibold px-3">
						{user.country} | {user.preferred_currency}
					</div>
					<div class="text-xs text-gray-500 font-semibold px-3 flex gap-x-3">
						<ShoppingBag />Become a seller
					</div>
				</div>

				<div class="flex justify-between items-center gap-4">
					<div class="flex-shrink-0">
						<img src="/e-commerce.png" class="w-[100px] h-[100px]" alt="logo" />
					</div>
					<div class="flex-grow justify-center items-center sm:flex hidden">
						<select
							class="h-full outline-none text-black font-semibold w-[100px] text-center border-2 border-gray-300 focus:outline-none border-l-1 p-3 bg-transparent bg-gray-500"
							><option>All</option></select
						>
						<input
							class="w-2/3 p-3 border-2 sm:block hidden hover:border-blue-900 focus:outline-none focus:border-blue-500 outline-none border-r-0 border-l-0 duration-500 border-solid"
							placeholder="Search..."
						/><button
							class="h-full bg-blue-900 text-white font-semibold w-[100px] text-center border-2 border-l-0 border-blue-900 p-3 rounded-r-md outline-2"
							>Search</button
						>
					</div>
					<Search
						class="sm:hidden block"
						size={20}
						onclick={() => {
							showSearchBar = !showSearchBar;
						}}
					/>
					<div class="flex items-center gap-x-3">
						<a href="/login">
							<div
								class="flex items-center gap-x-3 font-semibold hover:scale-100 cursor-pointer duration-500 px-4 py-2 hover:shadow-lg hover:border-blue-700 hover:border hover:shadow-blue-500 hover:rounded-full justify-end"
							>
								<UserCertification size={20} />
								<div class="sm:flex flex-col items-start hidden">
									<p class="font-light">
										{pocketbase.authStore.isValid ? `Hi, ${userData?.username}` : 'Login'}
									</p>
								</div>
							</div>
						</a>
						<div>
							<div
								class="relative inline-block duration-300 hover:shadow-xl hover:scale-100 rounded-full hover:shadow-blue-500 hover:border hover:border-blue-700"
							>
								<button class="relative p-2 rounded-full">
									<Heart />
									<span
										class="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-4 text-xs font-bold text-white bg-red-500 rounded-full"
										>3</span
									>
								</button>
							</div>
						</div>
						<div class="flex items-center font-bold">
							<div
								class="relative inline-block duration-300 hover:shadow-xl hover:scale-100 rounded-full hover:shadow-blue-500 hover:border hover:border-blue-700"
							>
								<button class="relative p-2 rounded-full">
									<a href="/cart" class="text-black font-semibold"
										><ShoppingCart color="black" class="font-bold" size={20} /></a
									>
									<span
										class="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-4 text-xs font-bold text-white bg-red-500 rounded-full"
										>3</span
									>
								</button>
							</div>
							$0.00
						</div>
						<div
							class="flex items-center gap-x-1 font-semibold justify-end hover:bg-blue-950 cursor-pointer h-[50px] p-3"
						></div>
					</div>
				</div>
			</div>
			<!-- Search Bar for mobile-->
			{#if showSearchBar}
				<div class="flex sm:hidden w-full p-3 justify-center items-center">
					<select
						class="h-full outline-none text-black font-semibold w-[100px] text-center border-2 border-gray-300 focus:outline-none border-l-1 border-r-0 p-3 bg-transparent"
						><option>All</option></select
					>
					<input
						class="w-full p-3 border-2 hover:border-blue-900 focus:outline-none focus:border-blue-500 outline-none border-r-0 border-l-1 duration-500 border-solid"
						placeholder="Search..."
					/><button
						class="h-full bg-blue-900 text-white font-semibold w-[100px] text-center border-2 border-l-0 border-blue-900 p-3 rounded-r-md"
						>Search</button
					>
				</div>
			{/if}
			<!-- End of Search Bar for mobile-->
			<div class="flex justify-center items-center">
				<div class="w-full h-[50px]">
					<hr />
					<div class="flex justify-between w-full items-center">
						<div class="flex justify-start space-x-10 items-center w-full py-3 px-2">
							<button
								class="text-start cursor-pointer h-full flex items-center sm:gap-x-2"
								onclick={() => {
									showCategories = !showCategories;
								}}
							>
								<HamburgerMenu /><span class="hidden sm:block">Browse All Categories</span>
							</button>
						</div>

						<div class="flex w-full gap-x-4 justify-end items-center px-3">
							<div class="text-start cursor-pointer h-full gap-x-2 hover:bg-black">Track</div>
							<div class="text-start cursor-pointer h-full gap-x-2 hover:bg-black">Affiliate</div>
							<div class="text-start cursor-pointer h-full gap-x-2 hover:bg-black">Brands</div>
						</div>
					</div>
					<hr />
				</div>
			</div>
			<div class="flex justify-center items-center p-3">
				{#if showCategories}
					<div
						transition:fly={{ x: -300, duration: 300 }}
						class="fixed top-0 left-0 z-50 min-h-screen w-full sm:w-1/4 bg-gray-800 transition-transform transform translate-x-0 sm:translate-x-0 ease-in-out"
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
									<p class="text-white font-semibold text-sm">{category}</p>
								</div>
								<hr class="border-gray-600" />
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</main>
	<div>
		{@render children()}
	</div>
</div>
