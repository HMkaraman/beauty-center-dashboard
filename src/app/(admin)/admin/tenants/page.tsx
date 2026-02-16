"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi, type AdminTenant } from "@/lib/api/admin";
import { Input } from "@/components/ui/input";
import {
  Search,
  Loader2,
  AlertCircle,
  Building2,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    trialing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    past_due: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    canceled: "bg-red-500/10 text-red-400 border-red-500/20",
    unpaid: "bg-red-500/10 text-red-400 border-red-500/20",
    incomplete: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[status] || colors.incomplete}`}
    >
      {status}
    </span>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    trial: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    starter: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    professional: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    enterprise: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${colors[plan] || colors.trial}`}
    >
      {plan}
    </span>
  );
}

export default function AdminTenantsPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "tenants", search],
    queryFn: () => adminApi.getTenants({ search }),
  });

  const tenants = data?.data ?? [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Tenants</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage all registered beauty center tenants
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search tenants by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-zinc-800 bg-zinc-900/50 ps-9 text-white placeholder:text-zinc-500"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-zinc-500" />
        </div>
      ) : error ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 text-zinc-400">
          <AlertCircle className="size-8" />
          <p>Failed to load tenants</p>
        </div>
      ) : tenants.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 text-zinc-400">
          <Building2 className="size-8" />
          <p>No tenants found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Name
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Slug
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Plan
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Status
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Staff
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {tenants.map((tenant: AdminTenant) => (
                <tr
                  key={tenant.id}
                  className="transition-colors hover:bg-zinc-900/30"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{tenant.name}</div>
                    {tenant.email && (
                      <div className="text-xs text-zinc-500">
                        {tenant.email}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-zinc-800/50 px-1.5 py-0.5 text-xs text-zinc-300">
                      {tenant.slug}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <PlanBadge plan={tenant.plan} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={tenant.subscriptionStatus} />
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-300">
                    {tenant.staffCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {new Date(tenant.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
