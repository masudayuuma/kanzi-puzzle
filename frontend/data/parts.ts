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
  { id: 'ichi', label: '一', imageSrc: '/parts/ichi.png' },
  { id: 'ni', label: '二', imageSrc: '/parts/ni.png' },
  { id: 'san', label: '三', imageSrc: '/parts/san.png' },
  { id: 'shi', label: '四', imageSrc: '/parts/shi.png' },
  { id: 'go', label: '五', imageSrc: '/parts/go.png' },
  { id: 'juu', label: '十', imageSrc: '/parts/juu.png' },
  { id: 'hyaku', label: '百', imageSrc: '/parts/hyaku.png' },
  { id: 'sen', label: '千', imageSrc: '/parts/sen.png' },
  { id: 'man', label: '万', imageSrc: '/parts/man.png' },
  { id: 'jin', label: '人', imageSrc: '/parts/jin.png' },
  { id: 'mono', label: '者', imageSrc: '/parts/mono.png' },
  { id: 'otoko', label: '男', imageSrc: '/parts/otoko.png' },
  { id: 'onna', label: '女', imageSrc: '/parts/onna.png' },
  { id: 'ko', label: '子', imageSrc: '/parts/ko.png' },
  { id: 'tomo', label: '友', imageSrc: '/parts/tomo.png' },
  { id: 'oya', label: '親', imageSrc: '/parts/oya.png' },
  { id: 'ie', label: '家', imageSrc: '/parts/ie.png' },
  { id: 'tami', label: '民', imageSrc: '/parts/tami.png' },
  { id: 'hi', label: '日', imageSrc: '/parts/hi.png' },
  { id: 'tsuki', label: '月', imageSrc: '/parts/tsuki.png' },
  { id: 'toshi', label: '年', imageSrc: '/parts/toshi.png' },
  { id: 'toki', label: '時', imageSrc: '/parts/toki.png' },
  { id: 'fun', label: '分', imageSrc: '/parts/fun.png' },
  { id: 'ima', label: '今', imageSrc: '/parts/ima.png' },
  { id: 'saki', label: '先', imageSrc: '/parts/saki.png' },
  { id: 'ato', label: '後', imageSrc: '/parts/ato.png' },
  { id: 'mae', label: '前', imageSrc: '/parts/mae.png' },
  { id: 'ue', label: '上', imageSrc: '/parts/ue.png' },
  { id: 'shita', label: '下', imageSrc: '/parts/shita.png' },
  { id: 'naka', label: '中', imageSrc: '/parts/naka.png' },
  { id: 'soto', label: '外', imageSrc: '/parts/soto.png' },
  { id: 'uchi', label: '内', imageSrc: '/parts/uchi.png' },
  { id: 'hidari', label: '左', imageSrc: '/parts/hidari.png' },
  { id: 'migi', label: '右', imageSrc: '/parts/migi.png' },
  { id: 'dai', label: '大', imageSrc: '/parts/dai.png' },
  { id: 'shou', label: '小', imageSrc: '/parts/shou.png' },
  { id: 'shin', label: '新', imageSrc: '/parts/shin.png' },
  { id: 'furu', label: '古', imageSrc: '/parts/furu.png' },
  { id: 'taka', label: '高', imageSrc: '/parts/taka.png' },
  { id: 'hiku', label: '低', imageSrc: '/parts/hiku.png' },
  { id: 'naga', label: '長', imageSrc: '/parts/naga.png' },
  { id: 'tan', label: '短', imageSrc: '/parts/tan.png' },
  { id: 'oo', label: '多', imageSrc: '/parts/oo.png' },
  { id: 'suku', label: '少', imageSrc: '/parts/suku.png' },
  { id: 'sei', label: '生', imageSrc: '/parts/sei.png' },
  { id: 'shi2', label: '死', imageSrc: '/parts/shi2.png' },
  { id: 'gaku', label: '学', imageSrc: '/parts/gaku.png' },
  { id: 'kou', label: '校', imageSrc: '/parts/kou.png' },
  { id: 'iku', label: '育', imageSrc: '/parts/iku.png' },
  { id: 'kai', label: '会', imageSrc: '/parts/kai.png' },
  { id: 'sha', label: '社', imageSrc: '/parts/sha.png' },
  { id: 'in', label: '員', imageSrc: '/parts/in.png' },
  { id: 'tsuka', label: '仕', imageSrc: '/parts/tsuka.png' },
  { id: 'koto', label: '事', imageSrc: '/parts/koto.png' },
  { id: 'gyou', label: '業', imageSrc: '/parts/gyou.png' },
  { id: 'chikara', label: '力', imageSrc: '/parts/chikara.png' },
  { id: 'kokoro', label: '心', imageSrc: '/parts/kokoro.png' },
  { id: 'karada', label: '体', imageSrc: '/parts/karada.png' },
  { id: 'ki', label: '気', imageSrc: '/parts/ki.png' },
  { id: 'omo', label: '思', imageSrc: '/parts/omo.png' },
  { id: 'kanga', label: '考', imageSrc: '/parts/kanga.png' },
  { id: 'shi3', label: '知', imageSrc: '/parts/shi3.png' },
  { id: 'i', label: '意', imageSrc: '/parts/i.png' },
  { id: 'aji', label: '味', imageSrc: '/parts/aji.png' },
  { id: 'ri', label: '理', imageSrc: '/parts/ri.png' },
  { id: 'yoshi', label: '由', imageSrc: '/parts/yoshi.png' },
  { id: 'kan', label: '感', imageSrc: '/parts/kan.png' },
  { id: 'jou', label: '情', imageSrc: '/parts/jou.png' },
  { id: 'nen', label: '念', imageSrc: '/parts/nen.png' },
  { id: 'mi', label: '見', imageSrc: '/parts/mi.png' },
  { id: 'ki2', label: '聞', imageSrc: '/parts/ki2.png' },
  { id: 'i2', label: '言', imageSrc: '/parts/i2.png' },
  { id: 'hana', label: '話', imageSrc: '/parts/hana.png' },
  { id: 'ka', label: '書', imageSrc: '/parts/ka.png' },
  { id: 'yo', label: '読', imageSrc: '/parts/yo.png' },
  { id: 'go', label: '語', imageSrc: '/parts/go.png' },
  { id: 'bun', label: '文', imageSrc: '/parts/bun.png' },
  { id: 'i3', label: '行', imageSrc: '/parts/i3.png' },
  { id: 'ki3', label: '来', imageSrc: '/parts/ki3.png' },
  { id: 'de', label: '出', imageSrc: '/parts/de.png' },
  { id: 'hai', label: '入', imageSrc: '/parts/hai.png' },
  { id: 'ugo', label: '動', imageSrc: '/parts/ugo.png' },
  { id: 'to', label: '止', imageSrc: '/parts/to.png' },
  { id: 'ta', label: '立', imageSrc: '/parts/ta.png' },
  { id: 'yasu', label: '休', imageSrc: '/parts/yasu.png' },
  { id: 'hatara', label: '働', imageSrc: '/parts/hatara.png' },
  { id: 'tsuku', label: '作', imageSrc: '/parts/tsuku.png' },
  { id: 'tsuka2', label: '使', imageSrc: '/parts/tsuka2.png' },
  { id: 'mochi', label: '用', imageSrc: '/parts/mochi.png' },
  { id: 'to2', label: '取', imageSrc: '/parts/to2.png' },
  { id: 'mo', label: '持', imageSrc: '/parts/mo.png' },
  { id: 'ka2', label: '変', imageSrc: '/parts/ka2.png' },
  { id: 'ka3', label: '化', imageSrc: '/parts/ka3.png' },
  { id: 'susu', label: '進', imageSrc: '/parts/susu.png' },
  { id: 'shirizo', label: '退', imageSrc: '/parts/shirizo.png' },
  { id: 'den', label: '電', imageSrc: '/parts/den.png' },
  { id: 'kuruma', label: '車', imageSrc: '/parts/kuruma.png' },
  { id: 'eki', label: '駅', imageSrc: '/parts/eki.png' },
  { id: 'michi', label: '道', imageSrc: '/parts/michi.png' },
  { id: 'sora', label: '空', imageSrc: '/parts/sora.png' },
  { id: 'umi', label: '海', imageSrc: '/parts/umi.png' },
  { id: 'yama', label: '山', imageSrc: '/parts/yama.png' },
  { id: 'kawa', label: '川', imageSrc: '/parts/kawa.png' },
  { id: 'ten', label: '天', imageSrc: '/parts/ten.png' },
  { id: 'mizu', label: '水', imageSrc: '/parts/mizu.png' },
  { id: 'hi2', label: '火', imageSrc: '/parts/hi2.png' },
  { id: 'ki4', label: '木', imageSrc: '/parts/ki4.png' },
  { id: 'kin', label: '金', imageSrc: '/parts/kin.png' },
  { id: 'tsuchi', label: '土', imageSrc: '/parts/tsuchi.png' },
  { id: 'kaze', label: '風', imageSrc: '/parts/kaze.png' },
  { id: 'ame', label: '雨', imageSrc: '/parts/ame.png' },
  { id: 'yuki', label: '雪', imageSrc: '/parts/yuki.png' },
  { id: 'ta2', label: '食', imageSrc: '/parts/ta2.png' },
  { id: 'no', label: '飲', imageSrc: '/parts/no.png' },
  { id: 'ryou', label: '料', imageSrc: '/parts/ryou.png' },
  { id: 'mono2', label: '物', imageSrc: '/parts/mono2.png' },
  { id: 'shina', label: '品', imageSrc: '/parts/shina.png' },
  { id: 'ka4', label: '買', imageSrc: '/parts/ka4.png' },
  { id: 'u', label: '売', imageSrc: '/parts/u.png' },
  { id: 'mise', label: '店', imageSrc: '/parts/mise.png' },
  { id: 'ba', label: '場', imageSrc: '/parts/ba.png' },
  { id: 'kuni', label: '国', imageSrc: '/parts/kuni.png' },
  { id: 'chi', label: '地', imageSrc: '/parts/chi.png' },
  { id: 'kata', label: '方', imageSrc: '/parts/kata.png' },
  { id: 'yo2', label: '世', imageSrc: '/parts/yo2.png' },
  { id: 'kai2', label: '界', imageSrc: '/parts/kai2.png' },
  { id: 'zen', label: '全', imageSrc: '/parts/zen.png' },
  { id: 'bu', label: '部', imageSrc: '/parts/bu.png' },
  { id: 'betsu', label: '別', imageSrc: '/parts/betsu.png' },
  { id: 'dou', label: '同', imageSrc: '/parts/dou.png' },
  { id: 'tada', label: '正', imageSrc: '/parts/tada.png' },
  { id: 'waru', label: '悪', imageSrc: '/parts/waru.png' },
  { id: 'yo3', label: '良', imageSrc: '/parts/yo3.png' },
  { id: 'utsuku', label: '美', imageSrc: '/parts/utsuku.png' },
  { id: 'yasu2', label: '安', imageSrc: '/parts/yasu2.png' },
  { id: 'abu', label: '危', imageSrc: '/parts/abu.png' },
  { id: 'tsuyo', label: '強', imageSrc: '/parts/tsuyo.png' },
  { id: 'yowa', label: '弱', imageSrc: '/parts/yowa.png' },
  { id: 'muzuka', label: '難', imageSrc: '/parts/muzuka.png' },
  { id: 'ka5', label: '勝', imageSrc: '/parts/ka5.png' },
  { id: 'ma', label: '負', imageSrc: '/parts/ma.png' },
  { id: 'ikusa', label: '戦', imageSrc: '/parts/ikusa.png' },
  { id: 'nago', label: '和', imageSrc: '/parts/nago.png' },
  { id: 'tai', label: '平', imageSrc: '/parts/tai.png' },
  { id: 'araso', label: '争', imageSrc: '/parts/araso.png' },
  { id: 'kyou', label: '協', imageSrc: '/parts/kyou.png' },
  { id: 'totono', label: '調', imageSrc: '/parts/totono.png' },
  { id: 'mizuka', label: '自', imageSrc: '/parts/mizuka.png' },
  { id: 'ta2', label: '他', imageSrc: '/parts/ta2.png' },
  { id: 'nushi', label: '主', imageSrc: '/parts/nushi.png' },
  { id: 'kyaku', label: '客', imageSrc: '/parts/kyaku.png' },
  { id: 'ooyake', label: '公', imageSrc: '/parts/ooyake.png' },
  { id: 'watakushi', label: '私', imageSrc: '/parts/watakushi.png' },
  { id: 'nao', label: '直', imageSrc: '/parts/nao.png' },
  { id: 'tsu', label: '接', imageSrc: '/parts/tsu.png' },
  { id: 'han', label: '反', imageSrc: '/parts/han.png' },
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

