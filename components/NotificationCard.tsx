import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, DollarSign } from 'lucide-react-native';
import { Notification } from '@/types';
import colors from '@/constants/colors';
import { fonts } from '@/constants/fonts';

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
}

export default function NotificationCard({ notification, onPress }: NotificationCardProps) {
  const priceText = notification.apartmentPrice
    ? `$${notification.apartmentPrice.toLocaleString()}/mo`
    : '';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.65}
    >
      <View style={styles.dot} />
      <View style={styles.body}>
        <Text style={styles.message} numberOfLines={2}>
          <Text style={styles.actorName}>{notification.actorName ?? 'Someone'}</Text>
          {' added a new listing to '}
          <Text style={styles.groupName}>{notification.groupName ?? 'a hunt'}</Text>
        </Text>
        {notification.apartmentAddress && (
          <View style={styles.detailRow}>
            <MapPin size={12} color={colors.textTertiary} />
            <Text style={styles.detailText} numberOfLines={1}>
              {notification.apartmentAddress}
            </Text>
            {priceText ? (
              <>
                <View style={styles.metaDot} />
                <DollarSign size={12} color={colors.textTertiary} />
                <Text style={styles.detailText}>{priceText}</Text>
              </>
            ) : null}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  body: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  actorName: {
    fontWeight: '600',
    fontFamily: fonts.dmSansSemiBold,
  },
  groupName: {
    fontWeight: '600',
    fontFamily: fonts.dmSansSemiBold,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  detailText: {
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
});
