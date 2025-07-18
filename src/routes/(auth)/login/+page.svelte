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

	let busy: boolean = $state(false);
	async function login() {
		busy = true;
		if (formData && !formData.checkValidity()) {
			formData.reportValidity();
		} else {
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
				busy = false;
			} catch (error) {
				notify('Error', `Invalid Login Credentials`, 'error');
				busy = false;
			}
		}
	}
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
						await login();
					}}>Log In</button
				>
				<p class="text-xs text-center py-2">
					Don't have an account? <a href="/signup" class="text-blue-500">Sign Up</a>
				</p>
			</div>
		</div>
	</main>
</Form>
