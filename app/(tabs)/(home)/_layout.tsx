import { Stack } from 'expo-router';
import colors from '@/constants/colors';
import { fonts } from '@/constants/fonts';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontFamily: fonts.dmSansSemiBold },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="apartment/[apartmentId]"
        options={{
          title: 'Details',
        }}
      />
    </Stack>
  );
}
