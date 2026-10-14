import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createElement, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { config } from '@/constants/config';
import { colors } from '@/constants/theme';
import type { MapMessage, PlaygroundMapHandle } from './PlaygroundMap';

export type { MapMessage, PlaygroundMapHandle };

type Props = {
  initialCenter: { latitude: number; longitude: number };
  onMessage: (msg: MapMessage) => void;
};

type Pin = { id: string; name: string; latitude: number; longitude: number; access: string };

const PIN_COLORS: Record<string, string> = { yes: colors.gold, limited: '#d9c7a8', unknown: '#b5b5b5' };

function pinElement(p: Pin, selected: boolean, onClick: () => void) {
  const el = document.createElement('div');
  const size = p.access === 'unknown' ? 18 : 26;
  Object.assign(el.style, {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    border: '3px solid #fff',
    boxShadow: '0 1px 4px rgba(0,0,0,.35)',
    background: selected ? colors.button : PIN_COLORS[p.access] ?? PIN_COLORS.unknown,
    transform: selected ? 'scale(1.25)' : '',
    cursor: 'pointer',
  });
  el.setAttribute('aria-label', p.name);
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });
  return el;
}

function radiusKm(map: maplibregl.Map) {
  const c = map.getCenter();
  const ne = map.getBounds().getNorthEast();
  return c.distanceTo(ne) / 1000;
}

// Web build: MapLibre runs directly in the page (no iframe), same messages as
// the native WebView version.
export const PlaygroundMap = forwardRef<PlaygroundMapHandle, Props>(function PlaygroundMap(
  { initialCenter, onMessage },
  ref,
) {
  const container = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const me = useRef<maplibregl.Marker | null>(null);
  const programmatic = useRef(false);
  const handler = useRef(onMessage);
  handler.current = onMessage;

  const markProgrammatic = () => {
    programmatic.current = true;
    setTimeout(() => (programmatic.current = false), 1200);
  };

  useEffect(() => {
    if (!container.current) return;
    const m = new maplibregl.Map({
      container: container.current,
      style: config.mapStyleUrl,
      center: [initialCenter.longitude, initialCenter.latitude],
      zoom: 10,
      attributionControl: { compact: true },
    });
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    m.on('load', () => handler.current({ type: 'ready' }));
    m.on('error', () => handler.current({ type: 'error' }));
    m.on('moveend', (e) => {
      // Only offer "Search this area" after the person moves the map.
      if (!e.originalEvent || programmatic.current) return;
      const c = m.getCenter();
      handler.current({ type: 'moved', latitude: c.lat, longitude: c.lng, radiusKm: radiusKm(m) });
    });
    // The map's box can change size after layout (tabs, phone frame).
    const resize = new ResizeObserver(() => m.resize());
    resize.observe(container.current);
    map.current = m;
    return () => {
      resize.disconnect();
      m.remove();
      map.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    send: (msg: any) => {
      const m = map.current;
      if (!m) return;
      if (msg.type === 'center') {
        markProgrammatic();
        m.flyTo({ center: [msg.longitude, msg.latitude], zoom: msg.zoom ?? m.getZoom(), duration: 600 });
      }
      if (msg.type === 'data') {
        markers.current.forEach((mk) => mk.remove());
        markers.current = [];
        const bounds = new maplibregl.LngLatBounds();
        (msg.playgrounds as Pin[]).forEach((p) => {
          const el = pinElement(p, p.id === msg.selectedId, () => handler.current({ type: 'select', id: p.id }));
          markers.current.push(new maplibregl.Marker({ element: el }).setLngLat([p.longitude, p.latitude]).addTo(m));
          bounds.extend([p.longitude, p.latitude]);
        });
        me.current?.remove();
        me.current = null;
        if (msg.user) {
          const dot = document.createElement('div');
          Object.assign(dot.style, {
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#2a7de1',
            border: '3px solid #fff',
            boxShadow: '0 0 0 6px rgba(42,125,225,.25)',
          });
          me.current = new maplibregl.Marker({ element: dot })
            .setLngLat([msg.user.longitude, msg.user.latitude])
            .addTo(m);
          bounds.extend([msg.user.longitude, msg.user.latitude]);
        }
        if (msg.fit && !bounds.isEmpty()) {
          markProgrammatic();
          m.fitBounds(bounds, { padding: { top: 80, bottom: 56, left: 48, right: 64 }, maxZoom: 14, duration: 600 });
        }
      }
    },
  }));

  return createElement('div', {
    ref: container,
    style: { position: 'absolute', inset: 0 },
  });
});
