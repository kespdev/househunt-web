import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Group,
  GroupMember,
  Apartment,
  Rating,
  Note,
  ApartmentWithMeta,
  RatingValue,
  ApartmentStatus,
  CompletionReason,
  HuntType,
} from '@/types';
import {
  mockCurrentUser,
  mockUsers,
  mockGroups,
  mockGroupMembers,
  mockApartments,
  mockRatings,
  mockNotes,
  generateId,
  generateInviteCode,
} from '@/mocks/data';

const STORAGE_KEYS = {
  GROUPS: 'roomscout_groups',
  MEMBERS: 'roomscout_members',
  APARTMENTS: 'roomscout_apartments',
  RATINGS: 'roomscout_ratings',
  NOTES: 'roomscout_notes',
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [currentUser] = useState<User>(mockCurrentUser);
  const [users] = useState<User[]>(mockUsers);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedGroups, storedMembers, storedApartments, storedRatings, storedNotes] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.GROUPS),
          AsyncStorage.getItem(STORAGE_KEYS.MEMBERS),
          AsyncStorage.getItem(STORAGE_KEYS.APARTMENTS),
          AsyncStorage.getItem(STORAGE_KEYS.RATINGS),
          AsyncStorage.getItem(STORAGE_KEYS.NOTES),
        ]);

      const parsedGroups: Group[] = storedGroups ? JSON.parse(storedGroups) : mockGroups;
      const migratedGroups = parsedGroups.map((g) => ({
        ...g,
        status: g.status || 'active',
      })) as Group[];

      setGroups(migratedGroups);
      setGroupMembers(storedMembers ? JSON.parse(storedMembers) : mockGroupMembers);
      setApartments(storedApartments ? JSON.parse(storedApartments) : mockApartments);
      setRatings(storedRatings ? JSON.parse(storedRatings) : mockRatings);
      setNotes(storedNotes ? JSON.parse(storedNotes) : mockNotes);
    } catch (error) {
      console.log('Error loading data:', error);
      setGroups(mockGroups);
      setGroupMembers(mockGroupMembers);
      setApartments(mockApartments);
      setRatings(mockRatings);
      setNotes(mockNotes);
    } finally {
      setIsLoading(false);
    }
  };

  const saveGroups = async (newGroups: Group[]) => {
    setGroups(newGroups);
    await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(newGroups));
  };

  const saveMembers = async (newMembers: GroupMember[]) => {
    setGroupMembers(newMembers);
    await AsyncStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(newMembers));
  };

  const saveApartments = async (newApartments: Apartment[]) => {
    setApartments(newApartments);
    await AsyncStorage.setItem(STORAGE_KEYS.APARTMENTS, JSON.stringify(newApartments));
  };

  const saveRatings = async (newRatings: Rating[]) => {
    setRatings(newRatings);
    await AsyncStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(newRatings));
  };

  const saveNotes = async (newNotes: Note[]) => {
    setNotes(newNotes);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(newNotes));
  };

  const createGroup = useCallback(
    async (name: string, moveDate?: string, moveExactDate?: string, huntType?: HuntType) => {
      const newGroup: Group = {
        id: generateId(),
        name,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        inviteCode: generateInviteCode(),
        status: 'active',
        moveDate,
        moveExactDate,
        huntType,
      };
      const newMember: GroupMember = {
        userId: currentUser.id,
        groupId: newGroup.id,
        role: 'creator',
      };
      await saveGroups([...groups, newGroup]);
      await saveMembers([...groupMembers, newMember]);
      return newGroup;
    },
    [groups, groupMembers, currentUser.id]
  );

  const joinGroup = useCallback(
    async (inviteCode: string) => {
      const group = groups.find((g) => g.inviteCode === inviteCode);
      if (!group) {
        throw new Error('Invalid invite code');
      }
      const alreadyMember = groupMembers.some(
        (m) => m.groupId === group.id && m.userId === currentUser.id
      );
      if (alreadyMember) {
        throw new Error('Already a member of this hunt');
      }
      const newMember: GroupMember = {
        userId: currentUser.id,
        groupId: group.id,
        role: 'member',
      };
      await saveMembers([...groupMembers, newMember]);
      return group;
    },
    [groups, groupMembers, currentUser.id]
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
      const newApartment: Apartment = {
        id: generateId(),
        groupId,
        sourceUrl: data.sourceUrl,
        address: data.address,
        price: data.price,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        squareFootage: data.squareFootage,
        photos: data.photos || [],
        listingSource: data.listingSource,
        status: 'New',
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        tags: data.tags,
      };
      await saveApartments([...apartments, newApartment]);
      return newApartment;
    },
    [apartments, currentUser.id]
  );

  const updateApartmentStatus = useCallback(
    async (apartmentId: string, status: ApartmentStatus) => {
      const updated = apartments.map((apt) =>
        apt.id === apartmentId ? { ...apt, status } : apt
      );
      await saveApartments(updated);
    },
    [apartments]
  );

  const completeHunt = useCallback(
    async (groupId: string, reason: CompletionReason, chosenApartmentId?: string) => {
      const updated = groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              status: 'completed' as const,
              completedAt: new Date().toISOString(),
              completionReason: reason,
              chosenApartmentId: chosenApartmentId,
            }
          : g
      );
      await saveGroups(updated);
      console.log('Hunt completed:', groupId, reason, chosenApartmentId);
    },
    [groups]
  );

  const reactivateHunt = useCallback(
    async (groupId: string) => {
      const updated = groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              status: 'active' as const,
              completedAt: undefined,
              completionReason: undefined,
              chosenApartmentId: undefined,
            }
          : g
      );
      await saveGroups(updated);
      console.log('Hunt reactivated:', groupId);
    },
    [groups]
  );

  const addOrUpdateRating = useCallback(
    async (apartmentId: string, value: RatingValue) => {
      const existingRating = ratings.find(
        (r) => r.apartmentId === apartmentId && r.userId === currentUser.id
      );
      if (existingRating) {
        const updated = ratings.map((r) =>
          r.id === existingRating.id ? { ...r, value } : r
        );
        await saveRatings(updated);
      } else {
        const newRating: Rating = {
          id: generateId(),
          apartmentId,
          userId: currentUser.id,
          value,
        };
        await saveRatings([...ratings, newRating]);
      }
    },
    [ratings, currentUser.id]
  );

  const addNote = useCallback(
    async (apartmentId: string, text: string) => {
      const newNote: Note = {
        id: generateId(),
        apartmentId,
        userId: currentUser.id,
        text,
        createdAt: new Date().toISOString(),
      };
      await saveNotes([...notes, newNote]);
      return newNote;
    },
    [notes, currentUser.id]
  );

  const getUserGroups = useCallback(() => {
    const userGroupIds = groupMembers
      .filter((m) => m.userId === currentUser.id)
      .map((m) => m.groupId);
    return groups.filter((g) => userGroupIds.includes(g.id));
  }, [groups, groupMembers, currentUser.id]);

  const getMostRecentActiveHunt = useCallback(() => {
    const userGroupIds = groupMembers
      .filter((m) => m.userId === currentUser.id)
      .map((m) => m.groupId);
    const userGroups = groups.filter((g) => userGroupIds.includes(g.id));
    const activeHunts = userGroups.filter((g) => g.status === 'active');

    if (activeHunts.length === 0) return null;

    return activeHunts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }, [groups, groupMembers, currentUser.id]);

  const getLastCompletedHunt = useCallback(() => {
    const userGroupIds = groupMembers
      .filter((m) => m.userId === currentUser.id)
      .map((m) => m.groupId);
    const userGroups = groups.filter((g) => userGroupIds.includes(g.id));
    const completedHunts = userGroups.filter((g) => g.status === 'completed');

    if (completedHunts.length === 0) return null;

    return completedHunts.sort(
      (a, b) =>
        new Date(b.completedAt || b.createdAt).getTime() -
        new Date(a.completedAt || a.createdAt).getTime()
    )[0];
  }, [groups, groupMembers, currentUser.id]);

  const getGroupById = useCallback(
    (groupId: string) => groups.find((g) => g.id === groupId),
    [groups]
  );

  const getGroupMembers = useCallback(
    (groupId: string) => {
      const memberIds = groupMembers
        .filter((m) => m.groupId === groupId)
        .map((m) => m.userId);
      return users.filter((u) => memberIds.includes(u.id));
    },
    [groupMembers, users]
  );

  const getGroupApartments = useCallback(
    (groupId: string): ApartmentWithMeta[] => {
      return apartments
        .filter((apt) => apt.groupId === groupId)
        .map((apt) => {
          const aptRatings = ratings.filter((r) => r.apartmentId === apt.id);
          const aptNotes = notes.filter((n) => n.apartmentId === apt.id);
          const userRating = aptRatings.find((r) => r.userId === currentUser.id);

          let ratingSum = 0;
          for (const r of aptRatings) {
            if (r.value === 'Love') ratingSum += 3;
            else if (r.value === 'Maybe') ratingSum += 2;
            else if (r.value === 'Pass') ratingSum += 1;
          }
          const averageRating = aptRatings.length > 0 ? ratingSum / aptRatings.length : 0;

          return {
            ...apt,
            ratings: aptRatings,
            notes: aptNotes,
            averageRating,
            userRating,
          };
        });
    },
    [apartments, ratings, notes, currentUser.id]
  );

  const getApartmentById = useCallback(
    (apartmentId: string): ApartmentWithMeta | undefined => {
      const apt = apartments.find((a) => a.id === apartmentId);
      if (!apt) return undefined;

      const aptRatings = ratings.filter((r) => r.apartmentId === apt.id);
      const aptNotes = notes.filter((n) => n.apartmentId === apt.id);
      const userRating = aptRatings.find((r) => r.userId === currentUser.id);

      let ratingSum = 0;
      for (const r of aptRatings) {
        if (r.value === 'Love') ratingSum += 3;
        else if (r.value === 'Maybe') ratingSum += 2;
        else if (r.value === 'Pass') ratingSum += 1;
      }
      const averageRating = aptRatings.length > 0 ? ratingSum / aptRatings.length : 0;

      return {
        ...apt,
        ratings: aptRatings,
        notes: aptNotes,
        averageRating,
        userRating,
      };
    },
    [apartments, ratings, notes, currentUser.id]
  );

  const getUserById = useCallback(
    (userId: string) => users.find((u) => u.id === userId),
    [users]
  );

  return {
    currentUser,
    users,
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
