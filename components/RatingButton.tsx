import React from 'react';
import { Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Heart, HelpCircle, X } from 'lucide-react-native';
import { RatingValue } from '@/types';
import colors from '@/constants/colors';

interface RatingButtonProps {
  value: RatingValue;
  isSelected: boolean;
  onPress: () => void;
  size?: 'small' | 'large';
}

const getConfig = (value: RatingValue) => {
  switch (value) {
    case 'Love':
      return {
        icon: Heart,
        color: colors.love,
        bgColor: colors.loveLight,
        label: 'Love',
      };
    case 'Maybe':
      return {
        icon: HelpCircle,
        color: colors.maybe,
        bgColor: colors.maybeLight,
        label: 'Maybe',
      };
    case 'Pass':
      return {
        icon: X,
        color: colors.pass,
        bgColor: colors.passLight,
        label: 'Pass',
      };
  }
};

export default function RatingButton({
  value,
  isSelected,
  onPress,
  size = 'large',
}: RatingButtonProps) {
  const { width } = useWindowDimensions();
  const isSmall = width < 380;
  const config = getConfig(value);
  const Icon = config.icon;
  const iconSize = size === 'large' ? (isSmall ? 20 : 24) : 18;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        size === 'small' && styles.buttonSmall,
        isSmall && { paddingVertical: 10, paddingHorizontal: 10, gap: 4 },
        isSelected && { backgroundColor: config.bgColor, borderColor: config.color },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      testID={`rating-button-${value.toLowerCase()}`}
    >
      <Icon
        size={iconSize}
        color={isSelected ? config.color : colors.textSecondary}
        fill={value === 'Love' && isSelected ? config.color : 'transparent'}
      />
      {size === 'large' && (
        <Text
          style={[
            styles.label,
            isSmall && { fontSize: 13 },
            isSelected && { color: config.color, fontWeight: '600' as const },
          ]}
        >
          {config.label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  buttonSmall: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 4,
  },
  label: {
    fontSize: 15,
    color: colors.textSecondary,
  },
});
