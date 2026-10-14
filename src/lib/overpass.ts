// Finds playgrounds from OpenStreetMap through the free Overpass API (no key).
// Accessibility comes from OSM tags:
//   leisure=playground + wheelchair=yes|designated|limited
//   leisure=playground + sensory_friendly=yes|limited
//   playground=<equipment> + wheelchair=yes|designated (e.g. accessible swings)
import { config } from '@/constants/config';

export type Access = 'yes' | 'limited' | 'unknown';

export type FoundPlayground = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  access: Access;
  features: string[];
};

type OsmElement = {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const ACCESSIBLE = '^(yes|designated|limited)$';
const EQUIPMENT_ACCESSIBLE = '^(yes|designated)$';

function buildQuery(lat: number, lon: number, radiusM: number, includeAll: boolean) {
  const area = `(around:${radiusM},${lat},${lon})`;
  return `[out:json][timeout:25];
(
  nwr["leisure"="playground"]["wheelchair"~"${ACCESSIBLE}"]${area};
  nwr["leisure"="playground"]["sensory_friendly"~"^(yes|limited)$"]${area};
  ${includeAll ? `nwr["leisure"="playground"]${area};` : ''}
)->.pg;
nwr["playground"]["wheelchair"~"${EQUIPMENT_ACCESSIBLE}"]${area}->.eq;
nwr(around.eq:40)["leisure"="playground"]->.host;
(.pg; .host; .eq;);
out center tags;`;
}

const SMOOTH_SURFACES = new Set([
  'rubber',
  'rubber_crumb',
  'tartan',
  'artificial_turf',
  'concrete',
  'asphalt',
  'paved',
  'paving_stones',
]);

const EQUIPMENT_LABELS: Record<string, string> = {
  swing: 'Accessible swing',
  basketswing: 'Accessible swing',
  roundabout: 'Wheelchair merry-go-round',
  spinner: 'Accessible spinner',
  spinning_disc: 'Accessible spinner',
  seesaw: 'Accessible see-saw',
  slide: 'Accessible slide',
  sandpit: 'Raised sand play',
  activitypanel: 'Play panels',
  structure: 'Accessible play structure',
  trampoline: 'Ground trampoline',
};

const equipmentLabel = (type: string) =>
  EQUIPMENT_LABELS[type] ?? `Accessible ${type.replace(/_/g, ' ')}`;

const point = (el: OsmElement) =>
  el.lat != null && el.lon != null
    ? { latitude: el.lat, longitude: el.lon }
    : el.center
      ? { latitude: el.center.lat, longitude: el.center.lon }
      : null;

export function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

function toPlaygrounds(elements: OsmElement[]): FoundPlayground[] {
  const parks: FoundPlayground[] = [];
  const equipment: { type: string; at: { latitude: number; longitude: number } }[] = [];
  const seen = new Set<string>();

  for (const el of elements) {
    const tags = el.tags ?? {};
    const at = point(el);
    const id = `${el.type}/${el.id}`;
    if (!at || seen.has(id)) continue;
    seen.add(id);

    if (tags.leisure === 'playground') {
      const features: string[] = [];
      const wc = tags.wheelchair;
      if (wc === 'yes' || wc === 'designated') features.push('Wheelchair accessible');
      if (wc === 'limited') features.push('Partly wheelchair accessible');
      if (tags.sensory_friendly === 'yes' || tags.sensory_friendly === 'limited') features.push('Sensory friendly');
      if (tags.surface && SMOOTH_SURFACES.has(tags.surface)) features.push('Smooth surface');
      if (tags.fenced === 'yes' || tags.barrier === 'fence') features.push('Fenced');
      parks.push({
        id,
        name: tags.name || 'Playground',
        ...at,
        access: wc === 'yes' || wc === 'designated' ? 'yes' : wc === 'limited' ? 'limited' : 'unknown',
        features,
      });
    } else if (tags.playground) {
      equipment.push({ type: tags.playground, at });
    }
  }

  // Attach accessible equipment to the closest playground, or list it on its own.
  for (const item of equipment) {
    let best: FoundPlayground | undefined;
    let bestKm = 0.12;
    for (const p of parks) {
      const d = distanceKm(item.at, p);
      if (d < bestKm) {
        best = p;
        bestKm = d;
      }
    }
    const label = equipmentLabel(item.type);
    if (!best) {
      best = {
        id: `equipment/${item.at.latitude},${item.at.longitude}`,
        name: 'Playground',
        ...item.at,
        access: 'limited',
        features: [],
      };
      parks.push(best);
    }
    if (!best.features.includes(label)) best.features.push(label);
    if (best.access === 'unknown') best.access = 'limited';
  }

  return parks;
}

export async function findPlaygrounds(opts: {
  latitude: number;
  longitude: number;
  radiusKm: number;
  includeAll: boolean;
  signal?: AbortSignal;
}): Promise<FoundPlayground[]> {
  const query = buildQuery(opts.latitude, opts.longitude, Math.round(opts.radiusKm * 1000), opts.includeAll);
  let lastError: unknown;
  for (const endpoint of config.overpassEndpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: opts.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { elements: OsmElement[] };
      return toPlaygrounds(json.elements ?? []);
    } catch (e) {
      if (opts.signal?.aborted) throw e;
      lastError = e;
    }
  }
  throw lastError;
}
