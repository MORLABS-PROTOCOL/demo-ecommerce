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
let vendors = $state([]);
let users = $state([]);
let loading = $state(false);
let tab = $state('kys'); // 'kys', 'users', 'vendors'

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
    // Fetch all vendors (KYS applications)
    vendors = await pocketbase.collection('vendors').getFullList({ requestKey: Date.now().toString() });
    // Fetch all users
    users = await pocketbase.collection('users').getFullList({ requestKey: Date.now().toString() });
  } catch (e) {
    // handle error
  }
  loading = false;
}

async function updateKysStatus(vendorId: string, status: 'verified' | 'rejected') {
  loading = true;
  try {
    await pocketbase.collection('vendors').update(vendorId, { kys_status: status });
    await loadData();
  } catch (e) {
    // handle error
  }
  loading = false;
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
    <form class="bg-white p-8 rounded shadow-md w-full max-w-sm" on:submit={handleLogin}>
      <h2 class="text-2xl font-bold mb-6 text-center">Superadmin Login</h2>
      {#if loginError}
        <div class="mb-4 text-red-600">{loginError}</div>
      {/if}
      <div class="mb-4">
        <label class="block mb-1">Email</label>
        <input class="w-full border rounded px-3 py-2" type="email" bind:value={email} required />
      </div>
      <div class="mb-6">
        <label class="block mb-1">Password</label>
        <input class="w-full border rounded px-3 py-2" type="password" bind:value={password} required />
      </div>
      <button class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700" type="submit">Login</button>
    </form>
  </div>
{:else}
  <div class="min-h-screen bg-gray-50">
    <div class="flex justify-between items-center p-4 bg-blue-700 text-white">
      <h1 class="text-xl font-bold">Superadmin Dashboard</h1>
      <button class="bg-red-500 px-4 py-2 rounded" on:click={logout}>Logout</button>
    </div>
    <div class="p-4">
      <div class="mb-4 flex gap-4">
        <button class="px-4 py-2 rounded border" class:selected={tab==='kys'} on:click={() => tab='kys'}>KYS Applications</button>
        <button class="px-4 py-2 rounded border" class:selected={tab==='users'} on:click={() => tab='users'}>All Users</button>
        <button class="px-4 py-2 rounded border" class:selected={tab==='vendors'} on:click={() => tab='vendors'}>All Vendors</button>
      </div>
      {#if loading}
        <div class="text-center py-10">Loading...</div>
      {:else}
        {#if tab === 'kys'}
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
                        <button class="bg-green-500 text-white px-2 py-1 rounded mr-2" on:click={() => updateKysStatus(v.id, 'verified')}>Approve</button>
                        <button class="bg-red-500 text-white px-2 py-1 rounded" on:click={() => updateKysStatus(v.id, 'rejected')}>Reject</button>
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
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
        {/if}
      {/if}
    </div>
  </div>
{/if}

<style>
.selected {
  background: #2563eb;
  color: white;
}
</style> 