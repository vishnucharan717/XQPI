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
import {
    ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/app/lib/actions';
import { updateUser } from '@/app/lib/actions';
import { Button } from "@material-tailwind/react";
import { useSearchParams } from 'next/navigation';
import { toast, Zoom, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";


export default function UserDetail() {
    const [edit, setEdit] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(true)
    const [user, setUser] = useState({
        username: '',
        password: '',
        password2: '',
        email: '',
        county: '',
        agency: '',
        role: ''
    });
    const router = useRouter();
    const searchParams = useSearchParams()
    const userId = searchParams.get('id')
    const notify = () => {
        toast.success("User details updated successfully !", {
            position: "top-right"
        });
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                console.log("query", router)
                const response = await getUser(userId);
                console.log("user response data", response);
                setUser(response);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchUser();
    }, []);

    const handleChange = (e: any) => {
        if (e.target.name == 'password2') {
            if (user.password !== e.target.value) {
                setPasswordMatch(false);
                return;
            } else {
                setPasswordMatch(true);
            }
            return;
        }
        setUser({
            ...user,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        console.log("In handle submit")
        try {
            const response = await updateUser(user, userId)// Example endpoint to update user data
            console.log('User updated successfully:', response.data);
            if (response.status == 200) {
                notify();
                setEdit(false);
            }
        } catch (error) {
            console.error('Error updating user:', error);
            // Handle error, show error message, etc.
        }
    };

    const handleEdit = (e: any) => {
        setEdit(!edit);
    }

    return (
        <div className="w-full overflow-none overflow-y-scroll flex items-center justify-center">
            {/* <Card color="transparent" shadow={false} classname> */}
            <form onSubmit={handleSubmit} className="w-full flex space-y-3">
                <div className="flex-1 rounded-lg bg-gray-100 px-6 pb-4 pt-2 self-center">
                <ToastContainer autoClose={1000} transition={Zoom} hideProgressBar={true} />
                    <Button onClick={handleEdit} className='float-right mb-2 bg-theme_green'>{!edit ? 'Edit' : 'View'}</Button>
                    <div className='lg:w-4/6 place-self-center place-items-center'>
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
                                {!edit && (<span className='text-bold pl-5'>{user.username}</span>)}
                                {edit && (
                                    <div className="relative">
                                        <input
                                            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                                            id="username"
                                            type="text"
                                            name="username"
                                            value={user.username}
                                            placeholder="Enter Username"
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                            {edit && (
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
                                            onChange={handleChange}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                            )}
                            {edit && (
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
                                            onChange={handleChange}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <div
                                        className="flex h-8 items-end space-x-1"
                                        aria-live="polite"
                                        aria-atomic="true"
                                    >
                                        {!passwordMatch && (
                                            <>
                                                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                                                <p className="text-sm text-red-500">Password does not match</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div>
                                <label
                                    className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                                    htmlFor="email"
                                >
                                    Email
                                </label>
                                {!edit && (<span className='text-bold pl-5'>{user.email}</span>)}
                                {edit && (
                                    <div className="relative">
                                        <input
                                            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={user.email}
                                            placeholder="Enter Email"
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="mt-4">
                                <label
                                    className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                                    htmlFor="county"
                                >
                                    County
                                </label>
                                {!edit && (<span className='text-bold pl-5'>{user.county}</span>)}
                                {edit && (
                                    <div className="relative">
                                        <input
                                            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                                            id="county"
                                            type="text"
                                            name="county"
                                            value={user.county}
                                            placeholder="Enter County"
                                            onChange={handleChange}
                                        // required
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="mt-4">
                                <label
                                    className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                                    htmlFor="agency"
                                >
                                    Agency
                                </label>
                                {!edit && (<span className='text-bold pl-5'>{user.agency}</span>)}
                                {edit && (
                                    <div className="relative">
                                        <input
                                            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                                            id="agency"
                                            type="text"
                                            name="agency"
                                            value={user.agency}
                                            placeholder="Enter Agency"
                                            onChange={handleChange}
                                        // required
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="mt-4">
                                <label
                                    className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                                    htmlFor="role"
                                >
                                    Role
                                </label>
                                {!edit && (<span className='text-bold pl-5'>{user.role}</span>)}
                                {edit && (
                                    <div className="relative">
                                        <div className="w-72 ">
                                            <Select id="role" name="role" value={user.role} label="Select Role" onChange={(value) => setUser({ ...user, role: value })}>
                                                <Option value='admin'>Admin</Option>
                                                <Option value='agency'>Agency User</Option>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {edit && (
                            <Button onClick={handleSubmit} className="mt-4 w-full bg-theme_btn">
                                Update User
                            </Button>
                        )}
                    </div>
                </div>
            </form>
            {/* </Card> */}
        </div>
    )
}

function RegisterButton() {
    return (
        <Button className="mt-4 w-full">
            Create User <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
    );
}