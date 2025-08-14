// src/routes/login/+page.server.ts
import { pocketbase } from '$lib/controls.svelte';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    return {};
};

export const actions: Actions = {
    login: async ({ request, cookies }) => {

        // Admin auth (replace with your admin email/password)
        
        const formData = await request.formData();
        const email = formData.get('email')?.toString().trim();
        const password = formData.get('password')?.toString();
        await pocketbase.collection('users').authWithPassword(email as string, password as string);

        if (!email || !password) {
            return { success: false, message: 'Email and password are required' };
        }

        try {
            // Check user record first
            const user = await pocketbase.collection('users').getFirstListItem(`email='${email}'`);

            if (!user.verified) {
                // Send verification email
                await pocketbase.collection('users').requestVerification(email);
                return { success: false, message: 'Please verify your email before logging in' };
            }

            // Auth as normal user

            return { success: true, message: 'Login successful', user: pocketbase.authStore.record };
        } catch (err: any) {
            console.error('Login error:', err);
            return { success: false, message: 'Invalid credentials or user not found' };
        }
    }
};
