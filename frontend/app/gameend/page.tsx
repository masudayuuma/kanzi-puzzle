'use client';

import { useState, useEffect } from 'react';
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
        headers: {
          'Content-Type': 'application/json',
        },
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
          maxWidth: '560px',
          width: '90%',
          background: 'rgba(30, 30, 50, 0.85)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '48px 40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Title */}
        <h1
          style={{
            margin: '0 0 16px 0',
            fontSize: '36px',
            fontWeight: '700',
            color: '#e0e0e0',
            textAlign: 'center',
            letterSpacing: '0.05em',
          }}
        >
          ゲーム終了
        </h1>

        {/* Score Display */}
        <div
          style={{
            margin: '32px 0',
            padding: '32px',
            background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.15) 0%, rgba(39, 174, 96, 0.15) 100%)',
            borderRadius: '16px',
            border: '2px solid rgba(74, 144, 226, 0.3)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '16px',
              color: '#a0a0b0',
              marginBottom: '12px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Your Score
          </div>
          <div
            style={{
              fontSize: '64px',
              fontWeight: '800',
              color: '#4A90E2',
              textShadow: '0 4px 12px rgba(74, 144, 226, 0.4)',
              lineHeight: '1',
            }}
          >
            {score}
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#808090',
              marginTop: '8px',
            }}
          >
            点
          </div>
        </div>

        {/* Username Form */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label
                htmlFor="userName"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#b0b0c0',
                  fontWeight: '500',
                }}
              >
                ユーザー名
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="名前を入力してください"
                maxLength={100}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#e0e0e0',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.borderColor = 'rgba(74, 144, 226, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
              />
            </div>

            {/* Error Display */}
            {submitError && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '12px 16px',
                  background: 'rgba(231, 76, 60, 0.15)',
                  border: '1px solid rgba(231, 76, 60, 0.3)',
                  borderRadius: '8px',
                  color: '#E74C3C',
                  fontSize: '14px',
                }}
              >
                {submitError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !userName.trim()}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                background: isSubmitting || !userName.trim()
                  ? 'rgba(100, 100, 120, 0.3)'
                  : 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
                color: isSubmitting || !userName.trim() ? '#606070' : 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isSubmitting || !userName.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSubmitting || !userName.trim()
                  ? 'none'
                  : '0 4px 12px rgba(74, 144, 226, 0.3)',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && userName.trim()) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(74, 144, 226, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isSubmitting || !userName.trim()
                  ? 'none'
                  : '0 4px 12px rgba(74, 144, 226, 0.3)';
              }}
            >
              {isSubmitting ? 'スコア送信中...' : 'スコアを登録'}
            </button>
          </form>
        ) : (
          <div
            style={{
              padding: '24px',
              background: 'rgba(39, 174, 96, 0.15)',
              border: '1px solid rgba(39, 174, 96, 0.3)',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                marginBottom: '12px',
              }}
            >
              ✅
            </div>
            <div
              style={{
                fontSize: '18px',
                color: '#27AE60',
                fontWeight: '600',
                marginBottom: '8px',
              }}
            >
              スコアを登録しました！
            </div>
            <div
              style={{
                fontSize: '14px',
                color: '#a0a0b0',
              }}
            >
              {userName} - {score}点
            </div>
          </div>
        )}

        {/* Back to Game Link */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
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
