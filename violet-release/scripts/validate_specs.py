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
