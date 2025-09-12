<script lang="ts">
import { onMount } from 'svelte';
import { pocketbase } from '$lib/controls.svelte';

// Hardcoded superadmin credentials
const ADMIN_EMAIL = 'admin@vixstores.com';
const ADMIN_PASSWORD = 'Vixstores@2025';

let email = $state('');
let password = $state('');
let isLoggedIn = $state(false);
let loginError = $state('');

// Data
let vendors: any[] = $state([]);
let users: any[] = $state([]);
let products: any[] = $state([]);
let orders: any[] = $state([]);
let carts: any[] = $state([]);
let ads: any[] = $state([]);
let settings: any[] = $state([]);
let loading = $state(false);
let tab = $state('overview'); // 'overview', 'products', 'orders', 'users', 'vendors', 'kys', 'analytics', 'settings'
let notifications: any[] = $state([]);

// Analytics data
let totalRevenue = $state(0);
let totalOrders = $state(0);
let totalUsers = $state(0);
let totalProducts = $state(0);
let totalVendors = $state(0);
let pendingKys = $state(0);
let recentOrders = $state([]);
let topProducts = $state([]);

function handleLogin(e: Event) {
  e.preventDefault();
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    isLoggedIn = true;
    loginError = '';
    loadData();
    localStorage.setItem('superadmin', '1');
  } else {
    loginError = 'Invalid credentials';
  }
}

function logout() {
  isLoggedIn = false;
  localStorage.removeItem('superadmin');
}

async function loadData() {
  loading = true;
  try {
    // Fetch all data in parallel
    const [vendorsData, usersData, productsData, ordersData, cartsData, adsData, settingsData] = await Promise.all([
      pocketbase.collection('vendors').getFullList({ requestKey: Date.now().toString() }),
      pocketbase.collection('users').getFullList({ requestKey: Date.now().toString() }),
      pocketbase.collection('products').getFullList({ requestKey: Date.now().toString() }),
      pocketbase.collection('orders').getFullList({ requestKey: Date.now().toString() }),
      pocketbase.collection('carts').getFullList({ requestKey: Date.now().toString() }),
      pocketbase.collection('ads').getFullList({ requestKey: Date.now().toString() }),
      pocketbase.collection('settings').getFullList({ requestKey: Date.now().toString() })
    ]);

    vendors = vendorsData;
    users = usersData;
    products = productsData;
    orders = ordersData;
    carts = cartsData;
    ads = adsData;
    settings = settingsData;

    // Calculate analytics
    calculateAnalytics();
  } catch (e) {
    console.error('Error loading data:', e);
  }
  loading = false;
}

function calculateAnalytics() {
  totalUsers = users.length;
  totalProducts = products.length;
  totalVendors = vendors.length;
  totalOrders = orders.length;
  pendingKys = vendors.filter(v => v.kys_status === 'pending').length;
  
  // Calculate total revenue from accepted orders
  totalRevenue = orders
    .filter(order => order.status === 'accepted')
    .reduce((sum, order) => {
      const productDetails = order.product_details || {};
      const price = productDetails.price || 0;
      const quantity = order.quantity || 0;
      return sum + (price * quantity);
    }, 0);

  // Get recent orders (last 10)
  recentOrders = orders
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    .slice(0, 10);

  // Get top products (by order count or views)
  topProducts = products
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);
}

async function updateKysStatus(vendorId: string, status: 'verified' | 'rejected') {
  loading = true;
  try {
    await pocketbase.collection('vendors').update(vendorId, { kys_status: status });
    await loadData();
    addNotification(`Vendor ${status} successfully`, 'success');
  } catch (e) {
    addNotification('Error updating vendor status', 'error');
  }
  loading = false;
}

async function updateOrderStatus(orderId: string, status: 'accepted' | 'rejected') {
  loading = true;
  try {
    await pocketbase.collection('orders').update(orderId, { status });
    await loadData();
    addNotification(`Order ${status} successfully`, 'success');
  } catch (e) {
    addNotification('Error updating order status', 'error');
  }
  loading = false;
}

async function deleteProduct(productId: string) {
  if (confirm('Are you sure you want to delete this product?')) {
    loading = true;
    try {
      await pocketbase.collection('products').delete(productId);
      await loadData();
      addNotification('Product deleted successfully', 'success');
    } catch (e) {
      addNotification('Error deleting product', 'error');
    }
    loading = false;
  }
}

async function toggleProductStatus(productId: string, currentStatus: boolean) {
  loading = true;
  try {
    await pocketbase.collection('products').update(productId, { is_active: !currentStatus });
    await loadData();
    addNotification('Product status updated', 'success');
  } catch (e) {
    addNotification('Error updating product status', 'error');
  }
  loading = false;
}

