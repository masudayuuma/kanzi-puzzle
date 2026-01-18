import { Suspense } from 'react';
import GameEndClient from './GameEndClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GameEndClient />
    </Suspense>
  );
}
