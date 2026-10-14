import * as WebBrowser from 'expo-web-browser';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Button } from '@/components/ui';
import { config } from '@/constants/config';
import { colors, fonts, spacing } from '@/constants/theme';

export type WebPageHandle = { reload: () => void };

// Hides the website's own header and footer so the page feels part of the app.
const HIDE_SITE_CHROME = `
  (function () {
    var s = document.createElement('style');
    s.innerHTML = '#header, #footer, .back-to-top, .breadcrumbs { display: none !important; } body { padding-top: 0 !important; }';
    document.head.appendChild(s);
  })();
  true;
`;

const siteHost = new URL(config.siteUrl).host;

// In-app browser window for content the charity manages on its website.
export const WebPage = forwardRef<WebPageHandle, { url: string }>(function WebPage({ url }, ref) {
  const webview = useRef<WebView>(null);
  const [failed, setFailed] = useState(false);

  useImperativeHandle(ref, () => ({
    reload: () => {
      setFailed(false);
      webview.current?.reload();
    },
  }));

  if (failed) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>We couldn't load this page</Text>
        <Text style={styles.errorText}>Check your internet connection and try again.</Text>
        <Button label="Try again" icon="refresh" onPress={() => setFailed(false)} />
      </View>
    );
  }

  return (
    <WebView
      ref={webview}
      source={{ uri: url }}
      style={styles.web}
      startInLoadingState
      renderLoading={() => (
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      )}
      injectedJavaScriptBeforeContentLoaded={HIDE_SITE_CHROME}
      injectedJavaScript={HIDE_SITE_CHROME}
      pullToRefreshEnabled
      cacheEnabled={false}
      onError={() => setFailed(true)}
      onHttpError={(e) => e.nativeEvent.statusCode >= 500 && setFailed(true)}
      onShouldStartLoadWithRequest={(req) => {
        // Keep the charity's own pages in the window; open anything else
        // (Facebook, partner sites, donation pages) in the system browser sheet.
        if (req.isTopFrame === false || !req.url.startsWith('http')) return true;
        try {
          const host = new URL(req.url).host;
          if (host === siteHost || host === siteHost.replace(/^www\./, '')) return true;
        } catch {
          return true;
        }
        WebBrowser.openBrowserAsync(req.url);
        return false;
      }}
    />
  );
});

const styles = StyleSheet.create({
  web: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  errorTitle: { fontFamily: fonts.heading, fontSize: 20, color: colors.heading, textAlign: 'center' },
  errorText: { fontFamily: fonts.body, fontSize: 15, color: colors.text, textAlign: 'center' },
});
