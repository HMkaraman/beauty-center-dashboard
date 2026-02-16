import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AuthGuard } from "@/components/layout/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="md:ms-[72px] xl:ms-[260px] transition-all duration-200">
          <Header />
          <main className="p-4 pb-20 md:p-6 md:pb-6">{children}</main>
        </div>
        <MobileNav />
      </div>
    </AuthGuard>
  );
}
