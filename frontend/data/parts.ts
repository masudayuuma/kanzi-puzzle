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
  { id: 'gaku', label: '学', imageSrc: '/parts/gaku.png' },
  { id: 'sei', label: '生', imageSrc: '/parts/sei.png' },
  { id: 'kou', label: '校', imageSrc: '/parts/kou.png' },
  { id: 'sen', label: '先', imageSrc: '/parts/sen.png' },
  { id: 'kyou', label: '教', imageSrc: '/parts/kyou.png' },
  { id: 'shoku', label: '食', imageSrc: '/parts/shoku.png' },
  { id: 'ryou', label: '料', imageSrc: '/parts/ryou.png' },
  { id: 'ri', label: '理', imageSrc: '/parts/ri.png' },
  { id: 'hin', label: '品', imageSrc: '/parts/hin.png' },
  { id: 'zai', label: '材', imageSrc: '/parts/zai.png' },
  { id: 'ji', label: '自', imageSrc: '/parts/ji.png' },
  { id: 'dou', label: '動', imageSrc: '/parts/dou.png' },
  { id: 'sha', label: '車', imageSrc: '/parts/sha.png' },
  { id: 'den', label: '電', imageSrc: '/parts/den.png' },
  { id: 'ki', label: '気', imageSrc: '/parts/ki.png' },
  { id: 'kai', label: '会', imageSrc: '/parts/kai.png' },
  { id: 'sha2', label: '社', imageSrc: '/parts/sha2.png' },
  { id: 'in', label: '員', imageSrc: '/parts/in.png' },
  { id: 'shi', label: '仕', imageSrc: '/parts/shi.png' },
  { id: 'ji2', label: '事', imageSrc: '/parts/ji2.png' },
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
  radical: string;     // 漢字文字
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

// キーごとに使う熟語用の漢字20個のプール
export const radicalsByKey: Record<KeyType, string[]> = {
  W: ['学', '生', '校', '先', '教'],
  A: ['食', '料', '理', '品', '材'],
  S: ['自', '動', '車', '電', '気'],
  D: ['会', '社', '員', '仕', '事'],
};

export const ALL_KEYS: KeyType[] = ['W', 'A', 'S', 'D'];
