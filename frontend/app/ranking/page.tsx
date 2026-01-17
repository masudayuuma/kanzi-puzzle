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
    const audio = new Audio('/sounds/finish.mp3');
    audio.play().catch(err => console.error('Audio play failed:', err));
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

  const terminalLines = [
    `TOTAL: ${totalCount} ENTRIES`,
    isLoading ? 'LOADING...' : `TOP ${rankings.length} RANKING`,
  ];

  return (
    <div className="page">
      {/* 背景画像 */}
      <div className="scene" aria-label="factory-console-background">
        {/* モニタ画面 */}
        <div className="screen">
          <div className="scanlines" />
          <div className="terminal">
            <div className="terminalHeader">
              <div className="led" />
              <div className="title">RANKING CONSOLE</div>
            </div>

            <div className="log">
              {terminalLines.map((line, i) => (
                <div key={i} className="line">
                  <span className="prompt">{'>'}</span> {line}
                </div>
              ))}
              {!isLoading && !error && rankings.length > 0 && (
                <div className="cursorLine">
                  <span className="prompt">{'>'}</span> VIEW<span className="cursor" />
                </div>
              )}
            </div>

            {/* メインコンテンツ */}
            <div className="content">
              {/* Loading State */}
              {isLoading && (
                <div className="centerMsg">
                  <span className="prompt">{'>'}</span> LOADING...
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="errorBox">
                  <div className="errorTitle">
                    <span className="prompt">{'!'}</span> ERROR
                  </div>
                  <div className="errorMsg">{error}</div>
                  <button onClick={fetchRankings} className="btn">
                    RETRY
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && rankings.length === 0 && (
                <div className="centerMsg">
                  <span className="prompt">{'>'}</span> NO DATA
                </div>
              )}

              {/* Rankings List */}
              {!isLoading && !error && rankings.length > 0 && (
                <div className="rankList">
                  {rankings.map((entry) => (
                    <div key={`${entry.rank}-${entry.user_name}-${entry.created_at}`} className="rankItem">
                      <div className="rankNum">
                        {getRankEmoji(entry.rank) && (
                          <span className="emoji">{getRankEmoji(entry.rank)}</span>
                        )}
                        <span className={entry.rank <= 3 ? 'rankHighlight' : ''}>
                          {entry.rank}
                        </span>
                      </div>
                      <div className="rankInfo">
                        <div className="userName">{entry.user_name}</div>
                        <div className="dateTime">{formatDate(entry.created_at)}</div>
                      </div>
                      <div className="scoreBox">
                        <div className={entry.rank <= 3 ? 'scoreHighlight' : 'scoreValue'}>
                          {entry.score.toLocaleString()}
                        </div>
                        <div className="scoreUnit">pts</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation Links */}
              <div className="links">
                <a href="/game" className="link">
                  {'>'} BACK TO GAME
                </a>
                {!isLoading && !error && (
                  <button onClick={fetchRankings} className="linkBtn">
                    {'>'} REFRESH
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ===== page ===== */
        .page {
          min-height: 100vh;
          background: #0b0f18;
        }

        /* ===== scene image ===== */
        .scene {
          position: relative;
          width: 100vw;
          height: 100vh;
          background-image: url('/game-end-machine.png');
          background-repeat: no-repeat;
          background-size: 130%;
          background-position: center 45%;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /*
          ===== モニタ部分の位置調整 =====
          画像中央のモニタ画面に合わせる
        */
        .scene {
          --screen-left: 50%;
          --screen-top: 35%;
          --screen-width: 43vw;
          --screen-height: 40vh;
        }

        .screen {
          position: absolute;
          left: var(--screen-left);
          top: var(--screen-top);
          transform: translate(-50%, -50%);
          width: var(--screen-width);
          height: var(--screen-height);
          border-radius: 10px;
          overflow: hidden;
        }

        /* ===== terminal look ===== */
        .terminal {
          position: relative;
          width: 100%;
          height: 100%;
          padding: 8px 12px;
          background: radial-gradient(circle at 30% 20%, rgba(0, 255, 140, 0.08), transparent 40%),
                      linear-gradient(180deg, rgba(0,0,0,0.92), rgba(0,0,0,0.98));
          color: rgba(160, 255, 205, 0.95);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          letter-spacing: 0.02em;
          text-shadow: 0 0 10px rgba(0, 255, 140, 0.15);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .terminalHeader {
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          color: rgba(160, 255, 205, 0.85);
          border-bottom: 1px solid rgba(0, 255, 140, 0.15);
          padding-bottom: 3px;
        }

        .led {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: rgba(0, 255, 140, 0.9);
          box-shadow: 0 0 8px rgba(0, 255, 140, 0.55);
        }

        .title {
          font-weight: 700;
          text-transform: uppercase;
        }

        .log {
          flex: 0 0 auto;
          overflow: visible;
          padding-right: 4px;
          font-size: 18px;
          line-height: 1.3;
        }

        .line, .cursorLine {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .prompt {
          color: rgba(0, 255, 140, 0.95);
        }

        .cursor {
          display: inline-block;
          width: 10px;
          height: 1em;
          margin-left: 6px;
          background: rgba(0, 255, 140, 0.9);
          vertical-align: -2px;
          animation: blink 1s steps(1) infinite;
        }

        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }

        /* scanlines overlay */
        .scanlines {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(
            180deg,
            rgba(255,255,255,0.02) 0px,
            rgba(255,255,255,0.02) 1px,
            transparent 2px,
            transparent 4px
          );
          mix-blend-mode: overlay;
          opacity: 0.35;
        }

        /* ===== content area ===== */
        .content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-top: 1px solid rgba(0, 255, 140, 0.12);
          padding-top: 8px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .centerMsg {
          padding: 15px;
          text-align: center;
          font-size: 16px;
          color: rgba(160, 255, 205, 0.8);
        }

        /* ===== error box ===== */
        .errorBox {
          padding: 10px 12px;
          border-radius: 4px;
          border: 1px solid rgba(255, 90, 90, 0.35);
          background: rgba(255, 90, 90, 0.12);
          color: rgba(255, 150, 150, 0.95);
          display: grid;
          gap: 8px;
        }

        .errorTitle {
          font-size: 16px;
          font-weight: 700;
        }

        .errorMsg {
          font-size: 13px;
          opacity: 0.9;
        }

        /* ===== rankings list ===== */
        .rankList {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .rankItem {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 4px;
          border: 1px solid rgba(0, 255, 140, 0.15);
          background: rgba(0, 0, 0, 0.25);
          transition: all 0.2s ease;
        }

        .rankItem:hover {
          background: rgba(0, 255, 140, 0.08);
          border-color: rgba(0, 255, 140, 0.25);
        }

        .rankNum {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 50px;
          font-size: 18px;
          font-weight: 700;
        }

        .emoji {
          font-size: 20px;
        }

        .rankHighlight {
          color: rgba(255, 215, 0, 0.95);
          text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
        }

        .rankInfo {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .userName {
          font-size: 16px;
          font-weight: 600;
          color: rgba(160, 255, 205, 0.95);
        }

        .dateTime {
          font-size: 11px;
          color: rgba(160, 255, 205, 0.6);
        }

        .scoreBox {
          text-align: right;
          min-width: 80px;
        }

        .scoreValue {
          font-size: 20px;
          font-weight: 800;
          color: rgba(160, 255, 205, 0.95);
        }

        .scoreHighlight {
          font-size: 20px;
          font-weight: 800;
          color: rgba(255, 215, 0, 0.95);
          text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
        }

        .scoreUnit {
          font-size: 11px;
          color: rgba(160, 255, 205, 0.6);
        }

        /* ===== buttons ===== */
        .btn {
          padding: 12px 16px;
          border-radius: 4px;
          border: 1px solid rgba(0, 255, 140, 0.28);
          background: rgba(0, 255, 140, 0.12);
          color: rgba(160, 255, 205, 0.95);
          cursor: pointer;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 18px;
          white-space: nowrap;
          align-self: center;
        }

        .btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* ===== links ===== */
        .links {
          margin-top: 8px;
          display: flex;
          gap: 12px;
          justify-content: center;
          padding-top: 8px;
          border-top: 1px solid rgba(0, 255, 140, 0.08);
        }

        .link {
          display: inline-block;
          color: rgba(160, 255, 205, 0.95);
          text-decoration: none;
          border-bottom: 1px dashed rgba(0, 255, 140, 0.3);
          padding-bottom: 2px;
          font-size: 14px;
        }

        .link:hover {
          color: rgba(0, 255, 140, 0.95);
        }

        .linkBtn {
          background: none;
          border: none;
          color: rgba(160, 255, 205, 0.95);
          cursor: pointer;
          border-bottom: 1px dashed rgba(0, 255, 140, 0.3);
          padding: 0 0 2px 0;
          font-size: 14px;
        }

        .linkBtn:hover {
          color: rgba(0, 255, 140, 0.95);
        }
      `}</style>
    </div>
  );
}
