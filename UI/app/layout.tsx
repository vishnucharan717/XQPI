'use client';

import AuthContext from "../app/context/AuthContext";

import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import Header from "./header/page";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased overflow-hidden`}>
        <AuthContext>
          <Header />
          <div className="w-full overflow:hidden">
            {children}
          </div>
        </AuthContext>
      </body>
    </html>
  );
}