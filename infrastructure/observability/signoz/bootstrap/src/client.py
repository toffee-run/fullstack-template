import json
import os
import uuid

from httpx import AsyncClient

from .settings import SigNozSettings


class SigNozClient:
    def __init__(
        self, http: AsyncClient, settings: SigNozSettings, script_dir: str
    ) -> None:
        self.http = http
        self.settings = settings
        self.script_dir = script_dir

    async def _get_org_id(self):
        response = await self.http.get(
            f"/api/v2/sessions/context?email={self.settings.user_root_email}"
        )
        return response.json()["data"]["orgs"][0]["id"]

    async def login(self):
        response = await self.http.post(
            "/api/v2/sessions/email_password",
            json={
                "email": self.settings.user_root_email,
                "password": self.settings.user_root_password,
                "orgId": await self._get_org_id(),
            },
        )
        self.http.headers["Authorization"] = (
            f"Bearer {response.json()['data']['accessToken']}"
        )

    async def add_dashboards(self):
        dashboards_dir = os.path.join(self.script_dir, "dashboards")

        for filename in os.listdir(dashboards_dir):
            filepath = os.path.join(dashboards_dir, filename)

            with open(filepath, "r", encoding="utf-8") as file:
                dashboard = json.load(file)

            dash_ident = dashboard.get("uuid") or dashboard.get("id")
            if not dash_ident:
                dash_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, filename))
                dashboard["uuid"] = dash_uuid

            await self.http.post("/api/v1/dashboards", json=dashboard)

    async def navbar_setting(self):
        await self.http.put(
            "/api/v1/user/preferences/nav_shortcuts",
            json={
                "value": [
                    "services",
                    "logs",
                    "traces",
                    "metrics",
                    "infrastructure",
                    "dashboards",
                    "messaging-queues",
                    "external-apis",
                    "alerts",
                    "integrations",
                    "exceptions",
                    "service-map",
                    "meter-explorer",
                ]
            },
        )