function addNotification(message: string, type: 'success' | 'error' | 'info') {
  const id = Date.now().toString();
  notifications = [...notifications, { id, message, type, timestamp: new Date() }];
  setTimeout(() => {
    notifications = notifications.filter(n => n.id !== id);
  }, 5000);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

onMount(async() => {
  if (localStorage.getItem('superadmin') === '1') {
    isLoggedIn = true;
    await loadData();
    console.log(await loadData())
  }
});
</script>

{#if !isLoggedIn}
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <form class="bg-white p-8 rounded shadow-md w-full max-w-sm" onsubmit={handleLogin}>
      <h2 class="text-2xl font-bold mb-6 text-center">Superadmin Login</h2>
      {#if loginError}
        <div class="mb-4 text-red-600">{loginError}</div>
      {/if}
      <div class="mb-4">
        <label for="email" class="block mb-1">Email</label>
        <input id="email" class="w-full border rounded px-3 py-2" type="email" bind:value={email} required />
      </div>
      <div class="mb-6">
        <label for="password" class="block mb-1">Password</label>
        <input id="password" class="w-full border rounded px-3 py-2" type="password" bind:value={password} required />
      </div>
      <button class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700" type="submit">Login</button>
    </form>
  </div>
{:else}
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="flex justify-between items-center p-4 bg-blue-700 text-white shadow-lg">
      <h1 class="text-2xl font-bold">VixStores Admin Dashboard</h1>
      <div class="flex items-center gap-4">
        <span class="text-sm">Welcome, Admin</span>
        <button class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition-colors" onclick={logout}>Logout</button>
      </div>
    </div>
    <!-- Navigation Tabs -->
    <div class="bg-white shadow-sm border-b">
      <div class="flex overflow-x-auto">
        <button class="px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors" 
                class:border-blue-500={tab==='overview'} class:text-blue-600={tab==='overview'} class:border-transparent={tab!=='overview'} class:text-gray-500={tab!=='overview'}
                onclick={() => tab='overview'}>Overview</button>
        <button class="px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors" 
                class:border-blue-500={tab==='products'} class:text-blue-600={tab==='products'} class:border-transparent={tab!=='products'} class:text-gray-500={tab!=='products'}
                onclick={() => tab='products'}>Products</button>
        <button class="px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors" 
                class:border-blue-500={tab==='orders'} class:text-blue-600={tab==='orders'} class:border-transparent={tab!=='orders'} class:text-gray-500={tab!=='orders'}
                onclick={() => tab='orders'}>Orders</button>
        <button class="px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors" 
                class:border-blue-500={tab==='users'} class:text-blue-600={tab==='users'} class:border-transparent={tab!=='users'} class:text-gray-500={tab!=='users'}
                onclick={() => tab='users'}>Users</button>
        <button class="px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors" 
                class:border-blue-500={tab==='vendors'} class:text-blue-600={tab==='vendors'} class:border-transparent={tab!=='vendors'} class:text-gray-500={tab!=='vendors'}
                onclick={() => tab='vendors'}>Vendors</button>
        <button class="px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors" 
                class:border-blue-500={tab==='kys'} class:text-blue-600={tab==='kys'} class:border-transparent={tab!=='kys'} class:text-gray-500={tab!=='kys'}
                onclick={() => tab='kys'}>KYS Applications</button>
        <button class="px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors" 
                class:border-blue-500={tab==='analytics'} class:text-blue-600={tab==='analytics'} class:border-transparent={tab!=='analytics'} class:text-gray-500={tab!=='analytics'}
                onclick={() => tab='analytics'}>Analytics</button>
        <button class="px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors" 
                class:border-blue-500={tab==='settings'} class:text-blue-600={tab==='settings'} class:border-transparent={tab!=='settings'} class:text-gray-500={tab!=='settings'}
                onclick={() => tab='settings'}>Settings</button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="p-6">
      {#if loading}
        <div class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-lg">Loading...</span>
        </div>
      {:else}
        {#if tab === 'overview'}
          <!-- Overview Dashboard -->
          <div class="space-y-6">
            <!-- Key Metrics -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="bg-white p-6 rounded-lg shadow">
                <div class="flex items-center">
                  <div class="p-2 bg-blue-100 rounded-lg">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p class="text-2xl font-semibold text-gray-900">{formatCurrency(totalRevenue)}</p>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-lg shadow">
                <div class="flex items-center">
                  <div class="p-2 bg-green-100 rounded-lg">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Total Orders</p>
                    <p class="text-2xl font-semibold text-gray-900">{totalOrders}</p>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-lg shadow">
                <div class="flex items-center">
                  <div class="p-2 bg-purple-100 rounded-lg">
                    <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Total Users</p>
                    <p class="text-2xl font-semibold text-gray-900">{totalUsers}</p>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-lg shadow">
                <div class="flex items-center">
                  <div class="p-2 bg-orange-100 rounded-lg">
                    <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Total Products</p>
                    <p class="text-2xl font-semibold text-gray-900">{totalProducts}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Order Statistics</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Total Orders:</span>
                    <span class="font-semibold">{totalOrders}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Accepted:</span>
                    <span class="font-semibold text-green-600">{orders.filter(o => o.status === 'accepted').length}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Rejected:</span>
                    <span class="font-semibold text-red-600">{orders.filter(o => o.status === 'rejected').length}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Pending:</span>
                    <span class="font-semibold text-yellow-600">{orders.filter(o => o.status !== 'accepted' && o.status !== 'rejected').length}</span>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                <div class="space-y-2">
                  {#each recentOrders.slice(0, 5) as order}
                    {@const productDetails = order.product_details || {}}
                    <div class="flex justify-between items-center text-sm">
                      <div>
                        <div class="truncate">{productDetails.title || 'Unknown Product'}</div>
                        <div class="text-xs text-gray-500">Qty: {order.quantity}</div>
                      </div>
                      <span class="font-semibold">{formatCurrency((productDetails.price || 0) * (order.quantity || 0))}</span>
                    </div>
                  {/each}
                </div>
              </div>

              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Vendor Performance</h3>
                <div class="space-y-2">
                  {#each vendors.slice(0, 5).map(vendor => {
                    const vendorOrders = orders.filter(o => o.vendor_id === vendor.id);
                    const acceptedOrders = vendorOrders.filter(o => o.status === 'accepted');
                    return {
                      ...vendor,
                      orderCount: vendorOrders.length,
                      acceptedCount: acceptedOrders.length,
                      acceptanceRate: vendorOrders.length > 0 ? Math.round((acceptedOrders.length / vendorOrders.length) * 100) : 0
                    };
                  }).sort((a, b) => b.orderCount - a.orderCount) as vendor}
                    <div class="flex justify-between items-center text-sm">
                      <span class="truncate">{vendor.store_name}</span>
                      <div class="text-right">
                        <div class="font-semibold">{vendor.orderCount} orders</div>
                        <div class="text-xs text-gray-500">{vendor.acceptanceRate}% accepted</div>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>

        {:else if tab === 'kys'}
          <h2 class="text-lg font-semibold mb-2">KYS Applications</h2>
          <div class="overflow-x-auto text-center">
            <table class="min-w-full text-center bg-white border rounded">
              <thead>
                <tr>
                  <th class="px-2 py-1 border font-bold">Store Name</th>
                  <th class="px-2 py-1 border font-bold">Owner</th>
                  <th class="px-2 py-1 border font-bold">Status</th>
                  <th class="px-2 py-1 border font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {#each vendors as v}
                  <tr>
                    <td class="px-2 py-1 border">{v.store_name}</td>
                    <td class="px-2 py-1 border">{v.personal_phone} <br /> {v.address}</td>
                    <td class="px-2 py-1 border">{v.kys_status}</td>
                    <td class="px-2 py-1 border">
                      {#if v.kys_status === 'pending'}
                        <button class="bg-green-500 text-white px-2 py-1 rounded mr-2" onclick={() => updateKysStatus(v.id, 'verified')}>Approve</button>
                        <button class="bg-red-500 text-white px-2 py-1 rounded" onclick={() => updateKysStatus(v.id, 'rejected')}>Reject</button>
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else if tab === 'products'}
          <!-- Products Management -->
          <div class="space-y-6">
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-bold text-gray-900">Products Management</h2>
              <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Add Product
              </button>
            </div>

            <div class="bg-white shadow rounded-lg overflow-hidden">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each products as product}
                      <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <div class="h-10 w-10 flex-shrink-0">
                              <img class="h-10 w-10 rounded-full object-cover" src={product.images?.[0] || '/placeholder.jpg'} alt={product.title} />
                            </div>
                            <div class="ml-4">
                              <div class="text-sm font-medium text-gray-900">{product.title}</div>
                              <div class="text-sm text-gray-500">{product.category}</div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(product.price || 0)}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock || 0}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                                class:bg-green-100={product.is_active} class:text-green-800={product.is_active}
                                class:bg-red-100={!product.is_active} class:text-red-800={!product.is_active}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.views || 0}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button class="text-indigo-600 hover:text-indigo-900" onclick={() => toggleProductStatus(product.id, product.is_active)}>
                            {product.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button class="text-red-600 hover:text-red-900" onclick={() => deleteProduct(product.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        {:else if tab === 'orders'}
          <!-- Orders Management -->
          <div class="space-y-6">
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-bold text-gray-900">Orders Management</h2>
              <div class="flex gap-2">
                <span class="text-sm text-gray-600">Total Orders: {orders.length}</span>
                <span class="text-sm text-green-600">Accepted: {orders.filter(o => o.status === 'accepted').length}</span>
                <span class="text-sm text-red-600">Rejected: {orders.filter(o => o.status === 'rejected').length}</span>
              </div>
            </div>

            <div class="bg-white shadow rounded-lg overflow-hidden">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each orders as order}
                      {@const vendor = vendors.find(v => v.id === order.vendor_id)}
                      {@const productDetails = order.product_details || {}}
                      {@const totalAmount = (productDetails.price || 0) * (order.quantity || 0)}
                      <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id.slice(0, 8)}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <div class="h-10 w-10 flex-shrink-0">
                              <img class="h-10 w-10 rounded-full object-cover" src={productDetails.image || '/placeholder.jpg'} alt={productDetails.title} />
                            </div>
                            <div class="ml-4">
                              <div class="text-sm font-medium text-gray-900">{productDetails.title || 'N/A'}</div>
                              <div class="text-sm text-gray-500">{productDetails.category || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vendor ? vendor.store_name : 'Unknown Vendor'}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.quantity || 0}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(totalAmount)}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                                class:bg-green-100={order.status === 'accepted'} class:text-green-800={order.status === 'accepted'}
                                class:bg-red-100={order.status === 'rejected'} class:text-red-800={order.status === 'rejected'}>
                            {order.status || 'Unknown'}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(order.created)}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {#if order.status !== 'accepted' && order.status !== 'rejected'}
                            <button class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs" 
                                    onclick={() => updateOrderStatus(order.id, 'accepted')}>Accept</button>
                            <button class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs" 
                                    onclick={() => updateOrderStatus(order.id, 'rejected')}>Reject</button>
                          {:else}
                            <span class="text-gray-500 text-xs">Processed</span>
                          {/if}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Order Statistics -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Total Orders:</span>
                    <span class="font-semibold">{orders.length}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Accepted:</span>
                    <span class="font-semibold text-green-600">{orders.filter(o => o.status === 'accepted').length}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Rejected:</span>
                    <span class="font-semibold text-red-600">{orders.filter(o => o.status === 'rejected').length}</span>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenue by Status</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Accepted Orders:</span>
                    <span class="font-semibold text-green-600">
                      {formatCurrency(orders.filter(o => o.status === 'accepted').reduce((sum, order) => {
                        const productDetails = order.product_details || {};
                        return sum + ((productDetails.price || 0) * (order.quantity || 0));
                      }, 0))}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Pending Orders:</span>
                    <span class="font-semibold text-yellow-600">
                      {formatCurrency(orders.filter(o => o.status !== 'accepted' && o.status !== 'rejected').reduce((sum, order) => {
                        const productDetails = order.product_details || {};
                        return sum + ((productDetails.price || 0) * (order.quantity || 0));
                      }, 0))}
                    </span>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Vendors by Orders</h3>
                <div class="space-y-2">
                  {#each vendors.slice(0, 5).map(vendor => ({
                    ...vendor,
                    orderCount: orders.filter(o => o.vendor_id === vendor.id).length
                  })).sort((a, b) => b.orderCount - a.orderCount) as vendor}
                    <div class="flex justify-between items-center text-sm">
                      <span class="truncate">{vendor.store_name}</span>
                      <span class="font-semibold">{vendor.orderCount} orders</span>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>

        {:else if tab === 'users'}
          <h2 class="text-lg font-semibold mb-2">All Users</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full text-center bg-white border rounded">
              <thead>
                <tr>
                  <th class="px-2 py-1 border font-bold">Email</th>
                  <th class="px-2 py-1 border font-bold">Username</th>
                  <th class="px-2 py-1 border font-bold">ID</th>
                </tr>
              </thead>
              <tbody>
                {#each users as u}
                  <tr>
                    <td class="px-2 py-1 border">{u.email}</td>
                    <td class="px-2 py-1 border">{u.username}</td>
                    <td class="px-2 py-1 border">{u.id}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else if tab === 'vendors'}
          <h2 class="text-lg font-semibold mb-2">All Vendors</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full text-center bg-white border rounded">
              <thead>
                <tr>
                  <th class="px-2 font-bold py-1 border">Store Name</th>
                  <th class="px-2 font-bold py-1 border">Owner</th>
                  <th class="px-2 font-bold py-1 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {#each vendors as v}
                  <tr>
                    <td class="px-2 py-1 border">{v.store_name}</td>
                    <td class="px-2 py-1 border">{v.personal_phone} <br /> {v.address}</td>
                    <td class="px-2 py-1 border">{v.kys_status}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else if tab === 'analytics'}
          <!-- Analytics -->
          <div class="space-y-6">
            <h2 class="text-2xl font-bold text-gray-900">Analytics & Reports</h2>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600">Total Revenue</span>
                    <span class="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600">Average Order Value</span>
                    <span class="text-lg font-semibold">{formatCurrency(totalOrders > 0 ? totalRevenue / totalOrders : 0)}</span>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600">Total Users</span>
                    <span class="text-2xl font-bold text-blue-600">{totalUsers}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600">Total Vendors</span>
                    <span class="text-lg font-semibold">{totalVendors}</span>
                  </div>
                </div>
              </div>

              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Product Performance</h3>
                <div class="space-y-2">
                  {#each topProducts as product}
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600 truncate">{product.title}</span>
                      <span class="text-sm font-semibold">{product.views || 0} views</span>
                    </div>
                  {/each}
                </div>
              </div>

              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Vendor Performance</h3>
                <div class="space-y-2">
                  {#each vendors.slice(0, 5).map(vendor => {
                    const vendorOrders = orders.filter(o => o.vendor_id === vendor.id);
                    const acceptedOrders = vendorOrders.filter(o => o.status === 'accepted');
                    const totalRevenue = acceptedOrders.reduce((sum, order) => {
                      const productDetails = order.product_details || {};
                      return sum + ((productDetails.price || 0) * (order.quantity || 0));
                    }, 0);
                    return {
                      ...vendor,
                      orderCount: vendorOrders.length,
                      acceptedCount: acceptedOrders.length,
                      totalRevenue
                    };
                  }).sort((a, b) => b.totalRevenue - a.totalRevenue) as vendor}
                    <div class="flex justify-between items-center text-sm">
                      <span class="truncate">{vendor.store_name}</span>
                      <div class="text-right">
                        <div class="font-semibold">{formatCurrency(vendor.totalRevenue)}</div>
                        <div class="text-xs text-gray-500">{vendor.acceptedCount}/{vendor.orderCount} orders</div>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>

              <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
                <div class="space-y-2">
                  {#each ['accepted', 'rejected'] as status}
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600 capitalize">{status}</span>
                      <span class="text-sm font-semibold">{orders.filter(o => o.status === status).length}</span>
                    </div>
                  {/each}
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Pending</span>
                    <span class="text-sm font-semibold">{orders.filter(o => o.status !== 'accepted' && o.status !== 'rejected').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {:else if tab === 'settings'}
          <!-- Settings -->
          <div class="space-y-6">
            <h2 class="text-2xl font-bold text-gray-900">System Settings</h2>

            <div class="bg-white p-6 rounded-lg shadow">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Site Configuration</h3>
              <div class="space-y-4">
                {#each settings as setting}
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600">{setting.name}</span>
                    <span class="text-sm font-semibold">{setting.value}</span>
                  </div>
                {/each}
              </div>
            </div>

            <div class="bg-white p-6 rounded-lg shadow">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span class="text-gray-600">Total Collections:</span>
                  <span class="ml-2 font-semibold">7</span>
                </div>
                <div>
                  <span class="text-gray-600">Database Status:</span>
                  <span class="ml-2 font-semibold text-green-600">Connected</span>
                </div>
                <div>
                  <span class="text-gray-600">Last Backup:</span>
                  <span class="ml-2 font-semibold">Today</span>
                </div>
                <div>
                  <span class="text-gray-600">System Version:</span>
                  <span class="ml-2 font-semibold">v1.0.0</span>
                </div>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    </div>

    <!-- Notifications -->
    <div class="fixed top-4 right-4 space-y-2 z-50">
      {#each notifications as notification}
        <div class="bg-white border-l-4 p-4 rounded shadow-lg max-w-sm" 
             class:border-green-500={notification.type === 'success'} 
             class:border-red-500={notification.type === 'error'} 
             class:border-blue-500={notification.type === 'info'}>
          <div class="flex">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">{notification.message}</p>
            </div>
            <button class="ml-4 text-gray-400 hover:text-gray-600" 
                    aria-label="Close notification"
                    onclick={() => notifications = notifications.filter(n => n.id !== notification.id)}>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
