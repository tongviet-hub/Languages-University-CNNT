import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import * as api from "@/api"

export const useSubjects = () => useQuery({ queryKey: ["subjects"], queryFn: api.fetchSubjects })
export const useSchedule = () => useQuery({ queryKey: ["schedule"], queryFn: api.fetchSchedule })
export const useGrades = () => useQuery({ queryKey: ["grades"], queryFn: api.fetchGrades })
export const useAnnouncements = () =>
  useQuery({ queryKey: ["announcements"], queryFn: api.fetchAnnouncements })
export const useAssignments = () =>
  useQuery({ queryKey: ["assignments"], queryFn: api.fetchAssignments })
export const useAttendance = (year: number, month: number) =>
  useQuery({
    queryKey: ["attendance", year, month],
    queryFn: () => api.fetchAttendance(year, month),
  })

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.markAnnouncementRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.markAllAnnouncementsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  })
}

export function useToggleAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.toggleAssignment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments"] }),
  })
}
