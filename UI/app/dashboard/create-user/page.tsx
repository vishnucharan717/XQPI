'use client'

import { lusitana } from '@/app/ui/fonts';
import {
    Card,
    Select,
    Option,
    Input,
    Checkbox,
    Typography,
} from "@material-tailwind/react";
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/app/lib/actions';

export default function CreateUser() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [email, setEmail] = useState('');
    const [county, setCounty] = useState('');
    const [agency, setAgency] = useState('');
    const [role, setRole] = useState(false)
    const router = useRouter();

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        console.log("in handle submit")
        try {
            const result: any = await registerUser({
                username,
                email,
                password,
                password2,
                county,
                agency,
                role
            });
            console.log("result", result)
            if (result?.message === "User registered successfully") {
                router.push('/dashboard/users')
            }
        } catch (error) {
            console.log("Error occured", error)
        }
    };

    return (
        <div className="w-full overflow-none overflow-y-scroll flex items-center justify-center">
            {/* <Card color="transparent" shadow={false} classname> */}
            <form onSubmit={handleSubmit} className="w-full flex space-y-3">
                <div className="flex-1 rounded-lg bg-gray-100 px-6 pb-4 pt-2 self-center">
                    <div className='lg:w-4/6 place-self-center place-items-center'>
                        {/* <h1 className={`${lusitana.className} mb-3 text-2xl text-center`}>
                            User Details
                        </h1> */}
                        <div className="flex h-15 w-full items-end rounded-lg bg-theme_btn p-3">
                            <div className="text-white w-full place-self-center self-center">
                                <p className={`${lusitana.className} text-center text-1xl md:text-2xl text-theme_white self-center`}>User Details</p>
                            </div>
                        </div>
                        <div className="w-full">
                            <div>
                                <label
                                    className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                                    htmlFor="username"
                                >
                                    Username
                                </label>
                                <div className="relative">
                                    <input
                                        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                                        id="username"
                                        type="text"
                                        name="username"
                                        placeholder="Enter Username"
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label
                                    className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                                    htmlFor="password"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                                        id="password"
                                        type="password"
                                        name="password"
                                        placeholder="Enter Password"
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label
                                    className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                                    htmlFor="password2"
                                >
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                                        id="password2"
                                        type="password"
                                        name="password2"
                                        placeholder="Confirm Password"
                                        onChange={(e) => setPassword2(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                            <div>
                                <label
                                    className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                                    htmlFor="email"
                                >
                                    Email
                                </label>
                                <div className="relative">
                                    <input
                                        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="Enter Email"
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label
                                    className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                                    htmlFor="county"
                                >
                                    County
                                </label>
                                <div className="relative">
                                    <input
                                        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                                        id="county"
                                        type="text"
                                        name="county"
                                        placeholder="Enter County"
                                        onChange={(e) => setCounty(e.target.value)}
                                    // required
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label
                                    className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                                    htmlFor="agency"
                                >
                                    Agency
                                </label>
                                <div className="relative">
                                    <input
                                        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                                        id="agency"
                                        type="text"
                                        name="agency"
                                        placeholder="Enter Agency"
                                        onChange={(e) => setAgency(e.target.value)}
                                    // required
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label
                                    className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                                    htmlFor="role"
                                >
                                    Role
                                </label>
                                <div className="relative">
                                    <div className="w-72 ">
                                        <Select id="role" name="role" label="Select Role" onChange={(value) => setRole(value)}>
                                            <Option value='admin'>Admin</Option>
                                            <Option value='agency'>Agency User</Option>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <RegisterButton />
                    </div>
                </div>
            </form>
            {/* </Card> */}
        </div>
    );
}

function RegisterButton() {
    return (
        <Button className="mt-4 w-full">
            Create User <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
    );
}