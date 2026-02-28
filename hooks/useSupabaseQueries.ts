import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import * as db from '@/lib/database';
import {
  RatingValue,
  ApartmentStatus,
  CompletionReason,
  HuntType,
} from '@/types';
import { generateInviteCode } from '@/mocks/data';

// ── Query Keys ───────────────────────────────────────────────

export const queryKeys = {
  userGroups: (userId: string) => ['userGroups', userId] as const,
  group: (groupId: string) => ['group', groupId] as const,
  groupMembers: (groupId: string) => ['groupMembers', groupId] as const,
  groupApartments: (groupId: string) => ['groupApartments', groupId] as const,
  apartment: (apartmentId: string) => ['apartment', apartmentId] as const,
  apartmentRatings: (apartmentId: string) => ['apartmentRatings', apartmentId] as const,
  apartmentNotes: (apartmentId: string) => ['apartmentNotes', apartmentId] as const,
  notifications: (userId: string) => ['notifications', userId] as const,
  user: (userId: string) => ['user', userId] as const,
};

// ── Queries ──────────────────────────────────────────────────

export function useUserGroups(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.userGroups(userId ?? ''),
    queryFn: () => db.fetchUserGroups(userId!),
    enabled: !!userId,
  });
}

export function useGroup(groupId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.group(groupId ?? ''),
    queryFn: () => db.fetchGroupById(groupId!),
    enabled: !!groupId,
  });
}

export function useGroupMembers(groupId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.groupMembers(groupId ?? ''),
    queryFn: () => db.fetchGroupMembers(groupId!),
    enabled: !!groupId,
  });
}

export function useGroupApartments(groupId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.groupApartments(groupId ?? ''),
    queryFn: () => db.fetchGroupApartments(groupId!),
    enabled: !!groupId,
  });
}

export function useApartment(apartmentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.apartment(apartmentId ?? ''),
    queryFn: () => db.fetchApartmentById(apartmentId!),
    enabled: !!apartmentId,
  });
}

export function useApartmentRatings(apartmentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.apartmentRatings(apartmentId ?? ''),
    queryFn: () => db.fetchApartmentRatings(apartmentId!),
    enabled: !!apartmentId,
  });
}

export function useApartmentNotes(apartmentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.apartmentNotes(apartmentId ?? ''),
    queryFn: () => db.fetchApartmentNotes(apartmentId!),
    enabled: !!apartmentId,
  });
}

export function useNotifications(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.notifications(userId ?? ''),
    queryFn: () => db.fetchNotifications(userId!),
    enabled: !!userId,
  });
}

export function useUserById(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.user(userId ?? ''),
    queryFn: () => db.fetchUserById(userId!),
    enabled: !!userId,
  });
}

// ── Mutations ────────────────────────────────────────────────

export function useCreateGroup(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      name: string;
      moveDate?: string;
      moveExactDate?: string;
      huntType?: HuntType;
    }) =>
      db.createGroup(
        userId,
        params.name,
        generateInviteCode(),
        params.moveDate,
        params.moveExactDate,
        params.huntType
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userGroups(userId) });
    },
  });
}

export function useJoinGroup(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteCode: string) => db.joinGroupByInviteCode(userId, inviteCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userGroups(userId) });
    },
  });
}

export function useAddApartment(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      groupId: string;
      data: {
        sourceUrl: string;
        address: string;
        price: number;
        bedrooms: number;
        bathrooms: number;
        squareFootage?: number;
        photos?: string[];
        listingSource: string;
        tags?: string[];
      };
    }) => db.addApartment(userId, params.groupId, params.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.groupApartments(variables.groupId),
      });
    },
  });
}

export function useUpdateApartmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { apartmentId: string; status: ApartmentStatus; groupId: string }) =>
      db.updateApartmentStatus(params.apartmentId, params.status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.apartment(variables.apartmentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groupApartments(variables.groupId),
      });
    },
  });
}

export function useUpsertRating(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { apartmentId: string; value: RatingValue }) =>
      db.upsertRating(userId, params.apartmentId, params.value),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.apartmentRatings(variables.apartmentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.apartment(variables.apartmentId),
      });
    },
  });
}

export function useAddNote(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { apartmentId: string; text: string }) =>
      db.addNote(userId, params.apartmentId, params.text),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.apartmentNotes(variables.apartmentId),
      });
    },
  });
}

export function useCompleteHunt(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      groupId: string;
      reason: CompletionReason;
      chosenApartmentId?: string;
    }) => db.completeHunt(params.groupId, params.reason, params.chosenApartmentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.userGroups(userId) });
    },
  });
}

export function useReactivateHunt(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => db.reactivateHunt(groupId),
    onSuccess: (_data, groupId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.userGroups(userId) });
    },
  });
}

export function useMarkNotificationRead(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => db.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId) });
    },
  });
}

// ── Realtime Subscriptions ───────────────────────────────────

export function useRealtimeApartments(groupId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel(`apartments:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'apartments',
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.groupApartments(groupId),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, queryClient]);
}

export function useRealtimeNotifications(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.notifications(userId),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}

export function useRealtimeRatings(apartmentId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!apartmentId) return;

    const channel = supabase
      .channel(`ratings:${apartmentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ratings',
          filter: `apartment_id=eq.${apartmentId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.apartmentRatings(apartmentId),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [apartmentId, queryClient]);
}

export function useRealtimeNotes(apartmentId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!apartmentId) return;

    const channel = supabase
      .channel(`notes:${apartmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notes',
          filter: `apartment_id=eq.${apartmentId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.apartmentNotes(apartmentId),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [apartmentId, queryClient]);
}
