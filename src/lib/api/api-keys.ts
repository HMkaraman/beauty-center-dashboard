import { apiFetch } from "./client";

export interface ApiKeyInfo {
  id: string;
  name: string;
  prefix: string;
  maskedKey: string;
  lastUsedAt: string | null;
  requestCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface ApiKeyCreated {
  id: string;
  name: string;
  prefix: string;
  key: string; // Full key, only returned on creation
  lastUsedAt: string | null;
  requestCount: number;
  isActive: boolean;
  createdAt: string;
}

export const apiKeysApi = {
  list: () => apiFetch<{ data: ApiKeyInfo[] }>("/settings/api-keys"),
  create: (name: string) =>
    apiFetch<ApiKeyCreated>("/settings/api-keys", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  revoke: (id: string) =>
    apiFetch<{ success: boolean }>(`/settings/api-keys/${id}`, {
      method: "DELETE",
    }),
};
