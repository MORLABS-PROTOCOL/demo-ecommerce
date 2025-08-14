<script lang="ts">
  import { page } from '$app/stores';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import { getProductsByCategory } from '$lib/controls.svelte';
  import { Filter, Grid, List } from 'carbon-icons-svelte';
  import { onMount } from 'svelte';

  const categoryName = $derived($page.params.categoryName);

  // Actual products from PocketBase
  let {products, title=""} = $props();



  // Filters and sorting state
  let sortBy = $state('featured');
  let priceRange = $state({ min: 0, max: 2000000 });
  let showDiscountOnly = $state(false);
  let viewMode = $state('grid');

  // Pagination state
  let currentPage = $state(1);
  let itemsPerPage = $state(3);

  // Filtered and sorted products
  const filteredProducts = $derived(products
    .filter(product => {
      if (showDiscountOnly && product.discountPercentage === 0) return false;
      if (product.price < priceRange.min || product.price > priceRange.max) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'discount':
          return b.discountPercentage - a.discountPercentage;
        case 'newest':
          return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
        default:
          return 0;
      }
    })
  );

  // Pagination calculations
  const totalPages = $derived(Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = $derived(
    filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  );

  // Reset to page 1 when filters change
  $effect(() => {
    filteredProducts;
    currentPage = 1;
  });
</script>


<div class="min-h-screen bg-gray-50">
  <!-- Header Section -->
  <div class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 capitalize">{categoryName}</h1>
          <p class="text-gray-600 mt-1">{filteredProducts.length} products available {title ? `for "${title}"` : ''}</p>
        </div>
        
        <!-- View Mode Toggle -->
        <div class="flex items-center space-x-2">
          <button
            class="p-2 rounded-md {viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}"
            onclick={() => viewMode = 'grid'}
          >
            <Grid size={20} />
          </button>
          <button
            class="p-2 rounded-md {viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}"
            onclick={() => viewMode = 'list'}
          >
            <List size={20} />
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Filters Sidebar -->
      <div class="lg:w-64 flex-shrink-0">
        <div class="bg-white rounded-lg shadow-sm p-6 sticky top-4">
          <div class="flex items-center mb-4">
            <Filter size={20} class="mr-2" />
            <h3 class="text-lg font-semibold">Filters</h3>
          </div>

          <!-- Sort By -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              bind:value={sortBy}
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          <!-- Price Range -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <div class="space-y-2">
              <input
                type="number"
                bind:value={priceRange.min}
                placeholder="Min"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                bind:value={priceRange.max}
                placeholder="Max"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Discount Filter -->
          <div class="mb-6">
            <label class="flex items-center">
              <input
                type="checkbox"
                bind:checked={showDiscountOnly}
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700">Show discounted items only</span>
            </label>
          </div>

          <!-- Clear Filters -->
          <button
            class="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
            onclick={() => {
              sortBy = 'featured';
              priceRange = { min: 0, max: 2000 };
              showDiscountOnly = false;
            }}
          >
            Clear All Filters
          </button>

          <!-- Pagination Controls -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <h4 class="text-sm font-medium text-gray-700 mb-3">Page Navigation</h4>
            
            <!-- Items per page selector -->
            <div class="mb-4">
              <label class="block text-xs text-gray-600 mb-1">Items per page</label>
              <select
                bind:value={itemsPerPage}
                class="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={3}>3</option>
                <option value={6}>6</option>
                <option value={12}>12</option>
              </select>
            </div>

            <!-- Page navigation -->
            {#if totalPages > 1}
              <div class="flex flex-col space-y-2">
                <div class="text-xs text-gray-600 text-center">
                  Page {currentPage} of {totalPages}
                </div>
                
                <div class="flex justify-between">
                  <button
                    class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={currentPage === 1}
                    onclick={() => currentPage = Math.max(1, currentPage - 1)}
                  >
                    Previous
                  </button>
                  
                  <button
                    class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={currentPage === totalPages}
                    onclick={() => currentPage = Math.min(totalPages, currentPage + 1)}
                  >
                    Next
                  </button>
                </div>

                <!-- Page numbers for small pagination -->
                {#if totalPages <= 5}
                  <div class="flex justify-center space-x-1 mt-2">
                    {#each Array(totalPages).fill(0) as _, i}
                      <button
                        class="w-6 h-6 text-xs rounded {currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors"
                        onclick={() => currentPage = i + 1}
                      >
                        {i + 1}
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        </div>
        </div>






      <!-- Products Grid -->
      <div class="flex-1">
        {#if filteredProducts.length > 0}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each paginatedProducts as product}
              <ProductCard
                productId={product.id}
                title={product.title}
                price={product.price}
                discountPercentage={product.discountPercentage}
                image={product.imageUrl}
                quantity={product.quantity}
                threshold={product.threshold}
                dateCreated={product.dateCreated}
                flashSale={product.flashSale}
              />
            {/each}
          </div>
          
          <!-- Bottom Pagination -->
          {#if totalPages > 1}
            <div class="mt-8 flex justify-center">
              <div class="flex items-center space-x-4 bg-white border border-gray-300 rounded-lg px-6 py-3">
                <button
                  class="flex items-center text-gray-700 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-700"
                  disabled={currentPage === 1}
                  onclick={() => currentPage = Math.max(1, currentPage - 1)}
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span class="ml-1">Prev</span>
                </button>
                
                <span class="text-gray-900 font-medium">
                  {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredProducts.length)}
                </span>
                
                <button
                  class="flex items-center text-gray-700 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-700"
                  disabled={currentPage === totalPages}
                  onclick={() => currentPage = Math.min(totalPages, currentPage + 1)}
                >
                  <span class="mr-1">Next</span>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          {/if}
        {:else}
          <div class="text-center py-12">
            <div class="text-gray-400 mb-4">
              <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p class="text-gray-500">Try adjusting your filters to find what you're looking for.</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
