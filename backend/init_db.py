"""
データベース初期化スクリプト
サーバー起動時に自動で実行されますが、手動で実行したい場合はこのスクリプトを使用してください。
"""

from database import init_db

if __name__ == "__main__":
    print("データベースを初期化しています...")
    init_db()
    print("✅ データベースの初期化が完了しました！")
    print("テーブル: scores")
