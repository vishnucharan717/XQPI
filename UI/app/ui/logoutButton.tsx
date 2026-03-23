'use client'

import { signOut } from 'next-auth/react';
import { redirect } from 'next/navigation'
import { userLogout } from "@/app/lib/actions";

const LogoutButton = async () => {
    const response = await userLogout();
    await signOut({ callbackUrl: '/login' }); // Customize redirect and callback URL as needed

};

export default LogoutButton;