import { browser } from "$app/environment"
import { page } from "$app/state"
import Client, { type ListResult, type RecordModel } from "pocketbase"

export let pocketbase = new Client("https://manage.morlabsprotocol.com/")
export let user: {
    country: string
    name: string
    preferred_currency: string
} = $state({
    country: "Nigeria",
    name: "Dandy",
    preferred_currency: 'NGN'
})
export let userData = pocketbase.authStore.record
export let currency = () => {
    if (user.preferred_currency === "NGN") {
        return "₦"
    } else if (user.preferred_currency === "USD") {
        return "$"
    }
}

export function getRandomNumber(): number {
    return Math.floor(Math.random() * 2) + 1;
}

export function getRandomArray(): number[] {
    const numbers = [0, 1, 2];
    return numbers.sort(() => Math.random() - 0.5);
}
export async function pullAds(): Promise<RecordModel[]> {
    let records = await pocketbase.collection('ads').getFullList()
    const ads = records.map((ad) => {
        return {
            ...ad,
            imageUrl: pocketbase.files.getURL(ad, ad.ad_image) // ✅ Recommended way
        };
    });
    return ads
}

export async function getAllProducts(): Promise<RecordModel[]> {
    let records = await pocketbase.collection("products").getFullList()
    let products = records.map((p) => {
        return {
            ...p, imageUrl: pocketbase.files.getURL(p, p.product_image)
        }
    })
    return products
}
export function notify(title: string, text: string = "", status: string = "info") {
    new Notify({
        title, text, status
    });
}
export function validateAuthState() {
    if (pocketbase.authStore.isValid && (page.url.pathname === '/signup' || page.url.pathname === '/login') && browser) {
        // Redirect authenticated users away from signup or login pages
        window.location.href = '/';
        return pocketbase.authStore.isValid;
    }

    if (!pocketbase.authStore.isValid && page.url.pathname !== '/' && page.url.pathname !== '/login' && page.url.pathname !== '/signup' && browser) {
        // Redirect unauthenticated users to the login page
        window.location.href = '/login';
        return pocketbase.authStore.isValid;
    }

    return pocketbase.authStore.isValid;
}

export async function getProductsByCategory(category: string, limit?: number): Promise<RecordModel[]> {


    let results = await pocketbase.collection("products").getList(1, limit, { filter: `category="${category.toLocaleLowerCase()}"`, requestKey: Date.now().toString() })

    return results.items.map((p) => {
        return {
            ...p, imageUrl: pocketbase.files.getURL(p, p.product_image)
        }
    })
}