import { supabase } from './supabase';
import {
  User,
  Group,
  GroupMember,
  Apartment,
  Rating,
  Note,
  Notification,
  RatingValue,
  ApartmentStatus,
  CompletionReason,
  HuntType,
} from '@/types';

// ── Helpers ──────────────────────────────────────────────────

function toGroup(row: any): Group {
  return {
    id: row.id,
    name: row.name,
    createdBy: row.created_by,
    createdAt: row.created_at,
    inviteCode: row.invite_code,
    status: row.status,
    moveDate: row.move_date ?? undefined,
    moveExactDate: row.move_exact_date ?? undefined,
    huntType: row.hunt_type ?? undefined,
    completedAt: row.completed_at ?? undefined,
    completionReason: row.completion_reason ?? undefined,
    chosenApartmentId: row.chosen_apartment_id ?? undefined,
  };
}

function toApartment(row: any): Apartment {
  return {
    id: row.id,
    groupId: row.group_id,
    sourceUrl: row.source_url,
    address: row.address,
    price: Number(row.price),
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    squareFootage: row.square_footage ?? undefined,
    photos: row.photos ?? [],
    listingSource: row.listing_source,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    tags: row.tags ?? undefined,
  };
}

function toRating(row: any): Rating {
  return {
    id: row.id,
    apartmentId: row.apartment_id,
    userId: row.user_id,
    value: row.value as RatingValue,
  };
}

function toNote(row: any): Note {
  return {
    id: row.id,
    apartmentId: row.apartment_id,
    userId: row.user_id,
    text: row.text,
    createdAt: row.created_at,
  };
}

function toUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar ?? undefined,
  };
}

function toGroupMember(row: any): GroupMember {
  return {
    userId: row.user_id,
    groupId: row.group_id,
    role: row.role,
  };
}

function toNotification(row: any): Notification {
  return {
    id: row.id,
    recipientId: row.recipient_id,
    groupId: row.group_id,
    apartmentId: row.apartment_id,
    actorId: row.actor_id,
    type: row.type,
    read: row.read,
    createdAt: row.created_at,
    actorName: row.actor?.name,
    actorAvatar: row.actor?.avatar,
    groupName: row.group?.name,
    apartmentAddress: row.apartment?.address,
    apartmentPrice: row.apartment ? Number(row.apartment.price) : undefined,
  };
}

// ── Queries ──────────────────────────────────────────────────

export async function fetchUserGroups(userId: string): Promise<Group[]> {
  const { data, error } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId);

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const groupIds = data.map((m) => m.group_id);

  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select('*')
    .in('id', groupIds)
    .order('created_at', { ascending: false });

  if (groupsError) throw groupsError;
  return (groups ?? []).map(toGroup);
}

export async function fetchGroupById(groupId: string): Promise<Group | null> {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return toGroup(data);
}

export async function fetchGroupByInviteCode(inviteCode: string): Promise<Group | null> {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('invite_code', inviteCode)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return toGroup(data);
}

export async function fetchGroupMembers(groupId: string): Promise<User[]> {
  const { data, error } = await supabase
    .from('group_members')
    .select('user_id, role, profiles:user_id(id, name, email, avatar)')
    .eq('group_id', groupId);

  if (error) throw error;
  return (data ?? []).map((row: any) => toUser(row.profiles));
}

export async function fetchGroupMemberships(groupId: string): Promise<GroupMember[]> {
  const { data, error } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId);

  if (error) throw error;
  return (data ?? []).map(toGroupMember);
}

export async function fetchGroupApartments(groupId: string): Promise<Apartment[]> {
  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toApartment);
}

