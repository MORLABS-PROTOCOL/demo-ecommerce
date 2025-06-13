<script lang="ts">
	import { page } from '$app/state';
	import Seo from '$lib/components/Seo.svelte';
	import {
		getLogo,
		notify,
		pageSettings,
		pocketbase,
		validateAuthState,
		addToCart,
		refreshCart
	} from '$lib/controls.svelte';
	import { FormGroup, Modal, PasswordInput, TextInput, Form } from 'carbon-components-svelte';
	import { onMount } from 'svelte';
	let userData = $state({
		email: '',
		password: '',
		otp: ''
	});
	let formData: HTMLFormElement | undefined = $state();
	onMount(async () => {
		validateAuthState();
	});
</script>

<Seo title="Vixstores | Login" description="login" keywords="vixstores, login" />

<Form bind:ref={formData}>
	<main class="h-screen overflow-hidden mx-auto flex justify-center items-center">
		<div class="h-[500px] w-[500px] gap-y-3 sm:flex bg-gray-500 px-3 sm:px-0 hidden">
			<!-- <img src="./e-commerce.png" alt="Logo" class="w-[100px] h-[100px]" /> -->
		</div>
		<div class="h-[500px] w-[500px] gap-y-3 px-3">
			<div class="sm:flex sm:flex-col sm:items-center sm:my-[100px]">
				<div class="items-center flex sm:hidden text-center justify-center">
					<img src={pageSettings.logoUrl} alt="Logo" class="w-[100px] h-[100px]" />
				</div>
				<h3 class="justify-center items-center flex">Log In</h3>
				<FormGroup class="w-full">
					<TextInput labelText="Enter Email" required bind:value={userData.email} />
				</FormGroup>
				<FormGroup class="w-full">
					<PasswordInput labelText="Enter Password" required bind:value={userData.password} />
					<br /><a href="/login/forgot-password"
						><span class="text-blue-500">Forgot password?</span></a
					>
				</FormGroup>

				<button
					class="w-full text-center bg-blue-700 p-3 font-bold rounded-lg text-white"
					onclick={async () => {
						try {
							let authData = await pocketbase
								.collection('users')
								.authWithPassword(userData.email, userData.password);
							if (authData) {
								notify('Success', 'Logged in successfully');
								const cartItems = localStorage.getItem('cartItems');
								if (cartItems) {
									const items = JSON.parse(cartItems);
									try {
										for (const item of items) {
											await addToCart(item.productId, item.quantity);
										}
										localStorage.removeItem('cartItems');
									} catch (e) {
										notify('Error', 'Failed to sync cart items', 'error');
									} finally {
										await refreshCart();
									}
								}
								window.location.href = '/';
							}
						} catch (error) {
							notify('Error', `Invalid Login Credentials`, 'error');
						}
					}}>Log In</button
				>
				<p class="text-xs text-center py-2">
					Don't have an account? <a href="/signup" class="text-blue-500">Sign Up</a>
				</p>
			</div>
		</div>
	</main>
</Form>
