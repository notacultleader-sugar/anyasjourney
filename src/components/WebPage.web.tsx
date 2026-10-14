import { createElement, forwardRef, useImperativeHandle, useState } from 'react';

export type WebPageHandle = { reload: () => void };

// Browser preview only (npx expo start --web): react-native-webview has no web
// support, so use a plain iframe.
export const WebPage = forwardRef<WebPageHandle, { url: string }>(function WebPage({ url }, ref) {
  const [key, setKey] = useState(0);
  useImperativeHandle(ref, () => ({ reload: () => setKey((k) => k + 1) }));
  return createElement('iframe', {
    key,
    src: url,
    title: 'Events',
    style: { border: 0, width: '100%', height: '100%', flex: 1 },
  });
});
