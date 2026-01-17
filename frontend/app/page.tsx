import Link from 'next/link';

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
      }}
    >
      <h1 style={{ fontSize: '48px', marginBottom: '32px' }}>漢字パズル</h1>
      <Link
        href="/game"
        style={{
          padding: '16px 32px',
          fontSize: '24px',
          backgroundColor: '#4A90E2',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
        }}
      >
        ゲームを始める
      </Link>
    </div>
  );
}
