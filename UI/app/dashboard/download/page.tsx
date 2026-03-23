'use client'

import { Card, CardBody, Typography } from "@material-tailwind/react";
import { ArrowDownCircleIcon } from '@heroicons/react/20/solid';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getUserProducts } from '@/app/lib/actions';
import { downloadFile, getUserProductsZip, downloadZipFile } from "@/app/lib/actions";
import { redirect } from 'next/navigation'
import { Button } from "@material-tailwind/react";
import Link from 'next/link';

const TABLE_HEAD = ["File Name", "Download"];

export default function Download() {
    const { data: session } = useSession();
    const [products, setProducts] = useState([]);
    const [zipURL, setZipzipURL] = useState('');

    if (!session || !session?.user) {
        redirect('/api/auth/signin?callback=/client')
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getUserProducts();
                console.log("response data", response);
                setProducts(response.files);
                const zip_res = await getUserProductsZip();
                setZipzipURL(zip_res.download_url)

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    async function downloadUserFile(url: string, isZip: boolean) {
        let username = session?.user.username;
        let file = url.split('/')[5];
        let token = url.split('=')[1];
        if (isZip) {
            var response = await downloadZipFile(username, file, token);
        } else {
            var response = await downloadFile(username, file, token);
        }
        console.log("response", response);
        const download_url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = download_url;
        link.setAttribute('download', file); // Specify the filename
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    }

    return (
        <div className="overflow-x-auto overflow-y-auto">
            <Button onClick={() => downloadUserFile(zipURL, true)} className='float-right mb-2 bg-theme_green'>Download All</Button>
            <table className="h-content w-full min-w-max table-auto text-left">
                <thead className="overflow-auto">
                    <tr>
                        {TABLE_HEAD.map((head) => (
                            <th
                                key={head}
                                className="border-b border-blue-gray-100 bg-[#bdbdbda8] p-4"
                            >
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal leading-none font-bold"
                                >
                                    {head}
                                </Typography>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="">
                    {products.map(({ filename, url }, index) => {
                        const isLast = index === products.length - 1;
                        const classes = isLast ? "p-2" : "p-2 border-b border-blue-gray-50";

                        return (
                            <tr key={filename}>
                                <td className={classes}>
                                    {filename}
                                </td>
                                <td className={classes}>
                                    <ArrowDownCircleIcon onClick={() => downloadUserFile(url, false)} className="h-8 w-8 text-theme_green" />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    )
}