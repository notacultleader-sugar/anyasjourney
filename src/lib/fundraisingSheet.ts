import { config } from '@/constants/config';

// Reads the thermometer total from the charity's Google Sheet (published as CSV).
//
// Sheet layout (see docs/fundraising-sheet.md):
//   Goal            | 500000
//   Starting total  | 128420
//   Campaign        | Fuller Lake Inclusive Playground   (optional)
//   (blank row)
//   Date | Description | Amount
//   ...one row per donation; the app adds up the Amount column
//
// Raised = starting total + every amount below the "Amount" heading.

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(cell);
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

const money = (s: string | undefined) => {
  if (!s) return NaN;
  const cleaned = s.replace(/[$,\s]/g, '');
  return cleaned === '' ? NaN : Number(cleaned);
};

const label = (s: string | undefined) => (s ?? '').trim().toLowerCase();

export function parseSheet(csv: string): { goal: number; raised: number; title?: string } | null {
  const rows = parseCsv(csv);
  let goal = NaN;
  let start = 0;
  let title: string | undefined;
  let amountCol = -1;
  let added = 0;
  for (const row of rows) {
    if (amountCol >= 0) {
      const n = money(row[amountCol]);
      if (Number.isFinite(n)) added += n;
      continue;
    }
    const key = label(row[0]);
    if (key === 'goal') goal = money(row[1]);
    else if (key.startsWith('starting')) start = money(row[1]) || 0;
    else if (key === 'campaign' && row[1]?.trim()) title = row[1].trim();
    else {
      const col = row.findIndex((c) => label(c) === 'amount');
      if (col >= 0) amountCol = col;
    }
  }
  if (!Number.isFinite(goal) || goal <= 0) return null;
  return { goal, raised: Math.round((start + added) * 100) / 100, ...(title ? { title } : null) };
}

export async function fetchSheetTotals() {
  if (!config.fundraisingSheetCsvUrl) return null;
  const sep = config.fundraisingSheetCsvUrl.includes('?') ? '&' : '?';
  const res = await fetch(`${config.fundraisingSheetCsvUrl}${sep}t=${Date.now()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseSheet(await res.text());
}
