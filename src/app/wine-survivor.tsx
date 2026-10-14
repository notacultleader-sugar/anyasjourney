import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { BOARD_H, BOARD_W, SurvivorBoard } from '@/components/SurvivorBoard';
import { Button, Card } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';

const FRAME = 20; // the board's wooden border, both sides
const TEXT_H = 120; // the "coming soon" text under the board

// Placeholder while the Wine Survivor game is being designed. The earlier
// play-along game (WineSurvivorGame, useWineSurvivor) is kept for later.
// The board shrinks to fit so the whole page shows without scrolling.
export default function WineSurvivorScreen() {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [notice, setNotice] = useState(true);
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
          <Text style={styles.body}>Play along with Wine Survivor right here in the app. Details on the way.</Text>
        </>
      ) : null}

      {notice ? (
        <View style={styles.overlay}>
          <Card style={styles.panel}>
            <MaterialCommunityIcons name="hammer-wrench" size={40} color={colors.gold} />
            <Text style={styles.panelEyebrow}>PLACEHOLDER</Text>
            <Text style={styles.panelTitle}>The game is in development</Text>
            <Text style={styles.panelBody}>
              This board is a placeholder while the Wine Survivor game is being developed. The finished game will go
              here.
            </Text>
            <Button label="OK" onPress={() => setNotice(false)} style={{ alignSelf: 'stretch' }} />
          </Card>
        </View>
      ) : null}
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
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
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
  panelEyebrow: { fontFamily: fonts.bodyMedium, fontSize: 12, letterSpacing: 3, color: colors.gold },
  panelTitle: { fontFamily: fonts.heading, fontSize: 24, color: colors.heading, textAlign: 'center' },
  panelBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  eyebrow: { fontFamily: fonts.bodyMedium, fontSize: 12, letterSpacing: 3, color: colors.gold, marginTop: spacing.md },
  title: { fontFamily: fonts.heading, fontSize: 22, color: colors.heading, textAlign: 'center', marginTop: 2 },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 340,
  },
});
