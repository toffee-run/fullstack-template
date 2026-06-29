from __future__ import annotations

import json
import logging
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid
from dataclasses import dataclass
from typing import Any

logger = logging.getLogger(__name__)

DEFAULT_NAV_SHORTCUTS: tuple[str, ...] = (
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
)


class BootstrapError(Exception):
    """Fatal error during SigNoz bootstrap."""


@dataclass(frozen=True)
class Config:
    api_url: str
    email: str
    password: str
    dashboards_dir: str

    @classmethod
    def from_env(cls) -> Config:
        default_host = "signoz" if os.path.exists("/.dockerenv") else "localhost"
        host = os.environ.get("SIGNOZ_HOST", default_host)
        port = os.environ.get("SIGNOZ_PORT", "8080")

        default_dd = "/dashboards" if os.path.exists("/dashboards") else "signoz/dashboards"

        return cls(
            api_url=f"http://{host}:{port}",
            email=os.environ.get("SIGNOZ_USER_ROOT_EMAIL", ""),
            password=os.environ.get("SIGNOZ_USER_ROOT_PASSWORD", ""),
            dashboards_dir=os.environ.get("SIGNOZ_DASHBOARDS_DIR", default_dd),
        )


class SigNozClient:
    """HTTP client for the SigNoz API."""

    def __init__(self, api_url: str, token: str | None = None) -> None:
        self.api_url = api_url
        self.token = token

    def _request(
        self,
        path: str,
        *,
        method: str = "GET",
        data: dict[str, Any] | None = None,
    ) -> dict[str, Any] | None:
        """Send an HTTP request and return parsed JSON response."""
        url = f"{self.api_url}{path}"
        headers: dict[str, str] = {}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        req_data = None
        if data is not None:
            req_data = json.dumps(data).encode("utf-8")
            headers["Content-Type"] = "application/json"

        req = urllib.request.Request(url, method=method, headers=headers, data=req_data)
        try:
            with urllib.request.urlopen(req) as resp:
                resp_bytes = resp.read().strip()
                if resp_bytes:
                    try:
                        return json.loads(resp_bytes.decode("utf-8"))
                    except json.JSONDecodeError:
                        return {"raw": resp_bytes.decode("utf-8")}
                return {}
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            logger.error("HTTP Error %d on %s: %s", e.code, url, err_body)
            return {"error": err_body, "status_code": e.code}
        except Exception as e:
            logger.error("Connection error on %s: %s", url, e)
            return None

    @staticmethod
    def _unwrap(resp: dict[str, Any] | None) -> Any:
        """Unwrap SigNoz API envelope ``{status: 'success', data: ...}``."""
        if not isinstance(resp, dict):
            return resp
        if resp.get("status") == "success" and "data" in resp:
            return resp["data"]
        return resp

    # -- Registration & Auth ------------------------------------------------

    def get_registration_context(self, email: str) -> dict[str, Any] | None:
        ref_url = urllib.parse.quote(self.api_url)
        path = f"/api/v2/sessions/context?email={email}&ref={ref_url}"
        return self._unwrap(self._request(path))

    def register(self, email: str, password: str) -> str:
        """Register the first admin user. Returns ``orgId``."""
        payload = {
            "name": "Admin",
            "email": email,
            "password": password,
            "orgDisplayName": "My Organization",
            "orgName": "my-organization",
        }
        resp = self._unwrap(self._request("/api/v1/register", method="POST", data=payload))
        if resp and isinstance(resp, dict) and "orgId" in resp:
            return resp["orgId"]
        raise BootstrapError(f"Registration failed: {resp}")

    def login(self, email: str, password: str, org_id: str) -> str:
        """Log in and return an access token."""
        payload = {"email": email, "password": password, "orgId": org_id}
        resp = self._unwrap(
            self._request("/api/v2/sessions/email_password", method="POST", data=payload)
        )
        if resp and isinstance(resp, dict) and "accessToken" in resp:
            return resp["accessToken"]
        raise BootstrapError(f"Login failed: {resp}")

    # -- Dashboards ---------------------------------------------------------

    def list_dashboards(self) -> dict[str, dict[str, Any]]:
        data = self._unwrap(self._request("/api/v1/dashboards"))
        if isinstance(data, list):
            return {d.get("uuid") or d.get("id"): d for d in data}
        return {}

    def create_dashboard(self, data: dict[str, Any]) -> dict[str, Any] | None:
        return self._unwrap(self._request("/api/v1/dashboards", method="POST", data=data))

    def update_dashboard(self, uuid_str: str, data: dict[str, Any]) -> dict[str, Any] | None:
        return self._unwrap(
            self._request(f"/api/v1/dashboards/{uuid_str}", method="PUT", data=data)
        )

    # -- Preferences --------------------------------------------------------

    def update_nav_preferences(self, shortcuts: tuple[str, ...] | list[str]) -> None:
        payload: dict[str, Any] = {"value": list(shortcuts)}
        try:
            resp = self._request(
                "/api/v1/user/preferences/nav_shortcuts", method="PUT", data=payload
            )
            logger.info("Preferences update result: %s", resp)
        except Exception as e:
            logger.warning("Failed to update nav_shortcuts preference: %s", e)


