# 漢字パズル (Kanzi Puzzle)

部首パーツをタイピングで取得して配置、Gemini AIで自動判定するゲーム

## 🎮 ゲーム機能

### 4方向レーンタイピングゲーム
- **TOPレーン**: 左→右に流れる、`W`キーで取得
- **RIGHTレーン**: 上→下に流れる、`D`キーで取得
- **BOTTOMレーン**: 右→左に流れる、`S`キーで取得
- **LEFTレーン**: 下→上に流れる、`A`キーで取得
- 終点に最も近いパーツを優先的に取得
- 画面外に出たパーツはMissとしてカウント

### 中央キャンバス
- 取得したパーツが自動で追加される
- ドラッグ＆ドロップで位置を調整
- 漢字を組み立てて完成

### AI判定機能
- `Space`キーまたは「AI判定」ボタンで実行
- Gemini AIがキャンバス上の漢字を認識
- 正解/不正解を即座に表示

## 📱 操作方法

### キーボード操作
- `W` / `A` / `S` / `D`: 各レーンのパーツを取得
- `Space`: AI判定を実行
- マウスドラッグ: パーツを移動

### ゲームの流れ
1. 「▶ 開始」ボタンでタイピングゲーム開始
2. パーツが4方向から流れてくる
3. `W`/`A`/`S`/`D`キーでパーツを取得
4. 取得したパーツが中央キャンバスに追加される
5. マウスでパーツを移動して漢字を組み立てる
6. `Space`キーまたは「AI判定」ボタンで答え合わせ

## 📋 目次

