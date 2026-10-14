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
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { colors, fonts } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
        screenOptions={{
          tabBarActiveTintColor: colors.gold,
          tabBarInactiveTintColor: colors.nav,
          tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16 },
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor: colors.border,
            ...(Platform.OS === 'web' ? { height: 62, paddingBottom: 6 } : null),
          },
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
            headerTitle: 'Accessible Playgrounds',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="map-marker-radius" color={color} size={size} />
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
    </>
  );
}