export async function fetchApartmentById(apartmentId: string): Promise<Apartment | null> {
  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .eq('id', apartmentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return toApartment(data);
}

export async function fetchApartmentRatings(apartmentId: string): Promise<Rating[]> {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('apartment_id', apartmentId);

  if (error) throw error;
  return (data ?? []).map(toRating);
}

export async function fetchApartmentNotes(apartmentId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('apartment_id', apartmentId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(toNote);
}

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      actor:actor_id(name, avatar),
      group:group_id(name),
      apartment:apartment_id(address, price)
    `)
    .eq('recipient_id', userId)
    .eq('read', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toNotification);
}

export async function fetchUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return toUser(data);
}

// ── Mutations ────────────────────────────────────────────────

export async function createGroup(
  userId: string,
  name: string,
  inviteCode: string,
  moveDate?: string,
  moveExactDate?: string,
  huntType?: HuntType
): Promise<Group> {
  const { data, error } = await supabase
    .from('groups')
    .insert({
      name,
      created_by: userId,
      invite_code: inviteCode,
      status: 'active',
      move_date: moveDate ?? null,
      move_exact_date: moveExactDate ?? null,
      hunt_type: huntType ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  // Add creator as member
  const { error: memberError } = await supabase
    .from('group_members')
    .insert({
      user_id: userId,
      group_id: data.id,
      role: 'creator',
    });

  if (memberError) throw memberError;
  return toGroup(data);
}

export async function joinGroupByInviteCode(
  userId: string,
  inviteCode: string
): Promise<Group> {
  const group = await fetchGroupByInviteCode(inviteCode);
  if (!group) throw new Error('Invalid invite code');

  // Check if already a member (use maybeSingle to avoid error on 0 rows)
  const { data: existing, error: checkError } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', group.id)
    .eq('user_id', userId)
    .maybeSingle();

  if (checkError) throw checkError;
  if (existing) throw new Error('Already a member of this hunt');

  const { error } = await supabase
    .from('group_members')
    .insert({
      user_id: userId,
      group_id: group.id,
      role: 'member',
    });

  if (error) throw error;
  return group;
}

export async function addApartment(
  userId: string,
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
): Promise<Apartment> {
  const { error } = await supabase
    .from('apartments')
    .insert({
      group_id: groupId,
      source_url: data.sourceUrl,
      address: data.address,
      price: data.price,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      square_footage: data.squareFootage ?? null,
      photos: data.photos ?? [],
      listing_source: data.listingSource,
      status: 'New',
      created_by: userId,
      tags: data.tags ?? null,
    });

  if (error) throw new Error(`${error.message} (${error.code}: ${error.details})`);

  // Return a constructed apartment (real data will be fetched via query invalidation)
  return {
    id: 'temp-' + Date.now(),
    groupId,
    sourceUrl: data.sourceUrl,
    address: data.address,
    price: data.price,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    squareFootage: data.squareFootage,
    photos: data.photos ?? [],
    listingSource: data.listingSource,
    status: 'New' as const,
    createdBy: userId,
    createdAt: new Date().toISOString(),
    tags: data.tags,
  };
}

export async function updateApartment(
  apartmentId: string,
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
): Promise<void> {
  const { error } = await supabase
    .from('apartments')
    .update({
      source_url: data.sourceUrl,
      address: data.address,
      price: data.price,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      square_footage: data.squareFootage ?? null,
      photos: data.photos ?? [],
      listing_source: data.listingSource,
      tags: data.tags ?? null,
    })
    .eq('id', apartmentId);

  if (error) throw new Error(`${error.message} (${error.code}: ${error.details})`);
}

export async function updateApartmentStatus(
  apartmentId: string,
  status: ApartmentStatus
): Promise<void> {
  const { error } = await supabase
    .from('apartments')
    .update({ status })
    .eq('id', apartmentId);

  if (error) throw error;
}

export async function upsertRating(
  userId: string,
  apartmentId: string,
  value: RatingValue
): Promise<void> {
  const { error } = await supabase
    .from('ratings')
    .upsert(
      {
        apartment_id: apartmentId,
        user_id: userId,
        value,
      },
      { onConflict: 'apartment_id,user_id' }
    );

  if (error) throw error;
}

export async function addNote(
  userId: string,
  apartmentId: string,
  text: string
): Promise<Note> {
  const { error } = await supabase
    .from('notes')
    .insert({
      apartment_id: apartmentId,
      user_id: userId,
      text,
    });

  if (error) throw error;
  return {
    id: 'temp-' + Date.now(),
    apartmentId,
    userId,
    text,
    createdAt: new Date().toISOString(),
  };
}

export async function completeHunt(
  groupId: string,
  reason: CompletionReason,
  chosenApartmentId?: string
): Promise<void> {
  const { error } = await supabase
    .from('groups')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      completion_reason: reason,
      chosen_apartment_id: chosenApartmentId ?? null,
    })
    .eq('id', groupId);

  if (error) throw error;
}

export async function reactivateHunt(groupId: string): Promise<void> {
  const { error } = await supabase
    .from('groups')
    .update({
      status: 'active',
      completed_at: null,
      completion_reason: null,
      chosen_apartment_id: null,
    })
    .eq('id', groupId);

  if (error) throw error;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) throw error;
}
