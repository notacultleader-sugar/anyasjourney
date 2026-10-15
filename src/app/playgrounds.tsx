import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { PlaygroundMap, type MapMessage, type PlaygroundMapHandle } from '@/components/PlaygroundMap';
import { PlaceholderBanner, PlaceholderNotice } from '@/components/PlaceholderNotice';
import { SampleMap } from '@/components/SampleMap';
import { config } from '@/constants/config';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { samplePlaygrounds } from '@/data/samplePlaygrounds';
import { distanceKm, findPlaygrounds, type FoundPlayground } from '@/lib/overpass';

// The web preview uses a drawn sample map and sample playgrounds, so it works
// without location, map tiles or playground data services.
const PREVIEW = config.previewMode;
const MapView = PREVIEW ? SampleMap : PlaygroundMap;

type Coords = { latitude: number; longitude: number };

const MAX_RADIUS_KM = 50;
// Keeps the map and list quick when "Show all" finds a lot.
const MAX_RESULTS = 300;

function directionsUrl(p: FoundPlayground) {
  const label = encodeURIComponent(p.name);
  if (Platform.OS === 'ios') return `https://maps.apple.com/?daddr=${p.latitude},${p.longitude}&q=${label}`;
  if (Platform.OS === 'android') return `geo:${p.latitude},${p.longitude}?q=${p.latitude},${p.longitude}(${label})`;
  return `https://www.openstreetmap.org/directions?to=${p.latitude},${p.longitude}`;
}

