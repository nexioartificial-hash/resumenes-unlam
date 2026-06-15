"""
Genera embeddings de todos los módulos y los guarda en module_chunks.
Usa Jina AI jina-embeddings-v3 (1024 dims, task-aware).

Uso:
  python -X utf8 scripts/seed_embeddings.py
  python -X utf8 scripts/seed_embeddings.py --subject filosofia  (solo una materia)
"""
import os, sys, json, time, argparse, requests
from textwrap import wrap

try:
    from dotenv import load_dotenv
    load_dotenv(".env.local")
except ImportError:
    pass

sys.stdout.reconfigure(encoding="utf-8")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://dtbouycelkjgyddpftir.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")
JINA_KEY     = os.environ.get("JINA_API_KEY")

SB_HEADERS = {
    "apikey":        SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type":  "application/json",
}

CHUNK_SIZE    = 400   # palabras por chunk
CHUNK_OVERLAP = 60    # palabras de solapamiento entre chunks


# ── Chunking ──────────────────────────────────────────────────────────────────

def chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    words = text.split()
    if not words:
        return []
    chunks = []
    start = 0
    while start < len(words):
        end = start + size
        chunks.append(" ".join(words[start:end]))
        if end >= len(words):
            break
        start = end - overlap
    return chunks


# ── Jina Embeddings API ───────────────────────────────────────────────────────

def embed_passages(texts: list[str]) -> list[list[float]]:
    """Embede textos de documentos (task=retrieval.passage)."""
    r = requests.post(
        "https://api.jina.ai/v1/embeddings",
        headers={"Authorization": f"Bearer {JINA_KEY}", "Content-Type": "application/json"},
        json={"model": "jina-embeddings-v3", "task": "retrieval.passage", "input": texts},
        timeout=60,
    )
    r.raise_for_status()
    data = r.json()["data"]
    return [d["embedding"] for d in sorted(data, key=lambda x: x["index"])]


# ── Supabase helpers ──────────────────────────────────────────────────────────

def get_modules(subject_slug: str | None = None) -> list[dict]:
    params = {"select": "id,title,body,subject_id", "body": "not.is.null", "order": "subject_id,order_index"}
    if subject_slug:
        # Primero resolvemos el subject_id
        sr = requests.get(
            f"{SUPABASE_URL}/rest/v1/subjects",
            headers=SB_HEADERS,
            params={"slug": f"eq.{subject_slug}", "select": "id"},
        )
        subjects = sr.json()
        if not subjects:
            print(f"  ❌ Materia '{subject_slug}' no encontrada.")
            sys.exit(1)
        sid = subjects[0]["id"]
        params["subject_id"] = f"eq.{sid}"

    r = requests.get(f"{SUPABASE_URL}/rest/v1/modules", headers=SB_HEADERS, params=params)
    r.raise_for_status()
    return [m for m in r.json() if m.get("body")]


def delete_existing_chunks(module_id: str):
    requests.delete(
        f"{SUPABASE_URL}/rest/v1/module_chunks",
        headers=SB_HEADERS,
        params={"module_id": f"eq.{module_id}"},
    )


def insert_chunks(rows: list[dict]):
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/module_chunks",
        headers={**SB_HEADERS, "Prefer": "return=minimal"},
        json=rows,
    )
    if r.status_code not in (200, 201, 204):
        print(f"    ❌ Insert error {r.status_code}: {r.text[:200]}")
        return False
    return True


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--subject", default=None, help="slug de la materia (opcional, indexa todas si no se pasa)")
    args = parser.parse_args()

    if not JINA_KEY:
        print("❌ JINA_API_KEY no configurada en .env.local")
        sys.exit(1)

    print(f"=== Seed Embeddings ({'todas las materias' if not args.subject else args.subject}) ===\n")

    modules = get_modules(args.subject)
    print(f"  Módulos con contenido: {len(modules)}\n")

    total_chunks  = 0
    total_modules = 0

    for mod in modules:
        mid  = mod["id"]
        sid  = mod["subject_id"]
        body = mod["body"]

        chunks = chunk_text(body)
        if not chunks:
            continue

        print(f"  [{mod['title'][:40]}] {len(chunks)} chunks...", end=" ", flush=True)

        # Embeddings en batches de 16 (límite recomendado por Jina)
        embeddings = []
        for i in range(0, len(chunks), 16):
            batch = chunks[i:i+16]
            vecs  = embed_passages(batch)
            embeddings.extend(vecs)
            if i + 16 < len(chunks):
                time.sleep(0.2)  # rate limit courtesy

        # Borrar chunks anteriores del módulo y reinsertar
        delete_existing_chunks(mid)

        rows = [
            {
                "subject_id":  sid,
                "module_id":   mid,
                "content":     chunk,
                "embedding":   vec,
                "chunk_index": idx,
            }
            for idx, (chunk, vec) in enumerate(zip(chunks, embeddings))
        ]

        ok = insert_chunks(rows)
        if ok:
            print(f"✓")
            total_chunks  += len(chunks)
            total_modules += 1
        else:
            print(f"❌")

    print(f"\n{'='*50}")
    print(f"  Módulos indexados: {total_modules}/{len(modules)}")
    print(f"  Chunks totales:    {total_chunks}")
    print(f"  Listo — embeddings disponibles para RAG.")


if __name__ == "__main__":
    main()
