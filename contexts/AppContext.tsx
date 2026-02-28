import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useMemo } from 'react';
import {
  User,
  Group,
  ApartmentWithMeta,
  RatingValue,
  ApartmentStatus,
  CompletionReason,
  HuntType,
} from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  useUserGroups,
  useGroupApartments,
  useGroupMembers,
  useApartmentRatings,
  useApartmentNotes,
  useCreateGroup,
  useJoinGroup,
  useAddApartment,
  useUpdateApartmentStatus,
  useUpsertRating,
  useAddNote,
  useCompleteHunt,
  useReactivateHunt,
  useRealtimeNotifications,
  queryKeys,
} from '@/hooks/useSupabaseQueries';
import * as db from '@/lib/database';
import { generateInviteCode } from '@/mocks/data';
import { useQueryClient } from '@tanstack/react-query';

export const [AppProvider, useApp] = createContextHook(() => {
  const { profile } = useAuth();
  const userId = profile?.id ?? '';
  const queryClient = useQueryClient();

  // Subscribe to realtime notifications for the current user
  useRealtimeNotifications(userId || undefined);

  const currentUser: User = profile ?? { id: '', name: '', email: '' };

  const {
    data: groups = [],
    isLoading: groupsLoading,
  } = useUserGroups(userId || undefined);

  // ── Mutation hooks ─────────────────────────────────────────

  const createGroupMutation = useCreateGroup(userId);
  const joinGroupMutation = useJoinGroup(userId);
  const addApartmentMutation = useAddApartment(userId);
  const updateStatusMutation = useUpdateApartmentStatus();
  const upsertRatingMutation = useUpsertRating(userId);
  const addNoteMutation = useAddNote(userId);
  const completeHuntMutation = useCompleteHunt(userId);
  const reactivateHuntMutation = useReactivateHunt(userId);

  // ── Mutations (same API as before) ─────────────────────────

  const createGroup = useCallback(
    async (name: string, moveDate?: string, moveExactDate?: string, huntType?: HuntType) => {
      const group = await db.createGroup(
        userId,
        name,
        generateInviteCode(),
        moveDate,
        moveExactDate,
        huntType
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.userGroups(userId) });
      return group;
    },
    [userId, queryClient]
  );

  const joinGroup = useCallback(
    async (inviteCode: string) => {
      const group = await db.joinGroupByInviteCode(userId, inviteCode);
      queryClient.invalidateQueries({ queryKey: queryKeys.userGroups(userId) });
      return group;
    },
    [userId, queryClient]
  );

  const addApartment = useCallback(
    async (
      groupId: string,
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
      }
    ) => {
      const apt = await db.addApartment(userId, groupId, data);
      queryClient.invalidateQueries({ queryKey: queryKeys.groupApartments(groupId) });
      return apt;
    },
    [userId, queryClient]
  );

  const updateApartmentStatus = useCallback(
    async (apartmentId: string, status: ApartmentStatus) => {
      await db.updateApartmentStatus(apartmentId, status);
      // We don't know the groupId here, so invalidate broadly
      queryClient.invalidateQueries({ queryKey: ['groupApartments'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.apartment(apartmentId) });
    },
    [queryClient]
  );

  const completeHunt = useCallback(
    async (groupId: string, reason: CompletionReason, chosenApartmentId?: string) => {
      await db.completeHunt(groupId, reason, chosenApartmentId);
      queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.userGroups(userId) });
    },
    [userId, queryClient]
  );

  const reactivateHunt = useCallback(
    async (groupId: string) => {
      await db.reactivateHunt(groupId);
      queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.userGroups(userId) });
    },
    [userId, queryClient]
  );

  const addOrUpdateRating = useCallback(
    async (apartmentId: string, value: RatingValue) => {
      await db.upsertRating(userId, apartmentId, value);
      queryClient.invalidateQueries({ queryKey: queryKeys.apartmentRatings(apartmentId) });
      queryClient.invalidateQueries({ queryKey: ['groupApartments'] });
    },
    [userId, queryClient]
  );

  const addNote = useCallback(
    async (apartmentId: string, text: string) => {
      const note = await db.addNote(userId, apartmentId, text);
      queryClient.invalidateQueries({ queryKey: queryKeys.apartmentNotes(apartmentId) });
      return note;
    },
    [userId, queryClient]
  );

  // ── Getters (synchronous, from cached data) ────────────────

  const getUserGroups = useCallback(() => {
    return groups;
  }, [groups]);

  const getMostRecentActiveHunt = useCallback(() => {
    const active = groups.filter((g) => g.status === 'active');
    if (active.length === 0) return null;
    return active.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }, [groups]);

  const getLastCompletedHunt = useCallback(() => {
    const completed = groups.filter((g) => g.status === 'completed');
    if (completed.length === 0) return null;
    return completed.sort(
      (a, b) =>
        new Date(b.completedAt || b.createdAt).getTime() -
        new Date(a.completedAt || a.createdAt).getTime()
    )[0];
  }, [groups]);

  const getGroupById = useCallback(
    (groupId: string) => groups.find((g) => g.id === groupId),
    [groups]
  );

  // These getters fetch from cache or return empty arrays.
  // Components that need live data should use the React Query hooks directly.
  const getGroupMembers = useCallback(
    (groupId: string): User[] => {
      const cached = queryClient.getQueryData<User[]>(queryKeys.groupMembers(groupId));
      if (cached) return cached;
      // Trigger a fetch in the background
      queryClient.prefetchQuery({
        queryKey: queryKeys.groupMembers(groupId),
        queryFn: () => db.fetchGroupMembers(groupId),
      });
      return [];
    },
    [queryClient]
  );

  const getGroupApartments = useCallback(
    (groupId: string): ApartmentWithMeta[] => {
      const cached = queryClient.getQueryData<any[]>(queryKeys.groupApartments(groupId));
      if (!cached) {
        queryClient.prefetchQuery({
          queryKey: queryKeys.groupApartments(groupId),
          queryFn: () => db.fetchGroupApartments(groupId),
        });
        return [];
      }
      // Return apartments as ApartmentWithMeta with empty ratings/notes
      // Full ratings/notes are fetched per-apartment when needed
      return cached.map((apt) => ({
        ...apt,
        ratings: [],
        notes: [],
        averageRating: 0,
        userRating: undefined,
      }));
    },
    [queryClient]
  );

  const getApartmentById = useCallback(
    (apartmentId: string): ApartmentWithMeta | undefined => {
      // Search across all cached apartment lists
      const allCachedQueries = queryClient.getQueriesData<any[]>({
        queryKey: ['groupApartments'],
      });
      for (const [, data] of allCachedQueries) {
        if (!data) continue;
        const apt = data.find((a: any) => a.id === apartmentId);
        if (apt) {
          return {
            ...apt,
            ratings: [],
            notes: [],
            averageRating: 0,
            userRating: undefined,
          };
        }
      }
      return undefined;
    },
    [queryClient]
  );

  const getUserById = useCallback(
    (userId: string): User | undefined => {
      // Check all cached group member lists
      const allCachedQueries = queryClient.getQueriesData<User[]>({
        queryKey: ['groupMembers'],
      });
      for (const [, data] of allCachedQueries) {
        if (!data) continue;
        const user = data.find((u) => u.id === userId);
        if (user) return user;
      }
      // Check current user
      if (profile && profile.id === userId) return profile;
      return undefined;
    },
    [queryClient, profile]
  );

  const isLoading = groupsLoading;

  return {
    currentUser,
    users: [] as User[], // No longer maintaining full user list; use getGroupMembers
    groups,
    isLoading,
    createGroup,
    joinGroup,
    addApartment,
    updateApartmentStatus,
    completeHunt,
    reactivateHunt,
    addOrUpdateRating,
    addNote,
    getUserGroups,
    getMostRecentActiveHunt,
    getLastCompletedHunt,
    getGroupById,
    getGroupMembers,
    getGroupApartments,
    getApartmentById,
    getUserById,
  };
});
