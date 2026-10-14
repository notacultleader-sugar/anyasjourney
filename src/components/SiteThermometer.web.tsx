import { createElement, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Thermometer } from '@/components/Thermometer';
import { config } from '@/constants/config';
import { colors, radius } from '@/constants/theme';
import { FIND_THERMOMETER_JS } from '@/lib/siteThermometer';

// eslint-disable-next-line no-new-func
const findThermometer = new Function(`${FIND_THERMOMETER_JS}; return __findThermometer;`)() as (
  doc: Document,
) => Element | null;

type ViewState = { kind: 'loading' } | { kind: 'html'; html: string } | { kind: 'frame' } | { kind: 'fallback' };

// Web build: pull the thermometer section out of the homepage and show just
// that. If the browser blocks reading the site, show the site's thermometer
// area in a frame instead.
export function SiteThermometer({ compact = false }: { compact?: boolean }) {
  const [view, setView] = useState<ViewState>({ kind: 'loading' });
  const [height, setHeight] = useState(compact ? 220 : 320);
  const frame = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(config.siteUrl);
        const text = await res.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');
        const section = findThermometer(doc);
        if (!section) throw new Error('missing');
        const styles = Array.from(doc.querySelectorAll('link[rel="stylesheet"], style'))
          .map((n) => n.outerHTML)
          .join('');
        const html = `<!doctype html><html><head><base href="${config.siteUrl}/"><meta name="viewport" content="width=device-width, initial-scale=1">${styles}<style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}body>*{margin:0!important;padding-top:8px!important;padding-bottom:8px!important}</style></head><body>${section.outerHTML}</body></html>`;
        if (!cancelled) setView({ kind: 'html', html });
      } catch {
        if (!cancelled) setView({ kind: 'frame' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (view.kind === 'fallback') return <Thermometer compact={compact} />;
  if (view.kind === 'loading') {
    return (
      <View style={[styles.wrap, styles.center, { height }]}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { height: view.kind === 'frame' ? 420 : height }]}>
      {createElement('iframe', {
        ref: frame,
        title: 'Fundraising thermometer',
        scrolling: 'no',
        style: { border: 0, width: '100%', height: '100%' },
        ...(view.kind === 'html'
          ? {
              srcDoc: view.html,
              onLoad: () => {
                const h = frame.current?.contentDocument?.body?.scrollHeight;
                if (h) setHeight(Math.max(120, Math.min(600, h)));
              },
            }
          : { src: `${config.siteUrl}/#thermometer` }),
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.white },
  center: { alignItems: 'center', justifyContent: 'center' },
});
