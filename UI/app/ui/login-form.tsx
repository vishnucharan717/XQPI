'use client';
 
import { lusitana } from '@/app/ui/fonts';
import {
  KeyIcon,
  ExclamationCircleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useFormState, useFormStatus } from 'react-dom';
import { getSession, signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
 
export default function LoginForm() {
  // const [errorMessage, dispatch] = useFormState(signIn, undefined);
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(false)

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    console.log("in handle submit")
    console.log("username", username)
    const result = await signIn('credentials', {
      username,
      password,
      redirect:false,
      callbackUrl:'/dashboard' 
    });
    console.log("result", result)
    if (result?.error) {
      console.log('Login failed!');
      setErrorMessage(true)
    } else {
      console.log("result", result)
      // Redirect or perform additional actions on successful login
      console.log('Login successful!');
      if (result?.url) {
        router.push(result?.url);
        router.refresh();
      } else {
        console.error('No redirect URL provided');
      }
      
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-100 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Please log in to continue.
        </h1>
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
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
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
                autoComplete="section-blue current password"
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>
        <LoginButton />
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">Please correct username or password</p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}

// LoginForm.getIntialProps = async(context: { req: any; res: any; }) => {
//   const {req, res} = context;
//   const session = await getSession({req});

//   if (session && res) {
//     res.writeHead(302, {
//       Location: "/",
//     });
//     res.end()
//     return;
//   }
//   return {
//     session: undefined,
//     //providers: await providers(),
//   }
// }
 
function LoginButton() {
  const { pending } = useFormStatus();
 
  return (
    <Button className="mt-4 w-full" aria-disabled={pending}>
      Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
    </Button>
  );
}