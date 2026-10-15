import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import type { ComponentProps } from 'react';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';

type Props = {
  title: string;
  body: string;
  icon?: ComponentProps<typeof MaterialCommunityIcons>['name'];
};

// Pop-up over a screen saying it's a placeholder. Shows again every time the
// screen is opened; OK hides it so the screen underneath can be seen.
export function PlaceholderNotice({ title, body, icon = 'hammer-wrench' }: Props) {
  const [visible, setVisible] = useState(true);
  useFocusEffect(useCallback(() => setVisible(true), []));
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Card style={styles.panel}>
        <MaterialCommunityIcons name={icon} size={40} color={colors.gold} />
        <Text style={styles.eyebrow}>PLACEHOLDER</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        <Button label="OK" onPress={() => setVisible(false)} style={{ alignSelf: 'stretch' }} />
      </Card>
    </View>
  );
}

// Small strip that stays on the page after the pop-up is closed.
export function PlaceholderBanner({ children }: { children: string }) {
  return (
    <View style={styles.banner}>
      <MaterialCommunityIcons name="information-outline" size={16} color={colors.heading} />
      <Text style={styles.bannerText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 50,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  panel: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderColor: colors.gold,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  eyebrow: { fontFamily: fonts.bodyMedium, fontSize: 12, letterSpacing: 3, color: colors.gold },
  title: { fontFamily: fonts.heading, fontSize: 24, color: colors.heading, textAlign: 'center' },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.goldPale,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  bannerText: { flexShrink: 1, fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 17, color: colors.heading },
});
