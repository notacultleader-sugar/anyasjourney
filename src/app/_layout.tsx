import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router/js-tabs';
import * as Haptics from 'expo-haptics';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingScreen } from '@/components/LoadingScreen';
import { colors, fonts } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  const [showLoader, setShowLoader] = useState(true);
  const hideLoader = useCallback(() => setShowLoader(false), []);
  const [loaded, error] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        screenListeners={{
          tabPress: () => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
          },
        }}
        screenOptions={{
          tabBarActiveTintColor: colors.gold,
          tabBarInactiveTintColor: colors.nav,
          tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11, lineHeight: 15 },
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor: colors.border,
            // The web build needs a little extra room for labels and the home bar.
            ...(Platform.OS === 'web' ? { height: 60 + insets.bottom, paddingBottom: 6 + insets.bottom } : null),
          },
          // Native-style slide between tabs.
          animation: 'shift',
          headerTitleStyle: { fontFamily: fonts.heading, fontSize: 20, color: colors.heading },
          headerStyle: { backgroundColor: colors.white },
          headerShadowVisible: false,
          headerTitleAlign: 'center',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home-heart" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: 'Events',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="calendar-star" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="playgrounds"
          options={{
            title: 'Playgrounds',
            tabBarLabel: 'Parks',
            headerTitle: 'Accessible Playgrounds',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="map-marker-radius" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="wine-survivor"
          options={{
            title: 'Wine Survivor',
            tabBarLabel: 'Survivor',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="glass-wine" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="donate"
          options={{
            title: 'Donate',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="hand-heart" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
      {showLoader ? <LoadingScreen onDone={hideLoader} /> : null}
    </>
  );
}
