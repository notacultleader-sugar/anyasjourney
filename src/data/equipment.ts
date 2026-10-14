import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

export type EquipmentItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
};

// PLACEHOLDER items and prices. Replace with the charity's real list.
export const equipment: EquipmentItem[] = [
  {
    id: 'park-bench',
    name: 'Park Bench',
    description: 'A place for parents, grandparents and friends to rest, with a dedication plaque.',
    price: 1500,
    icon: 'bench',
  },
  {
    id: 'accessible-swing',
    name: 'Accessible Swing Seat',
    description: 'A supportive swing seat so kids and teens of every ability can swing.',
    price: 3500,
    icon: 'wheelchair-accessibility',
  },
  {
    id: 'sensory-panel',
    name: 'Sensory Play Panel',
    description: 'Hands-on panels with sounds, textures and colours to explore.',
    price: 4000,
    icon: 'puzzle-outline',
  },
  {
    id: 'picnic-table',
    name: 'Accessible Picnic Table',
    description: 'A table with open ends so wheelchairs can pull right up.',
    price: 2500,
    icon: 'table-picnic',
  },
  {
    id: 'inclusive-slide',
    name: 'Inclusive Slide',
    description: 'A wide slide with a transfer platform at the top.',
    price: 9000,
    icon: 'slide',
  },
  {
    id: 'seesaw',
    name: 'Accessible Seesaw',
    description: 'A seesaw with supportive seats for shared play.',
    price: 6500,
    icon: 'seesaw',
  },
  {
    id: 'shade-structure',
    name: 'Shade Structure',
    description: 'Shade over the play area so families can stay longer on sunny days.',
    price: 12000,
    icon: 'umbrella-beach-outline',
  },
  {
    id: 'tree',
    name: 'Plant a Tree',
    description: 'A tree for shade and beauty around the playground.',
    price: 500,
    icon: 'tree-outline',
  },
];

export const formatCurrency = (amount: number) =>
  `$${amount.toLocaleString('en-CA', { maximumFractionDigits: 0 })}`;
