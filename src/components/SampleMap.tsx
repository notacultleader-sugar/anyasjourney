import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { sampleBounds } from '@/data/samplePlaygrounds';
import type { MapMessage, PlaygroundMapHandle } from './PlaygroundMap';

type Pin = { id: string; name: string; latitude: number; longitude: number; access: string };

const PIN_COLORS: Record<string, string> = { yes: colors.gold, limited: '#d9c7a8', unknown: '#b5b5b5' };
const LAND = '#eef2e6';
const WATER = '#cfe3ef';
const ROAD = '#ffffff';

// Places drawn as labels on the sample map.
const TOWNS = [
  { name: 'Ladysmith', latitude: 49.0, longitude: -123.82 },
  { name: 'Chemainus', latitude: 48.93, longitude: -123.72 },
  { name: 'Crofton', latitude: 48.87, longitude: -123.65 },
  { name: 'Duncan', latitude: 48.78, longitude: -123.71 },
  { name: 'Maple Bay', latitude: 48.8, longitude: -123.645 },
];

type Props = {
  initialCenter: { latitude: number; longitude: number };
  onMessage: (msg: MapMessage) => void;
};

// A drawn, offline map of the Cowichan Valley with sample pins. Used by the web
// preview so the Parks tab always shows something, with no map services needed.
export const SampleMap = forwardRef<PlaygroundMapHandle, Props>(function SampleMap({ onMessage }, ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [pins, setPins] = useState<Pin[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    onMessage({ type: 'ready' });
  }, []);

  useImperativeHandle(ref, () => ({
    send: (msg: any) => {
      if (msg.type === 'data') {
        setPins(msg.playgrounds);
        setSelectedId(msg.selectedId ?? null);
      }
    },
  }));

  const project = (lat: number, lon: number) => {
    const { north, south, west, east } = sampleBounds;
    return {
      x: ((lon - west) / (east - west)) * size.width,
      y: ((north - lat) / (north - south)) * size.height,
    };
  };

  const onLayout = (e: LayoutChangeEvent) => setSize(e.nativeEvent.layout);

  return (
    <View style={styles.map} onLayout={onLayout}>
      {size.width > 0 ? (
        <>
          {/* Ocean down the east side, with a bay reaching in at Maple Bay */}
          <View style={[styles.water, { left: size.width * 0.72, width: size.width * 0.6, height: size.height * 1.4, top: -size.height * 0.2, transform: [{ rotate: '-14deg' }] }]} />
          <View style={[styles.water, { left: size.width * 0.66, top: size.height * 0.68, width: size.width * 0.3, height: size.height * 0.16, borderRadius: 999 }]} />
          <View style={[styles.water, { left: size.width * 0.82, top: size.height * 0.02, width: size.width * 0.3, height: size.height * 0.2, borderRadius: 999 }]} />
          {/* Lake */}
          <View style={[styles.water, { left: size.width * 0.38, top: size.height * 0.3, width: 26, height: 16, borderRadius: 10 }]} />
          {/* Highway 1 */}
          <View style={[styles.road, { left: size.width * 0.5, top: -10, height: size.height + 20, transform: [{ rotate: '8deg' }] }]} />
          <View style={[styles.road, styles.minor, { left: size.width * 0.62, top: size.height * 0.35, height: size.height * 0.5, transform: [{ rotate: '-30deg' }] }]} />
          {TOWNS.map((t) => {
            const { x, y } = project(t.latitude, t.longitude);
            return (
              <Text key={t.name} style={[styles.town, { left: x - 40, top: y + 20 }]}>
                {t.name}
              </Text>
            );
          })}
          {pins.map((p) => {
            const { x, y } = project(p.latitude, p.longitude);
            const selected = p.id === selectedId;
            const d = p.access === 'unknown' ? 18 : selected ? 32 : 26;
            return (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                accessibilityLabel={p.name}
                hitSlop={10}
                onPress={() => {
                  setSelectedId(p.id);
                  onMessage({ type: 'select', id: p.id });
                }}
                style={[
                  styles.pin,
                  {
                    left: x - d / 2,
                    top: y - d / 2,
                    width: d,
                    height: d,
                    borderRadius: d / 2,
                    backgroundColor: selected ? colors.button : PIN_COLORS[p.access] ?? PIN_COLORS.unknown,
                    zIndex: selected ? 2 : 1,
                  },
                ]}
              />
            );
          })}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Sample map · preview</Text>
          </View>
        </>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  map: { flex: 1, backgroundColor: LAND, overflow: 'hidden' },
  water: { position: 'absolute', backgroundColor: WATER },
  road: { position: 'absolute', width: 5, backgroundColor: ROAD, borderRadius: 3 },
  minor: { width: 3 },
  town: {
    position: 'absolute',
    width: 80,
    textAlign: 'center',
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: '#6b7461',
  },
  pin: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: { fontFamily: fonts.body, fontSize: 11, color: colors.text },
});
