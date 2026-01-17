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
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [aiScore, setAiScore] = useState(0); // AI判定による正解スコア
  const [typingScore, setTypingScore] = useState(0); // タイピングゲームのスコア
  const [typingMiss, setTypingMiss] = useState(0); // タイピングゲームのミス数
  const audioRef = useRef<HTMLAudioElement>(null);

  // BGM再生
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // 音量を30%に設定
      audioRef.current.loop = true; // ループ再生
      audioRef.current.play().catch(err => {
        console.log('BGM autoplay prevented:', err);
      });
    }

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

  // 画面サイズに応じた正方形のサイズを計算
  const maxCanvasSize = Math.min(dimensions.width * 0.5, dimensions.height * 0.6);
  const canvasSize = clamp(maxCanvasSize, 400, 600);

  const canvasRect = {
    x: (dimensions.width - canvasSize) / 2,
    y: (dimensions.height - canvasSize) / 2,
    width: canvasSize,
    height: canvasSize,
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
    // キャンバスに何もない場合は処理しない
    if (placedParts.length === 0) return;

    // 非同期でAI判定を実行（ゲームを止めない）
    (async () => {
      try {
        // キャンバスから画像を取得
        const dataUrl = canvasRef.current?.toDataURL();
        if (!dataUrl) {
          throw new Error('キャンバスから画像を取得できませんでした');
        }

        // キャンバスをクリア（リクエスト送信後すぐに）
        setPlacedParts([]);
        setSelectedInstanceId(null);

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
      }
    })();
  };

  // Spaceキーでのジャッジ実行
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [placedParts]); // handleSubmitは依存に含めない（無限ループ防止）

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
            disabled={placedParts.length === 0}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              backgroundColor: placedParts.length === 0 ? '#95A5A6' : '#27AE60',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: placedParts.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            AI判定
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
