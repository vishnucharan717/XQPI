'use client'

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';


export default function Page() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/api/auth/signin?callback=/client');
    }
  })

  const router = useRouter();

  if (!session || !session?.user) {
    // return null;
    router.push('/api/auth/signin?callback=/client');
  }

  useEffect(() => {
    if (session?.user.role == "admin") {
      // Redirect to the desired sub-route within the dashboard module
      router.push('/dashboard/users');
    } else {
      router.push('/dashboard/user-area');
    }

  }, [status]); // Empty dependency array ensures this effect runs only once on component mount

  return (
    <main>
      {/* <Userslist /> */}

    </main>
  );
}