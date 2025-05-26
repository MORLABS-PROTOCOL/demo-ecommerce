import { browser, dev } from "$app/environment"
import { page } from "$app/state"
import Client, { type ListResult, type RecordModel } from "pocketbase"
import { writable, type Writable } from "svelte/store"
import { PUBLIC_SDK_URL } from "$env/static/public"

export let pocketbase: Client;
if (dev) {
    pocketbase = new Client(`${PUBLIC_SDK_URL}`)
} else {
    pocketbase = new Client(`https://manage.morlabsprotocol.com`)
}
export let user: {
    country: string
    name: string
    preferred_currency: string
} = $state({
    country: "Nigeria",
    name: "Dandy",
    preferred_currency: 'NGN'
})
export let pageSettings = $state({ logoUrl: "" })
export let userData = pocketbase.authStore.record
export let currency = () => {
    if (user.preferred_currency === "NGN") {
        return "₦"
    } else if (user.preferred_currency === "USD") {
        return "$"
    }
}

export let categories: any[] = $state(['Electronics',
    'Fashion',
    'Home & Kitchen',
    'Beauty & Personal Care',
    'Sports & Outdoors',
    'Toys & Games',
    'Books',
    'Automotive',
    'Health & Wellness',
    'Groceries',
    'Office Supplies',
    'Pet Supplies'])
export async function getLogo() {
    let logo = await pocketbase.collection("settings").getFullList({ filter: `name="logo"`, requestKey: Date.now().toString() })
    let collection = pocketbase.collection("settings")

    pageSettings.logoUrl = pocketbase.files.getURL(logo[0], logo[0].image)


}

export function getRandomNumber(): number {
    return Math.floor(Math.random() * 2) + 1;
}

export function getRandomArray(): number[] {
    const numbers = [0, 1, 2];
    return numbers.sort(() => Math.random() - 0.5);
}
export async function pullAds(): Promise<RecordModel[]> {
    let records = await pocketbase.collection('ads').getFullList({ requestKey: Date.now().toString() })
    const ads = records.map((ad) => {
        return {
            ...ad,
            imageUrl: pocketbase.files.getURL(ad, ad.ad_image) // ✅ Recommended way
        };
    });
    return ads
}

