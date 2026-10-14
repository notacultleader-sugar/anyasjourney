import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';

export function SectionHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <View style={styles.heading}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rule} />
    </View>
  );
}

export function Body({ children }: { children: ReactNode }) {
  return <Text style={styles.body}>{children}</Text>;
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'gold' | 'dark' | 'outline';
  icon?: ComponentProps<typeof MaterialCommunityIcons>['name'];
  style?: ViewStyle;
};

export function Button({ label, onPress, variant = 'gold', icon, style }: ButtonProps) {
  const outline = variant === 'outline';
  const fg = outline ? colors.gold : colors.white;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'gold' && { backgroundColor: pressed ? colors.goldLight : colors.gold },
        variant === 'dark' && { backgroundColor: pressed ? colors.gold : colors.button },
        outline && styles.outline,
        outline && pressed && { backgroundColor: colors.goldPale },
        style,
      ]}
    >
      {icon ? <MaterialCommunityIcons name={icon} size={20} color={fg} /> : null}
      <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  heading: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.gold,
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: colors.heading,
    textAlign: 'center',
  },
  rule: {
    width: 48,
    height: 3,
    backgroundColor: colors.gold,
    marginTop: spacing.sm,
    borderRadius: 2,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 26,
    color: colors.text,
    marginBottom: spacing.md,
  },
  button: {
    minHeight: 50,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  outline: {
    borderWidth: 2,
    borderColor: colors.gold,
    backgroundColor: colors.white,
  },
  buttonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
