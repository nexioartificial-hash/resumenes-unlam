"""
fix_logica_modulos.py — Re-extrae módulos de Lógica Matemática sin filtrar fórmulas.
El script anterior (seed_modulos.py) descartaba líneas cortas (_is_formula_row),
perdiendo tablas de verdad y notación matemática. Esto viola la regla de paridad.

Uso:
    python -X utf8 scripts/fix_logica_modulos.py
"""
import os, sys, requests
sys.stdout.reconfigure(encoding="utf-8")

try:
    from dotenv import load_dotenv
    load_dotenv(".env.local")
except ImportError:
    pass

import fitz

PDF          = "docs/logica-matematica/Resumen de Logica Matematica 2026.pdf"
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://dtbouycelkjgyddpftir.supabase.co")
SERVICE_KEY  = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
WATERMARK    = "@RESUMENES.UNLAM"

HEADERS = {
    "apikey":        SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type":  "application/json",
}


# ── Parity helpers (CLAUDE.md) ────────────────────────────────────────────────

def count_content_words(text, strip_headings=False):
    words = []
    for line in text.split("\n"):
        s = line.strip()
        if s.isdigit() and len(s) <= 3:
            continue
        if WATERMARK in s:
            continue
        if strip_headings:
            s = s.replace("## ", "").replace("### ", "")
        words.extend(s.split())
    return len(words)

def verify_parity(raw_pdf_text, extracted_text, module_name):
    raw = count_content_words(raw_pdf_text)
    ext = count_content_words(extracted_text, strip_headings=True)
    if raw != ext:
        print(f"  ❌ PARIDAD FALLIDA en {module_name}: PDF={raw}, extraído={ext} (diff={raw-ext})")
        return False
    print(f"  ✓ Paridad OK: {raw} palabras")
    return True


# ── Font size map (para heading detection) ────────────────────────────────────

def build_text_to_size(page):
    mapping = {}
    for block in page.get_text("dict")["blocks"]:
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            spans = [sp for sp in line.get("spans", []) if sp.get("text", "").strip()]
            if not spans:
                continue
            text = "".join(sp["text"] for sp in spans).strip()
            size = max(sp["size"] for sp in spans)
            if text:
                mapping[text] = round(size, 1)
    return mapping


# ── Extracción por página ─────────────────────────────────────────────────────

def extract_pdf():
    """
    Devuelve lista de módulos: [{"title": str, "raw_pdf": str, "body": str}]
    raw_pdf: texto crudo sin headings markdown (para parity check)
    body: texto con headings ## y ### según tamaño de fuente
    """
    pdf = fitz.open(PDF)

    # Determinar tamaño base (el más frecuente en el doc)
    all_sizes = []
    for page in pdf:
        for block in page.get_text("dict")["blocks"]:
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                for sp in line.get("spans", []):
                    if sp.get("text", "").strip():
                        all_sizes.append(round(sp["size"], 1))
    from collections import Counter
    base_size = Counter(all_sizes).most_common(1)[0][0] if all_sizes else 11.0

    # Patrón de heading de módulo
    import re
    MOD_RE = re.compile(r'^Modulo\.\s*(\d+)', re.IGNORECASE)

    modules = []
    current_title = None
    current_raw   = []
    current_lines = []

    for page in pdf:
        t2s = build_text_to_size(page)

        # Extraer líneas limpias con get_text("text") — fuente de verdad
        raw_lines = page.get_text("text").split("\n")

        for raw_line in raw_lines:
            s = raw_line.strip()
            if not s:
                continue
            if s.isdigit() and len(s) <= 3:
                continue
            if WATERMARK in s:
                continue

            # Detectar inicio de módulo
            m = MOD_RE.match(s)
            if m:
                # Guardar módulo anterior
                if current_title is not None:
                    modules.append({
                        "title": current_title,
                        "raw_pdf": "\n".join(current_raw),
                        "body":    "\n".join(current_lines),
                    })
                current_title = s
                current_raw   = [s]
                current_lines = [f"## {s}"]
                continue

            if current_title is None:
                continue  # antes del primer módulo (portada)

            current_raw.append(s)

            # Detectar subheadings por tamaño de fuente
            size = t2s.get(s, base_size)
            if size > base_size + 0.5:
                current_lines.append(f"### {s}")
            else:
                current_lines.append(s)

    # Último módulo
    if current_title:
        modules.append({
            "title": current_title,
            "raw_pdf": "\n".join(current_raw),
            "body":    "\n".join(current_lines),
        })

    return modules


# ── Obtener IDs de módulos en Supabase ───────────────────────────────────────

def get_module_ids():
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/subjects",
        headers=HEADERS,
        params={"slug": "eq.logica-matematica", "select": "id"},
    )
    subjects = r.json()
    if not subjects:
        print("❌ No se encontró la materia logica-matematica en Supabase")
        sys.exit(1)
    subject_id = subjects[0]["id"]

    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/modules",
        headers=HEADERS,
        params={
            "subject_id": f"eq.{subject_id}",
            "select":     "id,title,order_index",
            "order":      "order_index",
        },
    )
    mods = r.json()
    return subject_id, mods


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=== Fix Lógica Matemática — Re-extracción sin filtro de fórmulas ===\n")

    modules = extract_pdf()
    print(f"Módulos detectados en PDF: {len(modules)}\n")

    subject_id, db_mods = get_module_ids()
    print(f"Módulos en Supabase: {len(db_mods)}\n")

    if len(modules) != len(db_mods):
        print(f"⚠️  Diferencia de módulos: PDF={len(modules)}, DB={len(db_mods)}")
        print("Continúo igualando por order_index...")

    all_ok = True
    for i, mod in enumerate(modules):
        db_mod = db_mods[i] if i < len(db_mods) else None
        if not db_mod:
            print(f"  ⚠️  Módulo {i+1} no tiene entrada en DB, saltando")
            continue

        print(f"Módulo {i+1}: {mod['title'][:50]}")
        ok = verify_parity(mod["raw_pdf"], mod["body"], mod["title"])
        if not ok:
            all_ok = False

    if not all_ok:
        print("\n❌ Hay módulos con paridad fallida. No se sube nada.")
        sys.exit(1)

    print("\n✓ Todos los módulos pasan paridad. Actualizando Supabase...\n")

    for i, mod in enumerate(modules):
        db_mod = db_mods[i]
        r = requests.patch(
            f"{SUPABASE_URL}/rest/v1/modules",
            headers={**HEADERS, "Prefer": "return=minimal"},
            params={"id": f"eq.{db_mod['id']}"},
            json={"body": mod["body"]},
        )
        if r.status_code in (200, 201, 204):
            words = len(mod["body"].split())
            print(f"  ✓ {db_mod['title'][:45]} — {words} palabras actualizadas")
        else:
            print(f"  ❌ Error {r.status_code}: {r.text[:100]}")

    print("\n✓ Listo. Ahora corré seed_embeddings.py --subject logica-matematica para re-indexar.")


if __name__ == "__main__":
    main()
