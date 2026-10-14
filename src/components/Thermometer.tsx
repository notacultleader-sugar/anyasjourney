import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { formatCurrency } from '@/data/equipment';
import { useFundraising } from '@/hooks/useFundraising';
import { CauseVoxThermometer, GoalHeading } from './CauseVoxThermometer';

// Fundraising thermometer drawn to match the CauseVox one on the charity's
// website, showing the same total.
export function Thermometer({ compact = false }: { compact?: boolean }) {
  const { data, loading, isLive, refresh } = useFundraising();
  const pct = Math.max(0, Math.min(1, data.raised / data.goal));
  const fill = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fill, { toValue: pct, duration: 900, useNativeDriver: false }).start();
  }, [pct, fill]);

  const scale = compact ? 0.7 : 0.9;

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityLabel={`${formatCurrency(data.raised)} raised of ${formatCurrency(data.goal)} goal`}
    >
      <GoalHeading scale={scale}>{`GOAL: ${formatCurrency(data.goal)}`}</GoalHeading>
      <View style={{ height: spacing.md * scale }} />
      <CauseVoxThermometer
        progress={fill}
        pctLabel={`${Math.round(pct * 100)}%`}
        amountLabel={formatCurrency(data.raised)}
        scale={scale}
      />
      <Text style={styles.title}>{data.title}</Text>
      {loading ? (
        <ActivityIndicator color={colors.gold} />
      ) : isLive ? (
        <Pressable onPress={refresh} accessibilityRole="button">
          <Text style={styles.updated}>{data.updated ? `Updated ${data.updated} · tap to refresh` : 'Tap to refresh'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.heading,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  updated: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
  },
});
