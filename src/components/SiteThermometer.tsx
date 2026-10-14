import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Thermometer } from '@/components/Thermometer';
import { config } from '@/constants/config';
import { colors, radius } from '@/constants/theme';
import { ISOLATE_THERMOMETER_JS } from '@/lib/siteThermometer';

// Shows the CauseVox thermometer from the charity's website. Falls back to the
// app's own thermometer if the site can't be reached or the embed isn't found.
export function SiteThermometer({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [height, setHeight] = useState(compact ? 220 : 320);

  // Don't leave a spinner up if the site is slow or the embed never appears.
  useEffect(() => {
    if (state !== 'loading') return;
    const t = setTimeout(() => setState('fallback'), 15000);
    return () => clearTimeout(t);
  }, [state]);

  if (state === 'fallback') return <Thermometer compact={compact} />;

  return (
    <View style={[styles.wrap, { height }]}>
      <WebView
        source={{ uri: config.siteUrl }}
        style={[styles.web, state !== 'ready' && styles.hidden]}
        injectedJavaScript={ISOLATE_THERMOMETER_JS}
        scrollEnabled={false}
        onMessage={(e) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data);
            if (msg.type === 'missing') setState('fallback');
            if (msg.type === 'height') {
              setHeight(Math.max(120, Math.min(600, msg.height)));
              setState('ready');
            }
          } catch {
            // ignore
          }
        }}
        onError={() => setState('fallback')}
        onHttpError={() => setState('fallback')}
        // The thermometer is display-only; links open nothing inside it.
        onShouldStartLoadWithRequest={(req) => req.url.startsWith(config.siteUrl) || req.isTopFrame === false}
      />
      {state === 'loading' ? (
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <ActivityIndicator color={colors.gold} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.white },
  web: { flex: 1, backgroundColor: 'transparent' },
  hidden: { opacity: 0 },
  center: { alignItems: 'center', justifyContent: 'center' },
});
