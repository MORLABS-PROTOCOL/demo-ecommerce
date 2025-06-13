<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getCart,
		cart,
		currency,
		validateAuthState,
		removeFromCart,
		makePayment,
		pocketbase,
		addToCart,
		refreshCart,
		notify
	} from '$lib/controls.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { TrashCan } from 'carbon-icons-svelte';

	let cartDetails: any = $state([]);
	let cartItems: any[] = $state([]);
	let cartTotal = $state(0);
	let data: any = $state([]);
	onMount(async () => {
		validateAuthState();
		data = await getCart();
		cartDetails = data[0]; // assuming getCart() returns an array with the cart as the first item
		cartItems = cartDetails.items || [];
		cartTotal = cart.total || 0;
	});
</script>

<Seo title="Cart" description="Your shopping cart" keywords="vixstores, cart, shopping cart" />

{#if cartItems.length === 0}
	<div class="max-w-6xl mx-auto p-6 text-center">
		<p class="text-gray-500 font-bold">Your cart is empty.</p>
	</div>
{:else}
	<div class="flex flex-col lg:flex-row gap-6 px-4 py-6">
		<!-- Cart Items Section -->
		<div class="flex-1 space-y-6">
			{#each cartItems as item, index}
				<div class="flex mb-4">
					<div class="flex justify-between items-center w-full p-4 bg-white rounded-lg shadow">
						<div class="flex items-center gap-4">
							<img
								onclick={() => {
									window.location.href = `/products/${item.product.id}`;
								}}
								src={item.product.productImage}
								alt={item.product.name}
								class="w-20 h-20 object-cover rounded-md"
							/>
							<div>
								<button
									onclick={() => {
										window.location.href = `/products/${item.product.id}`;
									}}
									class="font-semibold text-lg flex items-center gap-x-2"
								>
									{item.product.name}
								</button>

								<!-- Quantity Control -->
								<div class="flex items-center gap-4 py-2">
									<div class="flex items-center border border-gray-300 rounded-md">
										<button
											class="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-l-md"
											onclick={async () => {
												if (item.quantity > 1) {
													item.quantity--;
													if (pocketbase.authStore.isValid) {
														await addToCart(item.product.id, item.quantity);
														await refreshCart();
														let updatedCart = await getCart();
														cartItems = updatedCart[0].items || [];
													} else {
														localStorage.setItem('cartItems', JSON.stringify(cartItems));
													}
													// notify('Success', 'Cart updated successfully');
												} else {
													await removeFromCart(item.product.id);
													await refreshCart();
													let updatedCart = await getCart();
													cartItems = updatedCart[0].items || [];
													notify('Item removed', 'Item removed from cart', 'info');
												}
											}}>-</button
										>
										<span class="px-3 text-sm font-medium">
											{item.quantity}
										</span>
										<button
											class="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-r-md"
											onclick={async () => {
												item.quantity++;
												if (pocketbase.authStore.isValid) {
													await addToCart(item.product.id, item.quantity);
													await refreshCart();
													let updatedCart = await getCart();
													cartItems = updatedCart[0].items || [];
												} else {
													localStorage.setItem('cartItems', JSON.stringify(cartItems));
												}
												notify('Success', 'Cart updated successfully');
											}}>+</button
										>
									</div>
								</div>

								{#if item.product.discount}
									<p class="text-sm text-gray-500">Discount: {item.product.discount}%</p>
								{/if}
							</div>
						</div>

						<!-- Price and Delete -->
						<div
							class="text-right text-lg font-medium flex flex-col justify-between h-full gap-y-2"
						>
							<button
								class="text-red-500 self-end"
								onclick={async () => {
									await removeFromCart(item.product.id);
									let data = await getCart();
									cartDetails = data[0];
									cartItems = cartDetails.items || [];
									cartTotal = cartDetails.total || 0;
								}}
							>
								<TrashCan />
							</button>
							<div>
								₦{item.total.toLocaleString()}
								{#if item.product.discount}
									<p class="line-through text-xs text-gray-400">
										{currency()}{item.product.oldPrice}
									</p>
								{/if}
							</div>
						</div>
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
			<button
				onclick={async () => {
					let redirectUrl = await makePayment(pocketbase?.authStore?.record.email, cart.total);
					window.location.href = redirectUrl.data.authorization_url;
				}}
				class="w-full bg-black text-white py-3 rounded-lg text-center font-medium"
				>Checkout Now</button
			>
		</div>
	</div>
{/if}