- [プロジェクト構成](#プロジェクト構成)
- [クイックスタート](#クイックスタート)
- [詳細セットアップ](#詳細セットアップ)
- [機能](#機能)
- [技術スタック](#技術スタック)
- [トラブルシューティング](#トラブルシューティング)

## 📁 プロジェクト構成

```
kanzi-puzzle/
├── frontend/               # フロントエンド (Next.js)
│   ├── app/               # Next.js App Router
│   │   ├── game/         # ゲームページ
│   │   │   └── page.tsx
│   │   ├── layout.tsx    # ルートレイアウト
│   │   └── page.tsx      # ホームページ
│   ├── components/        # Reactコンポーネント
│   │   ├── CanvasStage.tsx    # キャンバス描画
│   │   └── Palette.tsx        # パーツパレット
│   ├── data/             # データ定義
│   │   └── parts.ts      # パーツ定義
│   ├── public/           # 静的ファイル
│   ├── package.json      # npm依存関係
│   ├── next.config.js    # Next.js設定
│   ├── tsconfig.json     # TypeScript設定
│   └── README.md         # フロントエンド詳細ドキュメント
│
├── backend/               # バックエンド (FastAPI)
│   ├── main.py           # FastAPI アプリケーション
│   ├── requirements.txt  # Python依存パッケージ
│   ├── .env.example      # 環境変数テンプレート
│   ├── .env              # 環境変数 (gitignore)
│   └── README.md         # バックエンド詳細ドキュメント
│
├── README.md             # このファイル (プロジェクト全体のドキュメント)
├── QUICKSTART.md         # 5分で起動するガイド
└── .gitignore            # Git除外設定
```

## 🚀 クイックスタート

### 必要な環境

- **Node.js**: 18.x 以上
- **Python**: 3.8 以上
- **Gemini API Key**: [Google AI Studio](https://aistudio.google.com/app/apikey) で取得

### 起動手順（初回）

#### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd kanzi-puzzle
```

#### 2. バックエンドのセットアップ

```bash
# backendディレクトリに移動
cd backend

# Python仮想環境の作成
python3 -m venv venv

# 仮想環境の有効化
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# 依存パッケージのインストール
pip install -r requirements.txt

# 環境変数ファイルの作成
cp .env.example .env

# .envファイルを編集してGEMINI_API_KEYを設定
# vim .env または任意のエディタで開く
```

**.env ファイル内容:**
```
GEMINI_API_KEY=your_actual_api_key_here
```

#### 3. フロントエンドのセットアップ

```bash
# プロジェクトルートに戻る
cd ..

# frontendディレクトリに移動
cd frontend

# 依存パッケージのインストール
npm install
```

#### 4. アプリケーションの起動

**ターミナル1 (バックエンド):**
```bash
cd backend
source venv/bin/activate  # 仮想環境を有効化
uvicorn main:app --reload --port 8000
```

**ターミナル2 (フロントエンド):**
```bash
cd frontend
npm run dev
```

#### 5. アクセス

- **フロントエンド**: http://localhost:3000/game
- **バックエンドAPI**: http://localhost:8000
- **API ヘルスチェック**: http://localhost:8000/health

## 📖 詳細セットアップ

### フロントエンド (Next.js)

**場所**: `frontend/` ディレクトリ

**詳細ドキュメント**: [frontend/README.md](frontend/README.md)

**セットアップ:**
```bash
cd frontend
npm install
npm run dev
```

**主要ファイル:**
- `app/game/page.tsx` - ゲームメインページ
- `components/CanvasStage.tsx` - HTML5 Canvas によるパーツ描画
- `components/Palette.tsx` - パーツ選択パレット
- `data/parts.ts` - パーツデータ定義

**ビルド (本番環境):**
```bash
cd frontend
npm run build
npm start
```

### バックエンド (FastAPI)

**場所**: `backend/` ディレクトリ

**詳細ドキュメント**: [backend/README.md](backend/README.md)

**セットアップ:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# .env を編集して GEMINI_API_KEY を設定
uvicorn main:app --reload --port 8000
```

**API エンドポイント:**
- `POST /api/judge` - 漢字判定
- `GET /health` - ヘルスチェック

**環境変数:**
- `GEMINI_API_KEY` - Google Gemini API キー（必須）

## ✨ 機能

### Step1: 基本的なパズル機能
- 左側のパレットから漢字パーツ（亻、木）を選択
- キャンバス上にパーツを配置
- ドラッグ&ドロップでパーツを移動
- パーツをクリックして選択（青い枠で表示）
- 削除ボタンで選択したパーツを削除
- リセットボタンで全パーツをクリア

### Step2: Gemini AI判定機能 ✅ 完了
- 提出ボタンでキャンバスの画像をPNG形式でエクスポート
- FastAPI経由でGemini APIに画像を送信
- AIが認識した漢字を表示
- 目標漢字（例: 「休」）との一致判定
- 正解/不正解の視覚的表示
- エラーハンドリング

## 🛠 技術スタック

### フロントエンド
| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 15.1.0 | Reactフレームワーク (App Router) |
| React | 18.3.1 | UIライブラリ |
| TypeScript | 5.x | 型安全な開発 |
| HTML5 Canvas | - | パーツ描画 |
| UUID | 11.0.3 | パーツの一意識別 |

### バックエンド
| 技術 | バージョン | 用途 |
|------|-----------|------|
| FastAPI | 0.115.6 | Web APIフレームワーク |
| Google GenAI SDK | 1.58.0 | Gemini API統合 |
| Python Dotenv | 1.0.1 | 環境変数管理 |
| Uvicorn | 0.32.1 | ASGIサーバー |

### アーキテクチャ
- **フロントエンド**: CSR (Client Side Rendering) + API連携
- **バックエンド**: RESTful API + AI統合
- **通信**: JSON over HTTP
- **セキュリティ**: APIキーはバックエンドのみで管理、CORS制限

## 🔐 セキュリティ

1. **APIキー管理**
   - Gemini APIキーは `backend/.env` でのみ管理
   - フロントエンドには絶対に露出しない
   - `.gitignore` で `.env` を除外

2. **CORS設定**
   - `localhost:3000` のみ許可
   - 本番環境では適切なドメインに変更が必要

3. **データ検証**
   - Pydanticによるリクエスト/レスポンス検証
   - 画像データのbase64検証

## 🐛 トラブルシューティング

### フロントエンドが起動しない

**症状**: `npm run dev` でエラー

**解決策**:
```bash
# node_modules を削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

**確認事項**:
- Node.js 18.x 以上がインストールされているか
- `package.json` が存在するか

### バックエンドが起動しない

**症状**: `uvicorn main:app` でエラー

**解決策**:
```bash
# 仮想環境が有効化されているか確認
# プロンプトに (venv) が表示されているはず

# 再インストール
pip install --upgrade -r requirements.txt
```

**確認事項**:
- Python 3.8 以上がインストールされているか
- 仮想環境が有効化されているか
- `.env` ファイルが存在し、`GEMINI_API_KEY` が設定されているか

### Gemini API エラー

**症状**: `429 RESOURCE_EXHAUSTED` エラー

**原因**: APIのクォータ超過

**解決策**:
1. [Rate Limit Monitor](https://ai.dev/rate-limit) で使用状況を確認
2. 20秒ほど待ってから再試行
3. 新しいAPIキーを取得（別プロジェクトで作成）
4. 有料プランへのアップグレードを検討

**Gemini APIキーの取得**:
1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン
3. "Create API Key" をクリック
4. 生成されたキーを `backend/.env` に貼り付け

### CORS エラー

**症状**: ブラウザコンソールに `CORS policy` エラー

**解決策**:
- バックエンドが `http://localhost:8000` で起動しているか確認
- フロントエンドが `http://localhost:3000` で起動しているか確認
- 別のポートを使う場合は `backend/main.py` の CORS設定を変更:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # 追加
    ...
)
```

### パーツが動かない

**症状**: パレットからパーツを追加できるが、ドラッグできない

**解決策**:
- ブラウザのコンソールでエラーを確認
- ページをリロード (Cmd+R / Ctrl+R)
- ブラウザのキャッシュをクリア

## 📚 開発ガイド

### ローカル開発の流れ

1. **バックエンド起動**
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn main:app --reload --port 8000
   ```

2. **フロントエンド起動**
   ```bash
   # 別のターミナルで
   cd frontend
   npm run dev
   ```

3. **開発**
   - http://localhost:3000/game でテスト
   - コード変更は自動的にリロードされる

4. **終了時**
   - 両方のターミナルで `Ctrl+C`
   - バックエンドの仮想環境を無効化: `deactivate`

### Git管理

**除外されるファイル** (`.gitignore`):
- `frontend/node_modules/`
- `frontend/.next/`
- `backend/venv/`
- `backend/.env`
- `*.pyc`

**コミット前の確認**:
```bash
git status
# .env ファイルが含まれていないことを確認
```

## 🎯 今後の拡張予定

- [ ] パーツの回転・拡大縮小機能
- [ ] 複数の問題（異なる目標漢字）
- [ ] スコアリング機能
- [ ] タイムアタックモード
- [ ] ヒント機能
- [ ] アニメーション効果
- [ ] ユーザー認証
- [ ] プレイ履歴の保存

## 📝 ライセンス

MIT License

## 🤝 貢献

Issue や Pull Request を歓迎します。

---

**作成日**: 2026-01-17
**最終更新**: 2026-01-17
