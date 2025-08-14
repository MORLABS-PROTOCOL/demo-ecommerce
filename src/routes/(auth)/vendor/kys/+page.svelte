<script lang="ts">
	import { kysRegistration, notify, pocketbase, validateAuthState } from '$lib/controls.svelte';
	import {
		Button,
		FileUploader,
		Form,
		FormGroup,
		Select,
		SelectItem,
		TextArea,
		TextInput
	} from 'carbon-components-svelte';
	import { onDestroy, onMount } from 'svelte';

	let payload = $state({
		user_id: '',
		store_name: '',
		store_niche: '',
		address: '',
		country: '',
		state: '',
		city: '',
		dob: '',
		personal_phone: '',
		proof_of_occupancy: [],
		store_address: '',
		store_description: '',
		store_phone: '',
		store_logo: [],
		store_banner: [],
		valid_id: [],
		bank_details: '',
		website: '',
		agreed: false
	});
	let userId: string | undefined = $state('')
	onMount(() => {
		userId = pocketbase.authStore.record?.id
	})
	let valid: boolean = $state(false);
	async function handleSubmit() {
		payload.user_id = userId as string;
		busy = true;
		try {
			await kysRegistration(payload);
		} finally {
			busy = false;
		}
		// console.log(payload);
	}
	let user: any = $state({});
	let busy: boolean = $state(false);
	let unsubscribe: () => void;
	onMount(async () => {
		valid = validateAuthState();
		if (!valid) {
			window.location.href = '/login';
		} else {
			
			if (!userId) {
				return;
			}
			try {
				let result = await pocketbase.collection('vendors').getFullList({
					filter: `user_id="${userId}"`, requestKey: Date.now().toString()
				});
				console.log(result)
				if (result.length > 0) {
					user = result[0];
					handleKysStatus(user);
				}
			} catch (e) {
				// Vendor does not exist, just return silently
				console.log("Error: ",e)
			}

			unsubscribe = await pocketbase.collection('vendors').subscribe('*', (e) => {
				if (e.record.user_id === userId) {
					user = e.record;
					handleKysStatus(user);
				}
			});
		}
	});

	function handleKysStatus(vendor: any) {
		console.log('KYS Status:', vendor.kys_status);
		
		if (vendor.kys_status === 'verified') {
			window.location.href = '/vendor/dashboard';
		} else if (vendor.kys_status === 'rejected') {
			notify('Rejected', 'Your KYS registration has been rejected. Please try again.', 'error');
		} else if (vendor.kys_status === 'pending') {
			notify('Pending', 'Your KYS registration is pending review.', 'info');
		}
	}
	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
	});
</script>

