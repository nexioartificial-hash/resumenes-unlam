import os, sys, requests, fitz
from collections import Counter
try:
    from dotenv import load_dotenv
    load_dotenv(".env.local")
except ImportError:
    pass

sys.stdout.reconfigure(encoding="utf-8")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://dtbouycelkjgyddpftir.supabase.co")
KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")
HEADERS = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}
SUBJECT_ID = "fd4e783d-18e2-49f8-8a16-b8ada81b03c7"
PDF_PATH = "docs/educacion-fisica/Resumen de Fundamentos Ed. Fisica 2026.pdf"


def is_skippable(line):
    s = line.strip()
    if not s:
        return True
    if s.isdigit() and len(s) <= 3:
        return True
    if "@RESUMENES.UNLAM" in s:
        return True
    return False


def count_content_words(text):
    words = []
    for line in text.split("\n"):
        if is_skippable(line):
            continue
        words.extend(line.strip().split())
    return len(words)


def verify_parity(raw_pdf_text, extracted_text, module_name):
    raw_count = count_content_words(raw_pdf_text)
    clean = extracted_text.replace("## ", "").replace("### ", "")
    ext_count = count_content_words(clean)
    if raw_count != ext_count:
        print(f"  ❌ PARIDAD FALLIDA en {module_name}: PDF={raw_count} palabras, extraído={ext_count} palabras")
        return False
    print(f"  ✓ Paridad OK: {raw_count} palabras")
    return True


def extract_pdf(path):
    doc = fitz.open(path)

    # ── Paso 1: texto completo con get_text("text") — fuente de verdad ──────
    raw_pages = []
    for page in doc:
        raw_pages.append(page.get_text("text"))
    raw_full = "\n".join(raw_pages)

    # ── Paso 2: detectar tamaño de fuente base con get_text("dict") ──────────
    all_sizes = []
    for page in doc:
        for b in page.get_text("dict")["blocks"]:
            if b["type"] != 0:
                continue
            for line in b["lines"]:
                for span in line["spans"]:
                    if span["text"].strip():
                        all_sizes.append(round(span["size"]))
    base_size = Counter(all_sizes).most_common(1)[0][0] if all_sizes else 11

    # ── Paso 3: mapear texto → tamaño de fuente ───────────────────────────────
    # Clave: texto normalizado → tamaño máximo observado
    text_to_size = {}
    for page in doc:
        for b in page.get_text("dict")["blocks"]:
            if b["type"] != 0:
                continue
            for line in b["lines"]:
                for span in line["spans"]:
                    t = span["text"].strip()
                    if t:
                        sz = round(span["size"])
                        if sz > text_to_size.get(t, 0):
                            text_to_size[t] = sz

    # ── Paso 4: construir markdown desde raw text (sin deduplicar) ───────────
    markdown_lines = []
    for line in raw_full.split("\n"):
        s = line.strip()
        if is_skippable(s):
            continue
        sz = text_to_size.get(s, base_size)
        if sz >= base_size + 4:
            markdown_lines.append(f"## {s}")
        elif sz >= base_size + 2:
            markdown_lines.append(f"### {s}")
        else:
            markdown_lines.append(s)

    extracted = "\n".join(markdown_lines)
    return raw_full, extracted


def post_summary(body):
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/content_items",
        headers=HEADERS,
        params={"subject_id": f"eq.{SUBJECT_ID}", "type": "eq.summary", "select": "id,title"},
    )
    existing = r.json() if r.status_code == 200 else []
    if not isinstance(existing, list):
        existing = []

    payload = {
        "subject_id": SUBJECT_ID,
        "title": "Resumen de Fundamentos de Ed. Física 2026",
        "body": body,
        "type": "summary",
        "order_index": 0,
        "is_published": True,
    }

    if existing:
        item_id = existing[0]["id"]
        res = requests.patch(
            f"{SUPABASE_URL}/rest/v1/content_items?id=eq.{item_id}",
            headers=HEADERS,
            json=payload,
        )
        verb = "PATCH"
    else:
        res = requests.post(
            f"{SUPABASE_URL}/rest/v1/content_items",
            headers=HEADERS,
            json=payload,
        )
        verb = "POST"

    ok = res.status_code in (200, 201, 204)
    print(f"  [{verb}] summary Ed.Fisica: {'OK' if ok else f'ERR {res.status_code} - {res.text[:300]}'}")


if __name__ == "__main__":
    print("=== Fundamentos Ed. Fisica — Summary desde PDF ===")
    print(f"  PDF: {PDF_PATH}")

    raw_full, extracted = extract_pdf(PDF_PATH)
    print(f"  Texto raw: {len(raw_full)} chars")
    print(f"  Markdown generado: {len(extracted)} chars")

    if not verify_parity(raw_full, extracted, "Resumen Ed. Fisica"):
        print("  ⛔ Abortando — no se sube nada hasta resolver la paridad.")
        sys.exit(1)

    post_summary(extracted)
    print("Listo.")
