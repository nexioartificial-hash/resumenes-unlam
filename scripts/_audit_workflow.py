# -*- coding: utf-8 -*-
import json, requests

API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MmQzYTk3Yi01MDY5LTQ5ZjMtOTM3Yy05ZTk4NjM1YTE3ZWUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzgxNDUwNjAyfQ.G3Fo5OLVGf32gcT-e-jNmb3ymZA1UWbsk2qeuhnAOQM"
HOST = "https://n8n.nexioagency.online"
WF_ID = "o44ut3z52fHOXncz"
headers = {"x-n8n-api-key": API_KEY, "Content-Type": "application/json"}

wf = requests.get(f"{HOST}/api/v1/workflows/{WF_ID}", headers=headers).json()
conn = wf["connections"]

# ── 1. Borrar Validador de Contexto ─────────────────────────────────────────
# Redis -> Validar Entrada directo (salteamos el validador)
conn["Redis"]["main"] = [[{"node": "Validar Entrada", "type": "main", "index": 0}]]
del conn["Validador de Contexto"]
print("OK: Validador de Contexto eliminado, Redis -> Validar Entrada")

# ── 2. Borrar regla PDF del Switch Que es? ───────────────────────────────────
for node in wf["nodes"]:
    if node["name"] == "Que es?":
        rules = node["parameters"]["rules"]["values"]
        rules = [r for r in rules if r.get("outputKey") != "PDF"]
        node["parameters"]["rules"]["values"] = rules
        print(f"OK: Regla PDF eliminada del Switch — quedan {len(rules)} reglas")
        break

# Conexiones Switch: [Imagen(0), Audio(1), PDF(2), text(3)] -> [Imagen(0), Audio(1), text(2)]
que_main = conn["Que es?"]["main"]
conn["Que es?"]["main"] = [que_main[0], que_main[1], que_main[3]]

# Actualizar indice de Texto -> Merge2: de 3 a 2
for conns in conn["Texto"]["main"]:
    for c in conns:
        if c["node"] == "Merge2":
            c["index"] = 2
print("OK: Switch reindexado [Imagen, Audio, text]")

# ── 3. Merge2: numberInputs 4 -> 3 ───────────────────────────────────────────
for node in wf["nodes"]:
    if node["name"] == "Merge2":
        node["parameters"]["numberInputs"] = 3
        print("OK: Merge2 numberInputs 4 -> 3")
        break

# Borrar conexiones de los nodos PDF del dict de conexiones
for key in ["Descargar PDF", "Extract from File1", "Edit Fields5"]:
    if key in conn:
        del conn[key]
print("OK: Conexiones rama PDF eliminadas del dict")

# ── 4. Wait1: 15s -> 10s ─────────────────────────────────────────────────────
for node in wf["nodes"]:
    if node["name"] == "Wait1":
        node["parameters"]["amount"] = "=10"
        print("OK: Wait1 amount 15 -> 10")
        break

# ── 5. Eliminar nodos del array ───────────────────────────────────────────────
REMOVE = {"Validador de Contexto", "Descargar PDF", "Extract from File1", "Edit Fields5"}
antes = len(wf["nodes"])
wf["nodes"] = [n for n in wf["nodes"] if n["name"] not in REMOVE]
print(f"OK: Nodos {antes} -> {len(wf['nodes'])} (eliminados {antes - len(wf['nodes'])})")

# ── 6. PUT ────────────────────────────────────────────────────────────────────
r = requests.put(
    f"{HOST}/api/v1/workflows/{WF_ID}",
    headers=headers,
    json={
        "name": wf["name"],
        "nodes": wf["nodes"],
        "connections": wf["connections"],
        "settings": wf["settings"],
        "staticData": wf.get("staticData"),
    }
)
r.raise_for_status()
result = r.json()
print(f"\nWorkflow '{result['name']}' actualizado — {len(result['nodes'])} nodos activos")
