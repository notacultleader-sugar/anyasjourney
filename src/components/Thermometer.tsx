import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { config } from '@/constants/config';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { formatCurrency } from '@/data/equipment';
import { useFundraising } from '@/hooks/useFundraising';

// Fundraising thermometer, drawn natively and fed by a JSON file on the
// charity's website so the total stays current.
export function Thermometer({ compact = false }: { compact?: boolean }) {
  const { data, loading, isLive, refresh } = useFundraising();
  const pct = Math.max(0, Math.min(1, data.raised / data.goal));
  const fill = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fill, { toValue: pct, duration: 900, useNativeDriver: false }).start();
  }, [pct, fill]);

  const height = compact ? 160 : 240;
  const fillHeight = fill.interpolate({ inputRange: [0, 1], outputRange: [0, height] });

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityLabel={`${formatCurrency(data.raised)} raised of ${formatCurrency(data.goal)} goal`}
    >
      <View style={styles.row}>
        <View style={styles.thermo}>
          <View style={[styles.tube, { height }]}>
            <Animated.View style={[styles.fill, { height: fillHeight }]} />
          </View>
          <View style={styles.bulb} />
        </View>

        <View style={styles.info}>
          <Text style={styles.label}>FUNDRAISING GOAL</Text>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.raised}>{formatCurrency(data.raised)}</Text>
          <Text style={styles.of}>raised of {formatCurrency(data.goal)}</Text>
          <Text style={styles.pct}>{Math.round(pct * 100)}% of the way there</Text>
          {loading ? (
            <ActivityIndicator color={colors.gold} style={{ alignSelf: 'flex-start' }} />
          ) : (
            <Pressable onPress={refresh} accessibilityRole="button">
              <Text style={styles.updated}>
                {isLive
                  ? data.updated
                    ? `Updated ${data.updated} · tap to refresh`
                    : 'Tap to refresh'
                  : config.previewMode
                    ? 'Sample figures (preview)'
                    : "Couldn't load the latest total · tap to retry"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.goldPale,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  thermo: {
    alignItems: 'center',
  },
  tube: {
    width: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.gold,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.gold,
    width: '100%',
  },
  bulb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gold,
    marginTop: -8,
  },
  info: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.gold,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.heading,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  raised: {
    fontFamily: fonts.heading,
    fontSize: 34,
    color: colors.heading,
  },
  of: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
  },
  pct: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.gold,
    marginVertical: spacing.sm,
  },
  updated: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
  },
});
