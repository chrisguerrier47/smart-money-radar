from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:password@db:5432/smartmoney"

    # LLM
    GEMINI_API_KEY: str = ""

    # SEC EDGAR
    SEC_USER_AGENT: str = "example@email.com"

    # Finnhub
    FINNHUB_API_KEY: str = ""

    # Signal config
    CLUSTER_WINDOW_DAYS: int = 30
    MIN_SCORE_THRESHOLD: int = 40

    # App
    ENV: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173,https://prolific-smile-production-2608.up.railway.app"

    @property
    def cors_origins_list(self):
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
