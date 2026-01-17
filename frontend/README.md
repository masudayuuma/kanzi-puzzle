# フロントエンド (Frontend)

Next.js 15 + TypeScript + HTML5 Canvas で構築された漢字パズルゲームのフロントエンドです。

## 📁 ディレクトリ構成

```
frontend/
├── app/                    # Next.js App Router
│   ├── game/              # ゲームページ
│   │   └── page.tsx       # メインゲーム画面
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # ホームページ
├── components/             # Reactコンポーネント
│   ├── CanvasStage.tsx    # キャンバス描画 (HTML5 Canvas)
│   └── Palette.tsx        # パーツ選択パレット
├── data/                   # データ定義
│   └── parts.ts           # パーツデータ (亻、木)
├── public/                 # 静的ファイル
│   └── parts/             # パーツ画像 (オプション)
├── package.json            # npm依存関係
├── next.config.js          # Next.js設定
└── tsconfig.json           # TypeScript設定
```

## 🚀 セットアップ

### 依存パッケージのインストール

```bash
cd frontend
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000/game にアクセスしてゲームをプレイできます。

## 📦 主要な依存パッケージ

- **Next.js** 15.1.0 - Reactフレームワーク
- **React** 18.3.1 - UIライブラリ
- **TypeScript** 5.x - 型安全な開発
- **UUID** 11.0.3 - 一意のID生成

## 🏗 技術的な実装

### HTML5 Canvas API

当初は `react-konva` を使用する予定でしたが、Next.js 15との互換性問題により、ネイティブHTML5 Canvas APIを採用しています。

**主な機能:**
- パーツの描画 (`context.drawImage`)
- マウスイベントハンドリング (ドラッグ&ドロップ)
- 画像のPNGエクスポート (`canvas.toDataURL`)

### 状態管理

React Hooks (`useState`, `useRef`) を使用したシンプルな状態管理:

- `placedParts` - キャンバス上のパーツ配列
- `selectedInstanceId` - 現在選択中のパーツ
- `draggedPartRef` - ドラッグ中のパーツ (useRef で同期的に管理)

### API連携

バックエンド (FastAPI) との通信:

```typescript
const response = await fetch('http://localhost:8000/api/judge', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    targetKanji: '休',
    imageDataUrl: canvas.toDataURL('image/png')
  })
});
```

## 🎨 コンポーネント

### `CanvasStage.tsx`

キャンバス描画とマウスイベントを管理する中核コンポーネント。

**主な機能:**
- パーツの描画 (画像またはテキストフォールバック)
- ドラッグ&ドロップ
- パーツの選択 (青い枠線)
- PNG画像のエクスポート (`toDataURL`)

### `Palette.tsx`

パーツ選択パレット。

**機能:**
- 利用可能なパーツの表示
- クリックでキャンバスに追加

### `app/game/page.tsx`

ゲームのメインページ。

**機能:**
- ゲーム全体の状態管理
- 削除/リセット/提出ボタン
- API連携と結果表示

## 🛠 開発ガイド

### ビルド (本番環境)

```bash
npm run build
npm start
```

### リントとフォーマット

```bash
npm run lint
```

### 新しいパーツの追加

`data/parts.ts` を編集:

```typescript
export const availableParts: Part[] = [
  { id: 'person', label: '亻', imageSrc: '/parts/person.png' },
  { id: 'tree', label: '木', imageSrc: '/parts/tree.png' },
  // 新しいパーツを追加
  { id: 'water', label: '氵', imageSrc: '/parts/water.png' },
];
```

## 🐛 トラブルシューティング

### パーツが動かない

**原因**: React の非同期状態更新

**解決**: `useRef` を使って同期的に状態を管理

```typescript
const draggedPartRef = useRef<string | null>(null);
// stateとrefの両方を更新
setDraggedPart(id);
draggedPartRef.current = id;
```

### 画像が表示されない

**原因**: 画像ファイルが存在しない

**解決**: テキストフォールバックが自動的に表示されます。画像を追加する場合は `public/parts/` に配置してください。

## 🔗 関連ドキュメント

- [プロジェクト全体のREADME](../README.md)
- [バックエンドREADME](../backend/README.md)
- [クイックスタートガイド](../QUICKSTART.md)
