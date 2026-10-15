import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BOARD_H, BOARD_W, SurvivorBoard } from '@/components/SurvivorBoard';
import { PlaceholderBanner, PlaceholderNotice } from '@/components/PlaceholderNotice';
import { colors, fonts, spacing } from '@/constants/theme';

const FRAME = 20; // the board's wooden border, both sides
const TEXT_H = 120; // the "coming soon" text under the board

// Placeholder while the Wine Survivor game is being designed. The earlier
// play-along game (WineSurvivorGame, useWineSurvivor) is kept for later.
// The board shrinks to fit so the whole page shows without scrolling.
export default function WineSurvivorScreen() {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const scale = size
    ? Math.min(
        1.2,
        (size.width - spacing.md * 2) / (BOARD_W + FRAME),
        (size.height - spacing.md * 2 - TEXT_H) / (BOARD_H + FRAME),
      )
    : 0;

  return (
    <View style={styles.screen} onLayout={(e) => setSize(e.nativeEvent.layout)}>
      {scale > 0 ? (
        <>
          <SurvivorBoard scale={scale} />
          <Text style={styles.eyebrow}>COMING SOON</Text>
          <Text style={styles.title}>The Wine Survivor game</Text>
          <View style={{ marginTop: spacing.sm }}>
            <PlaceholderBanner>Placeholder: this board will be replaced by the game once it's developed.</PlaceholderBanner>
          </View>
        </>
      ) : null}

      <PlaceholderNotice
        title="The game is in development"
        body="This board is a placeholder while the Wine Survivor game is being developed. The finished game will go here."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  eyebrow: { fontFamily: fonts.bodyMedium, fontSize: 12, letterSpacing: 3, color: colors.gold, marginTop: spacing.md },
  title: { fontFamily: fonts.heading, fontSize: 22, color: colors.heading, textAlign: 'center', marginTop: 2 },
});
