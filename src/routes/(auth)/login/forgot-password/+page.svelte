<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { notify, pageSettings, pocketbase, validateAuthState } from '$lib/controls.svelte';
	import { Form, FormGroup, PasswordInput, TextInput } from 'carbon-components-svelte';
	import { onMount } from 'svelte';

	let formData: HTMLFormElement;
	let userData = $state({
		email: '',
		password: '',
		otp: ''
	});
	let step: number = 1;
	onMount(() => {
		validateAuthState();
	});
</script>

<Seo
	title="vixstores | Forgot Password"
	description="Forgot Password"
	keywords="vixstores, forgot password"
/>

<Form bind:ref={formData} class="">
	<main class="h-screen overflow-hidden mx-auto flex justify-center items-center w-full">
		<div class="h-[500px] w-full gap-y-3 px-3">
			{#if step === 1}
				<div class="sm:flex sm:flex-col sm:items-center sm:my-[100px]">
					<div class="items-center flex text-center justify-center">
						<img src={pageSettings.logoUrl} alt="Logo" class="w-[100px] h-[100px]" />
					</div>
					<h3 class="justify-center items-center flex">Reset Password</h3>
					<FormGroup class="w-full">
						<TextInput labelText="Enter Email" required bind:value={userData.email} />
					</FormGroup>

					<button
						class="w-full text-center bg-blue-700 p-3 font-bold rounded-lg text-white"
						onclick={async () => {
							try {
								let passwordReset = await pocketbase
									.collection('users')
									.requestPasswordReset(userData.email);
								if (passwordReset) {
									notify('Password reset link sent to your email');
									window.location.href = '/login';
								}
								// notify('Error', 'User not found', 'error');
							} catch (error) {
								notify('Error', `${error}`, 'error');
							}
						}}>Log In</button
					>
				</div>
			{:else if step === 2}
				<div class="sm:flex sm:flex-col sm:items-center sm:my-[100px]">
					<div class="items-center flex text-center justify-center">
						<img src={pageSettings.logoUrl} alt="Logo" class="w-[100px] h-[100px]" />
					</div>
					<h3 class="justify-center items-center flex">Reset Password</h3>
					<FormGroup class="w-full">
						<TextInput labelText="Enter Email" required bind:value={userData.email} />
					</FormGroup>

					<button
						class="w-full text-center bg-blue-700 p-3 font-bold rounded-lg text-white"
						onclick={async () => {
							try {
								let userExists = await pocketbase
									.collection('users')
									.getFullList({ filter: `email="${userData.email}"` });
								let authData;
								if (userExists[0]) {
									authData = await pocketbase
										.collection('users')
										.confirmPasswordReset('RESET_TOKEN', 'NEW_PASSWORD', 'NEW_PASSWORD_CONFIRM');
									if (authData) {
										notify('Log in successful');
										window.location.href = '/';
									}
								} else {
									notify('Error', 'User not found', 'error');
								}
							} catch (error) {
								notify('Error', `An error occured while trying to login`, 'error');
							}
						}}>Log In</button
					>
				</div>
			{/if}
		</div>
	</main>
</Form>
