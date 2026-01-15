'use client';

import React, { useEffect, useState } from 'react';
import { Image, Text, Group, Rect } from 'react-konva';
import { PlacedPart } from '@/data/parts';

interface PlacedPartNodeProps {
  part: PlacedPart;
  label: string;
  imageSrc: string;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
}

const PlacedPartNode = ({
  part,
  label,
  imageSrc,
  isSelected,
  onSelect,
  onDragEnd,
}: PlacedPartNodeProps) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = imageSrc;
    img.onload = () => {
      setImage(img);
      setImageError(false);
    };
    img.onerror = () => {
      setImageError(true);
    };
  }, [imageSrc]);

  const handleDragEnd = (e: any) => {
    onDragEnd(e.target.x(), e.target.y());
  };

  // 画像が読み込めた場合
  if (image && !imageError) {
    return (
      <Group
        x={part.x}
        y={part.y}
        draggable
        onDragEnd={handleDragEnd}
        onClick={onSelect}
        onTap={onSelect}
      >
        {isSelected && (
          <Rect
            x={-5}
            y={-5}
            width={image.width * part.scale + 10}
            height={image.height * part.scale + 10}
            stroke="#4A90E2"
            strokeWidth={3}
          />
        )}
        <Image
          image={image}
          scaleX={part.scale}
          scaleY={part.scale}
          rotation={part.rotation}
        />
      </Group>
    );
  }

  // 画像が読み込めない場合はテキストで代替表示
  return (
    <Group
      x={part.x}
      y={part.y}
      draggable
      onDragEnd={handleDragEnd}
      onClick={onSelect}
      onTap={onSelect}
    >
      {isSelected && (
        <Rect
          x={-5}
          y={-5}
          width={60}
          height={60}
          stroke="#4A90E2"
          strokeWidth={3}
        />
      )}
      <Text
        text={label}
        fontSize={48}
        fill="#000"
        width={50}
        height={50}
      />
    </Group>
  );
};

export default PlacedPartNode;