const formatKm = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`);

export default function PlaygroundsScreen() {
  const map = useRef<PlaygroundMapHandle>(null);
  const abort = useRef<AbortController | null>(null);
  const mapReady = useRef(false);
  const list = useRef<FlatList<FoundPlayground & { km: number }>>(null);

  const [user, setUser] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(true);
  const [origin, setOrigin] = useState<Coords | null>(null);
  const [radiusKm, setRadiusKm] = useState(config.searchRadiusKm);
  const [includeAll, setIncludeAll] = useState(false);
  const [results, setResults] = useState<FoundPlayground[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [movedTo, setMovedTo] = useState<(Coords & { radiusKm: number }) | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fit, setFit] = useState(true);

  // Find the user, falling back to Chemainus if they say no.
  useEffect(() => {
    if (PREVIEW) {
      setLocating(false);
      setOrigin(config.defaultCenter);
      return;
    }
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          // Don't leave people waiting on a slow GPS fix.
          const pos = await Promise.race([
            Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
            Location.getLastKnownPositionAsync().then(
              (last) => new Promise<Location.LocationObject>((resolve, reject) =>
                setTimeout(() => (last ? resolve(last) : reject(new Error('timeout'))), 10000),
              ),
            ),
          ]);
          const here = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setUser(here);
          setOrigin(here);
          return;
        }
      } catch {
        // fall through to the default
      } finally {
        setLocating(false);
      }
      setOrigin(config.defaultCenter);
    })();
  }, []);

  const search = useCallback(async (at: Coords, km: number, all: boolean) => {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setLoading(true);
    setError(false);
    setMovedTo(null);
    if (PREVIEW) {
      setResults(all ? samplePlaygrounds : samplePlaygrounds.filter((p) => p.access !== 'unknown'));
      setFit(true);
      setLoading(false);
      return;
    }
    try {
      const found = await findPlaygrounds({ ...at, radiusKm: km, includeAll: all, signal: controller.signal });
      setResults(found);
      setFit(true);
    } catch {
      if (!controller.signal.aborted) setError(true);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (origin) search(origin, radiusKm, includeAll);
  }, [origin, radiusKm, includeAll, search]);

  const sorted = useMemo(() => {
    const from = user ?? origin;
    const withDistance = results.map((p) => ({ ...p, km: from ? distanceKm(from, p) : 0 }));
    // Accessible first, then nearest.
    const rank = { yes: 0, limited: 1, unknown: 2 } as const;
    return withDistance
      .sort((a, b) => rank[a.access] - rank[b.access] || a.km - b.km)
      .slice(0, MAX_RESULTS);
  }, [results, user, origin]);

  const pushToMap = useCallback(() => {
    if (!mapReady.current) return;
    map.current?.send({
      type: 'data',
      playgrounds: sorted.map(({ id, name, latitude, longitude, access }) => ({ id, name, latitude, longitude, access })),
      user,
      selectedId,
      fit,
    });
    if (fit) setFit(false);
  }, [sorted, user, selectedId, fit]);

  useEffect(pushToMap, [pushToMap]);

  const onMapMessage = (msg: MapMessage) => {
    if (msg.type === 'ready') {
      mapReady.current = true;
      pushToMap();
    } else if (msg.type === 'moved') {
      setMovedTo(msg);
    } else if (msg.type === 'select') {
      setSelectedId(msg.id);
      const index = sorted.findIndex((p) => p.id === msg.id);
      if (index >= 0) list.current?.scrollToIndex({ index, viewPosition: 0, animated: true });
    }
  };

  const searchHere = () => {
    if (!movedTo) return;
    const km = Math.min(MAX_RADIUS_KM, Math.max(2, movedTo.radiusKm));
    setRadiusKm(km);
    setOrigin({ latitude: movedTo.latitude, longitude: movedTo.longitude });
  };

  const focus = (p: FoundPlayground) => {
    setSelectedId(p.id);
    map.current?.send({ type: 'center', latitude: p.latitude, longitude: p.longitude, zoom: 15 });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.mapWrap}>
        <MapView ref={map} initialCenter={config.defaultCenter} onMessage={onMapMessage} />
        {movedTo && !loading ? (
          <Pressable style={styles.searchHere} onPress={searchHere} accessibilityRole="button">
            <MaterialCommunityIcons name="map-search-outline" size={18} color={colors.white} />
            <Text style={styles.searchHereText}>Search this area</Text>
          </Pressable>
        ) : null}
        {user ? (
          <Pressable
            style={styles.locate}
            accessibilityRole="button"
            accessibilityLabel="Back to my location"
            onPress={() => {
              setRadiusKm(config.searchRadiusKm);
              setOrigin({ ...user });
            }}
          >
            <MaterialCommunityIcons name="crosshairs-gps" size={22} color={colors.gold} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.toolbar}>
        <Text style={styles.count}>
          {!origin
            ? 'Finding your location…'
            : loading
            ? 'Searching…'
            : `${sorted.length} ${sorted.length === 1 ? 'playground' : 'playgrounds'} within ${Math.round(radiusKm)} km`}
        </Text>
        <View style={styles.toggle}>
          <Text style={styles.toggleLabel}>Show all</Text>
          <Switch
            value={includeAll}
            onValueChange={setIncludeAll}
            trackColor={{ true: colors.gold, false: colors.border }}
            thumbColor={colors.white}
            accessibilityLabel="Also show playgrounds without accessibility information"
          />
        </View>
      </View>

      {PREVIEW ? (
        <View style={styles.placeholder}>
          <PlaceholderBanner>
            Placeholder: sample map and playgrounds while the playground finder is being developed.
          </PlaceholderBanner>
        </View>
      ) : !user && !locating ? (
        <Text style={styles.notice}>Turn on location to see playgrounds near you. Showing the Cowichan Valley.</Text>
      ) : null}

      <FlatList
        ref={list}
        data={sorted}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        onScrollToIndexFailed={() => {}}
        ListEmptyComponent={
          loading || !origin ? (
            <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xl }} />
          ) : error ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>We couldn't reach the map data</Text>
              <Pressable onPress={() => origin && search(origin, radiusKm, includeAll)}>
                <Text style={styles.link}>Try again</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No accessible playgrounds listed nearby yet</Text>
              <Text style={styles.muted}>
                Try "Show all", zoom the map out and search that area, or add one you know to OpenStreetMap.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => focus(item)}
            style={[styles.item, item.id === selectedId && styles.itemSelected]}
            accessibilityRole="button"
          >
            <View style={[styles.dot, styles[item.access]]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {formatKm(item.km)} away ·{' '}
                {item.access === 'yes'
                  ? 'Wheelchair accessible'
                  : item.access === 'limited'
                    ? 'Some accessible features'
                    : 'Accessibility not recorded'}
              </Text>
              {item.features.length ? (
                <View style={styles.chips}>
                  {item.features
                    .filter((f) => !f.startsWith('Wheelchair accessible'))
                    .map((f) => (
                      <Text key={f} style={styles.chip}>
                        {f}
                      </Text>
                    ))}
                </View>
              ) : null}
            </View>
            <Pressable
              onPress={() => Linking.openURL(directionsUrl(item))}
              style={styles.directions}
              accessibilityRole="button"
              accessibilityLabel={`Directions to ${item.name}`}
              hitSlop={8}
            >
              <MaterialCommunityIcons name="directions" size={26} color={colors.gold} />
            </Pressable>
          </Pressable>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.muted}>
              Playground data © OpenStreetMap contributors. Know an accessible playground that's missing?
            </Text>
            <Pressable onPress={() => WebBrowser.openBrowserAsync('https://www.openstreetmap.org/')}>
              <Text style={styles.link}>Add it to OpenStreetMap</Text>
            </Pressable>
          </View>
        }
      />
      {PREVIEW ? (
        <PlaceholderNotice
          icon="map-marker-radius-outline"
          title="Sample map"
          body="This map and its playgrounds are placeholders while the accessible playground finder is being developed. The finished app will show real accessible playgrounds near you."
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  mapWrap: { height: '45%', backgroundColor: colors.section },
  searchHere: {
    position: 'absolute',
    top: spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  searchHereText: { fontFamily: fonts.bodyMedium, color: colors.white, fontSize: 14 },
  locate: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  count: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.heading, flex: 1 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  toggleLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.text },
  placeholder: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  notice: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.heading,
    backgroundColor: colors.goldPale,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemSelected: { backgroundColor: colors.goldPale },
  dot: { width: 14, height: 14, borderRadius: 7, marginTop: 5 },
  yes: { backgroundColor: colors.gold },
  limited: { backgroundColor: '#d9c7a8' },
  unknown: { backgroundColor: '#b5b5b5' },
  name: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.heading },
  meta: { fontFamily: fonts.body, fontSize: 13, color: colors.text, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  chip: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.heading,
    backgroundColor: colors.section,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  directions: { padding: spacing.xs },
  empty: { padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  emptyTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.heading, textAlign: 'center' },
  muted: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, textAlign: 'center' },
  link: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.gold, marginTop: spacing.xs },
  footer: { padding: spacing.lg, alignItems: 'center' },
});