# ---------------------------------------------------------------------------
# Bootstrap orchestration
# ---------------------------------------------------------------------------


def _register_and_login(client: SigNozClient, config: Config) -> str:
    """Ensure the admin user exists, log in, and return an access token."""
    if not config.email or not config.password:
        raise BootstrapError(
            "SIGNOZ_USER_ROOT_EMAIL and SIGNOZ_USER_ROOT_PASSWORD must be defined."
        )

    logger.info("Checking registration context for %s ...", config.email)
    context = client.get_registration_context(config.email)

    org_id: str | None = None
    if context and isinstance(context, dict) and context.get("exists") is True:
        orgs = context.get("orgs", [])
        if orgs:
            org_id = orgs[0].get("id")
            logger.info("User is already registered. orgId: %s", org_id)

    if not org_id:
        logger.info("User is not registered yet. Registering first admin and organization...")
        org_id = client.register(config.email, config.password)
        logger.info("Registration successful! orgId: %s", org_id)

    logger.info("Logging in to organization %s...", org_id)
    token = client.login(config.email, config.password, org_id)
    logger.info("Login successful!")
    return token


def _import_dashboards(client: SigNozClient, config: Config) -> list[str]:
    """Import dashboard JSON files from the configured directory."""
    imported_uuids: list[str] = []
    if not os.path.exists(config.dashboards_dir):
        logger.info("Dashboards directory %s not found. Skipping.", config.dashboards_dir)
        return imported_uuids

    existing = client.list_dashboards()

    for filename in sorted(os.listdir(config.dashboards_dir)):
        if not filename.endswith(".json"):
            continue

        filepath = os.path.join(config.dashboards_dir, filename)
        logger.info("Loading dashboard file %s ...", filename)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                dashboard_data: dict[str, Any] = json.load(f)
        except Exception as e:
            logger.warning("Failed to read/parse %s: %s", filename, e)
            continue

        uuid_str = dashboard_data.get("uuid") or dashboard_data.get("id")
        title = dashboard_data.get("title")

        if not uuid_str:
            uuid_str = str(uuid.uuid5(uuid.NAMESPACE_DNS, filename))
            dashboard_data["uuid"] = uuid_str
            logger.info(
                "Dashboard %s is missing uuid. Generated deterministic uuid: %s",
                filename,
                uuid_str,
            )

        imported_uuids.append(uuid_str)

        if uuid_str in existing:
            logger.info("Dashboard '%s' (%s) already exists. Updating...", title, uuid_str)
            resp = client.update_dashboard(uuid_str, dashboard_data)
            logger.info("Update result: %s", resp)
        else:
            logger.info("Dashboard '%s' (%s) does not exist. Creating...", title, uuid_str)
            resp = client.create_dashboard(dashboard_data)
            logger.info("Creation result: %s", resp)

    return imported_uuids


def bootstrap(config: Config) -> None:
    """Run the full SigNoz bootstrap sequence."""
    client = SigNozClient(config.api_url)
    token = _register_and_login(client, config)
    client.token = token
    _import_dashboards(client, config)

    logger.info("Updating nav_shortcuts preference to pin all standard features...")
    client.update_nav_preferences(DEFAULT_NAV_SHORTCUTS)

    logger.info("SigNoz bootstrap finished successfully.")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    try:
        bootstrap(Config.from_env())
    except BootstrapError as e:
        logger.error("%s", e)
        sys.exit(1)
