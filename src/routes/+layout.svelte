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
		pageSettings
	} from '$lib/controls.svelte';
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
	import { Form } from 'carbon-components-svelte';
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
	onMount(async () => {
		await refreshCart();
		await getLogo();
	});
	let formData: HTMLFormElement;
	let searchTerm: string = $state('');
</script>

<div class="font-jost overflow-hidden">
	<main class="max-w-7xl mx-auto">
		{#if page.url.pathname !== '/login' && page.url.pathname !== '/signup' && page.url.pathname !== '/login/forgot-password'}
			<div class="">
				<div class="flex justify-between items-center py-2">
					<div class="text-xs text-gray-500 font-semibold px-3">
						{user.country} | {user.preferred_currency}
					</div>
					<div class="text-xs text-gray-500 font-semibold px-3 flex gap-x-3">
						<ShoppingBag />Become a seller
					</div>
				</div>
				<Form
					bind:ref={formData}
					on:submit={() => {
						window.location.href = `/search/${searchTerm}`;
					}}
				>
					<div class="flex justify-between items-center gap-4">
						<a href="/">
							<div class="flex-shrink-0">
								<img src={pageSettings.logoUrl} class="w-[100px] h-[100px]" alt="logo" />
							</div>
						</a>
						<div class="flex-grow justify-center items-center sm:flex hidden h-12">
							<!-- Category Selector -->
							<select
								onchange={(e) => {
									queryCategory = e?.target.value;
								}}
								class="h-full w-[100px] px-3 text-black font-semibold bg-gray-100 border border-gray-300 focus:outline-none"
							>
								<option>All</option>
								{#each categories as category}
									<option>{category}</option>
								{/each}
							</select>

							<!-- Search Input -->
							<input
								type="text"
								required
								bind:value={searchTerm}
								oninput={() => {}}
								placeholder="Search..."
								class="h-full w-2/3 px-3 border-t border-b border-gray-300 text-black focus:outline-none focus:border-blue-500"
							/>

							<!-- Search Button -->
							<button
								type="submit"
								class="h-full w-[100px] px-3 bg-blue-900 text-white font-semibold border border-blue-900 rounded-r-md hover:bg-blue-800 transition-all duration-300"
							>
								Search
							</button>
						</div>

						<Search
							class="sm:hidden block"
							size={20}
							onclick={() => {
								showSearchBar = !showSearchBar;
							}}
						/>
						<div class="flex items-center gap-x-3">
							{#if pocketbase.authStore.isValid}
								<a href="/profile">
									<div
										class="flex items-center gap-x-3 font-semibold hover:scale-100 cursor-pointer duration-500 px-4 py-2 hover:shadow-lg hover:border-blue-700 hover:border hover:shadow-blue-500 hover:rounded-full justify-end"
									>
										<UserCertification size={20} />
										<div class="sm:flex flex-col items-start hidden">
											<p class="font-light">
												{`Hi, ${userData?.username}`}
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
								<a href="/cart" class="text-black font-semibold">
									<div
										class="flex items-center font-bold duration-300 hover:shadow-xl hover:scale-100 rounded-full hover:shadow-blue-500 hover:border hover:border-blue-700 px-2"
									>
										<div class="relative inline-block">
											<button class="relative p-2 rounded-full">
												<ShoppingCart color="black" class="font-bold" size={20} />
												<span
													class="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-4 text-xs font-bold text-white bg-red-500 rounded-full"
													>{cart.length}</span
												>
											</button>
										</div>
										{currency()}{cart.total}
									</div>
								</a>
							{:else}
								<a href="/login">
									<div
										class="flex items-center gap-x-3 font-semibold hover:scale-100 cursor-pointer duration-500 px-4 py-2 hover:shadow-lg hover:border-blue-700 hover:border hover:shadow-blue-500 hover:rounded-full justify-end"
									>
										<User />
										<div class="sm:flex flex-col items-start hidden">
											<p class="font-light">Login</p>
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
												>0</span
											>
										</button>
									</div>
								</div>
								<div
									class="flex items-center font-bold duration-300 hover:shadow-xl hover:scale-100 rounded-full hover:shadow-blue-500 hover:border hover:border-blue-700 px-2"
								>
									<div class="relative inline-block">
										<button class="relative p-2 rounded-full">
											<a href="/cart" class="text-black font-semibold"
												><ShoppingCart color="black" class="font-bold" size={20} /></a
											>
											<span
												class="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-4 text-xs font-bold text-white bg-red-500 rounded-full"
												>0</span
											>
										</button>
									</div>
									$0.00
								</div>
							{/if}

							<div
								class="flex items-center gap-x-1 font-semibold justify-end hover:bg-blue-950 cursor-pointer h-[50px] p-3"
							></div>
						</div>
					</div>
				</Form>
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
							<div class="text-start cursor-pointer h-full gap-x-2">Track</div>
							<div class="text-start cursor-pointer h-full gap-x-2">Affiliate</div>
							<div class="text-start cursor-pointer h-full gap-x-2">Brands</div>
						</div>
					</div>
					<hr />
				</div>
			</div>
			<div class="flex justify-center items-center p-3">
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
										href="/categories/{category.toLowerCase()}"
										class="text-white font-semibold text-sm">{category}</a
									>
								</div>
								<hr class="border-gray-700" />
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
	{#if page.url.pathname !== '/login' && page.url.pathname !== '/signup' && page.url.pathname !== '/login/forgot-password'}
		<footer class="bg-blue-700 text-white w-screen p-6 bottom-0 left-0 z-50">
			<div class="flex justify-center items-center">
				<div class="w-full h-[50px]">
					<hr />
					<div class="flex justify-between w-full items-center">
						<div class="flex justify-start space-x-10 items-center w-full py-3 px-2">
							<p class="text-start cursor-pointer h-full flex items-center sm:gap-x-2">
								&copy; {new Date().getFullYear()} Vikstores. All rights reserved.
							</p>
						</div>
						<div class="flex w-full gap-x-4 justify-end items-center px-3">
							<div class="text-start cursor-pointer h-full gap-x-2">Privacy Policy</div>
							<div class="text-start cursor-pointer h-full gap-x-2">Terms of Service</div>
							<div class="text-start cursor-pointer h-full gap-x-2">Contact Us</div>
							<div class="text-start cursor-pointer h-full gap-x-2">Help</div>
							<div class="text-start cursor-pointer h-full gap-x-2">About Us</div>
							<div class="text-start cursor-pointer h-full gap-x-2">Blog</div>
							<div class="text-start cursor-pointer h-full gap-x-2">Careers</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	{/if}
</div>
