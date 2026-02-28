import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Plus,
  Search,
  Users,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Calendar,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { Group } from '@/types';
import colors from '@/constants/colors';
import { fonts } from '@/constants/fonts';

function HuntCard({
  hunt,
  memberCount,
  listingCount,
  onPress,
}: {
  hunt: Group;
  memberCount: number;
  listingCount: number;
  onPress: () => void;
}) {
  const isActive = hunt.status === 'active';
  const completedDate = hunt.completedAt
    ? new Date(hunt.completedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  const moveDate = hunt.moveDate
    ? new Date(hunt.moveDate).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <TouchableOpacity
      style={styles.huntCard}
      onPress={onPress}
      activeOpacity={0.65}
      testID="hunt-card"
    >
      <View style={[styles.huntCardIcon, !isActive && styles.huntCardIconDone]}>
        {isActive ? (
          <Search size={18} color={colors.primary} strokeWidth={2.2} />
        ) : (
          <CheckCircle2 size={18} color={colors.textSecondary} strokeWidth={2} />
        )}
      </View>
      <View style={styles.huntCardBody}>
        <Text style={styles.huntCardName} numberOfLines={1}>
          {hunt.name}
        </Text>
        <View style={styles.huntCardMetaRow}>
          <Users size={12} color={colors.textTertiary} />
          <Text style={styles.huntCardMeta}>
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </Text>
          <View style={styles.metaDot} />
          <MapPin size={12} color={colors.textTertiary} />
          <Text style={styles.huntCardMeta}>
            {listingCount} listing{listingCount !== 1 ? 's' : ''}
          </Text>
          {moveDate && (
            <>
              <View style={styles.metaDot} />
              <Calendar size={12} color={colors.textTertiary} />
              <Text style={styles.huntCardMeta}>{moveDate}</Text>
            </>
          )}
          {!isActive && completedDate && (
            <>
              <View style={styles.metaDot} />
              <Text style={styles.huntCardMeta}>Done {completedDate}</Text>
            </>
          )}
        </View>
      </View>
      <View
        style={[
          styles.huntCardBadge,
          isActive ? styles.huntCardBadgeActive : styles.huntCardBadgeDone,
        ]}
      >
        <Text
          style={[
            styles.huntCardBadgeText,
            isActive ? styles.huntCardBadgeTextActive : styles.huntCardBadgeTextDone,
          ]}
        >
          {isActive ? 'Active' : 'Done'}
        </Text>
      </View>
      <ChevronRight size={16} color={colors.textTertiary} style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isSmall = width < 380;
  const isWide = width >= 768;
  const {
    getUserGroups,
    getGroupApartments,
    getGroupMembers,
    isLoading,
  } = useApp();

  const userGroups = useMemo(() => getUserGroups(), [getUserGroups]);

  const activeHunts = useMemo(
    () =>
      userGroups
        .filter((g) => g.status === 'active')
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [userGroups]
  );

  const completedHunts = useMemo(
    () =>
      userGroups
        .filter((g) => g.status === 'completed')
        .sort(
          (a, b) =>
            new Date(b.completedAt || b.createdAt).getTime() -
            new Date(a.completedAt || a.createdAt).getTime()
        ),
    [userGroups]
  );

  const handleCreateHunt = () => {
    router.push('/create-group' as never);
  };

  const handleJoinHunt = () => {
    router.push('/join-group' as never);
  };

  const handleHuntPress = (huntId: string) => {
    router.push(`/hunt/${huntId}` as never);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const hasNoHunts = userGroups.length === 0;
  const hasHunts = userGroups.length > 0;
  const hasNoActive = activeHunts.length === 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, isWide && styles.headerWide]}>
        <Text style={[styles.headerTitle, isSmall && { fontSize: 24 }]}>My Hunts</Text>
        {hasHunts && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionJoin}
              onPress={handleJoinHunt}
              activeOpacity={0.7}
              testID="join-hunt-btn"
            >
              <Users size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerActionAdd}
              onPress={handleCreateHunt}
              activeOpacity={0.7}
              testID="create-hunt-btn"
            >
              <Plus size={18} color={colors.textInverse} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {hasNoHunts ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconWrap, isSmall && { width: 80, height: 80 }]}>
            <Search size={isSmall ? 36 : 44} color={colors.textTertiary} strokeWidth={1.5} />
          </View>
          <Text style={[styles.emptyTitle, isSmall && { fontSize: 20 }]}>Start your first hunt</Text>
          <Text style={styles.emptyDesc}>
            Create a hunt to begin finding your perfect place with roommates.
          </Text>
          <View style={[styles.emptyActions, isSmall && { flexDirection: 'column' }]}>
            <TouchableOpacity
              style={[styles.ctaButton, isSmall && { paddingVertical: 12, paddingHorizontal: 20 }]}
              onPress={handleCreateHunt}
              activeOpacity={0.8}
            >
              <Plus size={20} color={colors.textInverse} />
              <Text style={styles.ctaText}>New Hunt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ctaButtonSecondary, isSmall && { paddingVertical: 12, paddingHorizontal: 20 }]}
              onPress={handleJoinHunt}
              activeOpacity={0.8}
            >
              <Users size={20} color={colors.primary} />
              <Text style={styles.ctaTextSecondary}>Join Hunt</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, isWide && styles.scrollContentWide]}
          showsVerticalScrollIndicator={false}
        >
          {hasNoActive && completedHunts.length > 0 && (
            <TouchableOpacity
              style={styles.startNewBanner}
              onPress={handleCreateHunt}
              activeOpacity={0.75}
            >
              <View style={styles.startNewBannerLeft}>
                <View style={styles.startNewBannerIcon}>
                  <Plus size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.startNewBannerTitle}>Ready for a new search?</Text>
                  <Text style={styles.startNewBannerDesc}>
                    Start a new hunt to find your next place.
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={colors.primary} />
            </TouchableOpacity>
          )}

          {activeHunts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>ACTIVE</Text>
              {activeHunts.map((hunt) => (
                <HuntCard
                  key={hunt.id}
                  hunt={hunt}
                  memberCount={getGroupMembers(hunt.id).length}
                  listingCount={getGroupApartments(hunt.id).length}
                  onPress={() => handleHuntPress(hunt.id)}
                />
              ))}
            </View>
          )}

          {completedHunts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>COMPLETED</Text>
              {completedHunts.map((hunt) => (
                <HuntCard
                  key={hunt.id}
                  hunt={hunt}
                  memberCount={getGroupMembers(hunt.id).length}
                  listingCount={getGroupApartments(hunt.id).length}
                  onPress={() => handleHuntPress(hunt.id)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerWide: {
    paddingHorizontal: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    fontFamily: fonts.dmSansBold,
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerActionJoin: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActionAdd: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center' as const,
    fontFamily: fonts.dmSansBold,
  },
  emptyDesc: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: 280,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  ctaText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '600' as const,
    fontFamily: fonts.dmSansSemiBold,
  },
  ctaButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primaryLight,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  ctaTextSecondary: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600' as const,
    fontFamily: fonts.dmSansSemiBold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  scrollContentWide: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  startNewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  startNewBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  startNewBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startNewBannerTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
    fontFamily: fonts.dmSansSemiBold,
  },
  startNewBannerDesc: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  section: {
    marginTop: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textTertiary,
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 8,
    fontFamily: fonts.dmSansSemiBold,
  },
  huntCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  huntCardIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  huntCardIconDone: {
    backgroundColor: colors.surfaceSecondary,
  },
  huntCardBody: {
    flex: 1,
  },
  huntCardName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
    fontFamily: fonts.dmSansSemiBold,
  },
  huntCardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  huntCardMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textTertiary,
    marginHorizontal: 2,
  },
  huntCardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  huntCardBadgeActive: {
    backgroundColor: colors.primaryLight,
  },
  huntCardBadgeDone: {
    backgroundColor: colors.surfaceSecondary,
  },
  huntCardBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    fontFamily: fonts.dmSansBold,
  },
  huntCardBadgeTextActive: {
    color: colors.primary,
  },
  huntCardBadgeTextDone: {
    color: colors.textSecondary,
  },
});
