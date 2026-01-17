'use client';

import { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import { ActiveItem, PaletteItem, LaneType, LANE_CONFIG, ALL_LANES, radicalsByKey } from '@/data/parts';

interface ConveyorPaletteProps {
  onSelectPart: (partId: string) => void;
  containerWidth: number;
  containerHeight: number;
  canvasRect: { x: number; y: number; width: number; height: number };
  onScoreChange?: (score: number) => void;
  onGameEnd?: (finalScore: number) => void;
}

// ========================================
// 設定値
// ========================================
const GAME_CONFIG = {
  SPAWN_INTERVAL: 1500,       // スポーン間隔（ミリ秒）
  MOVE_SPEED: 150,            // 移動速度（ピクセル/秒）
  LANE_THICKNESS: 80,         // レーン厚み
  GAME_DURATION: 60,          // ゲーム時間（秒）
};

// ========================================
// State管理用のReducer
// ========================================
interface GameState {
  activeItems: ActiveItem[];
  palette: PaletteItem[];
  score: number;
  nextId: number;
}

type GameAction =
  | { type: 'ADD_ITEM'; item: ActiveItem }
  | { type: 'UPDATE_POSITIONS'; deltaTime: number; containerW: number; containerH: number }
  | { type: 'CAPTURE_ITEM'; itemId: string }
  | { type: 'REMOVE_MISSED_ITEMS'; missedIds: string[] }
  | { type: 'RESET_GAME' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        activeItems: [...state.activeItems, action.item],
        nextId: state.nextId + 1,
      };

    case 'UPDATE_POSITIONS': {
      const { deltaTime, containerW, containerH } = action;
      const speed = GAME_CONFIG.MOVE_SPEED * deltaTime;
      
      return {
        ...state,
        activeItems: state.activeItems.map((item) => {
          const config = LANE_CONFIG[item.lane];
          return {
            ...item,
            x: item.x + config.direction.x * speed,
            y: item.y + config.direction.y * speed,
          };
        }),
      };
    }

    case 'CAPTURE_ITEM': {
      const capturedItem = state.activeItems.find((item) => item.id === action.itemId);
      if (!capturedItem) return state;

      const paletteItem: PaletteItem = {
        id: capturedItem.id,
        radical: capturedItem.radical,
        key: capturedItem.key,
        lane: capturedItem.lane,
        captureTime: Date.now(),
      };

      return {
        ...state,
        activeItems: state.activeItems.filter((item) => item.id !== action.itemId),
        palette: [...state.palette, paletteItem],
        // キャッチ時は点数加算しない
      };
    }

    case 'REMOVE_MISSED_ITEMS':
      if (action.missedIds.length === 0) return state;
      return {
        ...state,
        activeItems: state.activeItems.filter((item) => !action.missedIds.includes(item.id)),
      };

    case 'RESET_GAME':
      return {
        activeItems: [],
        palette: [],
        score: 0,
        nextId: 1,
      };

    default:
      return state;
  }
}

