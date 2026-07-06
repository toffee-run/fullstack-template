from pydantic_settings import BaseSettings, SettingsConfigDict


class SigNozSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="signoz_")

    host: str
    port: str
    user_root_email: str
    user_root_password: str

    @property
    def api_url(self) -> str:
        return f"http://{self.host}:{self.port}"
