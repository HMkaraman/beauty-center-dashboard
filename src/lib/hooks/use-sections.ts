import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sectionsApi } from "@/lib/api/sections";

export function useSections(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ["sections", params],
    queryFn: () => sectionsApi.list(params),
  });
}

export function useSection(id: string) {
  return useQuery({
    queryKey: ["sections", id],
    queryFn: () => sectionsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sectionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof sectionsApi.update>[1] }) =>
      sectionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sectionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });
}

export function useSetSectionEmployees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, employeeIds }: { id: string; employeeIds: string[] }) =>
      sectionsApi.setEmployees(id, employeeIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });
}

export function useSetSectionDoctors() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, doctorIds }: { id: string; doctorIds: string[] }) =>
      sectionsApi.setDoctors(id, doctorIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });
}
