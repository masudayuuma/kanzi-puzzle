'use client';

import { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import { ActiveItem, PaletteItem, LaneType, LANE_CONFIG, ALL_LANES, radicalsByKey } from '@/data/parts';

interface ConveyorPaletteProps {
  onSelectPart: (partId: string) => void;
  containerWidth: number;
  containerHeight: number;
  canvasRect: { x: number; y: number; width: number; height: number };
  onScoreChange?: (score: number, miss: number) => void;
  onGameEnd?: (finalScore: number, finalMiss: number) => void;
}

// ========================================
// 設定値
// ========================================
const GAME_CONFIG = {
  SPAWN_INTERVAL: 1500,       // スポーン間隔（ミリ秒）
  MOVE_SPEED: 150,            // 移動速度（ピクセル/秒）
  LANE_THICKNESS: 80,         // レーン厚み
};

// ========================================
// State管理用のReducer
// ========================================
interface GameState {
  activeItems: ActiveItem[];
  palette: PaletteItem[];
  score: number;
  miss: number;
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
        score: state.score + 1,
      };
    }

    case 'REMOVE_MISSED_ITEMS':
      if (action.missedIds.length === 0) return state;
      return {
        ...state,
        activeItems: state.activeItems.filter((item) => !action.missedIds.includes(item.id)),
        miss: state.miss + action.missedIds.length,
      };

    case 'RESET_GAME':
      return {
        activeItems: [],
        palette: [],
        score: 0,
        miss: 0,
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
    miss: 0,
    nextId: 1,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const lastSpawnTimeRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef<number>(0);
  const gameStateRef = useRef(gameState);

  // gameStateRefを常に最新に保つ
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // スコアとミス数が変更されたら親に通知
  useEffect(() => {
    if (onScoreChange) {
      onScoreChange(gameState.score, gameState.miss);
    }
  }, [gameState.score, gameState.miss, onScoreChange]);

  // ========================================
  // スポーン位置計算
  // ========================================
  const getSpawnPosition = useCallback((lane: LaneType): { x: number; y: number } => {
    const laneThick = clamp(containerHeight * 0.08, 48, 72);
    const gap = 24;
    
    switch (lane) {
      case 'TOP':
        return { x: 0, y: canvasRect.y - gap - laneThick / 2 };
      case 'RIGHT':
        return { x: canvasRect.x + canvasRect.width + gap + laneThick / 2, y: 0 };
      case 'BOTTOM':
        return { x: containerWidth, y: canvasRect.y + canvasRect.height + gap + laneThick / 2 };
      case 'LEFT':
        return { x: canvasRect.x - gap - laneThick / 2, y: containerHeight };
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
      }

      const deltaTime = (timestamp - lastUpdateTimeRef.current) / 1000;
      lastUpdateTimeRef.current = timestamp;

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
  }, [isPlaying, spawnItem, containerWidth, containerHeight]);

  // ========================================
  // キー入力処理（優先順位付き）
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

    // そのレーンのアイテムを抽出
    const candidates = currentState.activeItems.filter((item) => item.lane === targetLane);
    if (candidates.length === 0) return;

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
      '亻': 'person',
      '木': 'tree',
      '氵': 'water',
      '火': 'fire',
      '土': 'earth',
      '日': 'sun',
      '月': 'moon',
      '口': 'mouth',
      '扌': 'hand',
      '心': 'heart',
    };
    const partId = partMap[targetItem.radical];
    if (partId) {
      onSelectPart(partId);
    }
  }, [onSelectPart]);

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
    setIsPlaying(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
    // ゲーム停止時に最終スコアを親に通知
    if (onGameEnd) {
      onGameEnd(gameState.score, gameState.miss);
    }
  };

  // ========================================
  // レーン矩形計算（キャンバスを囲う配置）
  // ========================================
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  const laneThickness = clamp(containerHeight * 0.08, 48, 72);
  const gap = 24; // キャンバスとレーンの間隔

  const laneRects = {
    TOP: {
      left: 0,
      top: canvasRect.y - gap - laneThickness,
      width: containerWidth,
      height: laneThickness,
    },
    RIGHT: {
      left: canvasRect.x + canvasRect.width + gap,
      top: 0,
      width: laneThickness,
      height: containerHeight,
    },
    BOTTOM: {
      left: 0,
      top: canvasRect.y + canvasRect.height + gap,
      width: containerWidth,
      height: laneThickness,
    },
    LEFT: {
      left: canvasRect.x - gap - laneThickness,
      top: 0,
      width: laneThickness,
      height: containerHeight,
    },
  };

  // コーナーブロッカー（角で繋がらないように分断）
  const cornerSize = laneThickness + gap;
  const corners = [
    { left: 0, top: 0, width: canvasRect.x - gap, height: canvasRect.y - gap }, // 左上
    { left: canvasRect.x + canvasRect.width + gap, top: 0, width: containerWidth - (canvasRect.x + canvasRect.width + gap), height: canvasRect.y - gap }, // 右上
    { left: canvasRect.x + canvasRect.width + gap, top: canvasRect.y + canvasRect.height + gap, width: containerWidth - (canvasRect.x + canvasRect.width + gap), height: containerHeight - (canvasRect.y + canvasRect.height + gap) }, // 右下
    { left: 0, top: canvasRect.y + canvasRect.height + gap, width: canvasRect.x - gap, height: containerHeight - (canvasRect.y + canvasRect.height + gap) }, // 左下
  ];

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
        <button
          onClick={isPlaying ? handleStop : handleStart}
          style={{
            padding: '8px 20px',
            fontSize: '15px',
            cursor: 'pointer',
            background: isPlaying ? '#f44336' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          {isPlaying ? '⏸ 停止' : '▶ 開始'}
        </button>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFD700' }}>
          Score: {gameState.score}
        </div>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FF4444' }}>
          Miss: {gameState.miss}
        </div>
      </div>

      {/* 4レーン描画 */}
      {(Object.keys(laneRects) as LaneType[]).map((lane) => {
        const rect = laneRects[lane];
        return (
          <div
            key={lane}
            style={{
              position: 'absolute',
              left: `${rect.left}px`,
              top: `${rect.top}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
              background: 'linear-gradient(135deg, #1a1a3e 0%, #0f0f2e 100%)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
            }}
          >
            {/* レーンラベル */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'rgba(255, 255, 255, 0.2)',
                fontSize: '14px',
                fontWeight: 'bold',
                pointerEvents: 'none',
              }}
            >
              {lane} [{LANE_CONFIG[lane].key}]
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
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#333',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                  }}
                >
                  <div>{item.radical}</div>
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: '#fff',
                      background: '#555',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      marginTop: '2px',
                    }}
                  >
                    {item.key}
                  </div>
                </div>
              ))}
          </div>
        );
      })}

      {/* コーナーブロッカー（角で繋がらないように分断） */}
      {corners.map((corner, index) => (
        <div
          key={`corner-${index}`}
          style={{
            position: 'absolute',
            left: `${corner.left}px`,
            top: `${corner.top}px`,
            width: `${corner.width}px`,
            height: `${corner.height}px`,
            background: '#000',
            zIndex: 5,
          }}
        />
      ))}
    </>
  );
};

export default ConveyorPalette;
