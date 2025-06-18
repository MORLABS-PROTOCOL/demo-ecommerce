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
		refreshWishList,
		addToNewsLetter
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
	import { onDestroy, onMount } from 'svelte';
	import { Form } from 'carbon-components-svelte';
	import { browser } from '$app/environment';
	import CustomerCare from '$lib/components/Icons/CustomerCare.svelte';
	import Orders from '$lib/components/Icons/Orders.svelte';
	let { children } = $props();
	let showCategories = $state(false);
	let showSearchBar = $state(false);
	let categories: string[] = $state([
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
	]);
	let filteredCategories: string[] = $state(categories);
	let email = $state('');
	let userCartTotals: any;
	let queryCategory: string = $state('All');
	if (browser) {
		(async () => {
			await refreshCart();
			await getLogo();
			await refreshWishList();
		})();
	}
	let showDropdown: boolean = $state(false);
	let loginState: boolean = $state(false);
	let dropdownRef: HTMLDivElement | null = $state(null);
	onMount(() => {
		loginState = pocketbase.authStore.isValid;
		const handleClickOutside = (event) => {
			if (dropdownRef && !dropdownRef.contains(event.target)) {
				showDropdown = false;
			}
		};

		document.addEventListener('click', handleClickOutside);

		// Clean up the listener when component is destroyed
		onDestroy(() => {
			document.removeEventListener('click', handleClickOutside);
		});
	});
	let formData: HTMLFormElement | undefined = $state();
	let searchTerm: string = $state('');
	let selectedCountry: string = $state('Nigeria');
	let selectedLanguage: string = $state('English');
	let selectedCurrency: string = $state('NGN');
</script>

<svelte:window
	on:keydown={(e) => {
		if (showCategories && e.key === 'Escape') {
			showCategories = false;
		}
	}}
/>

