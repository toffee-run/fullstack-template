import asyncio
import os

import httpx
from src.client import SigNozClient
from src.settings import SigNozSettings

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


async def main():
    settings = SigNozSettings()
    http = httpx.AsyncClient(base_url=settings.api_url)

    client = SigNozClient(http, settings, SCRIPT_DIR)
    await client.login()
    await client.add_dashboards()
    await client.navbar_setting()


if __name__ == "__main__":
    asyncio.run(main())
