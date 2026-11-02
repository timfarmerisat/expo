"""Microsoft Graph connector with evidence-based health reporting.

No token is embedded or persisted by this module. Supply a short-lived delegated access
token through MS_GRAPH_ACCESS_TOKEN. A missing or rejected token is reported as a
permission/reconnect state, never as healthy.
"""
from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, asdict


@dataclass
class ConnectionEvidence:
    provider: str = "microsoft"
    state: str = "Disconnected"
    checked_at: int = 0
    latency_ms: int | None = None
    tenant_id: str | None = None
    client_id: str | None = None
    account: str | None = None
    detail: str = "Not checked"

    def to_dict(self) -> dict:
        return asdict(self)


class MicrosoftGraphDriver:
    graph_root = "https://graph.microsoft.com/v1.0"

    def __init__(self) -> None:
        self.tenant_id = os.getenv("MS_TENANT_ID")
        self.client_id = os.getenv("MS_CLIENT_ID")
        self.admin_email = os.getenv("MS_ADMIN_EMAIL")

    def verify_connectivity(self) -> dict:
        token = os.getenv("MS_GRAPH_ACCESS_TOKEN")
        evidence = ConnectionEvidence(
            checked_at=int(time.time()),
            tenant_id=self.tenant_id,
            client_id=self.client_id,
            account=self.admin_email,
        )
        if not token:
            evidence.state = "Permission Required"
            evidence.detail = "MS_GRAPH_ACCESS_TOKEN is not configured; reconnect Microsoft before use."
            return evidence.to_dict()

        query = urllib.parse.urlencode({"$select": "id,displayName,userPrincipalName"})
        request = urllib.request.Request(
            f"{self.graph_root}/me?{query}",
            headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
        )
        started = time.perf_counter()
        try:
            with urllib.request.urlopen(request, timeout=8) as response:
                payload = json.loads(response.read().decode("utf-8"))
            evidence.latency_ms = round((time.perf_counter() - started) * 1000)
            evidence.state = "Connected"
            evidence.account = payload.get("userPrincipalName") or self.admin_email
            evidence.detail = "Microsoft Graph /me returned successfully."
        except urllib.error.HTTPError as exc:
            evidence.latency_ms = round((time.perf_counter() - started) * 1000)
            evidence.state = "Permission Required" if exc.code in (401, 403) else "Error"
            evidence.detail = f"Microsoft Graph returned HTTP {exc.code}; reconnect or review consent/scopes."
        except Exception as exc:
            evidence.latency_ms = round((time.perf_counter() - started) * 1000)
            evidence.state = "Error"
            evidence.detail = f"Connectivity check failed: {type(exc).__name__}"
        return evidence.to_dict()


if __name__ == "__main__":
    print(json.dumps(MicrosoftGraphDriver().verify_connectivity(), indent=2))
