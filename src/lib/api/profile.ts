import { apiFetch } from "./client";

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
}

export const profileApi = {
  get: () => apiFetch<ProfileData>("/profile"),
  update: (data: { name: string; email?: string; image?: string | null }) =>
    apiFetch<ProfileData>("/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
