'use client';

import { Part } from '@/data/parts';

interface PaletteProps {
  parts: Part[];
  onSelectPart: (partId: string) => void;
}

const Palette = ({ parts, onSelectPart }: PaletteProps) => {
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        minWidth: '150px',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>
        パーツパレット
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {parts.map((part) => (
          <button
            key={part.id}
            onClick={() => onSelectPart(part.id)}
            style={{
              padding: '12px',
              fontSize: '32px',
              backgroundColor: '#fff',
              border: '2px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e8f4ff';
              e.currentTarget.style.borderColor = '#4A90E2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.borderColor = '#ccc';
            }}
          >
            {part.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Palette;
