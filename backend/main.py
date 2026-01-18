import os
import re
import base64
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types
from sqlalchemy.orm import Session
from database import get_db, Score, init_db

load_dotenv()

# データベース初期化
init_db()

app = FastAPI()

# CORS設定（Next.jsからのリクエストを許可）
# 本番のフロントエンド origin は環境変数で指定（カンマ区切りで複数可）
cors_origins_env = os.getenv("CORS_ALLOW_ORIGINS", "").strip()
allow_origin_regex = os.getenv("CORS_ALLOW_ORIGIN_REGEX")  # 例: r"https://.*\\.onrender\\.com"
allowed_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()] or ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],  # preflight含め全メソッド許可
    allow_headers=["*"],  # JSON等のヘッダ許可
)

# Gemini APIクライアントの初期化
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in environment variables")

client = genai.Client(api_key=GEMINI_API_KEY)


class JudgeRequest(BaseModel):
    imageDataUrl: str


class JudgeResponse(BaseModel):
    ok: bool
    recognized: str
    confidence: Optional[float] = None
    rawText: str
    message: str


def extract_base64_from_data_url(data_url: str) -> str:
    """data:image/png;base64,... からbase64部分だけ抽出"""
    if "base64," in data_url:
        return data_url.split("base64,")[1]
    return data_url


def extract_jukugo_from_text(text: str) -> str:
    """テキストから熟語（複数の漢字）を抽出"""
    # CJK統合漢字のUnicode範囲: U+4E00-U+9FFF
    match = re.search(r'[\u4E00-\u9FFF]+', text)
    if match:
        return match.group(0)
    # '?' が返ってきた場合は空文字
    if '?' in text:
        return ""
    return ""


@app.post("/api/judge", response_model=JudgeResponse)
async def judge_kanji(request: JudgeRequest):
    """
    画像から漢字を認識し、実在する漢字かどうかを判定
    """
    try:
        # base64データを抽出
        base64_data = extract_base64_from_data_url(request.imageDataUrl)
        print(f"[DEBUG] 画像データサイズ: {len(base64_data)} bytes")

        # Gemini APIに送信
        # 2段階プロンプト: 1. 熟語を認識、2. 実在する熟語かを判定
        prompt = """次の画像に写っている文字列を分析し、以下の形式で回答してください：

1行目: 認識した熟語（複数の漢字の組み合わせ。熟語でない場合や判別できない場合は「?」）
2行目: その熟語が実在する日本語の熟語（二字熟語、三字熟語、四字熟語など）かどうか（「存在する」または「存在しない」または「不明」）

例:
学校
存在する

説明や追加の文章は不要です。"""

        print("[DEBUG] Gemini APIにリクエスト送信中...")
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                prompt,
                types.Part.from_bytes(
                    data=base64.b64decode(base64_data),
                    mime_type="image/png"
                ),
            ]
        )

        # レスポンスからテキストを取得
        raw_text = response.text.strip() if response.text else ""
        print(f"[DEBUG] Gemini APIからの生レスポンス: '{raw_text}'")

        # レスポンスを解析
        lines = raw_text.split('\n')
        recognized = extract_jukugo_from_text(lines[0]) if lines else ""
        existence_check = lines[1].strip() if len(lines) > 1 else ""

        print(f"[DEBUG] 認識された熟語: '{recognized}'")
        print(f"[DEBUG] 存在判定: '{existence_check}'")

        # 存在する熟語かどうかを判定
        ok = recognized != "" and "存在する" in existence_check

        # メッセージを生成
        if not recognized:
            message = "熟語を認識できませんでした"
        elif ok:
            message = f"「{recognized}」は実在する熟語です！"
        else:
            message = f"「{recognized}」は実在しない熟語です"

        print(f"[DEBUG] 判定結果: {'正解（実在する）' if ok else '不正解（実在しない/不明）'}")

        return JudgeResponse(
            ok=ok,
            recognized=recognized,
            confidence=None,
            rawText=raw_text,
            message=message
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")


@app.get("/health")
async def health_check():
    """ヘルスチェック用エンドポイント"""
    return {"status": "ok", "gemini_api_key_set": bool(GEMINI_API_KEY)}


# ========== スコア管理API ==========

class ScoreSubmitRequest(BaseModel):
    user_name: str
    score: int


class RankingEntry(BaseModel):
    rank: int
    user_name: str
    score: int
    created_at: str


class RankingsResponse(BaseModel):
    rankings: List[RankingEntry]
    total_count: int


@app.post("/api/scores")
async def submit_score(request: ScoreSubmitRequest, db: Session = Depends(get_db)):
    """
    スコアを登録
    """
    try:
        # 新しいスコアを作成
        new_score = Score(
            user_name=request.user_name,
            score=request.score
        )

        db.add(new_score)
        db.commit()
        db.refresh(new_score)

        print(f"[DEBUG] スコア登録: {request.user_name} - {request.score}点")

        return {
            "success": True,
            "message": "Score submitted successfully",
            "score_id": new_score.id
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/rankings", response_model=RankingsResponse)
async def get_rankings(db: Session = Depends(get_db)):
    """
    ランキングTOP10を取得
    同点の場合は日時が早い方が上位
    """
    try:
        # スコアの高い順、同点なら日時の早い順でソート
        top_scores = db.query(Score)\
            .order_by(Score.score.desc(), Score.created_at.asc())\
            .limit(10)\
            .all()

        # 総スコア数を取得
        total_count = db.query(Score).count()

        # ランキングデータを構築
        rankings = [
            RankingEntry(
                rank=idx + 1,
                user_name=score.user_name,
                score=score.score,
                created_at=score.created_at.isoformat() + "Z"
            )
            for idx, score in enumerate(top_scores)
        ]

        return RankingsResponse(
            rankings=rankings,
            total_count=total_count
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
