'use client';

import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PlacedPart } from '@/data/parts';
import ConveyorPalette from '@/components/ConveyorPalette';
import CanvasStage, { CanvasStageRef } from '@/components/CanvasStage';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

interface JudgeResult {
  ok: boolean;
  recognized: string;
  confidence: number | null;
  rawText: string;
  message: string;
}

type GridArea = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export default function GamePage() {
  const [placedParts, setPlacedParts] = useState<PlacedPart[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const canvasRef = useRef<CanvasStageRef>(null);
  const [judgeResults, setJudgeResults] = useState<Record<GridArea, JudgeResult | null>>({
    'top-left': null,
    'top-right': null,
    'bottom-left': null,
    'bottom-right': null,
  });
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [aiScore, setAiScore] = useState(0);
  const [typingScore, setTypingScore] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [judgingAreas, setJudgingAreas] = useState<Set<GridArea>>(new Set());

  // BGM再生 & ゲーム終了画面の画像をプリロード
  useEffect(() => {
    // BGM
    if (audioRef.current) {
      audioRef.current.volume = 0.1;
      audioRef.current.loop = true;
      audioRef.current.play().catch(err => {
        console.log('BGM autoplay prevented:', err);
      });
    }

    // ゲーム終了画面の背景画像をプリロード（白いフラッシュを防ぐ）
    const img = new Image();
    img.src = '/game-end-machine.png';

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // コンテナサイズを取得
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // キャンバス矩形を計算（正方形、中央に配置）
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  const maxCanvasSize = Math.min(dimensions.width * 0.5, dimensions.height * 0.6);
  const canvasSize = clamp(maxCanvasSize, 400, 600);

  const canvasRect = {
    x: (dimensions.width - canvasSize) / 2,
    y: (dimensions.height - canvasSize) / 2,
    width: canvasSize,
    height: canvasSize,
  };

  // 4つのグリッドエリアの定義
  const gridAreas: Record<GridArea, { x: number; y: number; width: number; height: number; label: string }> = {
    'top-left': {
      x: 0,
      y: 0,
      width: canvasSize / 2,
      height: canvasSize / 2,
      label: '編集エリア',
    },
    'top-right': {
      x: canvasSize / 2,
      y: 0,
      width: canvasSize / 2,
      height: canvasSize / 2,
      label: '提出1',
    },
    'bottom-left': {
      x: 0,
      y: canvasSize / 2,
      width: canvasSize / 2,
      height: canvasSize / 2,
      label: '提出2',
    },
    'bottom-right': {
      x: canvasSize / 2,
      y: canvasSize / 2,
      width: canvasSize / 2,
      height: canvasSize / 2,
      label: '提出3',
    },
  };

  const handleAddPart = (partId: string) => {
    // 編集エリア（top-left）の範囲内にランダムに配置
    const editArea = gridAreas['top-left'];
    const margin = 20; // エリアの端から少し離す

    const newPart: PlacedPart = {
      instanceId: uuidv4(),
      partId,
      x: editArea.x + margin + Math.random() * (editArea.width - margin * 2),
      y: editArea.y + margin + Math.random() * (editArea.height - margin * 2),
      scale: 1,
      rotation: 0,
      zIndex: placedParts.length,
    };
    setPlacedParts([...placedParts, newPart]);
  };

  const handleUpdatePartPosition = (instanceId: string, x: number, y: number) => {
    // 判定中のエリアかチェック
    let isInJudgingArea = false;
    for (const area of judgingAreas) {
      const areaRect = gridAreas[area];
      if (
        x >= areaRect.x &&
        x < areaRect.x + areaRect.width &&
        y >= areaRect.y &&
        y < areaRect.y + areaRect.height
      ) {
        isInJudgingArea = true;
        break;
      }
    }

    // 判定中のエリアには配置できない
    if (isInJudgingArea) return;

    setPlacedParts((parts) =>
      parts.map((part) =>
        part.instanceId === instanceId ? { ...part, x, y } : part
      )
    );
  };

  const handleDelete = () => {
    if (selectedInstanceId) {
      setPlacedParts((parts) =>
        parts.filter((part) => part.instanceId !== selectedInstanceId)
      );
      setSelectedInstanceId(null);
    }
  };

  const handleReset = () => {
    setPlacedParts([]);
    setSelectedInstanceId(null);
    setError(null);
  };

  // スペースキーで削除
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && selectedInstanceId) {
        e.preventDefault();
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedInstanceId]);

  // 指定されたグリッドエリア内のパーツのみをAI判定
  const handleSubmitArea = async (area: GridArea) => {
    const areaRect = gridAreas[area];

    // そのエリア内のパーツを抽出
    const partsInArea = placedParts.filter((part) => {
      return (
        part.x >= areaRect.x &&
        part.x < areaRect.x + areaRect.width &&
        part.y >= areaRect.y &&
        part.y < areaRect.y + areaRect.height
      );
    });

    if (partsInArea.length === 0) return;

    // 判定開始
    setJudgingAreas((prev) => new Set(prev).add(area));

    try {
      const dataUrl = canvasRef.current?.toDataURL();
      if (!dataUrl) {
        throw new Error('キャンバスから画像を取得できませんでした');
      }

      // エリアの部分だけを切り取った画像を作成
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = areaRect.width;
      tempCanvas.height = areaRect.height;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // エリアの部分を切り取り
      ctx.drawImage(
        img,
        areaRect.x, areaRect.y, areaRect.width, areaRect.height,
        0, 0, areaRect.width, areaRect.height
      );

      const croppedDataUrl = tempCanvas.toDataURL();

      // FastAPI に送信
      const response = await fetch(`${API_BASE}/api/judge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageDataUrl: croppedDataUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result: JudgeResult = await response.json();

      // 判定結果を保存
      setJudgeResults((prev) => ({ ...prev, [area]: result }));

      // 正解音・不正解音を再生
      const audio = new Audio(result.ok ? '/sounds/correct.mp3' : '/sounds/no-correct.mp3');
      audio.volume = 0.6;
      audio.play().catch(err => console.error('Audio play failed:', err));

      // 正解なら文字数に応じてスコア加算
      if (result.ok) {
        const length = result.recognized.length;
        let points = 0;
        if (length === 2) {
          points = 2;  // 二字熟語: 2点
        } else if (length === 3) {
          points = 16; // 三字熟語: 16点
        } else if (length >= 4) {
          points = 64; // 四字熟語以上: 64点
        }
        setAiScore((prevScore) => prevScore + points);

        // 正解したエリアのパーツをクリア
        setPlacedParts((parts) =>
          parts.filter((part) => !partsInArea.find((p) => p.instanceId === part.instanceId))
        );
      }

      // 2秒後に判定結果を自動で削除
      setTimeout(() => {
        setJudgeResults((prev) => {
          const newResults = { ...prev };
          delete newResults[area];
          return newResults;
        });
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(message);
      console.error('Submit error:', err);
    } finally {
      // 判定終了
      setJudgingAreas((prev) => {
        const newSet = new Set(prev);
        newSet.delete(area);
        return newSet;
      });
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundImage: 'url(/game-back.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* BGM */}
      <audio ref={audioRef} src="/sounds/gamesound.mp3" />

      {/* 4方向レーン（ConveyorPalette） */}
      {dimensions.width > 0 && dimensions.height > 0 && (
        <ConveyorPalette
          onSelectPart={handleAddPart}
          containerWidth={dimensions.width}
          containerHeight={dimensions.height}
          canvasRect={canvasRect}
          onScoreChange={(score) => {
            setTypingScore(score);
          }}
          onGameEnd={(finalScore) => {
            const totalScore = finalScore + aiScore;
            window.location.href = `/gameend?score=${totalScore}`;
          }}
        />
      )}

      {/* 中央キャンバス（1つの大きなcanvas） */}
      <div
        style={{
          position: 'absolute',
          left: `${canvasRect.x}px`,
          top: `${canvasRect.y}px`,
          width: `${canvasRect.width}px`,
          height: `${canvasRect.height}px`,
          background: '#fff',
          borderRadius: '8px',
          overflow: 'hidden',
          zIndex: 10,
          border: '3px solid #4A90E2',
        }}
      >
        {/* Canvas */}
        <CanvasStage
          ref={canvasRef}
          placedParts={placedParts}
          selectedInstanceId={selectedInstanceId}
          onSelectPart={setSelectedInstanceId}
          onUpdatePartPosition={handleUpdatePartPosition}
        />

        {/* 点線グリッド（縦線） */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            width: '2px',
            height: '100%',
            backgroundImage: 'linear-gradient(to bottom, #999 50%, transparent 50%)',
            backgroundSize: '2px 8px',
            pointerEvents: 'none',
          }}
        />

        {/* 点線グリッド（横線） */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            width: '100%',
            height: '2px',
            backgroundImage: 'linear-gradient(to right, #999 50%, transparent 50%)',
            backgroundSize: '8px 2px',
            pointerEvents: 'none',
          }}
        />

        {/* 各エリアのラベルと提出ボタン */}
        {(Object.keys(gridAreas) as GridArea[]).map((area) => {
          const areaData = gridAreas[area];
          const isEditArea = area === 'top-left';

          return (
            <div
              key={area}
              style={{
                position: 'absolute',
                left: `${areaData.x}px`,
                top: `${areaData.y}px`,
                width: `${areaData.width}px`,
                height: `${areaData.height}px`,
                pointerEvents: 'none',
              }}
            >
              {/* エリアラベル */}
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  padding: '4px 8px',
                  background: isEditArea ? 'rgba(74, 144, 226, 0.9)' : 'rgba(39, 174, 96, 0.9)',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              >
                {areaData.label}
              </div>

              {/* 提出ボタン（編集エリア以外） */}
              {!isEditArea && (
                <button
                  onClick={() => handleSubmitArea(area)}
                  disabled={judgingAreas.has(area)}
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: judgingAreas.has(area) ? '#95A5A6' : '#27AE60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: judgingAreas.has(area) ? 'not-allowed' : 'pointer',
                    pointerEvents: 'auto',
                    opacity: judgingAreas.has(area) ? 0.6 : 1,
                  }}
                >
                  {judgingAreas.has(area) ? '判定中...' : 'AI判定'}
                </button>
              )}

              {/* 判定中のオーバーレイ */}
              {judgingAreas.has(area) && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(128, 128, 128, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    zIndex: 5,
                  }}
                >
                  <div
                    style={{
                      padding: '12px 20px',
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: 'white',
                      textAlign: 'center',
                    }}
                  >
                    🔍 判定中...<br />
                    <span style={{ fontSize: '10px', opacity: 0.8 }}>配置不可</span>
                  </div>
                </div>
              )}

              {/* 判定結果表示 */}
              {judgeResults[area] && (
                <div
                  style={{
                    position: 'absolute',
                    top: '35px',
                    left: '8px',
                    right: '8px',
                    padding: '6px',
                    backgroundColor: judgeResults[area]!.ok
                      ? 'rgba(39, 174, 96, 0.9)'
                      : 'rgba(231, 76, 60, 0.9)',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '10px',
                  }}
                >
                  {judgeResults[area]!.ok ? '✅ 正解！' : '❌ 不正解'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* コントロールパネル（右下固定） */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleDelete}
            disabled={!selectedInstanceId}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              backgroundColor: selectedInstanceId ? '#E74C3C' : '#555',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedInstanceId ? 'pointer' : 'not-allowed',
            }}
          >
            削除 (space)
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              backgroundColor: '#95A5A6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            リセット
          </button>
        </div>

        {/* エラー表示 */}
        {error && (
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(231, 76, 60, 0.9)',
              color: 'white',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* タイトル（左上固定） */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '12px 20px',
          background: 'rgba(74, 144, 226, 0.9)',
          color: 'white',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: 'bold',
          zIndex: 100,
        }}
      >
        漢字パズル
      </div>
    </div>
  );
}
