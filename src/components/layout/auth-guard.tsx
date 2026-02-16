"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const hasAuth = document.cookie.split("; ").some((c) => c.startsWith("auth="));
    if (!hasAuth) {
      router.replace("/login");
    }
  }, [router]);

  return <>{children}</>;
}
