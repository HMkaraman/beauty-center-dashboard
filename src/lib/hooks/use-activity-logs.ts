import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { activityLogsApi } from "@/lib/api/activity-logs";
import type { ActivityEntityType } from "@/types";

export function useActivityLogs(
  entityType: ActivityEntityType,
  entityId: string,
  params?: { page?: number; limit?: number }
) {
  return useQuery({
    queryKey: ["activity-logs", entityType, entityId, params],
    queryFn: () =>
      activityLogsApi.list({ entityType, entityId, ...params }),
    enabled: !!entityType && !!entityId,
  });
}

export function useCreateActivityNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activityLogsApi.createNote,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["activity-logs", variables.entityType, variables.entityId],
      });
    },
  });
}
