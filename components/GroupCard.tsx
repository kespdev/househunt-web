import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Users, Home, ChevronRight } from 'lucide-react-native';
import { Group, User } from '@/types';
import colors from '@/constants/colors';
import { fonts } from '@/constants/fonts';

interface GroupCardProps {
  group: Group;
  members: User[];
  apartmentCount: number;
  onPress: () => void;
}

export default function GroupCard({
  group,
  members,
  apartmentCount,
  onPress,
}: GroupCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      testID="group-card"
    >
      <View style={styles.iconContainer}>
        <Home size={24} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{group.name}</Text>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Users size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{members.length} members</Text>
          </View>
          <View style={styles.metaDot} />
          <Text style={styles.metaText}>{apartmentCount} listings</Text>
        </View>
      </View>
      <ChevronRight size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
    fontFamily: fonts.dmSansSemiBold,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textTertiary,
    marginHorizontal: 8,
  },
});
