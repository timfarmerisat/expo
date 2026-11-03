#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
with (ROOT/"specs/communication-awareness.json").open("r",encoding="utf-8") as f:
    awareness=json.load(f)
with (ROOT/"specs/marketplace-distribution.json").open("r",encoding="utf-8") as f:
    stores=json.load(f)

assert len(awareness["states"]) == 9
assert awareness["states"][-1]["id"] == "ready"
assert {x["id"] for x in stores["stores"]} == {"apple-app-store","google-play","microsoft-store"}
for store in stores["stores"]:
    assert store["managementUrl"].startswith("https://")
    assert len(store["gates"]) >= 5

print("PASS: communication awareness state machine")
print("PASS: Apple / Google Play / Microsoft Store registry")