{#if valid && (!user || user == null || user.kys_status === 'rejected' || user.kys_status == null)}
	<div class="flex mx-auto p-10 justify-center items-center">
		<div class="">
			<FormGroup>
				<h1>Know Your Store (KYS)</h1>
				<p class="mb-4 text-gray-600 text-sm">
					Please provide accurate information about your store.
				</p>
			</FormGroup>

			<Form on:submit={handleSubmit}>
				<!-- Personal Information -->
				<FormGroup>
					<h2 class="text-lg font-semibold mb-2">Personal Information</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
						<FormGroup>
							<TextInput
								labelText="Store Name *"
								bind:value={payload.store_name}
								required
								invalid={payload.store_name === ''}
								invalidText="Store name is required"
							/>
						</FormGroup>
						<FormGroup>
							<Select
								labelText="Store Niche *"
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
								labelText="Date of Birth *"
								type="date"
								bind:value={payload.dob}
								required
								invalid={payload.dob === ''}
								invalidText="Date of birth is required"
							/>
						</FormGroup>
						<FormGroup>
							<TextInput
								labelText="Personal Phone *"
								type="tel"
								bind:value={payload.personal_phone}
								required
								invalid={payload.personal_phone === ''}
								invalidText="Phone number is required"
							/>
						</FormGroup>
					</div>
				</FormGroup>

				<!-- Address Information -->
				<FormGroup>
					<h2 class="text-lg font-semibold mb-2 mt-6">Address Information</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
						<FormGroup>
							<TextInput
								labelText="Permanent Address *"
								bind:value={payload.address}
								required
								invalid={payload.address === ''}
								invalidText="Address is required"
							/>
						</FormGroup>
						<FormGroup>
							<TextInput
								labelText="Country *"
								bind:value={payload.country}
								required
								invalid={payload.country === ''}
								invalidText="Country is required"
							/>
						</FormGroup>
						<FormGroup>
							<TextInput
								labelText="State *"
								bind:value={payload.state}
								required
								invalid={payload.state === ''}
								invalidText="State is required"
							/>
						</FormGroup>
						<FormGroup>
							<TextInput
								labelText="City/Town *"
								bind:value={payload.city}
								required
								invalid={payload.city === ''}
								invalidText="City/Town is required"
							/>
						</FormGroup>
					</div>
				</FormGroup>

				<!-- Store Information -->
				<FormGroup>
					<h2 class="text-lg font-semibold mb-2 mt-6">Store Information</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
						<FormGroup>
							<TextInput
								labelText="Store Address *"
								bind:value={payload.store_address}
								required
								invalid={payload.store_address === ''}
								invalidText="Store address is required"
							/>
						</FormGroup>
						<FormGroup>
							<TextInput
								labelText="Store Phone *"
								type="tel"
								bind:value={payload.store_phone}
								required
								invalid={payload.store_phone === ''}
								invalidText="Store phone is required"
							/>
						</FormGroup>
					</div>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
						<FormGroup>
							<TextArea
								labelText="Store Description *"
								bind:value={payload.store_description}
								required
								invalid={payload.store_description === ''}
								invalidText="Description is required"
							/>
						</FormGroup>
						<FormGroup>
							<TextArea
								labelText="Bank Details *"
								bind:value={payload.bank_details}
								required
								invalid={payload.bank_details === ''}
								invalidText="Bank details are required"
							/>
						</FormGroup>
					</div>
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
				<!-- Uploads -->
				<FormGroup>
					<h2 class="text-lg font-semibold mb-2 mt-6">Uploads</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
						<FormGroup>
							<FileUploader
								status="complete"
								buttonLabel="Upload Proof of Occupancy"
								labelTitle="Proof of Occupancy *"
								accept={['.jpg', '.jpeg', '.png', '.pdf']}
								bind:files={payload.proof_of_occupancy}
							/>
						</FormGroup>
						<FormGroup>
							<FileUploader
								status="complete"
								buttonLabel="Upload Store Logo"
								labelTitle="Store Logo *"
								accept={['.jpg', '.jpeg', '.png']}
								bind:files={payload.store_logo}
							/>
						</FormGroup>
						<FormGroup>
							<FileUploader
								status="complete"
								buttonLabel="Upload Store Banner"
								labelTitle="Store Banner *"
								accept={['.jpg', '.jpeg', '.png']}
								bind:files={payload.store_banner}
							/>
						</FormGroup>
						<FormGroup>
							<FileUploader
								status="complete"
								buttonLabel="Upload Valid ID"
								labelTitle="Valid ID *"
								accept={['.jpg', '.jpeg', '.png', '.pdf']}
								bind:files={payload.valid_id}
							/>
						</FormGroup>
					</div>
				</FormGroup>

				<!-- Agree to Terms -->
				<FormGroup>
					<label class="flex items-center space-x-2">
						<input type="checkbox" bind:checked={payload.agreed} required />
						<span
							>I agree to the <a href="/terms" class="text-blue-500 underline">Terms & Conditions</a
							></span
						>
					</label>
				</FormGroup>

				<!-- Submit Button -->
				<button
					type="submit"
					class="mt-4 px-6 py-4 bg-blue-600 w-full text-white rounded disabled:bg-gray-500 disabled:opacity-50"
					disabled={busy || !payload.agreed ||
						!payload.store_name ||
						!payload.store_niche ||
						!payload.address ||
						!payload.country ||
						!payload.state ||
						!payload.city ||
						!payload.dob ||
						!payload.personal_phone ||
						payload.proof_of_occupancy.length === 0 ||
						!payload.store_address ||
						!payload.store_description ||
						!payload.store_phone ||
						payload.store_logo.length === 0 ||
						payload.store_banner.length === 0 ||
						payload.valid_id.length === 0 ||
						!payload.bank_details ||
						(!!payload.website && !/^https?:\/\/.+/.test(payload.website))}
				>
					{#if busy}
						<span>Submitting...</span>
					{:else}
						Save
					{/if}
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
