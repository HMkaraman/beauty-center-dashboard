"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { registerServiceWorker } from "@/lib/register-sw";
import { SettingsHydrator } from "@/components/settings-hydrator";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <SettingsHydrator>
          {children}
        </SettingsHydrator>
      </QueryClientProvider>
    </SessionProvider>
  );
}