export async function getAllProducts(): Promise<RecordModel[]> {
    let records = await pocketbase.collection("products").getList(1, 6, { requestKey: Date.now().toString() })
    let products = records.items.map((p) => {
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
    if (pocketbase.authStore.isValid && (page.url.pathname === '/signup' || page.url.pathname === '/login' || page.url.pathname === "/login/forgot-password") && browser) {
        // Redirect authenticated users away from signup or login pages
        window.location.href = '/';
        return pocketbase.authStore.isValid;
    }

    if (!pocketbase.authStore.isValid && page.url.pathname !== '/' && page.url.pathname !== '/login' && page.url.pathname !== '/signup' && page.url.pathname !== "/login/forgot-password" && browser) {
        // Redirect unauthenticated users to the login page
        window.location.href = '/login';
        return pocketbase.authStore.isValid;
    }

    return pocketbase.authStore.isValid;
}


export async function getProductsByCategory(category: string, limit?: number): Promise<RecordModel[]> {


    let results = await pocketbase.collection("products").getList(1, limit, { filter: `category="${category.toLocaleLowerCase()}"`, requestKey: `${category}-${Date.now().toString()}` })

    return results.items.map((p) => {
        return {
            ...p, imageUrl: pocketbase.files.getURL(p, p.product_image)
        }
    })
}

export async function getProductDetails(id: string) {
    let result = await pocketbase.collection("products").getOne(id, { requestKey: Date.now().toString() })

    return result
}

export async function getProductById(id: string) {

    if (browser) {
        let result = await pocketbase.collection("products").getOne(id, { requestKey: Date.now().toString() })
        return {
            ...result, imageUrl: pocketbase.files.getURL(result, result.product_image)
        }
    }
}
export async function getProductsBySearch(search: string, limit?: number): Promise<RecordModel[]> {
    let results = await pocketbase.collection("products").getList(1, limit, { filter: `title~"${search}"`, requestKey: Date.now().toString() })

    return results.items.map((p) => {
        return {
            ...p, imageUrl: pocketbase.files.getURL(p, p.product_image)
        }
    })
}

export function calculateNewPrice(price: number, discountPercentage: number): number {
    return price - (price * discountPercentage) / 100;
}

export async function getCart() {
    let cart = await pocketbase.collection("carts").getFullList({ filter: `userId="${pocketbase.authStore.record?.id}" && status="pending"`, requestKey: Date.now().toString() });
    return cart
}


export let cart: { length: number, total: number } = $state({ length: 0, total: 0 });

export let refreshCart = async () => {
    let record = await getCart()

    cart.length = record[0].items?.length
    cart.total = record[0].total

}
let productDetails: { id: string, name: string, productImage: string, price: number, discount: string, oldPrice?: number } = $state({
    id: "",
    name: "",
    productImage: "",
    price: 0,
    discount: ""
})
export async function addToCart(productId: string, quantity: number) {
    let product = await pocketbase.collection("products").getOne(productId, { requestKey: Date.now().toString() })

    if (product.discount_percentage < 1) {
        productDetails = {
            id: product.id,
            name: product.title,
            productImage: pocketbase.files.getURL(product, product.product_image), price: product.price, discount: product.discount_percentage
        };
    } else {
        productDetails = {
            id: product.id,
            name: product.title,
            productImage: pocketbase.files.getURL(product, product.product_image),
            price: calculateNewPrice(product.price, product.discount_percentage),
            oldPrice: product.price,
            discount: product.discount_percentage
        };
    }
    let existingCart = await pocketbase.collection("carts").getFullList({ filter: `userId="${pocketbase.authStore.record?.id}" && status="pending"`, requestKey: Date.now().toString() });

    if (existingCart.length > 0) {
        let cart = existingCart[0]
        // Modify the existing cart by pushing the new item into the items array
        cart.items.push({ quantity: quantity, product: productDetails, total: productDetails.price * quantity });
        await pocketbase.collection("carts").update(cart.id, {
            items: cart.items,
            total: cart.items.reduce((sum: number, item: { quantity: number, product: { price: number } }) => sum + (item.quantity * item.product.price), 0)
        }, { requestKey: Date.now().toString() });
        return cart;
    } else {
        // No existing pending cart, create a new one
        let cart = await pocketbase.collection("carts").create({
            items: [{ quantity: quantity, product: productDetails, total: productDetails.price * quantity }],
            userId: pocketbase.authStore.record?.id,
            status: "pending",
            total: [{ quantity: quantity, product: productDetails, total: productDetails.price * quantity }]
                .reduce((sum, item) => sum + item.total, 0)
        }, { requestKey: Date.now().toString() });
        await pocketbase.collection("users").update(pocketbase.authStore.record?.id as string, {
            carts: [...(pocketbase.authStore.record?.carts || []), cart.id]
        }, { requestKey: Date.now().toString() });

        return cart;
    }

}

export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

let wishlist = $state({ items: [] });

export async function modifyWishList(productId: string) {
    const user = await pocketbase.collection("users").getFullList({ filter: `id="${pocketbase.authStore.record?.id}"`, requestKey: Date.now().toString() })
    const product = await pocketbase.collection("products").getOne(productId, { requestKey: Date.now().toString() })
    const productImage = pocketbase.files.getURL(product, product.product_image)
    const productDetails = {
        id: product.id,
        name: product.title,
        productImage: productImage,
        price: product.discount_percentage < 1 ? product.price : calculateNewPrice(product.price, product.discount_percentage),
        oldPrice: product.price,
        discount: product.discount_percentage < 1 ? 0 : product.discount_percentage
    }
    if (user[0].wishlist === null) user[0].wishlist = [];
    if (user[0].wishlist.some((item: { id: string }) => item.id === productId)) {
        user[0].wishlist = user[0].wishlist.filter((item: { id: string }) => item.id !== productId);
        await pocketbase.collection("users").update(pocketbase.authStore.record?.id as string, {
            wishlist: user[0].wishlist
        }, { requestKey: Date.now().toString() });
    } else {
        user[0].wishlist.push(productDetails);
        await pocketbase.collection("users").update(pocketbase.authStore.record?.id as string, {
            wishlist: user[0].wishlist
        }, { requestKey: Date.now().toString() });
    }
    await refreshWishList()
    wishList.items = user[0].wishlist;
    return user[0].wishlist
}


export async function clearWishList() {
    wishList.items = [];
    await pocketbase.collection('users').update(pocketbase.authStore.record?.id as string, {
        wishlist: []
    });
}
export async function getWishList() {
    const user = await pocketbase.collection("users").getFullList({ filter: `id="${pocketbase.authStore.record?.id}"`, requestKey: Date.now().toString() })
    return user[0].wishlist
}

export let wishList: { items: any[] } = $state({ items: [] })
export async function refreshWishList() {
    let user = await pocketbase.collection("users").getFullList({ filter: `id="${pocketbase.authStore.record?.id}"`, requestKey: Date.now().toString() })

    wishList.items = user[0].wishlist;
}

export async function removeFromCart(productId: string) {
    let cartItems = await pocketbase.collection("carts").getFullList({ filter: `userId="${pocketbase.authStore.record?.id}"`, requestKey: Date.now().toString() })

    cartItems[0].items = cartItems[0].items.filter((products: any) => products.product.id !== productId);
    await pocketbase.collection("carts").update(cartItems[0].id as string, {
        items: cartItems[0].items
        , total: cartItems[0].items.reduce((sum: number, item: any) => sum + (item.quantity * item.product.price), 0)
    }, { requestKey: Date.now().toString() });
    await refreshCart()
}

export async function removeFromWishList(productId: string) {
    let user = await pocketbase.collection("users").getFullList({ filter: `id="${pocketbase.authStore.record?.id}"`, requestKey: Date.now().toString() });
    if (user[0].wishlist && user[0].wishlist.includes(productId)) {
        user[0].wishlist = user[0].wishlist.filter((id: string) => id !== productId);
        await pocketbase.collection("users").update(pocketbase.authStore.record?.id as string, {
            wishlist: user[0].wishlist
        }, { requestKey: Date.now().toString() });
        await refreshWishList();
    }
    return user[0].wishlist;
}

export async function updateCart(productId: string, quantity: number) {
    let cartItems = await pocketbase.collection("carts").getFullList({ filter: `userId="${pocketbase.authStore.record?.id}"&&status="pending"`, requestKey: Date.now().toString() })
    let cartItem = cartItems[0].items.find((item: any) => item.product.id === productId);
    if (cartItem) {
        cartItem.quantity = quantity;
        await pocketbase.collection("carts").update(cartItems[0].id as string, {
            items: cartItems[0].items
        }, { requestKey: Date.now().toString() });
    }
}
