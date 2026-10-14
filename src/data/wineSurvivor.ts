// Wine Survivor play-along game. The live version of this data is a JSON file
// on the charity's website (see docs/wine-survivor.json); the values below are
// used until that file is uploaded, or if it can't be reached.

export type TribeStatus = 'in' | 'immune' | 'out';

export type Tribe = {
  id: string;
  name: string;
  status: TribeStatus;
  // Dollars donated to this tribe's Rally Fund, entered by the charity.
  rally: number;
};

export type Draw = {
  id: string;
  label: string;
  date: string;
  // 'open' while people can still make picks; set to 'closed' when the draw starts.
  status: 'open' | 'closed';
  // Tribe ids knocked out in this draw, filled in once it's done.
  eliminated: string[];
};

export type TriviaQuestion = {
  question: string;
  options: string[];
  // Index into options.
  answer: number;
};

export type WineSurvivor = {
  // The on/off switch. When false the tab is greyed out behind the next-date panel.
  active: boolean;
  edition: string;
  nextDate: string;
  nextDateNote: string;
  infoUrl: string;
  updated: string;
  tribes: Tribe[];
  draws: Draw[];
  trivia: TriviaQuestion[];
};

export const wineSurvivorFallback: WineSurvivor = {
  active: false,
  edition: 'Wine Survivor 4.0',
  nextDate: 'Dates coming soon',
  nextDateNote: 'Watch for an announcement on registration timelines.',
  infoUrl: 'https://www.anyasjourney.com/winesurvivor/',
  updated: '',
  // Sample tribes, only shown greyed out behind the next-date panel.
  tribes: [
    { id: 'sample-1', name: 'Merlot Mavericks', status: 'in', rally: 1250 },
    { id: 'sample-2', name: 'Pinot Pirates', status: 'immune', rally: 980 },
    { id: 'sample-3', name: 'Cabernet Castaways', status: 'in', rally: 640 },
    { id: 'sample-4', name: 'Rosé Rebels', status: 'out', rally: 410 },
  ],
  draws: [{ id: 'sample-draw', label: 'Draw 1', date: '', status: 'open', eliminated: [] }],
  trivia: [
    {
      question: 'Lamb-Shaffer Syndrome is linked to changes in which gene?',
      options: ['SOX5', 'BRCA1', 'CFTR', 'MECP2'],
      answer: 0,
    },
    {
      question: "Where is the first Anya's Journey playground planned?",
      options: ['Maple Bay', 'Fuller Lake', 'Duncan', 'Ladysmith'],
      answer: 1,
    },
    {
      question: 'About how many people worldwide have been diagnosed with Lamb-Shaffer Syndrome?',
      options: ['Fewer than 450', 'About 5,000', 'About 50,000', 'Over a million'],
      answer: 0,
    },
    {
      question: 'Where was the Wine Survivor 2.0 finale held?',
      options: ['Cowichan Golf & Country Club', 'The Oak Taphouse', 'Dairy Queen Duncan', 'Fuller Lake Arena'],
      answer: 1,
    },
    {
      question: 'How many teams entered Wine Survivor 3.0?',
      options: ['12', '24', '36', '48'],
      answer: 2,
    },
  ],
};
