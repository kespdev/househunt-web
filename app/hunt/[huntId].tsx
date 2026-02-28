import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  Plus,
  Home,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  RotateCcw,
  Users,
  Calendar,
  Pencil,
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import ApartmentCard from '@/components/ApartmentCard';
import FilterBar from '@/components/FilterBar';
import EmptyState from '@/components/EmptyState';
import HuntCompletionModal from '@/components/HuntCompletionModal';
import { FilterStatus, SortOption, CompletionReason } from '@/types';
import colors from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

const statusOptions: FilterStatus[] = ['All', 'New', 'Shortlist', 'Tour', 'Rejected', 'FinalChoice'];
const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'date_added', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function HuntDetailScreen() {
  const { huntId } = useLocalSearchParams<{ huntId: string }>();
  const router = useRouter();
  const {
    getGroupById,
    getGroupApartments,
    getGroupMembers,
    completeHunt,
    reactivateHunt,
    getApartmentById,
  } = useApp();

  const { width } = useWindowDimensions();
  const isSmall = width < 380;
  const isWide = width >= 768;

  const [statusFilter, setStatusFilter] = useState<FilterStatus>('All');
  const [sortOption, setSortOption] = useState<SortOption>('date_added');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const hunt = useMemo(() => getGroupById(huntId || ''), [huntId, getGroupById]);
  const members = useMemo(() => getGroupMembers(huntId || ''), [huntId, getGroupMembers]);
  const apartments = useMemo(() => getGroupApartments(huntId || ''), [huntId, getGroupApartments]);

  const isActive = hunt?.status === 'active';

  const chosenApartment = useMemo(() => {
    if (!hunt?.chosenApartmentId) return null;
    return getApartmentById(hunt.chosenApartmentId);
  }, [hunt?.chosenApartmentId, getApartmentById]);

  const moveDateFormatted = useMemo(() => {
    if (!hunt?.moveDate) return null;
    return new Date(hunt.moveDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [hunt?.moveDate]);

  const filteredApartments = useMemo(() => {
    let result = [...apartments];
    if (statusFilter !== 'All') {
      result = result.filter((apt) => apt.status === statusFilter);
    }
    switch (sortOption) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'date_added':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    return result;
  }, [apartments, statusFilter, sortOption]);

  const handleApartmentPress = (apartmentId: string) => {
    router.push(`/(tabs)/(home)/apartment/${apartmentId}` as never);
  };

  const handleAddApartment = () => {
    if (!hunt) return;
    router.push({ pathname: '/add-apartment' as never, params: { groupId: hunt.id } });
  };

  const handleCopyInviteCode = async () => {
    if (hunt?.inviteCode) {
      await Clipboard.setStringAsync(hunt.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCompleteHunt = useCallback(
    async (reason: CompletionReason, chosenApartmentId?: string) => {
      if (!hunt) return;
      await completeHunt(hunt.id, reason, chosenApartmentId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const msg =
        reason === 'found_place'
          ? 'Congrats on finding your place! Hunt marked as complete.'
          : 'Hunt marked as complete.';
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
    },
    [hunt, completeHunt]
  );

  const handleReactivateHunt = useCallback(async () => {
    if (!hunt) return;
    await reactivateHunt(hunt.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setToastMessage('Hunt reactivated!');
    setTimeout(() => setToastMessage(null), 3000);
  }, [hunt, reactivateHunt]);

  if (!hunt) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Hunt Details' }} />
        <EmptyState
          icon={Home}
          title="Hunt not found"
          description="This hunt doesn't exist or you don't have access to it."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: hunt.name,
          headerRight: () => (
            <View style={styles.headerRightRow}>
              <TouchableOpacity
                onPress={() => console.log('Edit hunt pressed')}
                style={styles.headerButton}
              >
                <Pencil size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowShareModal(true)}
                style={styles.headerButton}
              >
                <Share2 size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <View style={[styles.infoBar, isWide && { paddingHorizontal: 40 }]}>
        <View style={styles.infoBarLeft}>
          <View style={styles.infoBarRow}>
            <Users size={14} color={colors.textSecondary} />
            <Text style={styles.infoBarText}>
              {members.length} member{members.length !== 1 ? 's' : ''} · {apartments.length} listing{apartments.length !== 1 ? 's' : ''}
            </Text>
          </View>
          {moveDateFormatted && (
            <View style={[styles.infoBarRow, { marginTop: 4 }]}>
              <Calendar size={14} color={colors.textSecondary} />
              <Text style={styles.infoBarText}>Move by {moveDateFormatted}</Text>
            </View>
          )}
          {!isActive && hunt.completedAt && (
            <Text style={styles.completedInfo}>
              Completed {new Date(hunt.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {hunt.completionReason === 'found_place' ? ' · Found a place' : ' · Search ended'}
            </Text>
          )}
          {chosenApartment && (
            <TouchableOpacity
              style={styles.chosenBanner}
              onPress={() => handleApartmentPress(chosenApartment.id)}
              activeOpacity={0.7}
            >
              <CheckCircle2 size={14} color={colors.primary} />
              <Text style={styles.chosenText} numberOfLines={1}>
                Chose: {chosenApartment.address}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.statusChip, isActive ? styles.statusChipActive : styles.statusChipCompleted]}
          onPress={isActive ? () => setShowCompletionModal(true) : handleReactivateHunt}
          activeOpacity={0.7}
        >
          {isActive ? (
            <>
              <View style={styles.activeIndicator} />
              <Text style={styles.statusChipActiveText}>Active</Text>
            </>
          ) : (
            <>
              <RotateCcw size={14} color={colors.textSecondary} />
              <Text style={styles.statusChipCompletedText}>Reactivate</Text>
            </>
          )}
        </TouchableOpacity>
      </View>



      <FilterBar
        statusFilter={statusFilter}
        sortOption={sortOption}
        onStatusFilterPress={() => setShowStatusModal(true)}
        onSortPress={() => setShowSortModal(true)}
      />

      {filteredApartments.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, isWide && styles.scrollContentWide]}
          showsVerticalScrollIndicator={false}
        >
          {filteredApartments.map((apartment) => (
            <ApartmentCard
              key={apartment.id}
              apartment={apartment}
              onPress={() => handleApartmentPress(apartment.id)}
            />
          ))}
        </ScrollView>
      ) : (
        <EmptyState
          icon={Home}
          title={statusFilter !== 'All' ? 'No matching listings' : 'No listings yet'}
          description={
            statusFilter !== 'All'
              ? 'Try changing your filters to see more results.'
              : 'Add your first apartment listing to get started!'
          }
        />
      )}

      {isActive && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddApartment}
          activeOpacity={0.9}
          testID="add-apartment-fab"
        >
          <Plus size={24} color={colors.textInverse} />
        </TouchableOpacity>
      )}

      {toastMessage && (
        <View style={styles.toast}>
          <CheckCircle2 size={18} color={colors.textInverse} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <HuntCompletionModal
        visible={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onComplete={handleCompleteHunt}
        apartments={apartments}
      />

      <Modal
        visible={showStatusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowStatusModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Status</Text>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.modalOption, statusFilter === status && styles.modalOptionSelected]}
                onPress={() => {
                  setStatusFilter(status);
                  setShowStatusModal(false);
                }}
              >
                <Text style={[styles.modalOptionText, statusFilter === status && styles.modalOptionTextSelected]}>
                  {status === 'FinalChoice' ? 'Final Choice' : status}
                </Text>
                {statusFilter === status && <Check size={18} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSortModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort By</Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.modalOption, sortOption === option.value && styles.modalOptionSelected]}
                onPress={() => {
                  setSortOption(option.value);
                  setShowSortModal(false);
                }}
              >
                <Text style={[styles.modalOptionText, sortOption === option.value && styles.modalOptionTextSelected]}>
                  {option.label}
                </Text>
                {sortOption === option.value && <Check size={18} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showShareModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowShareModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowShareModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invite to Hunt</Text>
            <Text style={styles.shareDescription}>
              Share this code to invite others to your hunt:
            </Text>
            <View style={styles.inviteCodeContainer}>
              <Text style={styles.inviteCode}>{hunt.inviteCode}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyInviteCode}
                activeOpacity={0.7}
              >
                {copied ? (
                  <Check size={20} color={colors.success} />
                ) : (
                  <Copy size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            </View>
            {copied && <Text style={styles.copiedText}>Copied to clipboard!</Text>}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerButton: {
    padding: 8,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoBarLeft: {
    flex: 1,
    marginRight: 12,
  },
  infoBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoBarText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  completedInfo: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },
  chosenBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  chosenText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500' as const,
    flex: 1,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusChipActive: {
    backgroundColor: colors.primaryLight,
  },
  statusChipCompleted: {
    backgroundColor: colors.surfaceSecondary,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  statusChipActiveText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  statusChipCompletedText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionPillText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  scrollContentWide: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  toast: {
    position: 'absolute',
    bottom: 96,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.text,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textInverse,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 16,
    fontFamily: fonts.dmSansSemiBold,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  modalOptionSelected: {
    backgroundColor: colors.primaryLight,
  },
  modalOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  modalOptionTextSelected: {
    color: colors.primary,
    fontWeight: '500' as const,
  },
  shareDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  inviteCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
  },
  inviteCode: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: 2,
  },
  copyButton: {
    padding: 8,
  },
  copiedText: {
    fontSize: 13,
    color: colors.success,
    marginTop: 8,
    textAlign: 'center' as const,
  },
});
