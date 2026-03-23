'use client'

import { useSession } from 'next-auth/react';
import { userProductsDescription } from '../../constants';
import { useEffect, useState } from "react";
import { Button } from '@/app/ui/button';
import { getUserProductsSelection } from '@/app/lib/actions'
import { updateUserProductsSelection } from '@/app/lib/actions'
import { toast, Zoom, ToastContainer } from 'react-toastify';
import { Switch } from "@material-tailwind/react";


const TABLE_HEAD = ["Product Name", "Description", "Select"];

export default function UserProducts() {
    const { data: session } = useSession();
    const [userProducts, setUserProducts] = useState({});

    const notify_success = () => {
        toast.success("Product preference updated successfully !", {
            position: "top-right"
        });
    };

    const notify_error = () => {
        toast.error("Error occured while updating product preference !", {
            position: "top-right"
        });
    };

    useEffect(() => {
        const fetchProductsSelection = async () => {
            try {
                const response = await getUserProductsSelection();
                console.log("userProducts fetched", response)
                setUserProducts(response);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchProductsSelection();
    }, [])

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        console.log("userProducts", userProducts)
        const res = await updateUserProductsSelection(userProducts);
        if (res.status == 200 && res?.data?.message == "User products updated successfully") {
            notify_success();
        } else {
            console.log("res", res)
            notify_error();
        }
    }

    return (
        <div className="overflow-x-auto overflow-y-auto">
            <ToastContainer autoClose={1000} transition={Zoom} hideProgressBar={true} />
            <form onSubmit={handleSubmit}>
                <table className="h-content w-full min-w-max table-auto text-left">
                    <thead className="overflow-auto">
                        <tr>
                            {TABLE_HEAD.map((head) => (
                                <th
                                    key={head}
                                    className="border-b border-blue-gray-100 bg-[#bdbdbda8] p-3"
                                >
                                    {head}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="">
                        {Object.keys(userProducts).map((key, index) => {
                            const isLast = index === Object.keys(userProducts).length - 1;
                            const classes = isLast ? "p-2" : "p-2 border-b border-blue-gray-50";
                            return (
                                <tr key={index}>
                                    <td className={classes}>
                                        {key}
                                    </td>
                                    <td>
                                        {userProductsDescription[key]}
                                    </td>
                                    <td className={classes}>
                                        <Switch
                                            className="h-full w-fullchecked:bg-[#1e4d2b]"
                                            id={key} checked={userProducts[key]}
                                            containerProps={{
                                                className: "w-11 h-6"
                                            }}
                                            style={{width:42}}
                                            circleProps={{
                                                className: "before:hidden left-0.5 border-none",
                                            }}
                                            onChange={(e) => setUserProducts(prev => ({ ...prev, [key]: e.target.checked }))}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <UpdateProductsButton />
            </form>
        </div>
    )
}

function UpdateProductsButton() {
    return (
        <Button className="mt-6 w-full text-center justify-center">
            Update Products Selection
        </Button>
    );
}