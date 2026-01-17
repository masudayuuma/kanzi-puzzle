# クイックスタートガイド

このガイドに従えば、5分でアプリケーションを起動できます。

## 📋 前提条件

以下がインストールされていることを確認してください：

- Node.js 18.x 以上
- Python 3.8 以上
- Git

## 🚀 セットアップ手順

### 1. プロジェクトのクローン

```bash
git clone <repository-url>
cd kanzi-puzzle
```

### 2. バックエンドのセットアップ

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

**重要**: `.env` ファイルを開いて、Gemini API キーを設定してください。

```bash
# vim .env または任意のエディタで
GEMINI_API_KEY=your_actual_api_key_here
```

**APIキーの取得方法**: https://aistudio.google.com/app/apikey

### 3. フロントエンドのセットアップ

```bash
cd ..  # プロジェクトルートに戻る
cd frontend
npm install
```

## ▶️ アプリケーションの起動

### ターミナル1: バックエンド

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

### ターミナル2: フロントエンド

```bash
cd frontend
npm run dev
```

## 🎮 アクセス

ブラウザで以下にアクセス：

- **ゲーム**: http://localhost:3000/game
- **API ヘルスチェック**: http://localhost:8000/health

## 🎯 使い方

1. 左側のパレットから「亻」と「木」をクリック
2. キャンバスにパーツが追加される
3. パーツをドラッグして「休」の形に配置
4. 「提出」ボタンをクリック
5. Gemini AIが漢字を認識して結果を表示

## ❌ よくある問題

### バックエンドが起動しない

```bash
# 仮想環境が有効化されているか確認
# プロンプトに (venv) が表示されているはず

# 再度有効化
cd backend
source venv/bin/activate
```

### フロントエンドが起動しない

```bash
# node_modulesを再インストール
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Gemini APIエラー

- `.env` ファイルに正しいAPIキーが設定されているか確認
- APIキーの前後にスペースや引用符がないか確認
- 新しいAPIキーを取得して試す

## 📚 詳細ドキュメント

詳細は [README.md](README.md) を参照してください。