// キーごとに使う漢字のプール
export const radicalsByKey: Record<KeyType, string[]> = {
  W: ['一', '二', '三', '四', '五', '十', '百', '千', '万', '人', '者', '男', '女', '子', '友', '親', '家', '民', '日', '月', '年', '時', '分', '今', '先', '後', '前', '上', '下', '中', '外', '内', '左', '右', '大', '小', '新', '古', '高', '低', '長', '短', '多', '少', '生', '死', '学', '校', '先', '教', '育', '会', '社', '員', '仕', '事', '業', '力', '心', '体', '気', '思', '考', '知', '意', '味', '理', '由', '感', '情', '念', '見', '聞', '言', '話', '書', '読', '語', '文', '行', '来', '出', '入', '動', '止', '立', '休', '働', '作', '使', '用', '取', '持', '変', '化', '進', '退', '電', '車', '駅', '道', '空', '海', '山', '川', '天', '水', '火', '木', '金', '土', '風', '雨', '雪', '食', '飲', '料', '物', '品', '買', '売', '店', '場', '国', '地', '方', '世', '界', '全', '部', '別', '同', '正', '悪', '良', '美', '安', '危', '強', '弱', '難', '勝', '負', '戦', '和', '平', '争', '協', '調', '自', '他', '主', '客', '公', '私', '直', '接', '反'],
  A: ['一', '二', '三', '四', '五', '十', '百', '千', '万', '人', '者', '男', '女', '子', '友', '親', '家', '民', '日', '月', '年', '時', '分', '今', '先', '後', '前', '上', '下', '中', '外', '内', '左', '右', '大', '小', '新', '古', '高', '低', '長', '短', '多', '少', '生', '死', '学', '校', '先', '教', '育', '会', '社', '員', '仕', '事', '業', '力', '心', '体', '気', '思', '考', '知', '意', '味', '理', '由', '感', '情', '念', '見', '聞', '言', '話', '書', '読', '語', '文', '行', '来', '出', '入', '動', '止', '立', '休', '働', '作', '使', '用', '取', '持', '変', '化', '進', '退', '電', '車', '駅', '道', '空', '海', '山', '川', '天', '水', '火', '木', '金', '土', '風', '雨', '雪', '食', '飲', '料', '物', '品', '買', '売', '店', '場', '国', '地', '方', '世', '界', '全', '部', '別', '同', '正', '悪', '良', '美', '安', '危', '強', '弱', '難', '勝', '負', '戦', '和', '平', '争', '協', '調', '自', '他', '主', '客', '公', '私', '直', '接', '反'],
  S: ['一', '二', '三', '四', '五', '十', '百', '千', '万', '人', '者', '男', '女', '子', '友', '親', '家', '民', '日', '月', '年', '時', '分', '今', '先', '後', '前', '上', '下', '中', '外', '内', '左', '右', '大', '小', '新', '古', '高', '低', '長', '短', '多', '少', '生', '死', '学', '校', '先', '教', '育', '会', '社', '員', '仕', '事', '業', '力', '心', '体', '気', '思', '考', '知', '意', '味', '理', '由', '感', '情', '念', '見', '聞', '言', '話', '書', '読', '語', '文', '行', '来', '出', '入', '動', '止', '立', '休', '働', '作', '使', '用', '取', '持', '変', '化', '進', '退', '電', '車', '駅', '道', '空', '海', '山', '川', '天', '水', '火', '木', '金', '土', '風', '雨', '雪', '食', '飲', '料', '物', '品', '買', '売', '店', '場', '国', '地', '方', '世', '界', '全', '部', '別', '同', '正', '悪', '良', '美', '安', '危', '強', '弱', '難', '勝', '負', '戦', '和', '平', '争', '協', '調', '自', '他', '主', '客', '公', '私', '直', '接', '反'],
  D: ['一', '二', '三', '四', '五', '十', '百', '千', '万', '人', '者', '男', '女', '子', '友', '親', '家', '民', '日', '月', '年', '時', '分', '今', '先', '後', '前', '上', '下', '中', '外', '内', '左', '右', '大', '小', '新', '古', '高', '低', '長', '短', '多', '少', '生', '死', '学', '校', '先', '教', '育', '会', '社', '員', '仕', '事', '業', '力', '心', '体', '気', '思', '考', '知', '意', '味', '理', '由', '感', '情', '念', '見', '聞', '言', '話', '書', '読', '語', '文', '行', '来', '出', '入', '動', '止', '立', '休', '働', '作', '使', '用', '取', '持', '変', '化', '進', '退', '電', '車', '駅', '道', '空', '海', '山', '川', '天', '水', '火', '木', '金', '土', '風', '雨', '雪', '食', '飲', '料', '物', '品', '買', '売', '店', '場', '国', '地', '方', '世', '界', '全', '部', '別', '同', '正', '悪', '良', '美', '安', '危', '強', '弱', '難', '勝', '負', '戦', '和', '平', '争', '協', '調', '自', '他', '主', '客', '公', '私', '直', '接', '反'],
};

export const ALL_KEYS: KeyType[] = ['W', 'A', 'S', 'D'];
