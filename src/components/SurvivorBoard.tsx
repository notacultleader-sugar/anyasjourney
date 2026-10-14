import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fonts } from '@/constants/theme';

// Placeholder artwork for the Survivor tab: a Survivor-style board game drawn
// with plain views, so it scales to any screen without image files.

type Icon = ComponentProps<typeof MaterialCommunityIcons>['name'];

const COLS = 5;
const ROWS = 6;
const TILE = 52;
const GAP = 10;
const PAD = 26;
const HEADER = 66;
export const BOARD_W = PAD * 2 + COLS * TILE + (COLS - 1) * GAP;
export const BOARD_H = HEADER + PAD + ROWS * TILE + (ROWS - 1) * GAP;

const c = {
  frame: '#6b4423',
  frameLight: '#8a5a32',
  sand: '#f3dca8',
  sandDark: '#e6c78a',
  water: '#4fa9b8',
  path: '#fff6e2',
  ink: '#3b2614',
  tribes: ['#e2683c', '#2f8f83', '#c9a227', '#7b5ea7'],
};

// Special squares along the path (index → icon and colour).
const specials: Record<number, { icon: Icon; color: string }> = {
  0: { icon: 'flag-outline', color: '#2f8f83' },
  4: { icon: 'fire', color: '#e2683c' },
  8: { icon: 'glass-wine', color: '#8e2f4f' },
  12: { icon: 'shield-star-outline', color: '#c9a227' },
  16: { icon: 'palm-tree', color: '#2f8f83' },
  20: { icon: 'fire', color: '#e2683c' },
  23: { icon: 'help', color: '#7b5ea7' },
  26: { icon: 'glass-wine', color: '#8e2f4f' },
  29: { icon: 'trophy', color: '#c9a227' },
};

// Where tribe pawns sit (path index → tribe colour index).
const pawns: Record<number, number[]> = { 3: [0], 9: [1, 2], 18: [3] };

// Snake the path: left to right on even rows, right to left on odd rows,
// starting at the bottom of the board.
function tilePos(i: number) {
  const rowFromBottom = Math.floor(i / COLS);
  const col = rowFromBottom % 2 === 0 ? i % COLS : COLS - 1 - (i % COLS);
  const row = ROWS - 1 - rowFromBottom;
  return { x: PAD + col * (TILE + GAP), y: HEADER + row * (TILE + GAP) };
}

export function SurvivorBoard({ scale = 1 }: { scale?: number }) {
  const s = (n: number) => n * scale;
  const total = COLS * ROWS;

  // Little bridges between neighbouring squares.
  const links = Array.from({ length: total - 1 }, (_, i) => {
    const a = tilePos(i);
    const b = tilePos(i + 1);
    const horizontal = a.y === b.y;
    return horizontal
      ? { left: Math.min(a.x, b.x) + TILE - 2, top: a.y + TILE / 2 - 5, width: GAP + 4, height: 10 }
      : { left: a.x + TILE / 2 - 5, top: b.y + TILE - 2, width: 10, height: GAP + 4 };
  });

  return (
    <View
      style={[styles.frame, { width: s(BOARD_W + 20), padding: s(10), borderRadius: s(22) }]}
      accessible
      accessibilityLabel="Wine Survivor board game, coming soon"
    >
      <View style={{ width: s(BOARD_W), height: s(BOARD_H), borderRadius: s(14), backgroundColor: c.water, overflow: 'hidden' }}>
        {/* island */}
        <View
          style={[
            styles.abs,
            {
              left: s(12),
              top: s(HEADER - 14),
              right: s(12),
              bottom: s(12),
              borderRadius: s(40),
              backgroundColor: c.sand,
              borderWidth: s(4),
              borderColor: c.sandDark,
            },
          ]}
        />
        {/* waves */}
        {[[BOARD_W - 46, 34]].map(([x, y], i) => (
          <MaterialCommunityIcons
            key={i}
            name="waves"
            size={s(30)}
            color="rgba(255,255,255,0.6)"
            style={[styles.abs, { left: s(x), top: s(y) }]}
          />
        ))}

        {/* title banner */}
        <View style={[styles.abs, styles.banner, { left: s(54), right: s(54), top: s(12), height: s(40), borderRadius: s(8) }]}>
          <MaterialCommunityIcons name="fire" size={s(18)} color="#ffb347" />
          <Text style={[styles.bannerText, { fontSize: s(17), letterSpacing: s(2) }]}>WINE SURVIVOR</Text>
          <MaterialCommunityIcons name="fire" size={s(18)} color="#ffb347" />
        </View>

        {links.map((l, i) => (
          <View
            key={`l${i}`}
            style={[
              styles.abs,
              { left: s(l.left), top: s(l.top), width: s(l.width), height: s(l.height), backgroundColor: c.frameLight },
            ]}
          />
        ))}

        {Array.from({ length: total }, (_, i) => {
          const { x, y } = tilePos(i);
          const special = specials[i];
          const tribe = c.tribes[i % 4];
          return (
            <View
              key={i}
              style={[
                styles.abs,
                styles.tile,
                {
                  left: s(x),
                  top: s(y),
                  width: s(TILE),
                  height: s(TILE),
                  borderRadius: s(10),
                  borderWidth: s(3),
                  borderColor: special ? special.color : tribe,
                  backgroundColor: special ? '#fffaf0' : c.path,
                },
              ]}
            >
              {special ? (
                <MaterialCommunityIcons name={special.icon} size={s(26)} color={special.color} />
              ) : (
                <Text style={[styles.num, { fontSize: s(14), color: tribe }]}>{i + 1}</Text>
              )}
              {(pawns[i] ?? []).map((p, k, arr) => (
                <View
                  key={p}
                  style={[
                    styles.abs,
                    styles.pawn,
                    {
                      width: s(18),
                      height: s(18),
                      borderRadius: s(9),
                      borderWidth: s(2),
                      top: s(-8),
                      left: s(TILE / 2 - 9 + (k - (arr.length - 1) / 2) * 16 - 3),
                      backgroundColor: c.tribes[p],
                    },
                  ]}
                />
              ))}
            </View>
          );
        })}

        {/* dice */}
        <View style={[styles.abs, styles.die, { left: s(14), top: s(16), width: s(30), height: s(30), borderRadius: s(6), transform: [{ rotate: '12deg' }] }]}>
          <MaterialCommunityIcons name="dice-5" size={s(30)} color={c.ink} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  frame: {
    backgroundColor: c.frame,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  banner: {
    backgroundColor: c.frame,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#c9a227',
  },
  bannerText: { fontFamily: fonts.bodyBold, color: '#fff6e2' },
  tile: { alignItems: 'center', justifyContent: 'center' },
  num: { fontFamily: fonts.bodyBold },
  pawn: { borderColor: '#fff' },
  die: { backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
