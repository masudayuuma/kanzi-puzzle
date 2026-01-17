'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface ScoreSubmitResult {
  success: boolean;
  message: string;
  score_id: string;
}

export default function GameEndPage() {
  const searchParams = useSearchParams();
  const score = parseInt(searchParams.get('score') || '0', 10);

  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim()) {
      setSubmitError('ユーザー名を入力してください');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('http://localhost:8000/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: userName.trim(),
          score: score,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result: ScoreSubmitResult = await response.json();
      console.log('Score submitted:', result);
      setIsSubmitted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setSubmitError(message);
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // “機械チック”ログ文言（必要なら増やしてOK）
  const machineLines = [
    'BOOT: NEO-CONSOLE v1.7.2',
    'CHECK: IO=OK  SENSOR=OK  NET=OK',
    `RESULT: SCORE=${score}pts`,
    isSubmitted ? `COMMIT: user="${userName}" score=${score} => OK` : 'AWAIT: USERNAME_INPUT',
  ];

  return (
    <div className="page">
      {/* 1枚絵（背景） */}
      <div className="scene" aria-label="factory-console-background">
        {/* モニタ黒画面の上にUIを重ねる */}
        <div className="screen">
          <div className="scanlines" />
          <div className="terminal">
            <div className="terminalHeader">
              <div className="led" />
              <div className="title">SYSTEM CONSOLE</div>
            </div>

            <div className="log">
              {machineLines.map((line, i) => (
                <div key={i} className="line">
                  <span className="prompt">{'>'}</span> {line}
                </div>
              ))}
              {!isSubmitted && <div className="cursorLine"><span className="prompt">{'>'}</span> INPUT<span className="cursor" /></div>}
            </div>

            {/* UI本体 */}
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="form">
                <label className="label" htmlFor="userName">
                  USERNAME
                </label>
                <div className="row">
                  <input
                    id="userName"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. TAMURA"
                    maxLength={100}
                    disabled={isSubmitting}
                    className="input"
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting || !userName.trim()}
                    className="btn"
                  >
                    {isSubmitting ? 'SUBMITTING...' : 'SUBMIT SCORE'}
                  </button>
                </div>

                {submitError && (
                  <div className="error">
                    <span className="prompt">{'!'}</span> ERROR: {submitError}
                  </div>
                )}

                <div className="hint">
                  <span className="dim">TIP:</span> モニタ内レイアウト位置は <code>--screen-*</code> を微調整
                </div>
              </form>
            ) : (
              <div className="done">
                <div className="ok">OK</div>
                <div className="dim">
                  user=<b>{userName}</b> / score=<b>{score}</b>
                </div>

                <div className="links">
                  <a href="/game" className="link">
                    {'>'} RESTART GAME
                  </a>
                </div>
              </div>
            )}

            {/* スコアを常に右下に小さく表示（機械UIっぽく） */}
            <div className="hud">
              <div className="hudBox">
                <div className="hudLabel">SCORE</div>
                <div className="hudValue">{score}</div>
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
          padding: 10px 14px;
          background: radial-gradient(circle at 30% 20%, rgba(0, 255, 140, 0.08), transparent 40%),
                      linear-gradient(180deg, rgba(0,0,0,0.92), rgba(0,0,0,0.98));
          color: rgba(160, 255, 205, 0.95);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          letter-spacing: 0.02em;
          text-shadow: 0 0 10px rgba(0, 255, 140, 0.15);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .terminalHeader {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: rgba(160, 255, 205, 0.85);
          border-bottom: 1px solid rgba(0, 255, 140, 0.15);
          padding-bottom: 5px;
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

        .right {
          opacity: 0.9;
        }

        .log {
          flex: 0 0 auto;
          overflow: visible;
          padding-right: 6px;
          font-size: 12px;
          line-height: 1.4;
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

        /* ===== form ===== */
        .form {
          display: grid;
          gap: 5px;
          border-top: 1px solid rgba(0, 255, 140, 0.12);
          padding-top: 8px;
        }

        .label {
          font-size: 11px;
          color: rgba(160, 255, 205, 0.8);
        }

        .row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
          align-items: center;
        }

        .input {
          width: 100%;
          padding: 7px 10px;
          border-radius: 4px;
          border: 1px solid rgba(0, 255, 140, 0.22);
          background: rgba(0, 0, 0, 0.45);
          color: rgba(160, 255, 205, 0.95);
          outline: none;
          font-size: 12px;
        }
        .input:focus {
          border-color: rgba(0, 255, 140, 0.45);
          box-shadow: 0 0 0 2px rgba(0, 255, 140, 0.12);
        }

        .btn {
          padding: 7px 12px;
          border-radius: 4px;
          border: 1px solid rgba(0, 255, 140, 0.28);
          background: rgba(0, 255, 140, 0.12);
          color: rgba(160, 255, 205, 0.95);
          cursor: pointer;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 11px;
          white-space: nowrap;
        }
        .btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .error {
          padding: 5px 8px;
          border-radius: 4px;
          border: 1px solid rgba(255, 90, 90, 0.35);
          background: rgba(255, 90, 90, 0.12);
          color: rgba(255, 150, 150, 0.95);
          font-size: 10px;
        }

        .hint {
          font-size: 9px;
          color: rgba(160, 255, 205, 0.7);
        }
        .dim {
          opacity: 0.75;
        }

        /* ===== submitted view ===== */
        .done {
          border-top: 1px solid rgba(0, 255, 140, 0.12);
          padding-top: 12px;
          display: grid;
          gap: 10px;
        }

        .ok {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .links {
          margin-top: 6px;
        }

        .link {
          display: inline-block;
          color: rgba(160, 255, 205, 0.95);
          text-decoration: none;
          border-bottom: 1px dashed rgba(0, 255, 140, 0.3);
          padding-bottom: 2px;
          font-size: 12px;
        }

        /* ===== HUD ===== */
        .hud {
          position: absolute;
          right: 8px;
          bottom: 8px;
          pointer-events: none;
        }
        .hudBox {
          border: 1px solid rgba(0, 255, 140, 0.22);
          background: rgba(0, 0, 0, 0.35);
          border-radius: 6px;
          padding: 5px 8px;
          min-width: 60px;
          text-align: right;
        }
        .hudLabel {
          font-size: 8px;
          opacity: 0.75;
          letter-spacing: 0.08em;
        }
        .hudValue {
          font-size: 14px;
          font-weight: 800;
        }
      `}</style>
    </div>
  );
}