<div class="font-jost overflow-hidden">
	<main class=" mx-auto">
		{#if page.url.pathname !== '/login' && page.url.pathname !== '/vendor/dashboard' && page.url.pathname !== '/signup' && page.url.pathname !== '/login/forgot-password'}
			<!-- Top Info Bar -->
			<div class="text-xs w-screen mx-auto text-gray-500 font-semibold py-2 px-4">
				<div class="flex max-w-6xl justify-between mx-auto items-center">
					<ul class="flex justify-start w-full items-center gap-x-4 text-black">
						<li><a href="/profile" class="text-black">Account</a></li>
						<li><a href="/orders/track" class="text-black">Track Order</a></li>
						<li><a href="/support" class="text-black">Support</a></li>
					</ul>
					<ul class="md:flex hidden items-center gap-x-4 ml-auto">
						<li>
							<select class="bg-transparent text-black font-semibold" bind:value={selectedCountry}>
								<option value="Nigeria">Nigeria</option>
								<option value="Ghana">Ghana</option>
								<option value="Kenya">Kenya</option>
								<!-- Add more countries as needed -->
							</select>
						</li>
						<li>
							<select class="bg-transparent text-black font-semibold" bind:value={selectedLanguage}>
								<option value="English">English</option>
								<option value="French">French</option>
								<option value="Swahili">Swahili</option>
								<!-- Add more languages as needed -->
							</select>
						</li>
						<li>
							<select
								class="bg-transparent text-black font-semibold"
								bind:value={selectedCurrency}
								onchange={(e) => {
									user.preferred_currency = e.target?.value;
								}}
							>
								<option value="NGN">NGN</option>
								<option value="GHS">GHS</option>
								<option value="KES">KES</option>
								<!-- Add more currencies as needed -->
							</select>
						</li>
					</ul>
				</div>
			</div>
			<hr class="border-gray-200 max-w-screen mx-auto" />

			<!-- Main Header Section -->
			<div class="flex max-w-6xl mx-auto justify-between items-center py-4 gap-4">
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
						class="h-10 px-4 bg-blue-700 text-white font-semibold hover:bg-blue-700 border border-blue-700"
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
						<!-- <div class="relative">
							<select
								class="flex items-center gap-2 px-4 py-2 hover:shadow hover:rounded-full border hover:border-blue-700 transition bg-white text-black pr-8 appearance-none"
								onchange={(e) => {
									const value = e.target.value;
									if (value === 'profile') window.location.href = '/profile';
									else if (value === 'orders') window.location.href = '/orders';
									else if (value === 'logout') {
										pocketbase.authStore.clear();
										window.location.href = '/login';
									}
								}}
							>
								<option value="profile" selected>
									{userData?.username || 'Profile'}
								</option>
								<option value="orders">My Orders</option>
								<option value="logout">Logout</option>
							</select>
							<span class="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
								<UserCertification size={20} />
							</span>
						</div> -->
						<div class="relative inline-block text-left" bind:this={dropdownRef}>
							<button
								class="flex items-center gap-2 text-gray-700 hover:text-black focus:outline-none"
								onclick={() => (showDropdown = !showDropdown)}
							>
								<div class="relative">
									<svg
										class="w-6 h-6"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
										viewBox="0 0 24 24"
									>
										<!-- User icon -->
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0"
										/>
									</svg>
									<span class="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>
								</div>
								<span class="hidden md:block">Hi, {userData?.username}</span>
								<svg
									class="w-4 h-4 hidden md:block"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									viewBox="0 0 24 24"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
								</svg>
							</button>

							{#if showDropdown}
								<div
									class="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg z-50"
								>
									<ul class="py-1 text-sm text-gray-700">
										<li>
											<a href="/account" class="flex items-center px-4 py-2 hover:bg-gray-100">
												<!-- <UserIcon class="w-5 h-5 mr-3" /> -->
												My Account
											</a>
										</li>

										<li>
											<a href="/wishlist" class="flex items-center px-4 py-2 hover:bg-gray-100">
												<!-- <HeartIcon class="w-5 h-5 mr-3" /> -->
												Wishlist
											</a>
										</li>
									</ul>
									<div class="border-t border-gray-200">
										<button
											class="w-full px-4 py-2 text-sm text-orange-600 hover:bg-gray-100 text-left"
											onclick={() => {
												pocketbase.authStore.clear();
												window.location.href = '/login';
											}}
										>
											Logout
										</button>
									</div>
								</div>
							{/if}
						</div>

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
								>{cart?.length || 0}</span
							>
						</a>
					{/if}

					{#if showCategories}
						<div
							transition:fly={{ x: -300, duration: 300 }}
							class="fixed top-0 left-0 z-50 min-h-screen w-full sm:w-1/4 bg-white text-black transition-transform transform translate-x-0 sm:translate-x-0 ease-in-out"
						>
							<div class="p-3 w-full h-full overflow-y-auto">
								<!-- Close button for large screens -->
								<div class="hidden sm:flex justify-end pb-5 px-2">
									<button class="font-bold text-black" onclick={() => (showCategories = false)}>
										<Exit />
									</button>
								</div>

								<!-- Header for small screens -->
								<h3
									class="sm:hidden font-bold text-xl flex justify-evenly gap-x-2 items-center pb-5 text-black"
								>
									Browse all categories
									<button onclick={() => (showCategories = false)}><Exit /></button>
								</h3>

								<hr class="border-gray-600" />
								<!-- Category Search Bar -->
								<div class="px-4 py-3">
									<input
										type="text"
										placeholder="Search categories..."
										class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none"
										oninput={(e) => {
											const value = e.target.value.toLowerCase();
											filteredCategories = [
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
											].filter((cat) => cat.toLowerCase().includes(value));
										}}
									/>
								</div>
								<!-- Categories list -->
								{#each filteredCategories as category}
									<div class="flex justify-between items-center px-4 py-3 hover:bg-gray-100">
										<!-- Left side: Icon + Category Name -->
										<div class="flex items-center gap-x-3">
											<!-- Placeholder for icon (replace with real icons using components or <img>) -->
											<span class="text-gray-600">
												<i class="fas fa-tag"></i>
												<!-- Replace this with appropriate icons -->
											</span>
											<a
												href="/products/category/{category.toLowerCase()}"
												onclick={() => (showCategories = false)}
												class="text-gray-800 font-medium text-sm"
											>
												{category}
											</a>
										</div>

										<!-- Right chevron -->
										<span class="text-gray-400">
											<i class="fas fa-chevron-right"></i>

											<!-- Right arrow icon -->
										</span>
									</div>

									<hr class="border-gray-200 mx-4" />
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
						<button type="submit" class="h-10 px-3 bg-blue-700 text-white font-semibold rounded">
							Search
						</button>
					</div>
				</Form>
			{/if}
			<div class=" w-full font-semibold min-w-screen h-fit text-white bg-blue-700">
				<div class="md:flex md:justify-between block max-w-6xl mx-auto">
					<div class="min-w-[250px] md:text-black h-auto md:pt-2">
						<button
							onclick={() => {
								showCategories = !showCategories;
							}}
							class="flex h-fit w-full md:bg-white items-center justify-start px-5 py-3 rounded-t-lg gap-x-3"
						>
							<HamburgerMenu />Browse all categories
						</button>
					</div>
					<div class="px-5 text-white lg:flex justify-evenly w-full items-center hidden">
						<p class="font-semibold">About</p>
						<p class="font-semibold">Contact</p>
						<p class="font-semibold">FAQ</p>
					</div>
					<div class="hidden px-4 w-full md:flex justify-end items-center">
						<button class="bg-black text-white p-3">Become a Seller &nbsp;{'>'}</button>
					</div>
				</div>
			</div>
		{/if}
		<div class="bg-[#eeeeee]">
			{@render children()}
		</div>

		{#if page.url.pathname !== '/login' && page.url.pathname !== '/vendor/dashboard' && page.url.pathname !== '/signup' && page.url.pathname !== '/login/forgot-password'}
			<footer class="bg-blue-700 text-white pt-10 pb-4 px-4">
				<!-- Newsletter Subscription Section -->
				<div
					class="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-blue-500"
				>
					<div class="mb-4 md:mb-0">
						<h2 class="text-2xl font-bold mb-2">Subscribe to our Newsletter</h2>
						<p class="text-blue-100">
							Get the latest updates, offers, and news delivered to your inbox.
						</p>
					</div>
					<form
						class="flex flex-col sm:flex-row items-center gap-2 w-full max-w-md"
						onsubmit={() => {
							// Add your newsletter subscription logic here
							addToNewsLetter(email);
							setTimeout(() => {
								email = '';
							}, 500);
						}}
					>
						<input
							type="email"
							bind:value={email}
							required
							placeholder="Enter your email"
							class="w-full px-4 py-2 rounded text-black focus:outline-none"
						/>
						<button
							type="submit"
							class="bg-white text-blue-700 font-semibold px-5 py-2 rounded hover:bg-blue-700 transition"
						>
							Subscribe
						</button>
					</form>
				</div>

				<!-- Responsive Footer Links Section -->
				<div class="max-w-6xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
					<div>
						<h3 class="font-bold mb-3">Company</h3>
						<ul class="space-y-2 text-white">
							<li><a href="/about" class="hover:underline text-white">About Us</a></li>
							<li><a href="/careers" class="hover:underline text-white">Careers</a></li>
							<li><a href="/blog" class="hover:underline text-white">Blog</a></li>
							<li><a href="/contact" class="hover:underline text-white">Contact</a></li>
						</ul>
					</div>
					<div>
						<h3 class="font-bold mb-3">Support</h3>
						<ul class="space-y-2 text-white">
							<li><a href="/help" class="hover:underline text-white">Help Center</a></li>
							<li><a href="/returns" class="hover:underline text-white">Returns</a></li>
							<li><a href="/shipping" class="hover:underline text-white">Shipping</a></li>
							<li><a href="/faq" class="hover:underline text-white">FAQ</a></li>
						</ul>
					</div>
					<div>
						<h3 class="font-bold mb-3">Legal</h3>
						<ul class="space-y-2 text-white">
							<li><a href="/terms" class="hover:underline text-white">Terms of Service</a></li>
							<li><a href="/privacy" class="hover:underline text-white">Privacy Policy</a></li>
							<li><a href="/cookies" class="hover:underline text-white">Cookie Policy</a></li>
						</ul>
					</div>
					<div>
						<h3 class="font-bold mb-3">Follow Us</h3>
						<ul class="flex gap-4 mt-2">
							<li>
								<a href="#" aria-label="Facebook" class="hover:text-blue-300 text-white"
									><svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"
										><path
											d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12"
										></path></svg
									></a
								>
							</li>
							<li>
								<a href="#" aria-label="Twitter" class="hover:text-blue-300 text-white"
									><svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"
										><path
											d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"
										></path></svg
									></a
								>
							</li>
							<li>
								<a href="#" aria-label="Instagram" class="hover:text-blue-300 text-white"
									><svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"
										><path
											d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.414 3.678 1.395 2.697 2.376 2.414 3.488 2.355 4.769.013 8.332 0 8.741 0 12c0 3.259.013 3.668.072 4.948.059 1.281.342 2.393 1.323 3.374.981.981 2.093 1.264 3.374 1.323C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.393-.342 3.374-1.323.981-.981 1.264-2.093 1.323-3.374.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.668-.072-4.948-.059-1.281-.342-2.393-1.323-3.374-.981-.981-2.093-1.264-3.374-1.323C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"
										></path></svg
									></a
								>
							</li>
						</ul>
					</div>
				</div>

				<!-- Copyright -->
				<div class="mt-8 text-center text-blue-200 text-sm">
					&copy; {new Date().getFullYear()} Vixstores. All rights reserved.
				</div>
			</footer>
		{/if}
	</main>
</div>
