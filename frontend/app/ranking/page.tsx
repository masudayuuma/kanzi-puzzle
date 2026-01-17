'use client';

import { useState, useEffect } from 'react';

interface RankingEntry {
  rank: number;
  user_name: string;
  score: number;
  created_at: string;
}

interface RankingsResponse {
  rankings: RankingEntry[];
  total_count: number;
}

export default function RankingPage() {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/rankings');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data: RankingsResponse = await response.json();
      setRankings(data.rankings);
      setTotalCount(data.total_count);
    } catch (err) {
      const message = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(message);
      console.error('Fetch rankings error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return '#4A90E2'; // Default blue
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '';
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #4A90E2 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '40px 20px',
      }}
    >
      {/* Belt Conveyor Background Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 80px,
              rgba(255, 255, 255, 0.03) 80px,
              rgba(255, 255, 255, 0.03) 160px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 40px,
              rgba(255, 255, 255, 0.02) 40px,
              rgba(255, 255, 255, 0.02) 80px
            )
          `,
          opacity: 0.3,
          pointerEvents: 'none',
        }}
      />

      {/* Subtle Moving Belt Effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            repeating-linear-gradient(
              90deg,
              transparent 0,
              rgba(255, 255, 255, 0.01) 50px,
              transparent 100px
            )
          `,
          animation: 'conveyorMove 20s linear infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Main Content Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '800px',
          width: '100%',
          background: 'rgba(30, 30, 50, 0.85)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '48px 40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1
            style={{
              margin: '0 0 8px 0',
              fontSize: '36px',
              fontWeight: '700',
              color: '#e0e0e0',
              letterSpacing: '0.05em',
            }}
          >
            ランキング
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: '#a0a0b0',
            }}
          >
            TOP 10 - 総エントリー数: {totalCount}件
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: '#a0a0b0',
              fontSize: '16px',
            }}
          >
            読み込み中...
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div
            style={{
              padding: '24px',
              background: 'rgba(231, 76, 60, 0.15)',
              border: '1px solid rgba(231, 76, 60, 0.3)',
              borderRadius: '12px',
              color: '#E74C3C',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
              エラーが発生しました
            </p>
            <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
            <button
              onClick={fetchRankings}
              style={{
                marginTop: '16px',
                padding: '10px 20px',
                background: '#E74C3C',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              再読み込み
            </button>
          </div>
        )}

        {/* Rankings List */}
        {!isLoading && !error && rankings.length === 0 && (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: '#a0a0b0',
              fontSize: '16px',
            }}
          >
            まだランキングデータがありません
          </div>
        )}

        {!isLoading && !error && rankings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rankings.map((entry) => (
              <div
                key={`${entry.rank}-${entry.user_name}-${entry.created_at}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '20px 24px',
                  background:
                    entry.rank <= 3
                      ? `linear-gradient(135deg, rgba(${
                          entry.rank === 1
                            ? '255, 215, 0'
                            : entry.rank === 2
                            ? '192, 192, 192'
                            : '205, 127, 50'
                        }, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)`
                      : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${
                    entry.rank <= 3
                      ? `rgba(${getRankColor(entry.rank)}, 0.3)`
                      : 'rgba(255, 255, 255, 0.1)'
                  }`,
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    entry.rank <= 3
                      ? `linear-gradient(135deg, rgba(${
                          entry.rank === 1
                            ? '255, 215, 0'
                            : entry.rank === 2
                            ? '192, 192, 192'
                            : '205, 127, 50'
                        }, 0.25) 0%, rgba(255, 255, 255, 0.08) 100%)`
                      : 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    entry.rank <= 3
                      ? `linear-gradient(135deg, rgba(${
                          entry.rank === 1
                            ? '255, 215, 0'
                            : entry.rank === 2
                            ? '192, 192, 192'
                            : '205, 127, 50'
                        }, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)`
                      : 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {/* Rank */}
                <div
                  style={{
                    minWidth: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {getRankEmoji(entry.rank) && (
                    <span style={{ fontSize: '24px' }}>{getRankEmoji(entry.rank)}</span>
                  )}
                  <span
                    style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: entry.rank <= 3 ? getRankColor(entry.rank) : '#a0a0b0',
                    }}
                  >
                    {entry.rank}
                  </span>
                </div>

                {/* User Name */}
                <div
                  style={{
                    flex: 1,
                    paddingLeft: '16px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#e0e0e0',
                      marginBottom: '4px',
                    }}
                  >
                    {entry.user_name}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#808090',
                    }}
                  >
                    {formatDate(entry.created_at)}
                  </div>
                </div>

                {/* Score */}
                <div
                  style={{
                    minWidth: '120px',
                    textAlign: 'right',
                  }}
                >
                  <div
                    style={{
                      fontSize: '28px',
                      fontWeight: '800',
                      color: entry.rank <= 3 ? getRankColor(entry.rank) : '#4A90E2',
                    }}
                  >
                    {entry.score.toLocaleString()}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#808090',
                    }}
                  >
                    点
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Links */}
        <div
          style={{
            marginTop: '40px',
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
          }}
        >
          <a
            href="/game"
            style={{
              color: '#4A90E2',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#357ABD';
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#4A90E2';
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            ゲームに戻る
          </a>
          {!isLoading && !error && (
            <button
              onClick={fetchRankings}
              style={{
                background: 'none',
                border: 'none',
                color: '#27AE60',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                padding: 0,
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#229954';
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#27AE60';
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              🔄 更新
            </button>
          )}
        </div>
      </div>

      {/* CSS Animation for Conveyor Belt */}
      <style jsx>{`
        @keyframes conveyorMove {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(100px);
          }
        }
      `}</style>
    </div>
  );
}
