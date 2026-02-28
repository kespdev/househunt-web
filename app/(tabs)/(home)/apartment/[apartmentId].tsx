import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Linking,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import {
  Bed,
  Bath,
  Square,
  ExternalLink,
  MapPin,
  Send,
  ChevronLeft,
  ChevronRight,
  Tag as TagIcon,
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import RatingButton from '@/components/RatingButton';
import StatusPicker from '@/components/StatusPicker';
import NoteCard from '@/components/NoteCard';
import EmptyState from '@/components/EmptyState';
import { RatingValue, ApartmentStatus } from '@/types';
import colors from '@/constants/colors';
import { fonts } from '@/constants/fonts';

export default function ApartmentDetailScreen() {
  const { apartmentId } = useLocalSearchParams<{ apartmentId: string }>();
  const { getApartmentById, addOrUpdateRating, updateApartmentStatus, addNote, getUserById } = useApp();
  const { width } = useWindowDimensions();
  const isSmall = width < 380;
  const isWide = width >= 768;
  const photoHeight = isSmall ? 220 : isWide ? 400 : 280;

  const [noteText, setNoteText] = useState('');
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apartment = useMemo(() => getApartmentById(apartmentId || ''), [apartmentId, getApartmentById]);

  const handleRating = async (value: RatingValue) => {
    if (!apartment) return;
    await addOrUpdateRating(apartment.id, value);
  };

  const handleStatusChange = async (status: ApartmentStatus) => {
    if (!apartment) return;
    await updateApartmentStatus(apartment.id, status);
  };

  const handleAddNote = async () => {
    if (!apartment || !noteText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addNote(apartment.id, noteText.trim());
      setNoteText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenListing = () => {
    if (apartment?.sourceUrl) {
      Linking.openURL(apartment.sourceUrl);
    }
  };

  const handlePrevPhoto = () => {
    if (!apartment) return;
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? apartment.photos.length - 1 : prev - 1
    );
  };

  const handleNextPhoto = () => {
    if (!apartment) return;
    setCurrentPhotoIndex((prev) =>
      prev === apartment.photos.length - 1 ? 0 : prev + 1
    );
  };

  if (!apartment) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon={MapPin}
          title="Apartment not found"
          description="This listing doesn't exist or has been removed."
        />
      </View>
    );
  }

  const sortedNotes = [...apartment.notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen options={{ title: apartment.address.split(',')[0] }} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.photoContainer, { height: photoHeight }]}>
          {apartment.photos.length > 0 ? (
            <>
              <Image
                source={{ uri: apartment.photos[currentPhotoIndex] }}
                style={styles.photo}
                resizeMode="cover"
              />
              {apartment.photos.length > 1 && (
                <>
                  <TouchableOpacity
                    style={[styles.photoNav, styles.photoNavLeft]}
                    onPress={handlePrevPhoto}
                  >
                    <ChevronLeft size={24} color={colors.textInverse} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.photoNav, styles.photoNavRight]}
                    onPress={handleNextPhoto}
                  >
                    <ChevronRight size={24} color={colors.textInverse} />
                  </TouchableOpacity>
                  <View style={styles.photoIndicator}>
                    <Text style={styles.photoIndicatorText}>
                      {currentPhotoIndex + 1} / {apartment.photos.length}
                    </Text>
                  </View>
                </>
              )}
            </>
          ) : (
            <View style={styles.noPhoto}>
              <MapPin size={48} color={colors.textTertiary} />
              <Text style={styles.noPhotoText}>No photos available</Text>
            </View>
          )}
        </View>

        <View style={[styles.content, isWide && styles.contentWide]}>
          <Text style={[styles.price, isSmall && { fontSize: 24 }]}>${apartment.price.toLocaleString()}/month</Text>

          <View style={[styles.specsRow, isSmall && { gap: 12 }]}>
            <View style={styles.spec}>
              <Bed size={18} color={colors.textSecondary} />
              <Text style={styles.specText}>{apartment.bedrooms} beds</Text>
            </View>
            <View style={styles.spec}>
              <Bath size={18} color={colors.textSecondary} />
              <Text style={styles.specText}>{apartment.bathrooms} baths</Text>
            </View>
            {apartment.squareFootage && (
              <View style={styles.spec}>
                <Square size={18} color={colors.textSecondary} />
                <Text style={styles.specText}>{apartment.squareFootage} sqft</Text>
              </View>
            )}
          </View>

          <View style={styles.addressRow}>
            <MapPin size={16} color={colors.textSecondary} />
            <Text style={styles.address}>{apartment.address}</Text>
          </View>

          <TouchableOpacity
            style={styles.listingButton}
            onPress={handleOpenListing}
            activeOpacity={0.7}
          >
            <ExternalLink size={18} color={colors.primary} />
            <Text style={styles.listingButtonText}>
              View on {apartment.listingSource}
            </Text>
          </TouchableOpacity>

          {apartment.tags && apartment.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {apartment.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <TagIcon size={12} color={colors.textSecondary} />
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <StatusPicker
              currentStatus={apartment.status}
              onStatusChange={handleStatusChange}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Rating</Text>
            <View style={[styles.ratingButtons, isSmall && { gap: 6 }]}>
              <RatingButton
                value="Love"
                isSelected={apartment.userRating?.value === 'Love'}
                onPress={() => handleRating('Love')}
              />
              <RatingButton
                value="Maybe"
                isSelected={apartment.userRating?.value === 'Maybe'}
                onPress={() => handleRating('Maybe')}
              />
              <RatingButton
                value="Pass"
                isSelected={apartment.userRating?.value === 'Pass'}
                onPress={() => handleRating('Pass')}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Notes ({apartment.notes.length})
            </Text>

            <View style={styles.noteInputContainer}>
              <TextInput
                style={styles.noteInput}
                placeholder="Add a note..."
                placeholderTextColor={colors.textTertiary}
                value={noteText}
                onChangeText={setNoteText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendButton, !noteText.trim() && styles.sendButtonDisabled]}
                onPress={handleAddNote}
                disabled={!noteText.trim() || isSubmitting}
              >
                <Send size={20} color={noteText.trim() ? colors.primary : colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {sortedNotes.length > 0 ? (
              <View style={styles.notesList}>
                {sortedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    user={getUserById(note.userId)}
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.noNotesText}>
                No notes yet. Be the first to add one!
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  photoContainer: {
    width: '100%',
    backgroundColor: colors.surfaceSecondary,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  noPhoto: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  noPhotoText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  photoNav: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoNavLeft: {
    left: 12,
  },
  photoNavRight: {
    right: 12,
  },
  photoIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoIndicatorText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '500',
    fontFamily: fonts.dmSansMedium,
  },
  content: {
    padding: 20,
  },
  contentWide: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  price: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
    fontFamily: fonts.dmSansBold,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 16,
  },
  address: {
    flex: 1,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  listingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  listingButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.primary,
    fontFamily: fonts.dmSansMedium,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
    fontFamily: fonts.dmSansSemiBold,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  noteInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  noteInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 15,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    padding: 14,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  notesList: {
    gap: 0,
  },
  noNotesText: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
