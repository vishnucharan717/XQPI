'use client';

import LoginForm from '@/app/ui/login-form';
import { lusitana } from '@/app/ui/fonts';

 
export default function LoginPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 mt-10 lg:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-theme_green p-3">
          <div className="text-white w-full place-self-center self-center">
            <p className={`${lusitana.className} text-center text-2xl md:text-3xl text-theme_white self-center`}>AQPI-CIRA</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}