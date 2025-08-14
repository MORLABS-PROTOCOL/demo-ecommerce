<script lang="ts">
	import { browser } from '$app/environment';
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
	let verificationRequired = $state(false);
	let busy: boolean = $state(false);
	
</script>

<Seo title="Vixstores | Login" description="login" keywords="vixstores, login" />

<Form bind:ref={formData}>
	<main class="min-h-screen h-screen top-0 overflow-hidden mx-auto flex justify-center">
		<div class="h-[500px] w-[500px] gap-y-3 px-3">
			<div class="sm:flex sm:flex-col sm:items-center sm:my-[100px]">
				<div class="items-center flex text-center justify-center">
					<img src="./Logo chosen HQ.png" alt="Logo" class="w-[130px] h-[100px]" />
				</div>
				<h3 class="justify-center items-center flex">Log In</h3>
				<FormGroup class="w-full">
					<TextInput labelText="Enter Email" type="email" required bind:value={userData.email} />
				</FormGroup>
				<FormGroup class="w-full">
					<PasswordInput labelText="Enter Password" required bind:value={userData.password} />
					<br /><a href="/login/forgot-password"
						><span class="text-blue-500">Forgot password?</span></a
					>
				</FormGroup>

				<button
					disabled={busy || !userData.email || !userData.password}
					type="submit"
					class="w-full text-center bg-blue-700 p-3 font-bold rounded-lg text-white disabled:bg-gray-500 disabled:opacity-50"
					onclick={async () => {
					
		busy = true;
		if(browser){
		if (formData && !formData.checkValidity()) {
			formData.reportValidity();
		} else {
			try {
				let authData = await pocketbase
					.collection('users')
					.authWithPassword(userData.email, userData.password);

					
					if (authData) {
					if(!pocketbase.authStore.record?.verified){
						notify('Error', 'Please verify your account before logging in', 'error');
						pocketbase.authStore.clear();
						let verificationReq = await pocketbase
									.collection('users')
									.requestVerification(userData.email);
									console.log(verificationReq)
						busy = false;
						verificationRequired = true;
						return;
					}
					
					notify('Success', 'Logged in successfully');
					const cartItems = localStorage.getItem('cartItems');
					if (cartItems) {
						const items = JSON.parse(cartItems);
						try {
							for (const item of items) {
								await addToCart(item.product?.id, item.quantity);
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
				busy = false;
			} catch (error) {
				// console.log(error);
				notify('Error', `Invalid Login Credentials`, 'error');
				busy = false;
			}
		
	}}
					}}>Log In</button
				>
				<p>
					Don't have an account?
					<a href="/signup" class="text-blue-500">Sign Up</a>
				</p>

				{#if verificationRequired}
				<p>A verification email has been sent to {userData.email}. Please check your inbox and follow the instructions to verify your account.</p>
				{/if}
			</div>
		</div>
	</main>
</Form>
