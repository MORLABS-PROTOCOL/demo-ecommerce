<script lang="ts">
	import { onMount } from 'svelte';
	import { getCart, cart, currency } from '$lib/controls.svelte';

	let cartDetails: any = $state(null);
	let cartItems: any[] = $state([]);
	let cartTotal = $state(0);

	onMount(async () => {
		const data = await getCart();
		console.log(data[0].items);
		cartDetails = data[0]; // assuming getCart() returns an array with the cart as the first item
		cartItems = cartDetails.items || [];
		console.log(cartItems);
		cartTotal = cart.total || 0;
	});
</script>

<div class="flex flex-col lg:flex-row gap-6 px-4 py-6">
	<!-- Cart Items Section -->
	<div class="flex-1 space-y-6">
		{#each cartItems as item}
			<div class="flex justify-between items-center p-4 bg-white rounded-lg shadow">
				<div class="flex items-center gap-4">
					<img
						src={item.product.productImage}
						alt={item.product.name}
						class="w-20 h-20 object-cover rounded-md"
					/>
					<div>
						<p class="font-semibold text-lg flex items-center gap-x-2">
							{item.product.name}{#if item.product.discount}<span
									class="w-fit h-fit text-center font-semibold bg-red-500 text-white py-1 px-2 text-xs rounded-full"
									>{item.product.discount}% off</span
								>{/if}
						</p>
						<p class="text-sm text-gray-500">Quantity: {item.quantity}</p>
					</div>
				</div>
				<div class="text-right text-lg font-medium">
					₦{item.total.toLocaleString()}
					{#if item.product.discount}<p class="line-through text-xs text-gray-400">
							{currency()}{item.product.oldPrice}
						</p>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<!-- Order Summary Section -->
	<div class="w-full lg:w-1/3 p-6 bg-white rounded-lg shadow space-y-4">
		<h2 class="text-xl font-semibold">Order Summary</h2>
		<div class="flex items-center border rounded overflow-hidden">
			<input type="text" placeholder="Discount voucher" class="flex-1 px-4 py-2 outline-none" />
			<button class="bg-black text-white px-4 py-2">Apply</button>
		</div>

		<div class="text-sm text-gray-700 space-y-1">
			<div class="flex justify-between">
				<span>Sub Total</span>
				<span>₦{cartTotal.toLocaleString()}</span>
			</div>

			<div class="flex justify-between">
				<span>Delivery Fee</span>
				<span>₦0.00</span>
			</div>
		</div>

		<div class="flex justify-between font-bold text-lg">
			<span>Total</span>
			<span>₦{cart.total.toLocaleString()}</span>
		</div>

		<p class="text-xs text-gray-500">
			90 Day Limited Warranty against manufacturer's defects.
			<!-- <a href="/details" class="underline"
				>Details</a
			> -->
		</p>
		<button class="w-full bg-black text-white py-3 rounded-lg text-center font-medium"
			>Checkout Now</button
		>
	</div>
</div>
