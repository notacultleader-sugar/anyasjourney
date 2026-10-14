import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useLayoutEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebPage, type WebPageHandle } from '@/components/WebPage';
import { config } from '@/constants/config';
import { colors, fonts, spacing } from '@/constants/theme';

// Announcements: the charity's events page in an in-app browser window, so new
// events show up as soon as they are posted on the website.
export default function EventsScreen() {
  const page = useRef<WebPageHandle>(null);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => page.current?.reload()}
          accessibilityRole="button"
          accessibilityLabel="Refresh events"
          hitSlop={12}
          style={{ marginRight: spacing.md }}
        >
          <MaterialCommunityIcons name="refresh" size={24} color={colors.gold} />
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          All events and fundraisers support our playground building efforts!
        </Text>
      </View>
      <WebPage ref={page} url={config.eventsUrl} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  banner: {
    backgroundColor: colors.goldPale,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  bannerText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.heading,
    textAlign: 'center',
  },
});
