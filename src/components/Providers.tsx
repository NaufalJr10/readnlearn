"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { ToastProvider } from "./ui/ToastProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}
