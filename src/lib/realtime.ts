import { pocketbase } from './controls.svelte';
import { writable } from 'svelte/store';
import type { RecordModel } from 'pocketbase';

// --- Products Store ---
export const products = writable<RecordModel[]>([]);
export const product = writable<RecordModel>();

let productsUnsubscribe: () => void;
let productUnsubscribe: () => void;

async function initProducts() {
    if (productsUnsubscribe) productsUnsubscribe();
    const initialProducts = await pocketbase.collection('products').getFullList({ sort: '-created' });
    products.set(initialProducts);

    productsUnsubscribe = await pocketbase.collection('products').subscribe('*', (e) => {
        products.update((currentProducts) => {
            if (e.action === 'delete') {
                return currentProducts.filter((p) => p.id !== e.record.id);
            }
            const index = currentProducts.findIndex((p) => p.id === e.record.id);
            if (index !== -1) {
                currentProducts[index] = e.record;
                return currentProducts;
            }
            return [...currentProducts, e.record];
        });
    });
}

export async function getProduct(id: string) {
    if (productUnsubscribe) productUnsubscribe();
    const initialProduct = await pocketbase.collection('products').getOne(id);
    product.set(initialProduct);

    productUnsubscribe = await pocketbase.collection('products').subscribe(id, (e) => {
        product.set(e.record);
    });
}

// --- Cart Store ---
export const cart = writable<RecordModel | null>(null);
let cartUnsubscribe: () => void;

async function initCart() {
    if (cartUnsubscribe) cartUnsubscribe();
    const userId = pocketbase.authStore.record?.id;
    if (!userId) {
        cart.set(null);
        return;
    }

    try {
        const cartData = await pocketbase
            .collection('carts')
            .getFirstListItem(`userId="${userId}" && status="pending"`);
        cart.set(cartData);
        if (cartData) {
            cartUnsubscribe = await pocketbase.collection('carts').subscribe(cartData.id, (e) => {
                cart.set(e.record);
            });
        }
    } catch (error) {
        console.error('Failed to initialize cart:', error);
        cart.set(null); // No cart found
    }
}

// --- Wishlist Store ---
export const wishlist = writable<RecordModel | null>(null);
let wishlistUnsubscribe: () => void;

async function initWishlist() {
    if (wishlistUnsubscribe) wishlistUnsubscribe();
    const userId = pocketbase.authStore.record?.id;
    if (!userId) {
        wishlist.set(null);
        return;
    }
    try {
        const wishlistData = await pocketbase
            .collection('wishlists')
            .getFirstListItem(`user="${userId}"`);
        wishlist.set(wishlistData);
        if (wishlistData) {
            wishlistUnsubscribe = await pocketbase
                .collection('wishlists')
                .subscribe(wishlistData.id, (e) => {
                    wishlist.set(e.record);
                });
        }
    } catch (error) {
        console.error('Failed to initialize wishlist:', error);
        wishlist.set(null); // No wishlist found
    }
}

// --- Settings Store ---
export const settings = writable<RecordModel[]>([]);
let settingsUnsubscribe: () => void;
async function initSettings() {
    if (settingsUnsubscribe) settingsUnsubscribe();
    const initialSettings = await pocketbase.collection('settings').getFullList();
    settings.set(initialSettings);

    settingsUnsubscribe = await pocketbase.collection('settings').subscribe('*', (e) => {
        settings.update((currentSettings) => {
            if (e.action === 'delete') {
                return currentSettings.filter((s) => s.id !== e.record.id);
            }
            const index = currentSettings.findIndex((s) => s.id === e.record.id);
            if (index !== -1) {
                currentSettings[index] = e.record;
                return currentSettings;
            }
            return [...currentSettings, e.record];
        });
    });
}

// Initialize all stores
export function initializeStores() {
    initProducts();
    initCart();
    initWishlist();
    initSettings();
}

export function cleanupStores() {
    if (productsUnsubscribe) productsUnsubscribe();
    if (productUnsubscribe) productUnsubscribe();
    if (cartUnsubscribe) cartUnsubscribe();
    if (wishlistUnsubscribe) wishlistUnsubscribe();
    if (settingsUnsubscribe) settingsUnsubscribe();
} 