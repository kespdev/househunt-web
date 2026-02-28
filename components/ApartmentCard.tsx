import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Heart, HelpCircle, X, Bed, Bath, MapPin } from 'lucide-react-native';
import { ApartmentWithMeta, ApartmentStatus } from '@/types';
import colors from '@/constants/colors';
import { fonts } from '@/constants/fonts';



interface ApartmentCardProps {
  apartment: ApartmentWithMeta;
  onPress: () => void;
}

const getStatusConfig = (status: ApartmentStatus) => {
  switch (status) {
    case 'New':
      return { color: colors.statusNew, label: 'New' };
    case 'Shortlist':
      return { color: colors.statusShortlist, label: 'Shortlist' };
    case 'Tour':
      return { color: colors.statusTour, label: 'Tour' };
    case 'Rejected':
      return { color: colors.statusRejected, label: 'Rejected' };
    case 'FinalChoice':
      return { color: colors.statusFinal, label: 'Final Choice' };
    default:
      return { color: colors.textSecondary, label: status };
  }
};

const getRatingIcon = (value: string | undefined) => {
  switch (value) {
    case 'Love':
      return <Heart size={14} color={colors.love} fill={colors.love} />;
    case 'Maybe':
      return <HelpCircle size={14} color={colors.maybe} />;
    case 'Pass':
      return <X size={14} color={colors.pass} />;
    default:
      return null;
  }
};

export default function ApartmentCard({ apartment, onPress }: ApartmentCardProps) {
  const { width } = useWindowDimensions();
  const isSmall = width < 380;
  const imageHeight = isSmall ? 140 : width < 768 ? 180 : 220;
  const statusConfig = getStatusConfig(apartment.status);
  const loveCount = apartment.ratings.filter((r) => r.value === 'Love').length;
  const maybeCount = apartment.ratings.filter((r) => r.value === 'Maybe').length;
  const passCount = apartment.ratings.filter((r) => r.value === 'Pass').length;

  return (
    <TouchableOpacity
      style={[styles.card, isSmall && { marginHorizontal: 12 }]}
      onPress={onPress}
      activeOpacity={0.9}
      testID="apartment-card"
    >
      <View style={[styles.imageContainer, { height: imageHeight }]}>
        {apartment.photos.length > 0 ? (
          <Image
            source={{ uri: apartment.photos[0] }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImage}>
            <MapPin size={32} color={colors.textTertiary} />
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
          <Text style={styles.statusText}>{statusConfig.label}</Text>
        </View>
        {apartment.userRating && (
          <View style={styles.userRatingBadge}>
            {getRatingIcon(apartment.userRating.value)}
          </View>
        )}
      </View>

      <View style={[styles.content, isSmall && { padding: 12 }]}>
        <Text style={[styles.price, isSmall && { fontSize: 18 }]}>${apartment.price.toLocaleString()}/mo</Text>
        <View style={styles.specsRow}>
          <View style={styles.spec}>
            <Bed size={14} color={colors.textSecondary} />
            <Text style={styles.specText}>{apartment.bedrooms} bd</Text>
          </View>
          <View style={styles.spec}>
            <Bath size={14} color={colors.textSecondary} />
            <Text style={styles.specText}>{apartment.bathrooms} ba</Text>
          </View>
          {apartment.squareFootage && (
            <Text style={styles.specText}>{apartment.squareFootage} sqft</Text>
          )}
        </View>
        <Text style={styles.address} numberOfLines={1}>
          {apartment.address}
        </Text>

        <View style={styles.footer}>
          <View style={styles.ratingSummary}>
            {loveCount > 0 && (
              <View style={[styles.ratingChip, { backgroundColor: colors.loveLight }]}>
                <Heart size={12} color={colors.love} fill={colors.love} />
                <Text style={[styles.ratingCount, { color: colors.love }]}>{loveCount}</Text>
              </View>
            )}
            {maybeCount > 0 && (
              <View style={[styles.ratingChip, { backgroundColor: colors.maybeLight }]}>
                <HelpCircle size={12} color={colors.maybe} />
                <Text style={[styles.ratingCount, { color: colors.maybe }]}>{maybeCount}</Text>
              </View>
            )}
            {passCount > 0 && (
              <View style={[styles.ratingChip, { backgroundColor: colors.passLight }]}>
                <X size={12} color={colors.pass} />
                <Text style={[styles.ratingCount, { color: colors.pass }]}>{passCount}</Text>
              </View>
            )}
          </View>
          {apartment.notes.length > 0 && (
            <Text style={styles.notesCount}>{apartment.notes.length} notes</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '600',
  },
  userRatingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.surface,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  price: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 6,
    fontFamily: fonts.dmSansBold,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  address: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 12,
  },
  ratingSummary: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  notesCount: {
    fontSize: 12,
    color: colors.textTertiary,
  },
});
