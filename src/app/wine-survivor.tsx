import { ScrollView, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { BOARD_W, SurvivorBoard } from '@/components/SurvivorBoard';
import { colors, fonts, spacing } from '@/constants/theme';

// Placeholder while the Wine Survivor game is being designed. The earlier
// play-along game (WineSurvivorGame, useWineSurvivor) is kept for later.
export default function WineSurvivorScreen() {
  const { width } = useWindowDimensions();
  const scale = Math.min(1.2, (Math.min(width, 480) - spacing.md * 2) / (BOARD_W + 20));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SurvivorBoard scale={scale} />
      <Text style={styles.eyebrow}>COMING SOON</Text>
      <Text style={styles.title}>The Wine Survivor game</Text>
      <Text style={styles.body}>Play along with Wine Survivor right here in the app. Details on the way.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { alignItems: 'center', padding: spacing.md, paddingBottom: spacing.xl },
  eyebrow: { fontFamily: fonts.bodyMedium, fontSize: 13, letterSpacing: 3, color: colors.gold, marginTop: spacing.lg },
  title: { fontFamily: fonts.heading, fontSize: 26, color: colors.heading, textAlign: 'center', marginTop: spacing.xs },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 360,
  },
});