const ConveyorPalette = ({ onSelectPart, containerWidth, containerHeight, canvasRect, onScoreChange, onGameEnd }: ConveyorPaletteProps) => {
  const [gameState, dispatch] = useReducer(gameReducer, {
    activeItems: [],
    palette: [],
    score: 0,
    nextId: 1,
  });

  const [isPlaying, setIsPlaying] = useState(true); // 初期状態で開始
  const [timeRemaining, setTimeRemaining] = useState(GAME_CONFIG.GAME_DURATION);
  const lastSpawnTimeRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef<number>(0);
  const gameStartTimeRef = useRef<number>(0);
  const gameStateRef = useRef(gameState);

  // gameStateRefを常に最新に保つ
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // スコアが変更されたら親に通知
  useEffect(() => {
    if (onScoreChange) {
      onScoreChange(gameState.score);
    }
  }, [gameState.score, onScoreChange]);

  // ========================================
  // スポーン位置計算（レーンの幅に対して中央配置）
  // ========================================
  const getSpawnPosition = useCallback((lane: LaneType): { x: number; y: number } => {
    const laneThickness = clamp(canvasRect.width * 0.15, 60, 100); // レーン描画と同じ厚さ
    const gap = 0; // レーン描画と同じギャップ
    
    // レーンの中心座標を計算（各レーンの厚みの中央に配置）
    switch (lane) {
      case 'TOP':
        // 左端からスタート、レーンの中心のy座標
        return { 
          x: 0, 
          y: canvasRect.y - gap - laneThickness / 2 
        };
      case 'RIGHT':
        // レーンの中心のx座標、上端からスタート
        return { 
          x: canvasRect.x + canvasRect.width + gap + laneThickness / 2, 
          y: 0 
        };
      case 'BOTTOM':
        // 右端からスタート、レーンの中心のy座標
        return { 
          x: containerWidth, 
          y: canvasRect.y + canvasRect.height + gap + laneThickness / 2 
        };
      case 'LEFT':
        // レーンの中心のx座標、下端からスタート
        return { 
          x: canvasRect.x - gap - laneThickness / 2, 
          y: containerHeight 
        };
    }
  }, [canvasRect, containerWidth, containerHeight]);

  // ========================================
  // スポーン処理
  // ========================================
  const spawnItem = useCallback(() => {
    const lane = ALL_LANES[Math.floor(Math.random() * ALL_LANES.length)];
    const key = LANE_CONFIG[lane].key;
    const radicals = radicalsByKey[key];
    const radical = radicals[Math.floor(Math.random() * radicals.length)];
    const pos = getSpawnPosition(lane);

    const newItem: ActiveItem = {
      id: `item-${gameStateRef.current.nextId}`,
      radical,
      key,
      lane,
      x: pos.x,
      y: pos.y,
      spawnTime: Date.now(),
    };

    dispatch({ type: 'ADD_ITEM', item: newItem });
  }, [getSpawnPosition]);

  // ========================================
  // ゲームループ
  // ========================================
  useEffect(() => {
    if (!isPlaying) return;

    let animationFrameId: number;

    const gameLoop = (timestamp: number) => {
      if (lastUpdateTimeRef.current === 0) {
        lastUpdateTimeRef.current = timestamp;
        lastSpawnTimeRef.current = timestamp;
        gameStartTimeRef.current = timestamp;
      }

      const deltaTime = (timestamp - lastUpdateTimeRef.current) / 1000;
      lastUpdateTimeRef.current = timestamp;

      // 経過時間を計算して残り時間を更新
      const elapsedSeconds = (timestamp - gameStartTimeRef.current) / 1000;
      const remaining = Math.max(0, GAME_CONFIG.GAME_DURATION - elapsedSeconds);
      setTimeRemaining(remaining);

      // 時間切れチェック
      if (remaining <= 0) {
        setIsPlaying(false);
        if (onGameEnd) {
          onGameEnd(gameStateRef.current.score);
        }
        return;
      }

      // スポーン処理
      if (timestamp - lastSpawnTimeRef.current >= GAME_CONFIG.SPAWN_INTERVAL) {
        spawnItem();
        lastSpawnTimeRef.current = timestamp;
      }

      // 位置更新
      dispatch({
        type: 'UPDATE_POSITIONS',
        deltaTime,
        containerW: containerWidth,
        containerH: containerHeight,
      });

      // ミス判定（画面外に出た）
      const missedIds = gameStateRef.current.activeItems
        .filter((item) => {
          switch (item.lane) {
            case 'TOP': return item.x > containerWidth;
            case 'RIGHT': return item.y > containerHeight;
            case 'BOTTOM': return item.x < 0;
            case 'LEFT': return item.y < 0;
          }
        })
        .map((item) => item.id);

      if (missedIds.length > 0) {
        dispatch({ type: 'REMOVE_MISSED_ITEMS', missedIds });
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, spawnItem, containerWidth, containerHeight, onGameEnd]);

  // ========================================
  // タイミング判定：アイテムがキーラベルゾーン内にいるか
  // ========================================
  const isItemInCaptureZone = useCallback((item: ActiveItem): boolean => {
    const rect = laneRects[item.lane];

    // キーラベル表示エリアのサイズと位置を定義
    const labelSize = { width: 60, height: 60 }; // ラベルのサイズ
    const tolerance = 25; // 判定を少し広げる（キャプチャしやすくする）

    switch (item.lane) {
      case 'TOP': {
        // 上レーン：中央付近の横位置判定
        const centerX = rect.left + rect.width / 2;
        return Math.abs(item.x - centerX) <= (labelSize.width / 2 + tolerance);
      }
      case 'BOTTOM': {
        // 下レーン：中央付近の横位置判定
        const centerX = rect.left + rect.width / 2;
        return Math.abs(item.x - centerX) <= (labelSize.width / 2 + tolerance);
      }
      case 'LEFT': {
        // 左レーン：中央付近の縦位置判定
        const centerY = rect.top + rect.height / 2;
        return Math.abs(item.y - centerY) <= (labelSize.height / 2 + tolerance);
      }
      case 'RIGHT': {
        // 右レーン：中央付近の縦位置判定
        const centerY = rect.top + rect.height / 2;
        return Math.abs(item.y - centerY) <= (labelSize.height / 2 + tolerance);
      }
    }
  }, [canvasRect, containerWidth, containerHeight]);

  // ========================================
  // キー入力処理（タイミング判定付き）
  // ========================================
  const handleKeyPress = useCallback((pressedKey: string) => {
    const currentState = gameStateRef.current;

    // キーに対応するレーンを特定
    let targetLane: LaneType | null = null;
    for (const lane of ALL_LANES) {
      if (LANE_CONFIG[lane].key === pressedKey) {
        targetLane = lane;
        break;
      }
    }

    if (!targetLane) return;

    // そのレーンのアイテムで、かつキャプチャゾーン内にあるものを抽出
    const candidates = currentState.activeItems.filter((item) =>
      item.lane === targetLane && isItemInCaptureZone(item)
    );

    if (candidates.length === 0) return; // ゾーン内にアイテムがなければ何もしない

    // 優先順位: 終点に最も近い（進行方向で最大/最小）
    candidates.sort((a, b) => {
      switch (targetLane) {
        case 'TOP': return b.x - a.x;      // x最大を優先
        case 'RIGHT': return b.y - a.y;    // y最大を優先
        case 'BOTTOM': return a.x - b.x;   // x最小を優先
        case 'LEFT': return a.y - b.y;     // y最小を優先
        default: return 0;
      }
    });

    const targetItem = candidates[0];
    dispatch({ type: 'CAPTURE_ITEM', itemId: targetItem.id });

    // 取得したパーツをキャンバスに追加
    const partMap: Record<string, string> = {
      '悪': 'aku', '口': 'kuchi', '雑': 'zatsu', '言': 'gen', '戦': 'sen2', '苦': 'ku', '闘': 'tou', '暗': 'an', '中': 'chuu', '模': 'mo',
      '索': 'saku', '以': 'i', '心': 'shin', '伝': 'den2', '威': 'i2', '風': 'fuu', '堂': 'dou2', '意': 'i3', '気': 'ki', '消': 'shou',
      '沈': 'chin', '投': 'tou2', '合': 'gou', '揚': 'you', '味': 'mi', '深': 'shin2', '長': 'chou', '異': 'i4', '同': 'dou3', '音': 'on',
      '一': 'ichi', '専': 'sen3', '衣': 'i5', '帯': 'tai', '水': 'sui', '家': 'ka', '団': 'dan', '欒': 'ran', '喜': 'ki2', '憂': 'yuu',
      '期': 'ki3', '会': 'kai', '騎': 'ki4', '当': 'tou3', '千': 'sen4', '挙': 'kyo', '動': 'dou', '両': 'ryou2', '得': 'toku', '居': 'kyo2',
      '士': 'shi2', '半': 'han', '句': 'ku2', '刻': 'koku', '金': 'kin', '字': 'ji', '所': 'sho', '懸': 'ken', '命': 'mei', '触': 'shoku2',
      '即': 'soku', '発': 'hatsu', '体': 'tai2', '不': 'fu', '乱': 'ran2', '世': 'sei2', '代': 'dai', '生': 'sei', '石': 'seki', '二': 'ni',
      '鳥': 'chou2', '切': 'setsu', '知': 'chi', '解': 'kai2', '朝': 'chou3', '夕': 'seki2', '短': 'tan', '刀': 'tou4', '断': 'dan2', '失': 'shitsu',
      '日': 'nichi', '秋': 'shuu', '念': 'nen', '起': 'ki5', '病': 'byou', '息': 'soku2', '災': 'sai', '因': 'in2', '果': 'ka2', '応': 'ou',
      '報': 'hou', '右': 'u', '往': 'ou2', '左': 'sa', '迂': 'u2', '余': 'yo', '曲': 'kyoku', '折': 'setsu2', '雲': 'un', '散': 'san',
      '霧': 'mu', '栄': 'ei', '枯': 'ko', '盛': 'sei3', '衰': 'sui2', '温': 'on2', '故': 'ko2', '新': 'shin3', '厚': 'kou2', '篤': 'toku2',
      '実': 'jitsu', '夏': 'ka3', '炉': 'ro', '冬': 'tou5', '扇': 'sen5', '花': 'ka4', '鳥': 'chou4', '月': 'getsu', '我': 'ga', '田': 'den3',
      '引': 'in3', '画': 'ga2', '龍': 'ryuu', '点': 'ten', '睛': 'sei4', '科': 'ka5', '玉': 'gyoku', '条': 'jou', '九': 'kyuu', '死': 'shi3',
      '惨': 'zan', '憺': 'tan2', '空': 'kuu', '前': 'zen', '絶': 'zetsu', '後': 'go', '君': 'kun', '子': 'shi4', '豹': 'hyou', '変': 'hen',
      '鯨': 'gei', '飲': 'in4', '馬': 'ba', '食': 'shoku', '語': 'go2', '道': 'dou4', '行': 'kou3', '致': 'chi2', '古': 'ko3', '今': 'kon',
      '東': 'tou6', '西': 'sei5', '孤': 'ko4', '軍': 'gun', '奮': 'fun', '立': 'ritsu', '無': 'mu2', '援': 'en', '虎': 'ko5', '視': 'shi5',
      '眈': 'tan3', '五': 'go3', '臓': 'zou', '六': 'roku', '腑': 'fu2', '分': 'bun', '里': 'ri2', '舟': 'shuu2', '呉': 'go4', '越': 'etsu',
      '公': 'kou4', '平': 'hei', '私': 'shi6', '明': 'mei2', '正': 'sei6', '大': 'dai2', '自': 'ji', '給': 'kyuu2', '足': 'soku3', '業': 'gyou',
      '暴': 'bou', '棄': 'ki6', '問': 'mon', '答': 'tou7', '由': 'yuu2', '在': 'zai2', '七': 'shichi', '転': 'ten2', '八': 'hachi', '倒': 'tou8',
      '質': 'shitsu2', '剛': 'gou2', '健': 'ken2', '弱': 'jaku', '肉': 'niku', '強': 'kyou2', '取': 'shu', '捨': 'sha3', '選': 'sen6', '択': 'taku',
      '手': 'te', '勝': 'shou2', '酒': 'shu2', '池': 'chi3', '林': 'rin', '終': 'shuu3', '始': 'shi7', '貫': 'kan', '十': 'juu', '人': 'jin',
      '色': 'shoku3', '縦': 'juu2', '横': 'ou3', '尽': 'jin2', '順': 'jun', '満': 'man', '帆': 'han2', '初': 'sho2', '志': 'shi8', '徹': 'tetsu',
      '諸': 'sho3', '常': 'jou2', '小': 'shou3', '春': 'shun', '和': 'wa', '機': 'ki7', '森': 'shin4', '羅': 'ra', '万': 'man2', '象': 'zou2',
      '歯': 'shi9', '扼': 'yaku', '腕': 'wan', '磋': 'sa2', '琢': 'taku2', '磨': 'ma', '客': 'kyaku', '来': 'rai', '差': 'sa3', '別': 'betsu',
      '載': 'sai2', '遇': 'guu', '化': 'ka6', '学': 'gaku', '校': 'kou', '先': 'sen', '教': 'kyou', '料': 'ryou', '理': 'ri', '品': 'hin',
      '材': 'zai', '車': 'sha', '電': 'den', '社': 'sha2', '員': 'in', '仕': 'shi', '事': 'ji2',
    };
    const partId = partMap[targetItem.radical];
    if (partId) {
      onSelectPart(partId);
    }
  }, [onSelectPart, isItemInCaptureZone]);

  // ========================================
  // キーボードイベント
  // ========================================
  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (['W', 'A', 'S', 'D'].includes(key)) {
        e.preventDefault();
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handleKeyPress]);

  // ========================================
  // ゲーム制御
  // ========================================
  const handleStart = () => {
    dispatch({ type: 'RESET_GAME' });
    lastSpawnTimeRef.current = 0;
    lastUpdateTimeRef.current = 0;
    gameStartTimeRef.current = 0;
    setTimeRemaining(GAME_CONFIG.GAME_DURATION);
    setIsPlaying(true);
  };

  // ========================================
  // レーン矩形計算（キャンバスを囲う配置）
  // ========================================
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  // レーンの厚みを適切なサイズに調整
  const laneThickness = clamp(canvasRect.width * 0.15, 60, 100);
  const gap = 0; // キャンバスとレーンの間隔

  const laneRects = {
    TOP: {
      left: canvasRect.x,
      top: canvasRect.y - gap - laneThickness,
      width: canvasRect.width,
      height: laneThickness,
    },
    RIGHT: {
      left: canvasRect.x + canvasRect.width + gap,
      top: canvasRect.y,
      width: laneThickness,
      height: canvasRect.height,
    },
    BOTTOM: {
      left: canvasRect.x,
      top: canvasRect.y + canvasRect.height + gap,
      width: canvasRect.width,
      height: laneThickness,
    },
    LEFT: {
      left: canvasRect.x - gap - laneThickness,
      top: canvasRect.y,
      width: laneThickness,
      height: canvasRect.height,
    },
  };

  // レーンごとの背景画像スタイル
  const getLaneBackground = (lane: LaneType): React.CSSProperties => {
    const isHorizontal = lane === 'TOP' || lane === 'BOTTOM';
    const railImage = isHorizontal ? '/horizontal-rail.png' : '/vertical-rail.png';

    return {
      backgroundImage: `url('${railImage}')`,
      backgroundSize: isHorizontal ? 'auto 100%' : '100% auto',
      backgroundRepeat: 'repeat',
      backgroundPosition: 'center',
    };
  };


  return (
    <>
      {/* コントロールバー（絶対位置） */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          display: 'flex',
          gap: '15px',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '8px',
          zIndex: 100,
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FF6B6B' }}>
          残り時間: {Math.ceil(timeRemaining)}秒
        </div>
      </div>

      {/* 4レーン描画 */}
      {(Object.keys(laneRects) as LaneType[]).map((lane) => {
        const rect = laneRects[lane];
        const backgroundStyle = getLaneBackground(lane);
        return (
          <div
            key={lane}
            style={{
              position: 'absolute',
              left: `${rect.left}px`,
              top: `${rect.top}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
              ...backgroundStyle,
              border: '2px solid rgba(139, 115, 85, 0.6)',
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* レーンラベル */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#fff',
                fontSize: '24px',
                fontWeight: 'bold',
                pointerEvents: 'none',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.5)',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                padding: '8px 12px',
                borderRadius: '4px',
              }}
            >
              {LANE_CONFIG[lane].key}
            </div>

            {/* このレーンのアイテム */}
            {gameState.activeItems
              .filter((item) => item.lane === lane)
              .map((item) => (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    left: `${item.x - rect.left}px`,
                    top: `${item.y - rect.top}px`,
                    transform: 'translate(-50%, -50%)',
                    width: '50px',
                    height: '50px',
                    background: 'linear-gradient(135deg, #f5deb3 0%, #d2b48c 100%)',
                    border: '3px solid #8b7355',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#333',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                  }}
                >
                  <div>{item.radical}</div>
                </div>
              ))}
          </div>
        );
      })}
    </>
  );
};

export default ConveyorPalette;
