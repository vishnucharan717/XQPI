'use client';

import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import styles from '@/app/ui/home.module.css';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
// import 'maplibre-gl/dist/maplibre-gl.css';
// import 'mapbox-gl/dist/mapbox-gl.css';

export default function Page() {
    const router = useRouter();
  
    useEffect(() => {
      router.push('/public');
    },[])
  
  return (
    <main className="flex min-h-screen flex-col p-6">
      {/* flex min-h-screen flex-col p-6 */}
      {/* <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
        <div className="h-0 w-0 border-b-[30px] border-l-[20px] border-r-[20px] border-b-black border-l-transparent border-r-transparent"
        />
        </div>
      </div> */}
    </main>
  );
}