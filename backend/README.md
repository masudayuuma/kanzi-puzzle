# 漢字パズル判定API (FastAPI + Gemini)

## セットアップ

### 1. Python仮想環境の作成と有効化

```bash
cd backend

# 仮想環境の作成
python3 -m venv venv

# 仮想環境の有効化
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate
```

仮想環境が有効化されると、ターミナルのプロンプトに `(venv)` が表示されます。

### 2. 依存パッケージのインストール

```bash
pip install -r requirements.txt
```

### 3. 環境変数の設定

`.env.example` をコピーして `.env` を作成し、Gemini APIキーとデータベースURLを設定してください。

```bash
cp .env.example .env
```

`.env` ファイルを編集:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
DATABASE_URL=sqlite:///./kanji_game.db
```

**Gemini APIキーの取得方法:**
1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン
3. "Create API Key" をクリックしてAPIキーを生成
4. 生成されたキーを `.env` ファイルに貼り付け

### 4. データベースの初期化

サーバー起動時に自動で初期化されますが、手動で初期化したい場合は以下のコマンドを実行してください:

```bash
python init_db.py
```

これにより `kanji_game.db` ファイルが作成され、`scores` テーブルが作成されます。

### 5. サーバーの起動

**重要**: 仮想環境が有効化されていることを確認してください（プロンプトに `(venv)` が表示されている状態）。

```bash
uvicorn main:app --reload --port 8000
```

サーバーが起動したら、http://localhost:8000/health にアクセスして正常に動作していることを確認できます。

**仮想環境の終了**:
作業が終わったら以下のコマンドで仮想環境を無効化できます。
```bash
deactivate
```

## API仕様

### POST /api/judge

キャンバスの画像から漢字を認識し、目標漢字と一致するか判定します。

**リクエスト:**
```json
{
  "targetKanji": "休",
  "imageDataUrl": "data:image/png;base64,iVBORw0KG..."
}
```

**レスポンス:**
```json
{
  "ok": true,
  "recognized": "休",
  "confidence": null,
  "rawText": "休"
}
```

- `ok`: 認識結果が目標漢字と一致するか
- `recognized`: 認識した漢字（1文字）
- `confidence`: 信頼度（現在はnull）
- `rawText`: Gemini APIの生の返答

### GET /health

ヘルスチェック用エンドポイント。

**レスポンス:**
```json
{
  "status": "ok",
  "gemini_api_key_set": true
}
```

### POST /api/scores

スコアを登録します。

**リクエスト:**
```json
{
  "user_name": "すしマスター",
  "score": 1500
}
```

**レスポンス:**
```json
{
  "success": true,
  "message": "Score submitted successfully",
  "score_id": "uuid-here"
}
```

### GET /api/rankings

ランキングTOP10を取得します。同点の場合は日時が早い方が上位になります。

**レスポンス:**
```json
{
  "rankings": [
    {
      "rank": 1,
      "user_name": "すしマスター",
      "score": 1500,
      "created_at": "2026-01-17T12:00:00Z"
    }
  ],
  "total_count": 100
}
```

## データベース仕様

### scores テーブル

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | String(36) | UUID、主キー |
| user_name | String(100) | ユーザー名（匿名） |
| score | Integer | スコア |
| created_at | DateTime | 作成日時 |

**インデックス:**
- スコアの降順、作成日時の昇順でソート

## トラブルシューティング

### GEMINI_API_KEY が設定されていない

サーバー起動時に以下のエラーが出る場合:
```
RuntimeError: GEMINI_API_KEY is not set in environment variables
```

`.env` ファイルが正しく作成されているか、APIキーが設定されているか確認してください。

### CORS エラー

フロントエンド (Next.js) が http://localhost:3000 以外のURLで動いている場合、`main.py` の CORS設定を変更してください:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # 必要に応じて追加
    ...
)
```
