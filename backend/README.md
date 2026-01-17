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

`.env.example` をコピーして `.env` を作成し、Gemini APIキーを設定してください。

```bash
cp .env.example .env
```

`.env` ファイルを編集:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Gemini APIキーの取得方法:**
1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン
3. "Create API Key" をクリックしてAPIキーを生成
4. 生成されたキーを `.env` ファイルに貼り付け

### 4. サーバーの起動

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
