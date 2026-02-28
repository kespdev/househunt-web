import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SlidersHorizontal, ChevronDown } from 'lucide-react-native';
import { FilterStatus, SortOption } from '@/types';
import colors from '@/constants/colors';

interface FilterBarProps {
  statusFilter: FilterStatus;
  sortOption: SortOption;
  onStatusFilterPress: () => void;
  onSortPress: () => void;
}

const getStatusLabel = (status: FilterStatus) => {
  if (status === 'All') return 'All Status';
  if (status === 'FinalChoice') return 'Final Choice';
  return status;
};

const getSortLabel = (sort: SortOption) => {
  switch (sort) {
    case 'price_asc':
      return 'Price ↑';
    case 'price_desc':
      return 'Price ↓';
    case 'rating':
      return 'Rating';
    case 'date_added':
      return 'Newest';
    default:
      return 'Sort';
  }
};

export default function FilterBar({
  statusFilter,
  sortOption,
  onStatusFilterPress,
  onSortPress,
}: FilterBarProps) {
  const { width } = useWindowDimensions();
  const isSmall = width < 380;

  return (
    <View style={[styles.container, isSmall && { paddingHorizontal: 12, gap: 6 }]}>
      <TouchableOpacity
        style={[styles.filterButton, statusFilter !== 'All' && styles.filterActive, isSmall && { paddingHorizontal: 10, paddingVertical: 6 }]}
        onPress={onStatusFilterPress}
        activeOpacity={0.7}
      >
        <SlidersHorizontal size={isSmall ? 14 : 16} color={statusFilter !== 'All' ? colors.primary : colors.textSecondary} />
        <Text style={[styles.filterText, statusFilter !== 'All' && styles.filterTextActive, isSmall && { fontSize: 12 }]}>
          {getStatusLabel(statusFilter)}
        </Text>
        <ChevronDown size={isSmall ? 14 : 16} color={statusFilter !== 'All' ? colors.primary : colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.filterButton, isSmall && { paddingHorizontal: 10, paddingVertical: 6 }]}
        onPress={onSortPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterText, isSmall && { fontSize: 12 }]}>{getSortLabel(sortOption)}</Text>
        <ChevronDown size={isSmall ? 14 : 16} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  filterText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
});
