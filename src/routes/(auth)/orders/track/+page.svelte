<script lang="ts">
	// Demo array of products/orders
	let orders = [
		{
			id: '1724336212',
			productName: 'Ultra-thin Wireless Mouse 2.4G Bluetooth Dual Mode Rechargeable Silver',
			productImage: '/e-commerce.png',
			variation: null,
			deliveryStart: 'Wednesday 27 August',
			deliveryEnd: 'Friday 29 August',
			status: 'SHIPPED'
		},
		{
			id: '1724336212',
			productName: 'Ultra-thin Wireless Mouse 2.4G Bluetooth Dual Mode Rechargeable Silver',
			productImage: '/e-commerce.png',
			variation: null,
			deliveryStart: 'Wednesday 27 August',
			deliveryEnd: 'Friday 29 August',
			status: 'SHIPPED'
		},
		{
			id: '1724336212',
			productName: '10 Speed Adjustable Laptop Stand+phone Stand',
			productImage: '/ads-3.png',
			variation: 'Black',
			deliveryStart: 'Wednesday 27 August',
			deliveryEnd: 'Friday 29 August',
			status: 'SHIPPED'
		}
	];
	let loading = false;
	let activeTab = 'ongoing';
</script>

<div class="max-w-3xl mx-auto mt-8 mb-16 md:mb-0">
	<h2 class="text-2xl font-semibold mb-4">Orders</h2>

	<script>
		let activeTab = 'ongoing';
	</script>

	<div class="bg-white rounded shadow">
		<div class="flex border-b">
			<button
				class="flex-1 py-3 font-semibold border-b-2 focus:outline-none"
				class:text-blue-600={activeTab === 'ongoing'}
				class:border-blue-600={activeTab === 'ongoing'}
				class:text-gray-500={activeTab !== 'ongoing'}
				class:border-transparent={activeTab !== 'ongoing'}
				on:click={() => (activeTab = 'ongoing')}
			>
				ONGOING/DELIVERED ({orders.length})
			</button>
			<button
				class="flex-1 py-3 font-semibold border-b-2 focus:outline-none"
				class:text-blue-600={activeTab === 'cancelled'}
				class:border-blue-600={activeTab === 'cancelled'}
				class:text-gray-500={activeTab !== 'cancelled'}
				class:border-transparent={activeTab !== 'cancelled'}
				on:click={() => (activeTab = 'cancelled')}
			>
				CANCELED/RETURNED (0)
			</button>
		</div>
		{#if activeTab === 'ongoing'}
			{#if loading}
				<p class="p-4">Loading your orders...</p>
			{:else if orders.length === 0}
				<p class="p-4">No orders yet.</p>
			{:else}
				<div class="p-4 space-y-4">
					{#each orders as order}
						<div class="flex items-center border rounded p-3 bg-white shadow">
							<img
								src={order.productImage || '/macbook.png'}
								alt="Product"
								class="w-20 h-20 object-cover rounded mr-4"
							/>
							<div class="flex-1">
								<p class="font-semibold">{order.productName}</p>
								<p class="text-gray-500 text-sm">Order {order.id}</p>
								{#if order.variation}
									<p class="text-gray-500 text-sm">Variation: {order.variation}</p>
								{/if}
								<div class="mt-2">
									<span
										class="inline-block px-2 py-1 bg-blue-700 text-white text-xs rounded font-bold"
										>SHIPPED</span
									>
								</div>
								<p class="mt-2 font-semibold">
									Delivered between {order.deliveryStart || 'Wednesday 27 August'} and {order.deliveryEnd ||
										'Friday 29 August'}
								</p>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		{:else}
			<div class="p-4 text-center text-gray-500">
				No cancelled or returned orders yet.<br />
				(This is dummy text for demonstration.)
			</div>
		{/if}
	</div>
</div>
