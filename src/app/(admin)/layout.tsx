import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tenants", label: "Tenants", icon: Building2 },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "owner") redirect("/");

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 start-0 z-30 flex w-64 flex-col border-e border-zinc-800 bg-zinc-950">
        {/* Logo area */}
        <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-6">
          <ShieldCheck className="size-6 text-emerald-500" />
          <span className="text-lg font-semibold text-white">
            Admin Panel
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-white"
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-zinc-800 p-4">
          <div className="mb-3 truncate text-sm text-zinc-500">
            {session.user.email}
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-white"
          >
            <LogOut className="size-4" />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="ms-64 flex-1 p-8">{children}</main>
    </div>
  );
}
