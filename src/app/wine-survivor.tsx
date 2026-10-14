import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Body, Button, Card } from '@/components/ui';
import { WineSurvivorGame } from '@/components/WineSurvivorGame';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useStoredState } from '@/hooks/useStoredState';
import { useWineSurvivor } from '@/hooks/useWineSurvivor';

export default function WineSurvivorScreen() {
  const { data, loading, isLive, refresh } = useWineSurvivor();
  const [is19, setIs19, ageLoaded] = useStoredState<boolean>('ws.is19', false);

  // Game switched off: show it greyed out behind the next-date panel.
  if (!data.active) {
    return (
      <View style={styles.screen}>
        <ScrollView
          style={styles.preview}
          contentContainerStyle={styles.content}
          scrollEnabled={false}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <WineSurvivorGame data={data} preview />
        </ScrollView>
        <View style={styles.overlay}>
          <Card style={styles.panel}>
            <MaterialCommunityIcons name="calendar-clock" size={40} color={colors.gold} />
            <Text style={styles.eyebrow}>NEXT DATE</Text>
            <Text style={styles.edition}>{data.edition}</Text>
            <Text style={styles.date}>{data.nextDate}</Text>
            {data.nextDateNote ? <Body>{data.nextDateNote}</Body> : null}
            <Text style={styles.note}>
              The play-along game opens here when Wine Survivor starts, so you can join in from your phone.
            </Text>
            <Button
              label="About Wine Survivor"
              variant="outline"
              icon="open-in-new"
              onPress={() => WebBrowser.openBrowserAsync(data.infoUrl)}
              style={{ alignSelf: 'stretch' }}
            />
            <Button label="Check again" variant="dark" icon="refresh" onPress={refresh} style={{ alignSelf: 'stretch' }} />
          </Card>
        </View>
      </View>
    );
  }

  if (!ageLoaded) return <View style={styles.screen} />;

  if (!is19) {
    return (
      <View style={[styles.screen, styles.overlay]}>
        <Card style={styles.panel}>
          <MaterialCommunityIcons name="glass-wine" size={40} color={colors.gold} />
          <Text style={styles.edition}>{data.edition}</Text>
          <Body>Wine Survivor is for adults. Please confirm you are 19 or older to play along.</Body>
          <Button label="I'm 19 or older" icon="check" onPress={() => setIs19(true)} style={{ alignSelf: 'stretch' }} />
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <WineSurvivorGame data={data} loading={loading} isLive={isLive} onRefresh={refresh} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  preview: { opacity: 0.3 },
  overlay: {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  panel: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderColor: colors.gold,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  eyebrow: { fontFamily: fonts.bodyMedium, fontSize: 13, letterSpacing: 3, color: colors.gold },
  edition: { fontFamily: fonts.heading, fontSize: 26, color: colors.heading, textAlign: 'center' },
  date: { fontFamily: fonts.heading, fontSize: 22, color: colors.gold, textAlign: 'center', marginBottom: spacing.xs },
  note: { fontFamily: fonts.body, fontSize: 13, lineHeight: 20, color: colors.muted, textAlign: 'center', marginBottom: spacing.sm },
});
