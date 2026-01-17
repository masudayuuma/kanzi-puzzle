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

// === タイピングゲーム用の型定義 ===

export type KeyType = 'W' | 'A' | 'S' | 'D';
export type LaneType = 'TOP' | 'RIGHT' | 'BOTTOM' | 'LEFT';

// レーンごとの設定
export const LANE_CONFIG = {
  TOP: { key: 'W' as KeyType, direction: { x: 1, y: 0 } },    // 左→右
  RIGHT: { key: 'D' as KeyType, direction: { x: 0, y: 1 } },  // 上→下
  BOTTOM: { key: 'S' as KeyType, direction: { x: -1, y: 0 } }, // 右→左
  LEFT: { key: 'A' as KeyType, direction: { x: 0, y: -1 } },  // 下→上
};

export const ALL_LANES: LaneType[] = ['TOP', 'RIGHT', 'BOTTOM', 'LEFT'];

export interface ActiveItem {
  id: string;          // ユニークID
  radical: string;     // 部首文字
  key: KeyType;        // 対応キー W/A/S/D
  lane: LaneType;      // レーン TOP/RIGHT/BOTTOM/LEFT
  x: number;           // 横位置（ピクセル）
  y: number;           // 縦位置（ピクセル）
  spawnTime: number;   // スポーン時刻（デバッグ用）
}

export interface PaletteItem {
  id: string;
  radical: string;
  key: KeyType;
  lane: LaneType;      // どのレーンで取得したか
  captureTime: number; // 取得時刻
}

// キーごとに使う部首のプール
export const radicalsByKey: Record<KeyType, string[]> = {
  W: ['亻', '木', '氵', '火'],
  A: ['氵', '日', '月', '口'],
  S: ['木', '土', '扌', '心'],
  D: ['口', '月', '日', '土'],
};

export const ALL_KEYS: KeyType[] = ['W', 'A', 'S', 'D'];
