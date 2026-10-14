import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { config } from '@/constants/config';
import { colors, fonts, spacing } from '@/constants/theme';
import { formatCurrency } from '@/data/equipment';
import { useFundraising } from '@/hooks/useFundraising';

const MIN_MS = 2200; // long enough to watch the fill
const MAX_WAIT_MS = 2500; // stop waiting for the total and fill to what we have

// Opening screen: a thermometer that fills to the current fundraising total
// while the app starts, then fades away.
export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const { data, loading, isLive } = useFundraising();
  const fill = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const [target, setTarget] = useState<{ raised: number; goal: number } | null>(null);
  const [shown, setShown] = useState(0);
  const started = useRef(Date.now());

  // Pick the numbers once the total arrives, or after a short wait.
  useEffect(() => {
    if (target) return;
    const choose = () => setTarget({ raised: data.raised, goal: data.goal });
    if (!loading) choose();
    const t = setTimeout(choose, MAX_WAIT_MS);
    return () => clearTimeout(t);
  }, [loading, isLive, data, target]);

  // Fill, count up, hold, fade out.
  useEffect(() => {
    if (!target) return;
    const pct = Math.max(0.02, Math.min(1, target.raised / target.goal));
    const listener = fill.addListener(({ value }) => setShown(Math.round((value / pct) * target.raised)));
    Animated.timing(fill, {
      toValue: pct,
      duration: 1400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      setShown(target.raised);
      const wait = Math.max(500, MIN_MS - (Date.now() - started.current));
      setTimeout(() => {
        Animated.timing(fade, { toValue: 0, duration: 350, useNativeDriver: true }).start(onDone);
      }, wait);
    });
    return () => fill.removeListener(listener);
  }, [target, fill, fade, onDone]);

  const TUBE = 260;
  const height = fill.interpolate({ inputRange: [0, 1], outputRange: [0, TUBE] });
  const pctText = target ? Math.round(Math.min(1, target.raised / target.goal) * 100) : 0;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.screen, { opacity: fade }]} pointerEvents="none">
      <Text style={styles.name}>Anya's Journey</Text>
      <Text style={styles.tag}>Playgrounds for everyone</Text>

      <View style={styles.thermo} accessible accessibilityLabel={`${pctText}% of the fundraising goal raised`}>
        <View style={[styles.tube, { height: TUBE }]}>
          {[0.25, 0.5, 0.75].map((m) => (
            <View key={m} style={[styles.tick, { bottom: TUBE * m }]} />
          ))}
          <Animated.View style={[styles.fill, { height }]} />
        </View>
        <View style={styles.bulb} />
      </View>

      <Text style={styles.raised}>{target ? formatCurrency(shown) : ' '}</Text>
      <Text style={styles.goal}>
        {target ? `raised of ${formatCurrency(target.goal)} · ${pctText}%` : 'Loading…'}
      </Text>
      {target && !isLive && config.previewMode ? <Text style={styles.note}>Sample figures (preview)</Text> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  name: { fontFamily: fonts.heading, fontSize: 34, color: colors.heading },
  tag: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    letterSpacing: 2,
    color: colors.gold,
    textTransform: 'uppercase',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  thermo: { alignItems: 'center', marginBottom: spacing.lg },
  tube: {
    width: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: colors.gold,
    backgroundColor: colors.goldPale,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  tick: { position: 'absolute', right: 0, width: 12, height: 2, backgroundColor: colors.goldLight },
  fill: { width: '100%', backgroundColor: colors.gold },
  bulb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.gold,
    marginTop: -14,
    borderWidth: 4,
    borderColor: colors.gold,
  },
  raised: { fontFamily: fonts.heading, fontSize: 36, color: colors.heading },
  goal: { fontFamily: fonts.body, fontSize: 15, color: colors.text, marginTop: spacing.xs },
  note: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: spacing.sm },
});
