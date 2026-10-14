import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/theme';
import { formatCurrency } from '@/data/equipment';
import { useFundraising } from '@/hooks/useFundraising';
import { CauseVoxThermometer, GoalHeading } from './CauseVoxThermometer';

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

  const pctText = target ? Math.round(Math.min(1, target.raised / target.goal) * 100) : 0;
  const shownPct = target ? Math.round(Math.min(1, shown / target.goal) * 100) : 0;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.screen, { opacity: fade }]} pointerEvents="none">
      <Text style={styles.name}>Anya's Journey</Text>
      <Text style={styles.tag}>Playgrounds for everyone</Text>

      <View accessible accessibilityLabel={`${pctText}% of the fundraising goal raised`} style={styles.thermo}>
        <GoalHeading scale={0.85}>{target ? `GOAL: ${formatCurrency(target.goal)}` : ' '}</GoalHeading>
        <View style={{ height: spacing.md }} />
        <CauseVoxThermometer
          progress={fill}
          pctLabel={`${shownPct}%`}
          amountLabel={formatCurrency(shown)}
          scale={0.85}
        />
      </View>
      {target ? null : <Text style={styles.note}>Loading…</Text>}
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
  thermo: { alignItems: 'center' },
  note: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: spacing.sm },
});
