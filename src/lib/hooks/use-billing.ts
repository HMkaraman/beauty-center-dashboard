import { useQuery, useMutation } from "@tanstack/react-query";
import { billingApi } from "../api/billing";

export function useSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: billingApi.getSubscription,
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: (plan: string) => billingApi.createCheckout(plan),
  });
}

export function useCreatePortalSession() {
  return useMutation({
    mutationFn: () => billingApi.createPortalSession(),
  });
}
