import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doctorsApi } from "@/lib/api/doctors";

export function useDoctors(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ["doctors", params],
    queryFn: () => doctorsApi.list(params),
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: ["doctors", id],
    queryFn: () => doctorsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: doctorsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof doctorsApi.update>[1] }) =>
      doctorsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function useDoctorDetails(id: string) {
  return useQuery({
    queryKey: ["doctors", id, "details"],
    queryFn: () => doctorsApi.getDetails(id),
    enabled: !!id,
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: doctorsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function useBulkDeleteDoctors() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: doctorsApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function useBulkUpdateDoctorStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: doctorsApi.bulkUpdateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}

export function useDoctorSchedules(id: string) {
  return useQuery({
    queryKey: ["doctors", id, "schedules"],
    queryFn: () => doctorsApi.getSchedules(id),
    enabled: !!id,
  });
}

export function useUpdateDoctorSchedules() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof doctorsApi.updateSchedules>[1] }) =>
      doctorsApi.updateSchedules(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["doctors", variables.id, "schedules"] });
    },
  });
}
