import os
from sqlalchemy import create_engine, Column, String, Integer, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import uuid

# 環境変数からデータベースURLを取得
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kanji_game.db")

# SQLAlchemyエンジンの作成
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# セッションの作成
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Baseクラスの作成
Base = declarative_base()


# スコアテーブルモデル
class Score(Base):
    __tablename__ = "scores"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_name = Column(String(100), nullable=False)  # 匿名ユーザー名
    score = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Score(id={self.id}, user_name={self.user_name}, score={self.score})>"


# データベース初期化関数
def init_db():
    """データベースとテーブルを作成"""
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully!")


# データベースセッションを取得する依存関数
def get_db():
    """FastAPIの依存性注入で使用するDB セッション取得関数"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
