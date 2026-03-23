'use client';

import {
  UserGroupIcon,
  UserPlusIcon,
  MapIcon,
  ClipboardDocumentCheckIcon,
  ArrowDownTrayIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useSession} from 'next-auth/react';
import { redirect } from 'next/navigation'



const links = [
  { name: 'Users', href: '/dashboard/users', icon: UserGroupIcon, role:'admin' },
  { name: 'Add User', href: '/dashboard/create-user', icon: UserPlusIcon, role:'admin' },
  { name: 'Map Selection', href: '/dashboard/user-area', icon: MapIcon, role:'agency' },
  { name: 'Select Products', href: '/dashboard/user-products', icon: ClipboardDocumentCheckIcon, role:'agency' },
  { name: 'Download Products', href: '/dashboard/download', icon: DocumentArrowDownIcon, role:'agency' },
];

export default function NavLinks() {
  const pathname = usePathname();

  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/api/auth/signin?callback=/client')
    }
  })
  if (!session?.user) {
    redirect('/api/auth/signin?callback=/client')
    return null;
  }
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        if (session?.user.role === link.role) {
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                'flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium hover:bg-[#1e4d2b4a] md:flex-none md:justify-start md:p-2 md:px-3',
                {
                  'bg-[#1e4d2b4a] text-theme_green': pathname === link.href,
                },
              )}
            >
              <LinkIcon className="w-6 text-theme_green" />
              <p className="hidden md:block">{link.name}</p>
            </Link>
          );
        }
      })}
    </>
  );
}


