'use client'

import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogPanel,
    PopoverGroup,
} from '@headlessui/react'
import {
    Bars3Icon,
    XMarkIcon,
} from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/app/ui/logoutButton'
import Link from 'next/link';
import Clock from 'react-live-clock';
import { Chip } from "@material-tailwind/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'


function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function Header() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
    }, [session, status]);

    const handleLogout = async (event: any) => {
        event.preventDefault();
        await LogoutButton();
    };

    return (
        <header className="sticky top-0 z-10 h-max max-w-full bg-theme_green">
            <nav className="mx-auto ml-0 flex max-w-full items-center justify-between p-3 lg:px-8" aria-label="Global">
                <div className="flex lg:flex-1 md:flex-1 md:mr-4">
                    <a href="#" className="-m-1.5 p-1.5">
                        <span className="sr-only">Your Company</span>
                        <img className="h-12 w-auto" src="/CSU-Signature-Stacked-rev.png" alt="" />
                        {/* <img className="lg:hidden md:hidden h-12 w-auto" src="/CSU-Symbol.png" alt="" /> */}
                    </a>
                </div>
                <div className="flex lg:hidden md:hidden">
                    <button
                        type="button"
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <span className="sr-only">Open main menu</span>
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>
                <PopoverGroup className="hidden lg:flex md:flex md:gap-x-10 lg:gap-x-12">
                    <Link href="/" className="text-md font-semibold leading-6 text-white">
                        Home
                    </Link>
                    {(session && session?.user &&
                        <Link href="/dashboard" className="text-md font-semibold leading-6 text-white">
                            Dashboard
                        </Link>)}
                </PopoverGroup>
                <div className="hidden lg:flex lg:flex-1 lg:justify-end md:flex md:flex-1 md:justify-end float-right">
                    <Chip icon={<FontAwesomeIcon icon={faClock} size="lg" color="white" />}
                        className='bg-theme_green mr-2 border-white shadow-white shadow-sm text-white' size='sm' variant="outlined"
                        value={<><Clock format={'HH:mm:ss'} noSsr={true} ticking={true} className='text-white text-base' timezone={'UTC'} />
                            <span className='text-white text-base ml-1'>UTC</span></>} />
                    {(!session || !session?.user) && (
                        <Link href="/login" className="text-sm font-semibold leading-6 text-white">
                            <Chip className='bg-theme_green text-white border-white' size='lg' variant="outlined" value="Log in" />
                            {/* Log in <span aria-hidden="true">&rarr;</span> */}
                        </Link>)}
                </div>
            </nav>
            <Dialog className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
                <div className="fixed inset-0 z-10" />
                <DialogPanel className="fixed inset-y-0 right-0 z-10 w-screen overflow-y-none bg-white px-6 pr-0 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                    <div className="flex items-center justify-between -ml-6 -mt-6 w-auto h-[4.5rem] bg-theme_green">
                        <Link href="#" className="-m-1.5 ml-4 p-1.5">
                            <span className="sr-only">Your Company</span>
                            <img
                                className="h-12 w-auto"
                                src="/CSU-Symbol.png"
                                alt=""
                            />
                        </Link>
                        <button
                            type="button"
                            className="sm:-m-2.5 rounded-md p-2.5 text-gray-700 text-white"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {/* <span className="">Close menu</span> */}
                            <XMarkIcon className="h-10 w-10 text-white" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="mt-6 flow-root">
                        <div className="-my-6 divide-y divide-gray-500/10">
                            <div className="space-y-2 py-6">
                                <Link href="/" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                                    Home
                                </Link>
                                {(session && session?.user &&
                                    <Link
                                        href="/dashboard"
                                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                    >
                                        Dashboard
                                    </Link>)}
                            </div>
                            <div className="py-6">
                                {(!session || !session?.user) && (
                                    <Link
                                        href="/login"
                                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                    >
                                        Log in
                                    </Link>)}
                                {(session && session?.user) && (
                                    <form onSubmit={handleLogout}>
                                        <button
                                            className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                        >
                                            Logout
                                        </button>
                                    </form>)}
                            </div>
                        </div>
                    </div>
                </DialogPanel>
            </Dialog>
        </header>
    )
}