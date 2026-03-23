'use client'

import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import { useRouter } from 'next/navigation';
import { PowerIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation'
import LogoutButton from '@/app/ui/logoutButton'

export default function SideNav() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login')
    }
  })

  if (!session?.user) {
    router.push('/login')
    return null;
  }

  const handleLogout = async (event: any) => {
    event.preventDefault();
    await LogoutButton();
  };

  return (
    <div className="flex flex-col px-3 py-2 md:px-2">
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        <form onSubmit={handleLogout}>
          <button className="hidden bg-theme_green text-white md:flex h-[48px] absolute bottom-0 w-full md:w-60 grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium md:flex-none md:justify-start md:p-2 md:px-3">
            <PowerIcon className="w-6 text-white" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}
