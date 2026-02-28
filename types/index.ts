export type RatingValue = 'Love' | 'Maybe' | 'Pass';
export type ApartmentStatus = 'New' | 'Shortlist' | 'Tour' | 'Rejected' | 'FinalChoice';
export type HuntStatus = 'active' | 'completed';
export type CompletionReason = 'found_place' | 'stopped_searching';
export type HuntType = 'rent' | 'buy';
export type GroupRole = 'creator' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Group {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  inviteCode: string;
  status: HuntStatus;
  moveDate?: string;
  moveExactDate?: string;
  huntType?: HuntType;
  completedAt?: string;
  completionReason?: CompletionReason;
  chosenApartmentId?: string;
}

export interface GroupMember {
  userId: string;
  groupId: string;
  role: GroupRole;
}

export interface Apartment {
  id: string;
  groupId: string;
  sourceUrl: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage?: number;
  photos: string[];
  listingSource: string;
  status: ApartmentStatus;
  createdBy: string;
  createdAt: string;
  tags?: string[];
}

export interface Rating {
  id: string;
  apartmentId: string;
  userId: string;
  value: RatingValue;
}

export interface Note {
  id: string;
  apartmentId: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface ApartmentWithMeta extends Apartment {
  ratings: Rating[];
  notes: Note[];
  averageRating: number;
  userRating?: Rating;
}

export type SortOption = 'price_asc' | 'price_desc' | 'rating' | 'date_added';
export type FilterStatus = ApartmentStatus | 'All';
export type FilterInterest = RatingValue | 'All';
