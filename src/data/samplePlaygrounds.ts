import type { FoundPlayground } from '@/lib/overpass';

// SAMPLE data for the web preview only (config.previewMode). Names, locations
// and features are illustrative, not a real survey of these playgrounds.
export const samplePlaygrounds: FoundPlayground[] = [
  {
    id: 'sample/fuller-lake',
    name: "Fuller Lake Park (Anya's Playground)",
    latitude: 48.922,
    longitude: -123.733,
    access: 'yes',
    features: ['Coming soon', 'Wheelchair accessible', 'Accessible swing', 'Sensory friendly', 'Smooth surface'],
  },
  {
    id: 'sample/chemainus-waterwheel',
    name: 'Waterwheel Park Playground',
    latitude: 48.927,
    longitude: -123.713,
    access: 'yes',
    features: ['Wheelchair accessible', 'Smooth surface', 'Accessible swing'],
  },
  {
    id: 'sample/ladysmith-transfer',
    name: 'Transfer Beach Playground',
    latitude: 48.99,
    longitude: -123.806,
    access: 'limited',
    features: ['Partly wheelchair accessible', 'Wheelchair merry-go-round'],
  },
  {
    id: 'sample/crofton',
    name: 'Crofton Seawalk Playground',
    latitude: 48.866,
    longitude: -123.648,
    access: 'limited',
    features: ['Accessible swing', 'Play panels'],
  },
  {
    id: 'sample/maple-bay',
    name: 'Maple Bay Community Playground',
    latitude: 48.8,
    longitude: -123.645,
    access: 'yes',
    features: ['Wheelchair accessible', 'Sensory friendly', 'Fenced'],
  },
  {
    id: 'sample/duncan-centennial',
    name: 'Centennial Park Playground',
    latitude: 48.781,
    longitude: -123.705,
    access: 'yes',
    features: ['Wheelchair accessible', 'Smooth surface', 'Accessible see-saw'],
  },
  {
    id: 'sample/duncan-mcadam',
    name: 'McAdam Park Playground',
    latitude: 48.792,
    longitude: -123.715,
    access: 'limited',
    features: ['Accessible play structure'],
  },
  {
    id: 'sample/cowichan-bay',
    name: 'Cowichan Bay Playground',
    latitude: 48.742,
    longitude: -123.62,
    access: 'unknown',
    features: [],
  },
];

// The area the sample map draws.
export const sampleBounds = { north: 49.02, south: 48.72, west: -123.86, east: -123.56 };
