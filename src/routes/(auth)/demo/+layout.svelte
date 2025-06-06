<script>
	// Dummy data for the product cards and brands
	let brands = [
		'OnePlus',
		'Tencent',
		'Apple',
		'Microsoft',
		'Lenovo',
		'Huawei',
		'Nexus',
		'Google',
		'Firefox',
		'Tesla',
		'Brave',
		'Facebook'
	];

	let products = [
		{
			name: 'Game Controller',
			price: 29.0,
			original: 39.0,
			img: '/img/controller.png'
		},
		{
			name: 'Wireless Headphone',
			price: 199.0,
			original: 229.0,
			img: '/img/headphone.png'
		}
		// Add more products as needed
	];
</script>

<!-- Top Header -->
<div class="bg-gray-100 text-sm py-2 px-4 flex justify-between items-center">
	<div class="flex gap-4">
		<a href="#">Login</a>
		<a href="#">Help</a>
		<a href="#">Support</a>
	</div>
	<div>
		<span>Call Us: +01 23456789</span>
	</div>
</div>

<!-- Navbar -->
<header class="bg-white shadow-md py-4">
	<div class="container mx-auto flex justify-between items-center px-4">
		<h1 class="text-2xl font-bold text-blue-600">ShopO</h1>
		<input type="text" placeholder="Search Products..." class="border px-4 py-2 w-1/2 rounded" />
		<button class="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
	</div>
</header>

<!-- Hero Section -->
<section class="bg-blue-100 py-10 px-4 flex flex-col md:flex-row items-center justify-between">
	<div class="md:w-1/2">
		<h2 class="text-3xl font-bold mb-4">Explore Our Tech Collection Perfect Gadget</h2>
		<button class="bg-blue-600 text-white px-6 py-2 rounded">Shop Now</button>
	</div>
	<img src="/img/vr.png" alt="VR Glass" class="md:w-1/2" />
</section>

<!-- Brands Section -->
<div class="bg-white py-6 px-4 grid grid-cols-3 sm:grid-cols-6 md:grid-cols-12 gap-4 text-center">
	{#each brands as brand}
		<div class="text-gray-700 font-medium">{brand}</div>
	{/each}
</div>

<!-- Product Grid Section -->
<section class="py-10 px-4">
	<h2 class="text-2xl font-bold mb-6">New Arrivals</h2>
	<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
		{#each products as product}
			<div class="border rounded-lg shadow p-4">
				<img src={product.img} alt={product.name} class="w-full h-40 object-cover mb-4" />
				<h3 class="text-lg font-semibold mb-2">{product.name}</h3>
				<div class="text-red-600 font-bold mb-1">${product.price.toFixed(2)}</div>
				<div class="line-through text-gray-500 text-sm">${product.original.toFixed(2)}</div>
			</div>
		{/each}
	</div>
</section>

<!-- Footer -->
<footer class="bg-gray-100 py-6 mt-10">
	<div class="container mx-auto text-center text-gray-600">
		&copy; 2024 ShopO. All rights reserved.
	</div>
</footer>
