'use client'

import Link from "next/link"

export default function ErrorPage () {
    return (
        <section className="flex flex-col gap-12 item-center"> 
            <h1 className="text-5xl">Unauthenticated Access</h1>
            <p className="text-3xl max-w-2xl text-center">Please login to continue</p>
            <Link href="/login" className="text-3xl underline">Return to Login Page</Link>
        </section>
    )
}