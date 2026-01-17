import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '漢字パズル',
  description: '漢字パーツを組み合わせてパズルを解くゲーム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" style={{ overflow: 'hidden', height: '100%' }}>
      <body style={{ margin: 0, padding: 0, fontFamily: 'sans-serif', overflow: 'hidden', height: '100vh', width: '100vw' }}>
        {children}
      </body>
    </html>
  );
}
