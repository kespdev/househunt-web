import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const fonts = {
  dmSans: isWeb ? '"DM Sans", sans-serif' : 'DMSans_400Regular',
  dmSansMedium: isWeb ? '"DM Sans", sans-serif' : 'DMSans_500Medium',
  dmSansSemiBold: isWeb ? '"DM Sans", sans-serif' : 'DMSans_600SemiBold',
  dmSansBold: isWeb ? '"DM Sans", sans-serif' : 'DMSans_700Bold',
};
