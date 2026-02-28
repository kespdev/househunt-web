import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { CheckCircle, Home, XCircle, ChevronRight } from 'lucide-react-native';
import { ApartmentWithMeta, CompletionReason } from '@/types';
import colors from '@/constants/colors';
import { fonts } from '@/constants/fonts';

interface HuntCompletionModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (reason: CompletionReason, chosenApartmentId?: string) => void;
  apartments: ApartmentWithMeta[];
}

type Step = 'reason' | 'select_listing';

export default function HuntCompletionModal({
  visible,
  onClose,
  onComplete,
  apartments,
}: HuntCompletionModalProps) {
  const [step, setStep] = useState<Step>('reason');

  const handleReasonSelect = (reason: CompletionReason) => {
    if (reason === 'found_place') {
      setStep('select_listing');
    } else {
      onComplete('stopped_searching');
      resetAndClose();
    }
  };

  const handleListingSelect = (apartmentId: string | null) => {
    onComplete('found_place', apartmentId ?? undefined);
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep('reason');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={resetAndClose}
    >
      <Pressable style={styles.overlay} onPress={resetAndClose}>
        <View style={styles.content} onStartShouldSetResponder={() => true}>
          {step === 'reason' && (
            <>
              <View style={styles.headerIcon}>
                <CheckCircle size={32} color={colors.primary} />
              </View>
              <Text style={styles.title}>Complete this hunt?</Text>
              <Text style={styles.subtitle}>
                What happened with your search?
              </Text>

              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => handleReasonSelect('found_place')}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, { backgroundColor: colors.primaryLight }]}>
                  <Home size={22} color={colors.primary} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Found a place</Text>
                  <Text style={styles.optionDesc}>We found our new home!</Text>
                </View>
                <ChevronRight size={20} color={colors.textTertiary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => handleReasonSelect('stopped_searching')}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, { backgroundColor: colors.surfaceSecondary }]}>
                  <XCircle size={22} color={colors.textSecondary} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Ended the search</Text>
                  <Text style={styles.optionDesc}>We're no longer looking</Text>
                </View>
                <ChevronRight size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </>
          )}

          {step === 'select_listing' && (
            <>
              <Text style={styles.title}>Which place did you choose?</Text>
              <Text style={styles.subtitle}>
                Select the listing you went with
              </Text>

              <ScrollView
                style={styles.listingScroll}
                showsVerticalScrollIndicator={false}
              >
                {apartments.map((apt) => (
                  <TouchableOpacity
                    key={apt.id}
                    style={styles.listingOption}
                    onPress={() => handleListingSelect(apt.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.listingInfo}>
                      <Text style={styles.listingAddress} numberOfLines={1}>
                        {apt.address}
                      </Text>
                      <Text style={styles.listingPrice}>
                        ${apt.price.toLocaleString()}/mo
                      </Text>
                    </View>
                    <ChevronRight size={18} color={colors.textTertiary} />
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[styles.listingOption, styles.noneOption]}
                  onPress={() => handleListingSelect(null)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.noneText}>None of these</Text>
                </TouchableOpacity>
              </ScrollView>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep('reason')}
                activeOpacity={0.7}
              >
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    maxHeight: '80%',
  },
  headerIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center' as const,
    marginBottom: 6,
    fontFamily: fonts.dmSansBold,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: 24,
    lineHeight: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
    fontFamily: fonts.dmSansSemiBold,
  },
  optionDesc: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  listingScroll: {
    maxHeight: 300,
  },
  listingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  listingInfo: {
    flex: 1,
  },
  listingAddress: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
    marginBottom: 2,
  },
  listingPrice: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  noneOption: {
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
  },
  noneText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  backButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  backText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '500' as const,
  },
});
