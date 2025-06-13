<script>
	import { Form, FormGroup, Select, SelectItem, TextInput } from 'carbon-components-svelte';

	let payload = $state({
		businessName: '',
		businessType: '',
		registrationNumber: '',
		address: '',
		country: '',
		website: ''
	});

	function handleSubmit() {
		// You can send payload to an API here
		alert('Business information saved!');
		// console.log(payload);
	}
</script>

<div class="flex mx-auto pt-10 justify-center items-center">
	<div>
		<FormGroup>
			<h1>Business Information</h1>
		</FormGroup>
		<Form>
			<FormGroup>
				<TextInput labelText="Store Name" bind:value={payload.businessName} required />
			</FormGroup>

			<Select labelText="Store Niche" bind:selected={payload.businessType} required>
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

			<TextInput
				labelText="Registration Number"
				type="text"
				bind:value={payload.registrationNumber}
				required
			/>

			<label>
				Address
				<input type="text" bind:value={payload.address} required />
			</label>

			<label>
				Country
				<input type="text" bind:value={payload.country} required />
			</label>

			<label>
				Website
				<input type="url" bind:value={payload.website} />
			</label>

			<button type="submit">Save</button>
		</Form>
	</div>
</div>
