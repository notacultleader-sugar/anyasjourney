import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { mapHtml } from '@/lib/mapHtml';

export type MapMessage =
  | { type: 'ready' }
  | { type: 'error' }
  | { type: 'moved'; latitude: number; longitude: number; radiusKm: number }
  | { type: 'select'; id: string };

export type PlaygroundMapHandle = { send: (msg: object) => void };

type Props = {
  initialCenter: { latitude: number; longitude: number };
  onMessage: (msg: MapMessage) => void;
};

// Free map (MapLibre + OpenFreeMap tiles) rendered in a WebView.
export const PlaygroundMap = forwardRef<PlaygroundMapHandle, Props>(function PlaygroundMap(
  { initialCenter, onMessage },
  ref,
) {
  const webview = useRef<WebView>(null);
  // Only build the page once; later moves go through messages.
  const html = useMemo(() => mapHtml(initialCenter), []);

  useImperativeHandle(ref, () => ({
    send: (msg) => {
      webview.current?.injectJavaScript(`window.__handle(${JSON.stringify(JSON.stringify(msg))}); true;`);
    },
  }));

  return (
    <WebView
      ref={webview}
      source={{ html, baseUrl: 'https://localhost' }}
      style={styles.map}
      originWhitelist={['*']}
      scrollEnabled={false}
      onMessage={(e) => {
        try {
          onMessage(JSON.parse(e.nativeEvent.data));
        } catch {
          // ignore
        }
      }}
    />
  );
});

const styles = StyleSheet.create({
  map: { flex: 1, backgroundColor: '#eef0f0' },
});
