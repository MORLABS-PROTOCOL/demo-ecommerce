import { browser, dev } from "$app/environment"
import { page } from "$app/state"
import Client, { type ListResult, type RecordModel } from "pocketbase"
import { writable, type Writable } from "svelte/store"
import { PUBLIC_PAYSTACK_SECRET_KEY, PUBLIC_SDK_URL } from "$env/static/public"
import { initializeStores, cleanupStores, wishlist } from './realtime'
import { get } from 'svelte/store'
import type { WishlistItem } from './types'


export let pocketbase: Client;

    console.log("Accessing SDK")
    pocketbase = new Client(`https://manage.morlabsprotocol.com`)


pocketbase.authStore.onChange((auth) => {
    if (pocketbase.authStore.isValid) {
        initializeStores();
    } else {
        cleanupStores();
    }
});

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
    let records = await pocketbase.collection("products").getList(1, 4, { requestKey: Date.now().toString() })
    let products = records.items.map((p) => {
        return {
            ...p, imageUrl: pocketbase.files.getURL(p, p.product_image)
        }
    })
    return products
}
export function notify(title: string, text: string = "", status: string = "info") {
    new Notify({
        title,
        text,
        status
    });
}
export function validateAuthState() {
    if (pocketbase.authStore.isValid && (page.url.pathname === '/signup' || page.url.pathname === '/login' || page.url.pathname === "/login/forgot-password") && browser) {
        // Redirect authenticated users away from signup or login pages
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
    if (pocketbase.authStore.isValid) {
        // User is logged in, fetch cart from PocketBase
        let cart = await pocketbase.collection("carts").getFullList({ filter: `userId="${pocketbase.authStore.record?.id}" && status="pending"`, requestKey: Date.now().toString() });
        return cart;
    } else if (browser) {
        // User not logged in, get cart from localStorage
        const localCart = localStorage.getItem("cartItems");
        return localCart ? JSON.parse(localCart) : [];
    } else {
        return [];
    }
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
    // Fetch product details first
    const product = await pocketbase.collection("products").getOne(productId, { requestKey: Date.now().toString() });
    let productInfo: typeof productDetails;

    if (product.discount_percentage < 1) {
        productInfo = {
            id: product.id,
            name: product.title,
            productImage: pocketbase.files.getURL(product, product.product_image),
            price: product.price,
            discount: product.discount_percentage
        };
    } else {
        productInfo = {
            id: product.id,
            name: product.title,
            productImage: pocketbase.files.getURL(product, product.product_image),
            price: calculateNewPrice(product.price, product.discount_percentage),
            oldPrice: product.price,
            discount: product.discount_percentage
        };
    }

    if (pocketbase.authStore.isValid) {
        // Authenticated user: use PocketBase cart
        let existingCart: RecordModel | null = null;
        try {
            existingCart = await pocketbase
                .collection('carts')
                .getFirstListItem(
                    `userId="${pocketbase.authStore.record?.id}" && status="pending"`
                );
        } catch (e) {
            // no cart
        }

        if (existingCart) {
            const items = existingCart.items || [];
            let existingItem = items.find((item: any) => item.product.id === productId);
            if (existingItem) {
                existingItem.quantity = quantity;
                existingItem.total = existingItem.quantity * productInfo.price;
            } else {
                items.push({
                    quantity,
                    product: productInfo,
                    total: productInfo.price * quantity
                });
            }
            const total = items.reduce((sum: number, item: any) => sum + item.total, 0);
            await pocketbase.collection('carts').update(existingCart.id, {
                items: items,
                total: total
            });
        } else {
            const newCart = await pocketbase.collection('carts').create({
                items: [
                    {
                        quantity,
                        product: productInfo,
                        total: productInfo.price * quantity
                    }
                ],
                userId: pocketbase.authStore.record?.id,
                status: 'pending',
                total: productInfo.price * quantity
            });
            await pocketbase
                .collection('users')
                .update(pocketbase.authStore.record?.id as string, {
                    'carts+': newCart.id
                });
        }
        await refreshCart();
        return { length: cart.length, total: cart.total };
    } else if (browser) {
        // Guest user: use localStorage
        let localCart = localStorage.getItem("cartItems");
        let cartItems = localCart ? JSON.parse(localCart) : [];
        let existingItem = cartItems.find((item: any) => item.product.id === productId);
        if (existingItem) {
            existingItem.quantity = quantity;
            existingItem.total = existingItem.quantity * productInfo.price;
        } else {
            cartItems.push({
                quantity,
                product: productInfo,
                total: productInfo.price * quantity
            });
        }
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
        await refreshCart();
        return { length: cart.length, total: cart.total };
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

export async function modifyWishList(productId: string) {
    if (!pocketbase.authStore.isValid) {
        notify('Error', 'You must be logged in to modify your wishlist.', 'error');
        if (browser) window.location.href = '/login';
        return;
    }

    const userId = pocketbase.authStore.record?.id;
    if (!userId) return;

    const currentWishlist = get(wishlist) || [];
    const productIndex = currentWishlist.findIndex((item: WishlistItem) => item.id === productId);

    let updatedWishlist;

    if (productIndex > -1) {
        updatedWishlist = currentWishlist.filter((item: WishlistItem) => item.id !== productId);
    } else {
        const product = await pocketbase.collection('products').getOne(productId);
        const productDetails = {
            id: product.id,
            name: product.title,
            productImage: pocketbase.files.getURL(product, product.product_image),
            price:
                product.discount_percentage < 1
                    ? product.price
                    : calculateNewPrice(product.price, product.discount_percentage),
            oldPrice: product.price,
            discount: product.discount_percentage < 1 ? 0 : product.discount_percentage
        };
        updatedWishlist = [...currentWishlist, productDetails];
    }

    await pocketbase.collection('users').update(userId, {
        wishlist: updatedWishlist
    });
}

export async function refreshWishList() {
    if (!pocketbase.authStore.isValid) {
        wishlist.set([]);
        return;
    }
    try {
        const userId = pocketbase.authStore.record?.id;
        if (!userId) {
            wishlist.set([]);
            return;
        }
        const userData = await pocketbase.collection('users').getOne(userId);
        wishlist.set(userData.wishlist || []);
    } catch (error) {
        console.error('Failed to refresh wishlist:', error);
        wishlist.set([]);
    }
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


export async function addToNewsLetter(email: string) {
    try {
        let record = await pocketbase.collection("newsletter").create({
            email: email
        }, { requestKey: Date.now().toString() });
        if (record) {
            notify("Success", "You have been added to the newsletter successfully!", "success");
        }
        return record;
    } catch (error) {
        console.error("Error adding to newsletter:", error);
        throw error;
    }
}

export async function makePayment(email: string, amount: number) {
    try {
        let transaction = await fetch("https://api.paystack.co/transaction/initialize", {
            headers: {
                "Authorization": `Bearer ${PUBLIC_PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json'
            }, method: "POST",
            body: JSON.stringify({ email, amount: amount * 100 })
        })
        return transaction.json();
    } catch (error) {
        console.error("Error making payment:", error);
        throw error;
    }
}

export async function kysRegistration(payload: {
    user_id: string,
    store_name: string,
    store_niche: string,
    address: string,
    country: string,
    state: string,
    city: string,
    dob: string,
    personal_phone: string,
    proof_of_occupancy: File[],
    store_address: string,
    store_description: string,
    store_phone: string,
    store_logo: File[],
    store_banner: File[],
    valid_id: File[],
    bank_details: any,
    website?: string,
    agreed?: boolean
}) {
    if (!pocketbase.authStore.isValid) {
        notify("Error", "You must be logged in to register as a vendor.", "error");
        return null;
    }

    // Attach the currently authenticated user's ID
    payload.user_id = pocketbase.authStore.record?.id as string;

    if (!payload.user_id) {
        notify("Error", "User ID not found.", "error");
        return null;
    }

    try {
        // Check if the vendor record already exists for this user
        const existing = await pocketbase.collection("vendors").getFullList({
            filter: `user_id="${payload.user_id}"`,
            requestKey: Date.now().toString()
        });

        // Helper to append multiple files
        const appendFiles = (key: string, files: File[]) => {
            files?.forEach(file => {
                if (file instanceof File) {
                    formData.append(key, file);
                }
            });
        };

        // Prepare FormData
        const formData = new FormData();
        formData.append("user_id", payload.user_id);
        formData.append("store_name", payload.store_name);
        formData.append("store_niche", payload.store_niche);
        formData.append("address", payload.address);
        formData.append("country", payload.country);
        formData.append("state", payload.state);
        formData.append("city", payload.city);
        formData.append("dob", payload.dob);
        formData.append("personal_phone", payload.personal_phone);
        formData.append("store_address", payload.store_address);
        formData.append("store_description", payload.store_description);
        formData.append("store_phone", payload.store_phone);
        formData.append("bank_details", JSON.stringify(payload.bank_details));
        formData.append("kys_status", "pending");
        formData.append("inventory", JSON.stringify([]));
        formData.append("orders", JSON.stringify([]));
        formData.append("finance", JSON.stringify([]));
        if (payload.website) {
            formData.append("website_url", payload.website);
        }
        formData.append("agreed", payload.agreed ? "true" : "false");

        // Append file fields
        appendFiles("proof_of_occupancy", payload.proof_of_occupancy);
        appendFiles("store_logo", payload.store_logo);
        appendFiles("store_banner", payload.store_banner);
        appendFiles("valid_id", payload.valid_id);

        // Optional: Debug FormData contents
        // for (const [key, value] of formData.entries()) {
        //     console.log(`${key}:`, value);
        // }

        let vendorRecord: any;
        if (existing.length > 0) {
            // Update existing record
            vendorRecord = await pocketbase.collection("vendors").update(existing[0].id, formData, {
                requestKey: Date.now().toString()
            });
            notify("Success", "Vendor registration updated. You will be notified once your registration is approved.", "success");
        } else {
            // Create new record
            vendorRecord = await pocketbase.collection("vendors").create(formData, {
                requestKey: Date.now().toString()
            });
            notify("Success", "Vendor registration initialized. You will be notified once your registration is approved.", "success");
        }

        return vendorRecord;

    } catch (error) {
        console.error("Error initializing vendor registration:", error);
        notify("Error", "Failed to register vendor.", "error");
        throw error;
    }
}


// async function removeBg(imageURL: string): Promise<ArrayBuffer> {
//     if (!imageURL) {
//         throw new Error("Image URL is required");
//     }
//     const formData = new FormData();
//     formData.append("size", "auto");
//     formData.append("image_url", imageURL);

//     const response = await fetch("https://api.remove.bg/v1.0/removebg", {
//         method: "POST",
//         headers: { "X-Api-Key": "INSERT_YOUR_API_KEY_HERE" },
//         body: formData,
//     });

//     if (response.ok) {
//         return await response.arrayBuffer();
//     } else {
//         throw new Error(`${response.status}: ${response.statusText}`);
//     }
// }

// const rbgResultData = await removeBg("https://www.remove.bg/example.jpg");

export async function getMyProducts(limit?: number): Promise<RecordModel[]> {
    if (!pocketbase.authStore.isValid) {
        notify("Error", "You must be logged in to view your products.", "error");
        return [];
    }
    const userId = pocketbase.authStore.record?.id;
    if (!userId) {
        notify("Error", "User ID not found.", "error");
        return [];
    }
    const options: any = {
        filter: `vendor_id="${userId}"`,
        requestKey: Date.now().toString()
    };
    if (limit !== undefined) {
        options.limit = limit;
    }
    const results = await pocketbase.collection("products").getFullList(options);
    console.log(results)
    return results.map((p) => ({
        ...p,
        imageUrl: pocketbase.files.getURL(p, p.product_image)
    }));
}

export async function uploadProduct(product: {
    title: string;
    description: string;
    price: number;
    category: string;
    product_image: File;
    discount_percentage?: number;
    quantity: number;
}) {
    if (!pocketbase.authStore.isValid) {
        notify('Error', 'You must be logged in to upload a product.', 'error');
        return null;
    }
    const vendorId = pocketbase.authStore?.record?.id;
    if (!vendorId) {
        notify('Error', 'Could not find vendor ID.', 'error');
        return null;
    }
    try {
        let formData = $state(new FormData());
        formData.append("title", product.title);
        formData.append("description", product.description);
        formData.append("price", product.price.toString());
        formData.append("category", product.category.toLowerCase());
        formData.append("product_image", product.product_image);
        if (product.discount_percentage !== undefined) {
            formData.append("discount_percentage", product.discount_percentage.toString());
        }
        if (product.quantity !== undefined) {
            formData.append("quantity", product.quantity.toString());
        }

        formData.append("vendor_id", vendorId);
        console.log(product)
        const created = await pocketbase.collection("products").create(formData, {
            requestKey: Date.now().toString()
        });
        notify("Success", "Product uploaded successfully!", "success");
        return created;
    } catch (error) {
        console.error("Error uploading product:", error);
        notify("Error", "Failed to upload product.", "error");
        throw error;
    }
}

export async function updateProductById(id: string, data: {
    title?: string;
    description?: string;
    price?: number;
    category?: string;
    product_image?: File;
    discount_percentage?: number;
    quantity?: number;
    threshold?: number;
}) {
    if (!pocketbase.authStore.isValid) {
        notify("Error", "You must be logged in to update a product.", "error");
        return null;
    }
    try {
        let formData = $state(new FormData());
        if (data.title !== undefined) formData.append("title", data.title);
        if (data.description !== undefined) formData.append("description", data.description);
        if (data.price !== undefined) formData.append("price", data.price.toString());
        if (data.category !== undefined) formData.append("category", data.category.toLowerCase());
        if (data.product_image !== undefined) formData.append("product_image", data.product_image);
        if (data.discount_percentage !== undefined) formData.append("discount_percentage", data.discount_percentage.toString());
        if (data.quantity !== undefined) formData.append("quantity", data.quantity.toString());
        if (data.threshold !== undefined) formData.append("threshold", data.threshold.toString());

        const updated = await pocketbase.collection("products").update(id, formData, {
            requestKey: Date.now().toString()
        });
        notify("Success", "Product updated successfully!", "success");
        return updated;
    } catch (error) {
        console.error("Error updating product:", error);
        notify("Error", "Failed to update product.", "error");
        throw error;
    }
}

export async function deleteProduct(productId: string) {
    if (!pocketbase.authStore.isValid) {
        notify("Error", "You must be logged in to delete a product.", "error");
        return null;
    }
    try {
        await pocketbase.collection("products").delete(productId, {
            requestKey: Date.now().toString()
        });
        notify("Success", "Product deleted successfully!", "success");
        return true;
    } catch (error) {
        console.error("Error deleting product:", error);
        notify("Error", "Failed to delete product.", "error");
        return false;
    }
}


export async function fuzzySearchProducts(searchTerm: string, limit: number = 50): Promise<RecordModel[]> {
    // Use PocketBase's ~ operator for partial/fuzzy matching on title and description, case-insensitive
    const sanitizedTerm = searchTerm.trim();
    if (!sanitizedTerm) return [];
    const filter = `title~"${sanitizedTerm}" || description~"${sanitizedTerm}"`;
    const results = await pocketbase.collection("products").getFullList({
        filter,
        requestKey: `fuzzy-${sanitizedTerm}-${Date.now()}`,
        limit
    });
    return results.map((p) => ({
        ...p,
        imageUrl: pocketbase.files.getURL(p, p.product_image)
    }));
}