import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, Redirect, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { StatusBar, ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from "@expo-google-fonts/dm-sans";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync().catch(() => {
  console.log('SplashScreen preventAutoHideAsync failed');
});

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const segments = useSegments();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const inAuthGroup = segments[0] === '(auth)';

  if (!session && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  }

  if (session && inAuthGroup) {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <AuthGate>
      <AppProvider>
        <Stack
          screenOptions={{
            headerBackTitle: "",
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
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
            name="edit-apartment"
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
      </AppProvider>
    </AuthGate>
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
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
