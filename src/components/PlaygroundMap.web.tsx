import { createElement, forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { mapHtml } from '@/lib/mapHtml';
import type { MapMessage, PlaygroundMapHandle } from './PlaygroundMap';

export type { MapMessage, PlaygroundMapHandle };

type Props = {
  initialCenter: { latitude: number; longitude: number };
  onMessage: (msg: MapMessage) => void;
};

// Browser preview: the same map page in an iframe, talking over postMessage.
export const PlaygroundMap = forwardRef<PlaygroundMapHandle, Props>(function PlaygroundMap(
  { initialCenter, onMessage },
  ref,
) {
  const frame = useRef<HTMLIFrameElement | null>(null);
  const html = useMemo(() => mapHtml(initialCenter), []);
  const handler = useRef(onMessage);
  handler.current = onMessage;

  useImperativeHandle(ref, () => ({
    send: (msg) => frame.current?.contentWindow?.postMessage(JSON.stringify(msg), '*'),
  }));

  useEffect(() => {
    const listen = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return;
      try {
        handler.current(JSON.parse(e.data));
      } catch {
        // ignore
      }
    };
    window.addEventListener('message', listen);
    return () => window.removeEventListener('message', listen);
  }, []);

  return createElement('iframe', {
    ref: frame,
    srcDoc: html,
    title: 'Playground map',
    style: { border: 0, width: '100%', height: '100%', flex: 1 },
  });
});
