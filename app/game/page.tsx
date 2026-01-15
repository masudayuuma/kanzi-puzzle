'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PlacedPart, availableParts } from '@/data/parts';
import Palette from '@/components/Palette';
import CanvasStage from '@/components/CanvasStage';

export default function GamePage() {
  const [placedParts, setPlacedParts] = useState<PlacedPart[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);

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
  };

  const handleSubmit = () => {
    alert('提出機能はまだ実装されていません');
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
          漢字パズル（お題：休）
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
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#27AE60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              提出
            </button>
          </div>

          {/* Canvas */}
          <CanvasStage
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
