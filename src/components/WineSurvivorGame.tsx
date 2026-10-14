import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Body, Button, Card, SectionHeading } from '@/components/ui';
import { config } from '@/constants/config';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { formatCurrency } from '@/data/equipment';
import type { Tribe, TriviaQuestion, WineSurvivor } from '@/data/wineSurvivor';
import { useStoredState } from '@/hooks/useStoredState';

const open = (url: string) => WebBrowser.openBrowserAsync(url);

// Rally donations go through the same donation pages as the rest of the app;
// the note tells the charity which tribe to credit.
function rally(tribe: Tribe) {
  if (Platform.OS === 'web') {
    open(config.donate.goFundMe);
    return;
  }
  Alert.alert(
    `Rally for ${tribe.name}`,
    `Thank you! Add "Rally: ${tribe.name}" in your donation note so we can count it toward their Rally Fund. Donations go to the Fuller Lake playground and never change the draw.`,
    [
      { text: 'CanadaHelps', onPress: () => open(config.donate.canadaHelps) },
      { text: 'PayPal', onPress: () => open(config.donate.payPal) },
      { text: 'GoFundMe', onPress: () => open(config.donate.goFundMe) },
    ],
    { cancelable: true },
  );
}

const statusLabel = { in: 'Still in', immune: 'Immune', out: 'Voted off' } as const;

function StatusPill({ status }: { status: Tribe['status'] }) {
  return (
    <View style={[styles.pill, status === 'immune' && styles.pillImmune, status === 'out' && styles.pillOut]}>
      <Text style={[styles.pillText, status === 'out' && { color: colors.muted }]}>{statusLabel[status]}</Text>
    </View>
  );
}

type Props = {
  data: WineSurvivor;
  // Greyed-out preview behind the next-date panel: nothing is tappable.
  preview?: boolean;
  loading?: boolean;
  isLive?: boolean;
  onRefresh?: () => void;
};

