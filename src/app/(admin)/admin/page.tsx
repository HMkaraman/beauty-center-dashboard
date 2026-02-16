"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import {
  Building2,
  CreditCard,
  DollarSign,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>
        <div
          className={`flex size-12 items-center justify-center rounded-lg ${color}`}
        >
          <Icon className="size-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: adminApi.getStats,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2 text-zinc-400">
        <AlertCircle className="size-8" />
        <p>Failed to load admin statistics</p>
      </div>
    );
  }

  const stats = data ?? {
    totalTenants: 0,
    activeSubscriptions: 0,
    mrr: 0,
    totalUsers: 0,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">
          SaaS platform overview and metrics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Tenants"
          value={stats.totalTenants}
          icon={Building2}
          color="bg-blue-600"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={CreditCard}
          color="bg-emerald-600"
        />
        <StatCard
          title="Monthly Recurring Revenue"
          value={`${stats.mrr.toLocaleString()} SAR`}
          icon={DollarSign}
          color="bg-amber-600"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-purple-600"
        />
      </div>
    </div>
  );
}
