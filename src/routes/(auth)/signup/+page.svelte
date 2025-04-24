<script lang="ts">
	import { page } from '$app/state';
	import { notify, pageSettings, pocketbase, validateAuthState } from '$lib/controls.svelte';
	import { Form, FormGroup, Modal, PasswordInput, TextInput } from 'carbon-components-svelte';
	import { getTokenPayload } from 'pocketbase';
	import { onMount } from 'svelte';
	let userData = $state({
		userName: '',
		email: '',
		password: '',
		c_password: '',
		otp: ''
	});
	let step: number = $state(1);
	let open: boolean = $state(false);
	let formData: HTMLFormElement;
	onMount(() => {
		validateAuthState();
		console.log(pocketbase.authStore.isValid);
		// console.log('Signup Auth State:', authState);
	});
</script>

<Form bind:ref={formData}>
	<main class="h-screen overflow-hidden mx-auto flex justify-center items-center">
		<div class="h-[500px] w-[500px] gap-y-3 sm:flex bg-gray-500 px-3 sm:px-0 hidden">
			<!-- <img src="./e-commerce.png" alt="Logo" class="w-[100px] h-[100px]" /> -->
		</div>
		<div class="h-[500px] w-[500px] gap-y-3 px-3 sm:px-1">
			<!-- {#if step === 1} -->
			<div class="sm:flex sm:flex-col sm:items-center px-3">
				<div class="items-center flex sm:hidden text-center justify-center">
					<img src={pageSettings.logoUrl} alt="Logo" class="w-[100px] h-[100px]" />
				</div>
				<h3 class="justify-center items-center flex">Sign Up</h3>
				<FormGroup class="w-full">
					<TextInput
						labelText="Username"
						required
						bind:value={userData.userName}
						on:keydown={(e) => {
							return e.key !== ' ';
						}}
						on:input={(e) => {
							e.target.value = e.target.value.replace(/\s/g, '');
						}}
					/>
				</FormGroup>
				<FormGroup class="w-full">
					<TextInput type="email" labelText="Enter Email" required bind:value={userData.email} />
				</FormGroup>
				<FormGroup class="w-full">
					<PasswordInput labelText="Enter Password" required bind:value={userData.password} />
				</FormGroup>
				<FormGroup class="w-full">
					<PasswordInput labelText="Confirm Password" required bind:value={userData.c_password} />
				</FormGroup>
				<!-- <button
				class="bg-blue-300"
				onclick={async () => {
					let auth = await pocketbase.collection('users').authWithOAuth2({
						provider: 'google'
					});
				}}>Sign in with Google</button
			> -->
				<button
					class="w-full text-center bg-blue-700 p-3 font-bold rounded-lg text-white"
					onclick={async () => {
						try {
							const authData = await pocketbase.collection('users').create({
								username: userData.userName,
								email: userData.email,
								password: userData.password,
								passwordConfirm: userData.c_password,
								carts: [],
								wishlist: []
							});
							console.log(authData);
							let verificationReq = await pocketbase
								.collection('users')
								.requestVerification(userData.email);
							if (verificationReq) {
								notify(
									'Verification Required',
									`A verification email has been sent to ${userData.email}`
								);
								window.location.href = '/login';
							} else {
								notify('Error', `An error occured while trying to send you a verification mail`);
							}
						} catch (error) {
							console.log(error.data);
							notify(
								'Error',
								`${error.data?.data?.email?.message || ''}\n \n ${error.data?.data?.password?.message || ''} \n \n ${error.data?.data?.passwordConfirm?.message || ''}`,
								'error'
							);
						}
					}}>Sign Up</button
				>
				<p class="text-xs text-center py-2">
					Already have an account? <a href="/login" class="text-blue-500">Log In</a>
				</p>
			</div>
		</div>
	</main>
</Form>
