import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { ApartmentStatus } from '@/types';
import colors from '@/constants/colors';

interface StatusPickerProps {
  currentStatus: ApartmentStatus;
  onStatusChange: (status: ApartmentStatus) => void;
}

const statuses: { value: ApartmentStatus; label: string; color: string }[] = [
  { value: 'New', label: 'New', color: colors.statusNew },
  { value: 'Shortlist', label: 'Shortlist', color: colors.statusShortlist },
  { value: 'Tour', label: 'Tour', color: colors.statusTour },
  { value: 'Rejected', label: 'Rejected', color: colors.statusRejected },
  { value: 'FinalChoice', label: 'Final Choice', color: colors.statusFinal },
];

export default function StatusPicker({ currentStatus, onStatusChange }: StatusPickerProps) {
  const { width } = useWindowDimensions();
  const isSmall = width < 380;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, isSmall && { paddingHorizontal: 12 }]}
    >
      {statuses.map((status) => {
        const isSelected = currentStatus === status.value;
        return (
          <TouchableOpacity
            key={status.value}
            style={[
              styles.chip,
              isSmall && { paddingHorizontal: 12, paddingVertical: 6 },
              isSelected && { backgroundColor: status.color },
            ]}
            onPress={() => onStatusChange(status.value)}
            activeOpacity={0.7}
            testID={`status-${status.value.toLowerCase()}`}
          >
            <Text
              style={[
                styles.chipText,
                isSmall && { fontSize: 12 },
                isSelected && styles.chipTextSelected,
              ]}
            >
              {status.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.textInverse,
  },
});
