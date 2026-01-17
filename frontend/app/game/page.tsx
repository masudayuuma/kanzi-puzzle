'use client';

import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PlacedPart, availableParts } from '@/data/parts';
import Palette from '@/components/Palette';
import CanvasStage, { CanvasStageRef } from '@/components/CanvasStage';

interface JudgeResult {
  ok: boolean;
  recognized: string;
  confidence: number | null;
  rawText: string;
}

export default function GamePage() {
  const [placedParts, setPlacedParts] = useState<PlacedPart[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const canvasRef = useRef<CanvasStageRef>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const TARGET_KANJI = '休';

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
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setJudgeResult(null);

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
          targetKanji: TARGET_KANJI,
          imageDataUrl: dataUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result: JudgeResult = await response.json();
      setJudgeResult(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(message);
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header
        style={{
          padding: '20px',
          backgroundColor: '#4A90E2',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '28px' }}>
          漢字パズル（お題：{TARGET_KANJI}）
        </h1>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          padding: '20px',
          gap: '20px',
        }}
      >
        {/* Left: Palette */}
        <div>
          <Palette parts={availableParts} onSelectPart={handleAddPart} />
        </div>

        {/* Right: Canvas and Controls */}
        <div style={{ flex: 1 }}>
          {/* Controls */}
          <div
            style={{
              marginBottom: '16px',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}
          >
            <button
              onClick={handleDelete}
              disabled={!selectedInstanceId}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: selectedInstanceId ? '#E74C3C' : '#ccc',
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
                fontSize: '16px',
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
                fontSize: '16px',
                backgroundColor: isSubmitting ? '#95A5A6' : '#27AE60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? '判定中...' : '提出'}
            </button>
          </div>

          {/* Result Display */}
          {judgeResult && (
            <div
              style={{
                marginBottom: '16px',
                padding: '16px',
                backgroundColor: judgeResult.ok ? '#D5F4E6' : '#F8D7DA',
                border: `2px solid ${judgeResult.ok ? '#27AE60' : '#E74C3C'}`,
                borderRadius: '8px',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
                {judgeResult.ok ? '✅ 正解です！' : '❌ 不正解です'}
              </h3>
              <p style={{ margin: '4px 0', fontSize: '16px' }}>
                <strong>認識結果:</strong> {judgeResult.recognized || '（認識できませんでした）'}
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                <strong>生の返答:</strong> {judgeResult.rawText}
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div
              style={{
                marginBottom: '16px',
                padding: '16px',
                backgroundColor: '#F8D7DA',
                border: '2px solid #E74C3C',
                borderRadius: '8px',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#E74C3C' }}>
                エラーが発生しました
              </h3>
              <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
            </div>
          )}

          {/* Canvas */}
          <CanvasStage
            ref={canvasRef}
            placedParts={placedParts}
            selectedInstanceId={selectedInstanceId}
            onSelectPart={setSelectedInstanceId}
            onUpdatePartPosition={handleUpdatePartPosition}
          />
        </div>
      </main>
    </div>
  );
}
