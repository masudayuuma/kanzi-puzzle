'use client';

import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PlacedPart } from '@/data/parts';
import ConveyorPalette from '@/components/ConveyorPalette';
import CanvasStage, { CanvasStageRef } from '@/components/CanvasStage';

interface JudgeResult {
  ok: boolean;
  recognized: string;
  confidence: number | null;
  rawText: string;
  message: string;
}

export default function GamePage() {
  const [placedParts, setPlacedParts] = useState<PlacedPart[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const canvasRef = useRef<CanvasStageRef>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [aiScore, setAiScore] = useState(0); // AI判定による正解スコア
  const [typingScore, setTypingScore] = useState(0); // タイピングゲームのスコア
  const [typingMiss, setTypingMiss] = useState(0); // タイピングゲームのミス数

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

  // キャンバス矩形を計算（中央に配置）
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  
  const canvasWidth = clamp(dimensions.width * 0.55, 520, 860);
  const canvasHeight = clamp(dimensions.height * 0.35, 260, 520);
  
  const canvasRect = {
    x: (dimensions.width - canvasWidth) / 2,
    y: (dimensions.height - canvasHeight) / 2,
    width: canvasWidth,
    height: canvasHeight,
  };

  const handleAddPart = (partId: string) => {
    const newPart: PlacedPart = {
      instanceId: uuidv4(),
      partId,
      x: 100 + Math.random() * 100, // ランダムな位置に配置
      y: 100 + Math.random() * 100,
      scale: 1,
      rotation: 0,
      zIndex: placedParts.length,
    };
    setPlacedParts([...placedParts, newPart]);
  };

  const handleUpdatePartPosition = (instanceId: string, x: number, y: number) => {
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
    setJudgeResult(null);
    setError(null);
    // スコアはリセットしない（ゲーム終了時に累積スコアを保持）
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // 多重実行防止

    setIsSubmitting(true);
    setError(null);
    setJudgeResult(null);

    // 非同期でAI判定を実行（ゲームを止めない）
    (async () => {
      try {
        // キャンバスから画像を取得
        const dataUrl = canvasRef.current?.toDataURL();
        if (!dataUrl) {
          throw new Error('キャンバスから画像を取得できませんでした');
        }

        // FastAPI に送信
        const response = await fetch('http://localhost:8000/api/judge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageDataUrl: dataUrl,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const result: JudgeResult = await response.json();
        setJudgeResult(result);

        // 正解ならAI判定スコアを+1
        if (result.ok) {
          setAiScore((prevScore) => prevScore + 1);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '不明なエラーが発生しました';
        setError(message);
        console.error('Submit error:', err);
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  // Spaceキーでのジャッジ実行
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSubmitting) {
        // タイピングゲーム実行中でない場合のみ
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting]); // handleSubmitは依存に含めない（無限ループ防止）

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative',
        width: '100vw', 
        height: '100vh', 
        overflow: 'hidden',
        background: '#000',
      }}
    >
      {/* 4方向レーン（ConveyorPalette） */}
      {dimensions.width > 0 && dimensions.height > 0 && (
        <ConveyorPalette
          onSelectPart={handleAddPart}
          containerWidth={dimensions.width}
          containerHeight={dimensions.height}
          canvasRect={canvasRect}
          onScoreChange={(score, miss) => {
            setTypingScore(score);
            setTypingMiss(miss);
          }}
          onGameEnd={(finalScore, finalMiss) => {
            // タイピングスコアとAI判定スコアを合算してゲーム終了ページへ
            const totalScore = finalScore + aiScore;
            window.location.href = `/gameend?score=${totalScore}`;
          }}
        />
      )}

      {/* 中央キャンバス */}
      <div
        style={{
          position: 'absolute',
          left: `${canvasRect.x}px`,
          top: `${canvasRect.y}px`,
          width: `${canvasRect.width}px`,
          height: `${canvasRect.height}px`,
          background: '#fff',
          border: '4px solid #4A90E2',
          borderRadius: '8px',
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        <CanvasStage
          ref={canvasRef}
          placedParts={placedParts}
          selectedInstanceId={selectedInstanceId}
          onSelectPart={setSelectedInstanceId}
          onUpdatePartPosition={handleUpdatePartPosition}
        />
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
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleDelete}
            disabled={!selectedInstanceId}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              backgroundColor: selectedInstanceId ? '#E74C3C' : '#555',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedInstanceId ? 'pointer' : 'not-allowed',
            }}
          >
            削除
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              backgroundColor: '#95A5A6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            リセット
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              backgroundColor: isSubmitting ? '#95A5A6' : '#27AE60',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? '判定中...' : 'AI判定'}
          </button>
        </div>

        {/* 判定結果 */}
        {judgeResult && (
          <div
            style={{
              padding: '12px',
              backgroundColor: judgeResult.ok ? 'rgba(39, 174, 96, 0.9)' : 'rgba(231, 76, 60, 0.9)',
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {judgeResult.ok ? '✅ 実在する漢字です！' : '❌ 実在しない漢字です'}
            </div>
            <div>{judgeResult.message}</div>
          </div>
        )}

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
