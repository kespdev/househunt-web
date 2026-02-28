import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
  Modal,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { X, Search, Calendar, ChevronDown, Check, Home, Key } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import colors from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { HuntType } from '@/types';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const currentYear = new Date().getFullYear();
const YEARS = [currentYear, currentYear + 1, currentYear + 2];

const DAYS_IN_MONTH = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export default function CreateHuntScreen() {
  const router = useRouter();
  const { createGroup } = useApp();
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const isSmall = width < 380;
  const isWide = width >= 768;

  const [huntName, setHuntName] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [huntType, setHuntType] = useState<HuntType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formattedMoveDate = selectedMonth !== null
    ? selectedDay !== null
      ? `${MONTHS[selectedMonth]} ${selectedDay}, ${selectedYear}`
      : `${MONTHS[selectedMonth]} ${selectedYear}`
    : null;

  const moveDateISO = selectedMonth !== null
    ? new Date(selectedYear, selectedMonth, 1).toISOString()
    : undefined;

  const moveExactDateISO = selectedMonth !== null && selectedDay !== null
    ? new Date(selectedYear, selectedMonth, selectedDay).toISOString()
    : undefined;

  const daysArray = selectedMonth !== null
    ? Array.from({ length: DAYS_IN_MONTH(selectedMonth, selectedYear) }, (_, i) => i + 1)
    : [];

  const handleSubmit = async () => {
    if (!huntName.trim()) {
      Alert.alert('Error', 'Please enter a hunt name');
      return;
    }

    if (!huntType) {
      Alert.alert('Error', 'Please select whether you are looking to rent or buy');
      return;
    }

    setIsSubmitting(true);
    try {
      const newHunt = await createGroup(huntName.trim(), moveDateISO, moveExactDateISO, huntType);
      if (Platform.OS === 'web') {
        window.alert(`Hunt Created!\n\nShare this invite code with others:\n${newHunt.inviteCode}`);
        router.replace('/');
      } else {
        Alert.alert(
          'Hunt Created!',
          `Share this invite code with others:\n\n${newHunt.inviteCode}`,
          [{ text: 'Done', onPress: () => router.dismiss() }]
        );
      }
    } catch {
      if (Platform.OS === 'web') {
        window.alert('Failed to create hunt. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to create hunt. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectDay = (day: number) => {
    if (selectedDay === day) {
      setSelectedDay(null);
    } else {
      setSelectedDay(day);
    }
  };

  const handleMonthSelect = (index: number) => {
    setSelectedMonth(index);
    setSelectedDay(null);
  };



  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'New Hunt',
          presentation: 'modal',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isWide && styles.scrollContentWide]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.iconContainer, isSmall && { width: 72, height: 72, borderRadius: 36 }]}>
          <Search size={48} color={colors.primary} />
        </View>

        <Text style={[styles.title, isSmall && { fontSize: 20 }]}>Start a New Hunt</Text>
        <Text style={styles.description}>
          Create a hunt to start searching for apartments with your roommates.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hunt Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Downtown Apartment Hunt"
            placeholderTextColor={colors.textTertiary}
            value={huntName}
            onChangeText={setHuntName}
            maxLength={50}

          />
          <Text style={styles.hint}>
            Choose something descriptive so you can easily identify this search.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Are you looking to rent or buy?</Text>
          <View style={[styles.huntTypeRow, isSmall && { flexDirection: 'column' }]}>
            <TouchableOpacity
              style={[styles.huntTypeOption, huntType === 'rent' && styles.huntTypeOptionSelected]}
              onPress={() => setHuntType('rent')}
              activeOpacity={0.7}
            >
              <Key size={20} color={huntType === 'rent' ? colors.primary : colors.textTertiary} />
              <Text style={[styles.huntTypeText, huntType === 'rent' && styles.huntTypeTextSelected]}>
                Rent
              </Text>
              {huntType === 'rent' && <Check size={16} color={colors.primary} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.huntTypeOption, huntType === 'buy' && styles.huntTypeOptionSelected]}
              onPress={() => setHuntType('buy')}
              activeOpacity={0.7}
            >
              <Home size={20} color={huntType === 'buy' ? colors.primary : colors.textTertiary} />
              <Text style={[styles.huntTypeText, huntType === 'buy' && styles.huntTypeTextSelected]}>
                Buy
              </Text>
              {huntType === 'buy' && <Check size={16} color={colors.primary} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Intended Move Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Calendar size={20} color={formattedMoveDate ? colors.primary : colors.textTertiary} />
            <Text style={[styles.dateButtonText, !formattedMoveDate && styles.dateButtonPlaceholder]}>
              {formattedMoveDate ?? 'Select month & year'}
            </Text>
            <ChevronDown size={18} color={colors.textTertiary} />
          </TouchableOpacity>
          <Text style={styles.hint}>
            When are you looking to move in? This helps keep your hunt on track.
          </Text>
          {formattedMoveDate && (
            <TouchableOpacity
              onPress={() => { setSelectedMonth(null); setSelectedDay(null); }}
              activeOpacity={0.7}
              style={styles.clearDate}
            >
              <Text style={styles.clearDateText}>Clear date</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Creating...' : 'Create Hunt'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDatePicker(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Select Move Date</Text>

            <Text style={styles.modalSectionLabel}>Year</Text>
            <View style={styles.yearRow}>
              {YEARS.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[styles.yearChip, selectedYear === year && styles.yearChipSelected]}
                  onPress={() => { setSelectedYear(year); setSelectedDay(null); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.yearChipText, selectedYear === year && styles.yearChipTextSelected]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalSectionLabel}>Month</Text>
            <View style={styles.monthGrid}>
              {MONTHS.map((month, index) => (
                <TouchableOpacity
                  key={month}
                  style={[styles.monthChip, selectedMonth === index && styles.monthChipSelected]}
                  onPress={() => handleMonthSelect(index)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.monthChipText, selectedMonth === index && styles.monthChipTextSelected]}>
                    {month.substring(0, 3)}
                  </Text>
                  {selectedMonth === index && (
                    <Check size={14} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {selectedMonth !== null && (
              <>
                <Text style={[styles.modalSectionLabel, { marginTop: 16 }]}>
                  Exact Date <Text style={styles.optionalTag}>(optional)</Text>
                </Text>
                <ScrollView style={styles.dayScroll} showsVerticalScrollIndicator={false}>
                  <View style={styles.dayGrid}>
                    {daysArray.map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[styles.dayChip, selectedDay === day && styles.dayChipSelected]}
                        onPress={() => handleSelectDay(day)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.dayChipText, selectedDay === day && styles.dayChipTextSelected]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}

            <TouchableOpacity
              style={styles.modalDoneButton}
              onPress={() => setShowDatePicker(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalDoneButtonText}>
                {selectedMonth !== null ? 'Done' : 'Cancel'}
              </Text>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  scrollContentWide: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  bottomSpacer: {
    height: 20,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center' as const,
    marginBottom: 8,
    fontFamily: fonts.dmSansBold,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
    fontFamily: fonts.dmSansSemiBold,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 17,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hint: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 8,
  },
  huntTypeRow: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  huntTypeOption: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  huntTypeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  huntTypeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    fontFamily: fonts.dmSansMedium,
  },
  huntTypeTextSelected: {
    color: colors.primary,
    fontWeight: '600' as const,
    fontFamily: fonts.dmSansSemiBold,
  },
  dateButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 17,
    color: colors.text,
    fontFamily: fonts.dmSans,
  },
  dateButtonPlaceholder: {
    color: colors.textTertiary,
  },
  clearDate: {
    marginTop: 6,
    alignSelf: 'flex-start' as const,
  },
  clearDateText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500' as const,
    fontFamily: fonts.dmSansMedium,
  },
  footer: {
    paddingTop: 12,
    paddingHorizontal: 0,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.textInverse,
    fontSize: 17,
    fontWeight: '600' as const,
    fontFamily: fonts.dmSansSemiBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%' as const,
    maxWidth: 340,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 20,
    fontFamily: fonts.dmSansBold,
  },
  modalSectionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textTertiary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 10,
    fontFamily: fonts.dmSansSemiBold,
  },
  optionalTag: {
    fontSize: 11,
    fontWeight: '400' as const,
    color: colors.textTertiary,
    textTransform: 'none' as const,
    letterSpacing: 0,
  },
  yearRow: {
    flexDirection: 'row' as const,
    gap: 10,
    marginBottom: 20,
  },
  yearChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center' as const,
  },
  yearChipSelected: {
    backgroundColor: colors.primaryLight,
  },
  yearChipText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    fontFamily: fonts.dmSansSemiBold,
  },
  yearChipTextSelected: {
    color: colors.primary,
  },
  monthGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  monthChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.surfaceSecondary,
  },
  monthChipSelected: {
    backgroundColor: colors.primaryLight,
  },
  monthChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    fontFamily: fonts.dmSansMedium,
  },
  monthChipTextSelected: {
    color: colors.primary,
    fontWeight: '600' as const,
    fontFamily: fonts.dmSansSemiBold,
  },
  dayScroll: {
    maxHeight: 160,
  },
  dayGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 6,
  },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  dayChipSelected: {
    backgroundColor: colors.primary,
  },
  dayChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    fontFamily: fonts.dmSansMedium,
  },
  dayChipTextSelected: {
    color: colors.textInverse,
    fontWeight: '600' as const,
    fontFamily: fonts.dmSansSemiBold,
  },
  modalDoneButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center' as const,
    marginTop: 20,
  },
  modalDoneButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '600' as const,
    fontFamily: fonts.dmSansSemiBold,
  },
});
