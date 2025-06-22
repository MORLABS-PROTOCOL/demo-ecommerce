<script lang="ts">
	import { kysRegistration, notify, pocketbase, validateAuthState } from '$lib/controls.svelte';
	import { Button, Form, FormGroup, Select, SelectItem, TextInput } from 'carbon-components-svelte';
	import { onMount } from 'svelte';

	let payload = $state({
		store_name: '',
		store_niche: '',
		address: '',
		country: '',
		website: ''
	});
	let valid: boolean = $state(false);
	async function handleSubmit() {
		// You can send payload to an API here
		await kysRegistration(
			payload.store_name,
			payload.store_niche,
			payload.address,
			payload.country,
			payload.website
		);
		window.location.reload();
		// console.log(payload);
	}
	let user: any = $state({});
	let busy: boolean = $state(false);
	onMount(async () => {
		valid = validateAuthState();
		if (!valid) {
			window.location.href = '/login';
		} else {
			let vendor: any = $state({});
			try {
				const userId = pocketbase.authStore?.record?.id;
				const result = await pocketbase.collection('vendors').getFullList({
					filter: `userId="${userId}"`
				});
				vendor = result[0];
			} catch (e) {
				// Vendor does not exist, just return silently
				return;
			}
			if (!vendor) {
				console.log('No vendor');

				return;
			}
			user = vendor;
			console.log('User: ', user);

			console.log('Vendor: ', user);
			if (user.kys_status === 'verified') {
				window.location.href = '/vendor/dashboard';
			} else if (user.kys_status === 'rejected') {
				notify('Rejected', 'Your KYS registration has been rejected. Please try again.', 'error');
			} else {
				return;
			}
		}
	});
</script>

{#if valid && (!user || user == null || user.kys_status === 'rejected' || user.kys_status == null)}
	<div class="flex mx-auto p-10 justify-center items-center">
		<div>
			<FormGroup>
				<h1>Know Your Store (KYS)</h1>
				<p class="mb-4 text-gray-600 text-sm">
					Please provide accurate information about your store.
				</p>
			</FormGroup>
			<Form on:submit={handleSubmit}>
				<FormGroup>
					<TextInput
						labelText="Store Name"
						bind:value={payload.store_name}
						required
						invalid={payload.store_name === ''}
						invalidText="Store name is required"
					/>
				</FormGroup>

				<FormGroup>
					<Select
						labelText="Store Niche"
						bind:selected={payload.store_niche}
						required
						invalid={payload.store_niche === ''}
						invalidText="Please select a store niche"
					>
						<SelectItem value="" text="Select a niche" disabled />
						<SelectItem value="fashion" text="Fashion" />
						<SelectItem value="electronics" text="Electronics" />
						<SelectItem value="beauty" text="Beauty & Personal Care" />
						<SelectItem value="home" text="Home & Living" />
						<SelectItem value="sports" text="Sports & Outdoors" />
						<SelectItem value="toys" text="Toys & Games" />
						<SelectItem value="food" text="Food & Beverages" />
						<SelectItem value="books" text="Books & Stationery" />
						<SelectItem value="automotive" text="Automotive" />
						<SelectItem value="health" text="Health & Wellness" />
						<SelectItem value="other" text="Other" />
					</Select>
				</FormGroup>

				<FormGroup>
					<TextInput
						labelText="Address"
						type="text"
						bind:value={payload.address}
						required
						invalid={payload.address === ''}
						invalidText="Address is required"
					/>
				</FormGroup>

				<FormGroup>
					<TextInput
						labelText="Country"
						type="text"
						bind:value={payload.country}
						required
						invalid={payload.country === ''}
						invalidText="Country is required"
					/>
				</FormGroup>

				<FormGroup>
					<TextInput
						labelText="Website"
						type="url"
						bind:value={payload.website}
						pattern="https?://.+"
						invalid={!!payload.website && !/^https?:\/\/.+/.test(payload.website)}
						invalidText="Please enter a valid URL (starting with http:// or https://)"
					/>
				</FormGroup>

				<button
					type="submit"
					class="mt-4 px-6 py-4 bg-blue-600 w-full text-white rounded disabled:bg-gray-500 disabled:opacity-50"
					disabled={!Boolean(payload.store_name) ||
						!Boolean(payload.store_niche) ||
						!Boolean(payload.address) ||
						!Boolean(payload.country) ||
						(!!payload.website && !/^https?:\/\/.+/.test(payload.website))}
				>
					Save
				</button>
			</Form>
		</div>
	</div>
{:else if valid && user && user.kys_status === 'pending'}
	<div class="flex mx-auto p-10 justify-center items-center">
		<div class="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
			<h2 class="text-2xl font-semibold mb-4 text-blue-700">Registration Pending</h2>
			<p class="mb-6 text-gray-700">
				Thank you for submitting your store information!<br />
				Your registration is currently <span class="font-bold text-yellow-600">under review</span> by
				our team.
			</p>
			<div class="mb-4 flex flex-col items-center">
				<svg
					class="w-16 h-16 text-yellow-400 mb-2"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					viewBox="0 0 24 24"
				>
					<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="#FEF3C7" />
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01" />
				</svg>
				<span class="text-sm text-gray-500">This process may take up to 48 hours.</span>
			</div>
			<p class="mb-6 text-gray-600">
				We will notify you via email once your store has been verified.<br />
				If you have any questions, please
				<a href="/contact" class="text-blue-600 underline">contact support</a>.
			</p>
		</div>
	</div>
{/if}
