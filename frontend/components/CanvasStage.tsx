'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { PlacedPart, availableParts } from '@/data/parts';

export interface CanvasStageRef {
  toDataURL: () => string | null;
}

interface CanvasStageProps {
  placedParts: PlacedPart[];
  selectedInstanceId: string | null;
  onSelectPart: (instanceId: string | null) => void;
  onUpdatePartPosition: (instanceId: string, x: number, y: number) => void;
}

const CanvasStage = forwardRef<CanvasStageRef, CanvasStageProps>(({
  placedParts,
  selectedInstanceId,
  onSelectPart,
  onUpdatePartPosition,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggedPart, setDraggedPart] = useState<string | null>(null);
  const draggedPartRef = useRef<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [images, setImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const [isDragging, setIsDragging] = useState(false);

  // 親コンポーネントから呼び出せるメソッドを公開
  useImperativeHandle(ref, () => ({
    toDataURL: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return canvas.toDataURL('image/png', 1.0);
    }
  }));

  // 画像の読み込み
  useEffect(() => {
    const imageMap = new Map<string, HTMLImageElement>();

    availableParts.forEach((part) => {
      const img = new Image();
      img.src = part.imageSrc;
      img.onerror = () => {
        // 画像読み込み失敗時はマップに追加しない（テキスト表示にフォールバック）
      };
      img.onload = () => {
        imageMap.set(part.id, img);
        setImages(new Map(imageMap));
      };
    });
  }, []);

  // キャンバスの描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // パーツを描画
    placedParts.forEach((placedPart) => {
      const partDef = availableParts.find((p) => p.id === placedPart.partId);
      if (!partDef) return;

      const image = images.get(placedPart.partId);
      const isSelected = placedPart.instanceId === selectedInstanceId;

      ctx.save();

      // 選択枠を描画
      if (isSelected) {
        ctx.strokeStyle = '#4A90E2';
        ctx.lineWidth = 3;

        if (image) {
          ctx.strokeRect(
            placedPart.x - 5,
            placedPart.y - 5,
            image.width * placedPart.scale + 10,
            image.height * placedPart.scale + 10
          );
        } else {
          ctx.strokeRect(placedPart.x - 5, placedPart.y - 5, 60, 60);
        }
      }

      // 画像またはテキストを描画
      if (image) {
        ctx.drawImage(
          image,
          placedPart.x,
          placedPart.y,
          image.width * placedPart.scale,
          image.height * placedPart.scale
        );
      } else {
        // 画像が読み込めない場合はテキストで表示
        ctx.font = '48px sans-serif';
        ctx.fillStyle = '#000';
        ctx.fillText(partDef.label, placedPart.x, placedPart.y + 40);
      }

      ctx.restore();
    });
  }, [placedParts, selectedInstanceId, images]);

  // マウスイベント処理
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log('MouseDown:', { x, y, placedPartsCount: placedParts.length });

    // クリックされたパーツを探す（逆順で最前面から）
    for (let i = placedParts.length - 1; i >= 0; i--) {
      const part = placedParts[i];
      const partDef = availableParts.find((p) => p.id === part.partId);
      if (!partDef) continue;

      const image = images.get(part.partId);
      const width = image ? image.width * part.scale : 50;
      const height = image ? image.height * part.scale : 50;

      console.log('Checking part:', {
        partId: part.partId,
        x: part.x,
        y: part.y,
        width,
        height,
        clickX: x,
        clickY: y,
        inBounds: x >= part.x && x <= part.x + width && y >= part.y && y <= part.y + height
      });

      if (
        x >= part.x &&
        x <= part.x + width &&
        y >= part.y &&
        y <= part.y + height
      ) {
        console.log('Part selected!', part.instanceId);
        const offset = { x: x - part.x, y: y - part.y };

        setDraggedPart(part.instanceId);
        draggedPartRef.current = part.instanceId;

        setDragOffset(offset);
        dragOffsetRef.current = offset;

        setIsDragging(true);
        onSelectPart(part.instanceId);
        return;
      }
    }

    // 何もクリックされなかった場合は選択解除
    onSelectPart(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const currentDraggedPart = draggedPartRef.current;
    console.log('MouseMove event:', { draggedPart: currentDraggedPart, isDragging });

    if (!currentDraggedPart || !isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffsetRef.current.x;
    const y = e.clientY - rect.top - dragOffsetRef.current.y;

    console.log('MouseMove (dragging):', { draggedPart: currentDraggedPart, x, y });
    onUpdatePartPosition(currentDraggedPart, x, y);
  };

  const handleMouseUp = () => {
    console.log('MouseUp');
    setDraggedPart(null);
    draggedPartRef.current = null;
    setIsDragging(false);
  };

  return (
    <div style={{ border: '2px solid #ccc', display: 'inline-block' }}>
      <canvas
        ref={canvasRef}
        width={600}
        height={500}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'default' }}
      />
    </div>
  );
});

CanvasStage.displayName = 'CanvasStage';

export default CanvasStage;
