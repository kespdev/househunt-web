import { User, Group, GroupMember, Apartment, Rating, Note } from '@/types';

export const mockCurrentUser: User = {
  id: 'user-1',
  name: 'Alex Chen',
  email: 'alex@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
};

export const mockUsers: User[] = [
  mockCurrentUser,
  {
    id: 'user-2',
    name: 'Jordan Smith',
    email: 'jordan@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    id: 'user-3',
    name: 'Taylor Reed',
    email: 'taylor@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  },
];

export const mockGroups: Group[] = [
  {
    id: 'group-1',
    name: 'Downtown Apt Search',
    createdBy: 'user-1',
    createdAt: '2024-01-15T10:00:00Z',
    inviteCode: 'DT2024X',
    status: 'active',
    moveDate: '2024-04-01T00:00:00Z',
  },
  {
    id: 'group-2',
    name: 'Summer Sublet Hunt',
    createdBy: 'user-2',
    createdAt: '2024-02-01T14:30:00Z',
    inviteCode: 'SUM24AB',
    status: 'completed',
    moveDate: '2024-06-01T00:00:00Z',
    completedAt: '2024-03-15T12:00:00Z',
    completionReason: 'found_place',
    chosenApartmentId: 'apt-5',
  },
];

export const mockGroupMembers: GroupMember[] = [
  { userId: 'user-1', groupId: 'group-1', role: 'creator' },
  { userId: 'user-2', groupId: 'group-1', role: 'member' },
  { userId: 'user-3', groupId: 'group-1', role: 'member' },
  { userId: 'user-2', groupId: 'group-2', role: 'creator' },
  { userId: 'user-1', groupId: 'group-2', role: 'member' },
];

export const mockApartments: Apartment[] = [
  {
    id: 'apt-1',
    groupId: 'group-1',
    sourceUrl: 'https://apartments.com/listing/123',
    address: '425 Market St, Apt 12B',
    price: 3200,
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 1100,
    photos: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
    ],
    listingSource: 'Apartments.com',
    status: 'Shortlist',
    createdBy: 'user-1',
    createdAt: '2024-01-20T09:00:00Z',
    tags: ['In-unit Laundry', 'Parking'],
  },
  {
    id: 'apt-2',
    groupId: 'group-1',
    sourceUrl: 'https://zillow.com/listing/456',
    address: '88 Pine Street, Unit 5A',
    price: 2800,
    bedrooms: 2,
    bathrooms: 1,
    squareFootage: 950,
    photos: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=800',
    ],
    listingSource: 'Zillow',
    status: 'New',
    createdBy: 'user-2',
    createdAt: '2024-01-22T15:30:00Z',
    tags: ['Pet Friendly'],
  },
  {
    id: 'apt-3',
    groupId: 'group-1',
    sourceUrl: 'https://craigslist.org/listing/789',
    address: '1200 Valencia St, #3',
    price: 3500,
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1400,
    photos: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    ],
    listingSource: 'Craigslist',
    status: 'Tour',
    createdBy: 'user-1',
    createdAt: '2024-01-25T11:00:00Z',
    tags: ['Roof Deck', 'Dishwasher'],
  },
  {
    id: 'apt-4',
    groupId: 'group-1',
    sourceUrl: 'https://hotpads.com/listing/101',
    address: '55 Oak Avenue, Apt 8',
    price: 2600,
    bedrooms: 2,
    bathrooms: 1,
    photos: [
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800',
    ],
    listingSource: 'HotPads',
    status: 'Rejected',
    createdBy: 'user-3',
    createdAt: '2024-01-18T08:00:00Z',
  },
  {
    id: 'apt-5',
    groupId: 'group-2',
    sourceUrl: 'https://apartments.com/listing/202',
    address: '900 Sunset Blvd, Unit 4C',
    price: 2200,
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 650,
    photos: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
    ],
    listingSource: 'Apartments.com',
    status: 'New',
    createdBy: 'user-2',
    createdAt: '2024-02-05T16:00:00Z',
  },
];

export const mockRatings: Rating[] = [
  { id: 'rating-1', apartmentId: 'apt-1', userId: 'user-1', value: 'Love' },
  { id: 'rating-2', apartmentId: 'apt-1', userId: 'user-2', value: 'Love' },
  { id: 'rating-3', apartmentId: 'apt-1', userId: 'user-3', value: 'Maybe' },
  { id: 'rating-4', apartmentId: 'apt-2', userId: 'user-1', value: 'Maybe' },
  { id: 'rating-5', apartmentId: 'apt-2', userId: 'user-2', value: 'Pass' },
  { id: 'rating-6', apartmentId: 'apt-3', userId: 'user-1', value: 'Love' },
  { id: 'rating-7', apartmentId: 'apt-3', userId: 'user-2', value: 'Love' },
  { id: 'rating-8', apartmentId: 'apt-3', userId: 'user-3', value: 'Love' },
  { id: 'rating-9', apartmentId: 'apt-4', userId: 'user-1', value: 'Pass' },
  { id: 'rating-10', apartmentId: 'apt-4', userId: 'user-2', value: 'Pass' },
];

export const mockNotes: Note[] = [
  {
    id: 'note-1',
    apartmentId: 'apt-1',
    userId: 'user-1',
    text: 'Great natural light in the living room. Close to BART station.',
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'note-2',
    apartmentId: 'apt-1',
    userId: 'user-2',
    text: 'Visited the area - very walkable, lots of coffee shops nearby!',
    createdAt: '2024-01-21T14:30:00Z',
  },
  {
    id: 'note-3',
    apartmentId: 'apt-2',
    userId: 'user-1',
    text: 'Only one bathroom might be tight for 3 people.',
    createdAt: '2024-01-23T09:15:00Z',
  },
  {
    id: 'note-4',
    apartmentId: 'apt-3',
    userId: 'user-3',
    text: 'This is my top pick! The roof deck is amazing.',
    createdAt: '2024-01-26T18:00:00Z',
  },
  {
    id: 'note-5',
    apartmentId: 'apt-4',
    userId: 'user-2',
    text: 'Too far from downtown, commute would be rough.',
    createdAt: '2024-01-19T11:00:00Z',
  },
];

export const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
