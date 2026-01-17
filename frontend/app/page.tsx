'use client';

import Link from 'next/link';

export default function HomePage() {
  const playStartSound = () => {
    const audio = new Audio('/sounds/start.mp3');
    audio.volume = 0.1; // 音量を10%に設定
    audio.play().catch(err => console.error('Audio play failed:', err));
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/pazzle-start.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
    >
      {/* コンテンツ */}
      <div
        style={{
          position: 'absolute',
          bottom: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '40px',
        }}
      >
        {/* 開始ボタン */}
        <Link
          href="/game"
          onClick={playStartSound}
          style={{
            padding: '24px 80px',
            fontSize: '36px',
            fontWeight: 'bold',
            backgroundColor: 'rgba(255, 165, 0, 0.95)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '12px',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3), inset 0 -4px 0 rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s ease',
            border: '3px solid rgba(255, 200, 0, 0.8)',
            cursor: 'pointer',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            letterSpacing: '2px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.4), inset 0 -4px 0 rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 180, 0, 0.98)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3), inset 0 -4px 0 rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 165, 0, 0.95)';
          }}
        >
          START
        </Link>

        {/* ランキングボタン */}
        <Link
          href="/ranking"
          style={{
            padding: '16px 60px',
            fontSize: '28px',
            fontWeight: 'bold',
            backgroundColor: 'rgba(255, 165, 0, 0.95)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 -3px 0 rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s ease',
            border: '2px solid rgba(255, 200, 0, 0.8)',
            cursor: 'pointer',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            letterSpacing: '2px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.4), inset 0 -3px 0 rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 180, 0, 0.98)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 -3px 0 rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 165, 0, 0.95)';
          }}
        >
          RANKING
        </Link>
      </div>
    </div>
  );
}
