"""
API動作確認テストスクリプト
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """ヘルスチェック"""
    print("\n=== ヘルスチェック ===")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_submit_score():
    """スコア登録"""
    print("\n=== スコア登録テスト ===")

    # テストデータ
    test_scores = [
        {"user_name": "すしマスター", "score": 1500},
        {"user_name": "漢字職人", "score": 1200},
        {"user_name": "パズル名人", "score": 1800},
        {"user_name": "初心者", "score": 300},
        {"user_name": "上級者", "score": 2100},
    ]

    for data in test_scores:
        response = requests.post(f"{BASE_URL}/api/scores", json=data)
        print(f"[{data['user_name']}] Status: {response.status_code}")
        if response.status_code == 200:
            print(f"  Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        else:
            print(f"  Error: {response.text}")

    return True

def test_get_rankings():
    """ランキング取得"""
    print("\n=== ランキング取得テスト ===")
    response = requests.get(f"{BASE_URL}/api/rankings")
    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print(f"Total Count: {data['total_count']}")
        print("\n【ランキングTOP10】")
        for entry in data['rankings']:
            print(f"  {entry['rank']}位: {entry['user_name']} - {entry['score']}点 ({entry['created_at']})")
    else:
        print(f"Error: {response.text}")

    return response.status_code == 200

if __name__ == "__main__":
    print("=" * 60)
    print("漢字パズルAPI 動作確認テスト")
    print("=" * 60)

    try:
        # テスト実行
        test_health()
        test_submit_score()
        test_get_rankings()

        print("\n" + "=" * 60)
        print("✅ すべてのテストが完了しました！")
        print("=" * 60)

    except requests.exceptions.ConnectionError:
        print("\n❌ エラー: サーバーに接続できません")
        print("サーバーが起動しているか確認してください:")
        print("  uvicorn main:app --reload --port 8000")
    except Exception as e:
        print(f"\n❌ エラー: {str(e)}")