export function WineSurvivorGame({ data, preview = false, loading, isLive, onRefresh }: Props) {
  const [backedId, setBackedId] = useStoredState<string | null>('ws.backedTribe', null);
  const [picks, setPicks] = useStoredState<Record<string, string>>('ws.picks', {});

  const backed = data.tribes.find((t) => t.id === backedId);
  const openDraw = data.draws.find((d) => d.status === 'open' && d.eliminated.length === 0);
  const pickable = data.tribes.filter((t) => t.status === 'in');
  const score = data.draws.filter((d) => picks[d.id] && d.eliminated.includes(picks[d.id])).length;
  const leaderboard = [...data.tribes].sort((a, b) => b.rally - a.rally).slice(0, 5);

  return (
    <View>
      <View style={styles.hero}>
        <MaterialCommunityIcons name="glass-wine" size={36} color={colors.gold} />
        <Text style={styles.heroTitle}>{data.edition}</Text>
        <Text style={styles.heroSub}>Play along from anywhere. Back a tribe, call the draws, rally for the playground.</Text>
        {!preview && onRefresh ? (
          loading ? (
            <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.sm }} />
          ) : (
            <Pressable onPress={onRefresh} accessibilityRole="button">
              <Text style={styles.updated}>
                {isLive
                  ? data.updated
                    ? `Updated ${data.updated} · tap to refresh`
                    : 'Tap to refresh'
                  : "Couldn't load the latest results · tap to retry"}
              </Text>
            </Pressable>
          )
        ) : null}
      </View>

      <View style={styles.block}>
        <SectionHeading eyebrow="Your tribe" title={backed ? backed.name : 'Pick a tribe to back'} />
        {backed ? (
          <Card style={styles.backedCard}>
            <StatusPill status={backed.status} />
            <Text style={styles.backedRally}>{formatCurrency(backed.rally)} rallied</Text>
            <Button label={`Rally for ${backed.name}`} icon="bullhorn-outline" onPress={() => !preview && rally(backed)} />
          </Card>
        ) : (
          <Body>Choose one of the teams playing Wine Survivor in person and follow them through every draw.</Body>
        )}
      </View>

      <View style={styles.block}>
        <SectionHeading eyebrow={openDraw ? `${openDraw.label}${openDraw.date ? ` · ${openDraw.date}` : ''}` : 'Draws'} title="Who's going home?" />
        {openDraw ? (
          <>
            <Body>Pick the tribe you think gets voted off in the next draw. Picks lock when the draw starts.</Body>
            <View style={styles.chips}>
              {pickable.map((t) => {
                const selected = picks[openDraw.id] === t.id;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => !preview && setPicks({ ...picks, [openDraw.id]: t.id })}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, selected && { color: colors.white }]}>{t.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : (
          <Body>Picks are closed. Watch for the results, then make your pick for the next draw.</Body>
        )}
        <Text style={styles.score}>
          Your score: {score} correct {score === 1 ? 'call' : 'calls'}
        </Text>
      </View>

      <View style={styles.block}>
        <SectionHeading eyebrow="The tribes" title="Back a tribe" />
        {data.tribes.map((t) => {
          const isBacked = t.id === backedId;
          return (
            <View key={t.id} style={[styles.tribe, t.status === 'out' && { opacity: 0.6 }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tribeName, t.status === 'out' && styles.struck]}>{t.name}</Text>
                <View style={styles.tribeMeta}>
                  <StatusPill status={t.status} />
                  <Text style={styles.tribeRally}>{formatCurrency(t.rally)} rallied</Text>
                </View>
              </View>
              <View style={styles.tribeActions}>
                <Pressable
                  onPress={() => !preview && setBackedId(isBacked ? null : t.id)}
                  accessibilityRole="button"
                  accessibilityLabel={isBacked ? `Stop backing ${t.name}` : `Back ${t.name}`}
                  style={[styles.smallBtn, isBacked && styles.smallBtnOn]}
                >
                  <MaterialCommunityIcons name={isBacked ? 'heart' : 'heart-outline'} size={16} color={isBacked ? colors.white : colors.gold} />
                  <Text style={[styles.smallBtnText, isBacked && { color: colors.white }]}>{isBacked ? 'Backing' : 'Back'}</Text>
                </Pressable>
                <Pressable
                  onPress={() => !preview && rally(t)}
                  accessibilityRole="button"
                  accessibilityLabel={`Rally for ${t.name}`}
                  style={styles.smallBtn}
                >
                  <MaterialCommunityIcons name="bullhorn-outline" size={16} color={colors.gold} />
                  <Text style={styles.smallBtnText}>Rally</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      <Card style={styles.block}>
        <Text style={styles.cardTitle}>Most-backed tribes</Text>
        <Body>The tribe with the biggest Rally Fund wins Fan Favourite at the finale.</Body>
        {leaderboard.map((t, i) => (
          <View key={t.id} style={styles.leaderRow}>
            <Text style={styles.leaderRank}>{i + 1}</Text>
            <Text style={styles.leaderName}>{t.name}</Text>
            <Text style={styles.leaderAmount}>{formatCurrency(t.rally)}</Text>
          </View>
        ))}
      </Card>

      <View style={styles.block}>
        <SectionHeading eyebrow="Loser Round" title="Second chance trivia" />
        {backed?.status === 'out' ? (
          <Trivia questions={data.trivia} preview={preview} />
        ) : (
          <Body>If your tribe gets voted off, you drop into the Loser Round: a lightning trivia game about Anya, the playground and Wine Survivor.</Body>
        )}
      </View>

      <Text style={styles.small}>
        Free to play, 19+. Picks and trivia are for fun and bragging rights. Donations go to the Fuller Lake
        playground and never change the draw.
      </Text>
    </View>
  );
}

function Trivia({ questions, preview }: { questions: TriviaQuestion[]; preview: boolean }) {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [best, setBest] = useStoredState<number>('ws.triviaBest', 0);

  if (questions.length === 0) return <Body>Trivia questions will appear here during the event.</Body>;

  const done = index >= questions.length;
  if (done) {
    return (
      <Card>
        <Text style={styles.cardTitle}>
          You got {correct} of {questions.length}
        </Text>
        <Body>Your best: {Math.max(best, correct)}</Body>
        <Button
          label="Play again"
          variant="outline"
          icon="restart"
          onPress={() => {
            setIndex(0);
            setCorrect(0);
            setChosen(null);
          }}
        />
      </Card>
    );
  }

  const q = questions[index];
  const choose = (i: number) => {
    if (preview || chosen !== null) return;
    setChosen(i);
    const nextCorrect = correct + (i === q.answer ? 1 : 0);
    setCorrect(nextCorrect);
    setTimeout(() => {
      setChosen(null);
      setIndex(index + 1);
      if (index + 1 >= questions.length && nextCorrect > best) setBest(nextCorrect);
    }, 900);
  };

  return (
    <Card>
      <Text style={styles.triviaCount}>
        Question {index + 1} of {questions.length}
      </Text>
      <Text style={styles.triviaQ}>{q.question}</Text>
      {q.options.map((opt, i) => {
        const reveal = chosen !== null;
        const right = reveal && i === q.answer;
        const wrong = reveal && i === chosen && i !== q.answer;
        return (
          <Pressable
            key={opt}
            onPress={() => choose(i)}
            accessibilityRole="button"
            style={[styles.option, right && styles.optionRight, wrong && styles.optionWrong]}
          >
            <Text style={[styles.optionText, (right || wrong) && { color: colors.white }]}>{opt}</Text>
          </Pressable>
        );
      })}
    </Card>
  );
}

const green = '#5a8f5a';

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    backgroundColor: colors.goldPale,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  heroTitle: { fontFamily: fonts.heading, fontSize: 28, color: colors.heading, marginTop: spacing.sm, textAlign: 'center' },
  heroSub: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.text, textAlign: 'center', marginTop: spacing.xs },
  updated: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: spacing.sm },
  block: { marginTop: spacing.xl },
  backedCard: { alignItems: 'center', gap: spacing.sm },
  backedRally: { fontFamily: fonts.heading, fontSize: 22, color: colors.heading },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.gold,
  },
  pillImmune: { backgroundColor: green },
  pillOut: { backgroundColor: colors.border },
  pillText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.white },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: colors.gold },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.heading },
  score: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.gold, marginTop: spacing.md, textAlign: 'center' },
  tribe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  tribeName: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.heading },
  struck: { textDecorationLine: 'line-through' },
  tribeMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  tribeRally: { fontFamily: fonts.body, fontSize: 13, color: colors.text },
  tribeActions: { gap: spacing.xs },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    minHeight: 36,
    minWidth: 92,
  },
  smallBtnOn: { backgroundColor: colors.gold },
  smallBtnText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.gold },
  cardTitle: { fontFamily: fonts.heading, fontSize: 20, color: colors.heading, marginBottom: spacing.sm },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  leaderRank: { fontFamily: fonts.heading, fontSize: 18, color: colors.gold, width: 28 },
  leaderName: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.heading },
  leaderAmount: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.heading },
  triviaCount: { fontFamily: fonts.bodyMedium, fontSize: 12, letterSpacing: 1, color: colors.gold },
  triviaQ: { fontFamily: fonts.heading, fontSize: 19, lineHeight: 26, color: colors.heading, marginVertical: spacing.md },
  option: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 48,
    justifyContent: 'center',
  },
  optionRight: { backgroundColor: green, borderColor: green },
  optionWrong: { backgroundColor: colors.error, borderColor: colors.error },
  optionText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.heading },
  small: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
