import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi, type SendNotificationData } from "@/lib/api/notifications";

export function useNotifications(params?: {
  page?: number;
  limit?: number;
  type?: string;
  channel?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => notificationsApi.list(params),
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendNotificationData) => notificationsApi.send(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
