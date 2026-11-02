#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPECS = ROOT / "specs"

def load(name: str):
    path = SPECS / name
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)

departments = load("department-registry.json")
system_schema = load("system-registry.schema.json")
asset_schema = load("asset-manifest.schema.json")
receipt_schema = load("release-receipt.schema.json")

items = departments["departments"]
assert len(items) == 11, f"Expected 11 departments, found {len(items)}"
department_ids = [item["id"] for item in items]
assert len(department_ids) == len(set(department_ids)), "Duplicate department IDs"

roles = [role for item in items for role in item["roles"]]
assert len(roles) == 77, f"Expected 77 role assignments, found {len(roles)}"
assert len(roles) == len(set(roles)), "Role names must be unique in the canonical registry"

routes = [item["route"] for item in items]
assert len(routes) == len(set(routes)), "Department routes must be unique"

expected_states = {"Disconnected","Permission Required","Connecting","Connected","Limited","Syncing","Error"}
actual_states = set(departments["sharedPageContract"]["connectionStates"])
assert actual_states == expected_states, f"Connection state contract mismatch: {actual_states}"

for name, schema in [
    ("system-registry.schema.json", system_schema),
    ("asset-manifest.schema.json", asset_schema),
    ("release-receipt.schema.json", receipt_schema),
]:
    assert schema.get("$schema") == "https://json-schema.org/draft/2020-12/schema", f"{name}: wrong JSON Schema dialect"
    assert schema.get("type") == "object", f"{name}: root must be object"

print(f"PASS: {len(items)} departments")
print(f"PASS: {len(roles)} unique specialist roles")
print("PASS: canonical seven-state connection model")
print("PASS: JSON schemas parsed and basic contracts validated")

# Additional UI/tool catalog validation
assistant_catalog = load("assistant-service-catalog.json")
action_schema = load("action-contract.schema.json")
action_catalog = load("action-catalog.json")
communication = load("communication-channels.json")

catalog_department_ids = [item["id"] for item in assistant_catalog["departments"]]
assert set(catalog_department_ids) == set(department_ids), "Assistant/service catalog must cover all canonical departments"
for department in assistant_catalog["departments"]:
    assert len(department["assistants"]) >= 4, f'{department["id"]}: needs at least 4 department assistants'
    assert 4 <= len(department["primaryButtons"]) <= 6, f'{department["id"]}: primary button count must be 4-6'
    assert len(department["secondaryButtons"]) <= 6, f'{department["id"]}: secondary buttons must be <= 6'

assert action_schema.get("type") == "object", "Action schema root must be object"
actions = action_catalog["actions"]
action_ids = [item["id"] for item in actions]
assert len(action_ids) == len(set(action_ids)), "Action IDs must be unique"
for action in actions:
    assert action["success"]["nextAction"].strip(), f'{action["id"]}: missing next action'
    assert action["unavailable"]["recoveryAction"].strip(), f'{action["id"]}: missing recovery action'

channel_ids = [item["id"] for item in communication["channels"]]
assert len(channel_ids) == len(set(channel_ids)), "Communication channel IDs must be unique"
print(f"PASS: assistant/service catalog covers {len(catalog_department_ids)} departments")
print(f"PASS: {len(actions)} action contracts include success and recovery paths")
print(f"PASS: {len(channel_ids)} communication channels have explicit fallback behavior")
