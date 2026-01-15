export interface Part {
  id: string;
  label: string;
  imageSrc: string;
}

export interface PlacedPart {
  instanceId: string;
  partId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

export const availableParts: Part[] = [
  {
    id: 'person',
    label: '亻',
    imageSrc: '/parts/person.png',
  },
  {
    id: 'tree',
    label: '木',
    imageSrc: '/parts/tree.png',
  },
];
