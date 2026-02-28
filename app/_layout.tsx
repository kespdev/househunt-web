import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from "@expo-google-fonts/dm-sans";
import { AppProvider } from "@/contexts/AppContext";
import colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync().catch(() => {
  console.log('SplashScreen preventAutoHideAsync failed');
});

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "",
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="create-group"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="join-group"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="add-apartment"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="hunt/[huntId]"
        options={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError || timeoutReached) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, timeoutReached]);

  if (!fontsLoaded && !fontError && !timeoutReached) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />
        <AppProvider>
          <RootLayoutNav />
        </AppProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
