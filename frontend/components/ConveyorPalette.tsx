'use client';

import { Part } from '@/data/parts';

interface ConveyorPaletteProps {
  parts: Part[];
  onSelectPart: (partId: string) => void;
}

const ConveyorPalette = ({ parts, onSelectPart }: ConveyorPaletteProps) => {
  // パーツを3回繰り返して途切れないスクロールを実現
  const repeatedParts = [...parts, ...parts, ...parts];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '180px',
        overflow: 'hidden',
        backgroundImage: 'url(/belt-conbeyor.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* スクロールするパーツコンテナ */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          gap: '40px',
          animation: 'conveyorScroll 20s linear infinite',
          paddingLeft: '20px',
        }}
      >
        {repeatedParts.map((part, index) => (
          <button
            key={`${part.id}-${index}`}
            onClick={() => onSelectPart(part.id)}
            style={{
              padding: '16px 24px',
              fontSize: '48px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '3px solid #4A90E2',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              minWidth: '80px',
              textAlign: 'center',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.backgroundColor = '#e8f4ff';
              e.currentTarget.style.borderColor = '#2E75B6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.borderColor = '#4A90E2';
            }}
          >
            {part.label}
          </button>
        ))}
      </div>

      {/* CSSアニメーション定義 */}
      <style jsx>{`
        @keyframes conveyorScroll {
          0% {
            left: 0;
          }
          100% {
            left: -33.33%; /* 3分の1移動（3回繰り返しているため） */
          }
        }
      `}</style>
    </div>
  );
};

export default ConveyorPalette;
