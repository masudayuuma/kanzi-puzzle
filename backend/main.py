import os
import re
import base64
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

app = FastAPI()

# CORS設定（Next.jsからのリクエストを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini APIクライアントの初期化
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in environment variables")

client = genai.Client(api_key=GEMINI_API_KEY)


class JudgeRequest(BaseModel):
    targetKanji: str
    imageDataUrl: str


class JudgeResponse(BaseModel):
    ok: bool
    recognized: str
    confidence: Optional[float] = None
    rawText: str


def extract_base64_from_data_url(data_url: str) -> str:
    """data:image/png;base64,... からbase64部分だけ抽出"""
    if "base64," in data_url:
        return data_url.split("base64,")[1]
    return data_url


def extract_kanji_from_text(text: str) -> str:
    """テキストから最初のCJK統合漢字1文字を抽出"""
    # CJK統合漢字のUnicode範囲: U+4E00-U+9FFF
    match = re.search(r'[\u4E00-\u9FFF]', text)
    if match:
        return match.group(0)
    # '?' が返ってきた場合は空文字
    if '?' in text:
        return ""
    return ""


@app.post("/api/judge", response_model=JudgeResponse)
async def judge_kanji(request: JudgeRequest):
    """
    画像から漢字を認識し、targetKanjiと一致するか判定
    """
    try:
        # base64データを抽出
        base64_data = extract_base64_from_data_url(request.imageDataUrl)
        print(f"[DEBUG] 画像データサイズ: {len(base64_data)} bytes")
        print(f"[DEBUG] 目標漢字: {request.targetKanji}")

        # Gemini APIに送信
        # プロンプト: 漢字1文字だけを返すように厳密に指示
        prompt = "次の画像に写っている漢字を、漢字1文字だけで答えてください。説明や記号は不要です。判別できない場合は『?』だけ返してください。"

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

        # 漢字を抽出
        recognized = extract_kanji_from_text(raw_text)
        print(f"[DEBUG] 抽出された漢字: '{recognized}'")

        # targetKanjiと一致するか判定
        ok = (recognized == request.targetKanji) if recognized else False
        print(f"[DEBUG] 判定結果: {'正解' if ok else '不正解'} (目標: {request.targetKanji}, 認識: {recognized})")

        return JudgeResponse(
            ok=ok,
            recognized=recognized,
            confidence=None,  # Gemini APIからconfidenceは取得しない
            rawText=raw_text
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")


@app.get("/health")
async def health_check():
    """ヘルスチェック用エンドポイント"""
    return {"status": "ok", "gemini_api_key_set": bool(GEMINI_API_KEY)}
