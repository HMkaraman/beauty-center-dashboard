import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inAppNotificationsApi } from "@/lib/api/in-app-notifications";

export function useInAppNotifications(params?: { category?: string; page?: number; limit?: number; unreadOnly?: boolean }) {
  return useQuery({
    queryKey: ["in-app-notifications", params],
    queryFn: () => inAppNotificationsApi.list(params),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["in-app-notifications-unread-count"],
    queryFn: () => inAppNotificationsApi.unreadCount(),
    refetchInterval: 30_000,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inAppNotificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["in-app-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["in-app-notifications-unread-count"] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category?: string) => inAppNotificationsApi.markAllRead(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["in-app-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["in-app-notifications-unread-count"] });
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: () => inAppNotificationsApi.getPreferences(),
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { category: string; inAppEnabled: boolean }) =>
      inAppNotificationsApi.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
  });
}
