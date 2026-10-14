import { Animated, StyleSheet, Text, View } from 'react-native';
import { fonts } from '@/constants/theme';

// Colours and shapes copied from the CauseVox thermometer on anyasjourney.com.
export const thermoColors = {
  slate: '#5b7fa6',
  fill: '#ffa48a',
  tick: '#333333',
  white: '#ffffff',
};

// Measurements at scale 1 (roughly the size of the website's thermometer).
const TUBE_W = 100;
const BORDER = 16;
const TUBE_H = 300; // top of the tube to the centre of the bulb
const BULB = 140;
const INNER_W = TUBE_W - BORDER * 2;
const INNER_H = TUBE_H - BORDER;
const BULB_INNER = BULB - BORDER * 2;
const GLASS = TUBE_H - BULB_INNER / 2 - BORDER; // visible tube length above the bulb
const BASE = INNER_H - GLASS; // fill hidden behind the bulb
const CANVAS_W = 300;
const CANVAS_H = TUBE_H + BULB / 2;
const TICKS = 17;

type Props = {
  /** 0 to 1, or an Animated value in that range */
  progress: number | Animated.Value | Animated.AnimatedInterpolation<number>;
  pctLabel: string;
  amountLabel: string;
  scale?: number;
};

// The thermometer drawing: slate outline, white tube with ticks, salmon fill
// and bulb, and the two tags that ride along with the fill level.
export function CauseVoxThermometer({ progress, pctLabel, amountLabel, scale = 1 }: Props) {
  const s = (n: number) => n * scale;
  const p = typeof progress === 'number' ? new Animated.Value(progress) : progress;
  const fillH = p.interpolate({ inputRange: [0, 1], outputRange: [s(BASE), s(INNER_H)], extrapolate: 'clamp' });
  // Top of the fill in canvas coordinates, minus half a tag's height.
  const tagH = s(34);
  const tagTop = p.interpolate({
    inputRange: [0, 1],
    outputRange: [s(BORDER + GLASS) - tagH / 2, s(BORDER) - tagH / 2],
    extrapolate: 'clamp',
  });
  const cx = s(CANVAS_W / 2);
  const tagText = { fontSize: s(17), lineHeight: s(22) };
  const arrow = s(8);

  return (
    <View style={{ width: s(CANVAS_W), height: s(CANVAS_H) }}>
      {/* slate outline */}
      <View
        style={[
          styles.abs,
          {
            left: cx - s(TUBE_W / 2),
            top: 0,
            width: s(TUBE_W),
            height: s(TUBE_H),
            borderTopLeftRadius: s(TUBE_W / 2),
            borderTopRightRadius: s(TUBE_W / 2),
            backgroundColor: thermoColors.slate,
          },
        ]}
      />
      <View
        style={[
          styles.abs,
          {
            left: cx - s(BULB / 2),
            top: s(TUBE_H - BULB / 2),
            width: s(BULB),
            height: s(BULB),
            borderRadius: s(BULB / 2),
            backgroundColor: thermoColors.slate,
          },
        ]}
      />

      {/* glass, fill and ticks */}
      <View
        style={[
          styles.abs,
          {
            left: cx - s(INNER_W / 2),
            top: s(BORDER),
            width: s(INNER_W),
            height: s(INNER_H),
            borderTopLeftRadius: s(INNER_W / 2),
            borderTopRightRadius: s(INNER_W / 2),
            backgroundColor: thermoColors.white,
            overflow: 'hidden',
          },
        ]}
      >
        <Animated.View style={[styles.abs, { left: 0, right: 0, bottom: 0, height: fillH, backgroundColor: thermoColors.fill }]} />
        {Array.from({ length: TICKS }, (_, i) => (
          <View
            key={i}
            style={[
              styles.abs,
              {
                left: s(6),
                top: s(30 + i * 12),
                width: s(i % 2 === 0 ? 22 : 13),
                height: s(3),
                backgroundColor: thermoColors.tick,
              },
            ]}
          />
        ))}
      </View>

      {/* bulb */}
      <View
        style={[
          styles.abs,
          {
            left: cx - s(BULB_INNER / 2),
            top: s(TUBE_H - BULB_INNER / 2),
            width: s(BULB_INNER),
            height: s(BULB_INNER),
            borderRadius: s(BULB_INNER / 2),
            backgroundColor: thermoColors.fill,
          },
        ]}
      />
      <View
        style={[
          styles.abs,
          {
            left: cx - s(40),
            top: s(TUBE_H - 40),
            width: s(80),
            height: s(80),
            borderRadius: s(40),
            borderWidth: s(6),
            borderColor: 'transparent',
            borderLeftColor: thermoColors.white,
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />

      {/* tags */}
      <Animated.View
        style={[styles.abs, styles.tagRow, { right: cx + s(TUBE_W / 2) + s(6), top: tagTop, height: tagH }]}
      >
        <View style={[styles.tag, { paddingHorizontal: s(10), borderRadius: s(5) }]}>
          <Text style={[styles.tagText, tagText]}>{pctLabel}</Text>
        </View>
        <View style={[styles.arrow, { borderTopWidth: arrow, borderBottomWidth: arrow, borderLeftWidth: arrow, borderLeftColor: thermoColors.slate }]} />
      </Animated.View>
      <Animated.View
        style={[styles.abs, styles.tagRow, { left: cx + s(TUBE_W / 2) + s(6), top: tagTop, height: tagH }]}
      >
        <View style={[styles.arrow, { borderTopWidth: arrow, borderBottomWidth: arrow, borderRightWidth: arrow, borderRightColor: thermoColors.slate }]} />
        <View style={[styles.tag, { paddingHorizontal: s(10), borderRadius: s(5) }]}>
          <Text style={[styles.tagText, tagText]}>{amountLabel}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

// "GOAL: $500,000" heading in the same style as the website's.
export function GoalHeading({ children, scale = 1 }: { children: string; scale?: number }) {
  return <Text style={[styles.goal, { fontSize: 30 * scale, lineHeight: 40 * scale }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  tagRow: { flexDirection: 'row', alignItems: 'center' },
  tag: { backgroundColor: thermoColors.slate, height: '100%', justifyContent: 'center' },
  tagText: { color: thermoColors.white, fontFamily: fonts.bodyBold },
  arrow: { width: 0, height: 0, borderTopColor: 'transparent', borderBottomColor: 'transparent' },
  goal: { color: thermoColors.slate, fontFamily: fonts.bodyBold, textAlign: 'center' },
});
