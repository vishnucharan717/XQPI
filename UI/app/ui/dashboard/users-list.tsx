'use client'


import { useEffect, useState } from 'react';
import { getUers } from "@/app/lib/actions";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import Link from 'next/link';
import { redirect } from 'next/navigation'
import { useRouter } from 'next/navigation';

const TABLE_HEAD = ["Username", "Email", "County", "Agency", "Role"];

export default function Userslist() {
    const [users, setData] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getUers();
                console.log("response data", response);
                setData(response);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        fetchData();
    }, []);

    function getUserDetails(userId: any) {
        router.push(`/dashboard/user-details?id=${userId}`);
    }

    return (
        <table className="h-content w-full min-w-max table-auto text-left">
            <thead>
                <tr>
                    {TABLE_HEAD.map((head) => (
                        <th
                            key={head}
                            className="border-b border-blue-gray-100 bg-[#bdbdbda8] p-4"
                        >
                            <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal leading-none opacity-100 text-black font-bold"
                            >
                                {head}
                            </Typography>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="">
                {users.map(({ id, username, email, county, agency, role }, index) => {
                    const isLast = index === users.length - 1;
                    const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                    return (
                        <tr key={username} onClick={() =>getUserDetails(id)}>
                            <td className={classes}>
                                {username}
                            </td>
                            <td className={classes}>
                                {email}
                            </td>
                            <td className={classes}>
                                {county}
                            </td>
                            <td className={classes}>
                                {agency}
                            </td>
                            <td className={classes}>
                                {role}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>

    )
}