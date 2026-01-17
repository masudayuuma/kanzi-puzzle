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
  {
    id: 'water',
    label: '氵',
    imageSrc: '/parts/water.png',
  },
  {
    id: 'fire',
    label: '火',
    imageSrc: '/parts/fire.png',
  },
  {
    id: 'earth',
    label: '土',
    imageSrc: '/parts/earth.png',
  },
  {
    id: 'sun',
    label: '日',
    imageSrc: '/parts/sun.png',
  },
  {
    id: 'moon',
    label: '月',
    imageSrc: '/parts/moon.png',
  },
  {
    id: 'mouth',
    label: '口',
    imageSrc: '/parts/mouth.png',
  },
  {
    id: 'hand',
    label: '扌',
    imageSrc: '/parts/hand.png',
  },
  {
    id: 'heart',
    label: '心',
    imageSrc: '/parts/heart.png',
  },
];
