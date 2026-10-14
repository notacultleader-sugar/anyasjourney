import { config } from '@/constants/config';

// Keeps the app's thermometer in step with the one on the charity's website.
// Reads "raised" and "goal" dollar amounts from the thermometer section of the
// homepage HTML. Returns null if the numbers aren't in the page (for example if
// the embed draws them inside an image or frame).
export function parseTotals(html: string): { raised: number; goal: number } | null {
  // Prefer the section's id, then the CauseVox embed, then the last "Fundraising
  // Goal" text (earlier ones are usually menu links).
  let start = html.search(/id=["']thermometer["']/i);
  if (start < 0) start = html.search(/causevox/i);
  if (start < 0) {
    const all = [...html.matchAll(/fundraising\s+goal/gi)];
    start = all.length ? all[all.length - 1].index ?? -1 : -1;
  }
  if (start < 0) return null;
  const text = html
    .slice(start, start + 6000)
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
  const amounts = [...text.matchAll(/\$\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{2})?\s*(k|K)?/g)].map(
    (m) => Number(m[1].replace(/,/g, '')) * (m[2] ? 1000 : 1),
  );
  if (amounts.length < 2) return null;
  const goal = Math.max(...amounts);
  const raised = amounts.find((a) => a !== goal) ?? 0;
  return goal > 0 ? { raised, goal } : null;
}

export async function fetchSiteTotals() {
  const res = await fetch(`${config.siteUrl}/?t=${Date.now()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseTotals(await res.text());
}
