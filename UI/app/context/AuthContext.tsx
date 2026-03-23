"use client";

import { SessionProvider } from "next-auth/react";
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

export interface AuthContextProps {
  children: React.ReactNode;
}

export default function AuthContext({ children }: {
  children: React.ReactNode
}) {

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}