"""
seed_logica_columnas.py  v3
Extrae módulos del PDF de Lógica Matemática preservando el layout multi-columna.

Trabaja a nivel de LÍNEA (page.get_text("dict")), agrupa líneas en filas
horizontales y clasifica cada fila en:
  - 'single'      → texto normal o heading (una sola columna)
  - 'full_table'  → tabla ancho completo (como la tabla de conectivos)
  - 'truth_split' → columna izquierda=descripción, columna derecha=tabla de verdad

Uso:
    python -X utf8 scripts/seed_logica_columnas.py --dry-run
    python -X utf8 scripts/seed_logica_columnas.py --dry-run --modulo 1
    python -X utf8 scripts/seed_logica_columnas.py
"""

import os, sys, re, argparse, requests
from collections import Counter

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
MOD_RE       = re.compile(r"^Modulo\.\s*\d+", re.IGNORECASE)

HEADERS = {
    "apikey":        SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type":  "application/json",
}

# Tokens que aparecen como células en tablas de verdad lógica
# Incluye versiones con espacios (tal como fitz lee este PDF) y sin espacios
TABLE_TOKENS = {
    "V", "F",
    "p", "q", "r", "s",
    "～p", "～q", "～r",
    # versiones compactas (sin espacios)
    "p˄q", "p˅q", "p⇒q", "p⇔q", "p⊻q",
    "q⇒p", "(p⇒q)˄(q⇒p)",
    "p⇒p", "p⇒～p",
    # versiones con espacios (así los lee fitz de este PDF)
    "p ˄ q", "p ˅ q", "p ⇒ q", "p ⇔ q", "p ⊻ q",
    "q ⇒ p",
    "(p ⇒ q) ˄ (q ⇒ p)",
    "p ⇒ p", "p ⇒ ～p",  # tablas de Tautología y Contradicción
}

# x-coordenada que separa columna izquierda (texto) de columna derecha (tabla de verdad)
SPLIT_X = 200
# x-spread mínimo para considerar una fila como "multi-columna"
TABLE_SPREAD_MIN = 50


# ─── Paridad ──────────────────────────────────────────────────────────────────

def count_words(text, strip_md=False):
    n = 0
    for line in text.split("\n"):
        s = line.strip()
        if not s or (s.isdigit() and len(s) <= 3) or WATERMARK in s:
            continue
        if strip_md:
            s = re.sub(r"^#{1,3}\s*", "", s)
            if re.match(r"^\|[\s\-|]+\|$", s):   # separador de tabla
                continue
            s = s.replace("|", " ")
        n += len(s.split())
    return n

def verify_parity(raw, md, name):
    r = count_words(raw)
    e = count_words(md, strip_md=True)
    diff = abs(r - e)
    ok = diff <= max(8, int(r * 0.04))
    sym = "✓" if ok else "⚠️ "
    print(f"  {sym} PDF={r} MD={e} diff={diff} — {name[:50]}")
    return ok


# ─── Tamaño de fuente base ───────────────────────────────────────────────────

def get_base_size(doc):
    sizes = []
    for page in doc:
        for blk in page.get_text("dict")["blocks"]:
            if blk.get("type") != 0:
                continue
            for ln in blk.get("lines", []):
                for sp in ln.get("spans", []):
                    if sp.get("text", "").strip():
                        sizes.append(round(sp["size"], 1))
    return Counter(sizes).most_common(1)[0][0] if sizes else 11.0


# ─── Detección de fórmulas matemáticas ───────────────────────────────────────

def is_math_formula(text):
    """True si el texto contiene símbolos matemáticos Unicode (bloque 1D400-1D7FF)."""
    for ch in text:
        if 0x1D400 <= ord(ch) <= 0x1D7FF:
            return True
    return False


# ─── Extracción de líneas individuales ───────────────────────────────────────

def get_lines(page):
    """
    Devuelve una lista de dicts por LÍNEA (no por bloque).
    Filtrado: watermark y números de página solos.
    Ordenado por (y0 redondeado, x0).
    """
    result = []
    for blk in page.get_text("dict")["blocks"]:
        if blk.get("type") != 0:
            continue
        for ln in blk.get("lines", []):
            spans = ln.get("spans", [])
            text  = "".join(s.get("text", "") for s in spans).strip()
            if not text or WATERMARK in text or (text.isdigit() and len(text) <= 3):
                continue
            bbox = ln.get("bbox", (0, 0, 0, 0))
            size = max(
                (round(s.get("size", 11), 1) for s in spans if s.get("text", "").strip()),
                default=11.0,
            )
            result.append({
                "x0": bbox[0], "y0": bbox[1],
                "x1": bbox[2], "y1": bbox[3],
                "text": text, "size": size,
            })
    result.sort(key=lambda l: (round(l["y0"]), l["x0"]))
    return result


# ─── Agrupamiento en filas horizontales ──────────────────────────────────────

def group_into_rows(lines, y_tol=4):
    """
    Agrupa líneas con y0 cercano en 'filas horizontales'.
    """
    if not lines:
        return []
    rows = [[lines[0]]]
    for ln in lines[1:]:
        if abs(ln["y0"] - rows[-1][0]["y0"]) <= y_tol:
            rows[-1].append(ln)
        else:
            rows.append([ln])
    for row in rows:
        row.sort(key=lambda l: l["x0"])
    return rows


# ─── Clasificación de filas ───────────────────────────────────────────────────

def row_x_spread(row):
    if len(row) < 2:
        return 0
    return row[-1]["x0"] - row[0]["x0"]

def rows_x_compatible(a, b, x_tol=35):
    if len(a) != len(b):
        return False
    return all(abs(x["x0"] - y["x0"]) <= x_tol for x, y in zip(a, b))

def is_table_token(text):
    return text.strip() in TABLE_TOKENS

def is_multi_token_span(text):
    """True si el texto es un TABLE_TOKEN completo O una secuencia espacio-separada de TABLE_TOKENs.
    Ej: 'p p' → True (dos 'p'), 'V V' → True, 'p ˄ q' → True (token completo).
    Permite detectar celdas compactas que fitz fusiona en un solo span."""
    if is_table_token(text):
        return True
    words = text.strip().split()
    return len(words) >= 2 and all(is_table_token(w) for w in words)

def classify_row(row):
    """
    Clasifica una fila multi-columna:
      'truth_split'  → columna izquierda=texto descriptivo, columna derecha=tokens de tabla
      'full_table'   → tabla de ancho completo (columna izquierda también tiene tokens)
    """
    right = [ln for ln in row if ln["x0"] >= SPLIT_X]
    left  = [ln for ln in row if ln["x0"] <  SPLIT_X]

    if not right or not all(is_table_token(ln["text"]) for ln in right):
        return "full_table"

    # La columna derecha es toda tokens. Si la izquierda también lo es
    # (ej: tabla de 5 columnas que abarca todo el ancho), es full_table.
    if left and all(is_table_token(ln["text"]) for ln in left):
        return "full_table"

    return "truth_split"


# ─── Construcción de tabla Markdown ──────────────────────────────────────────

def expand_row(row):
    """Divide spans que fitz fusiona ('p p', 'V V', 'p ～p') en celdas individuales.
    Solo divide si CADA palabra del span es un TABLE_TOKEN; así 'p ˄ q' no se parte."""
    expanded = []
    for ln in row:
        words = ln["text"].strip().split()
        if len(words) >= 2 and all(is_table_token(w) for w in words):
            for w in words:
                expanded.append({**ln, "text": w})
        else:
            expanded.append(ln)
    return expanded


def build_md_table(table_rows):
    """Convierte lista de filas (cada fila = lista de líneas) a tabla Markdown."""
    if not table_rows:
        return ""
    header = [ln["text"] for ln in table_rows[0]]
    n = len(header)
    lines = []
    lines.append("| " + " | ".join(header) + " |")
    lines.append("| " + " | ".join(["---"] * n) + " |")
    for row in table_rows[1:]:
        cells = [ln["text"] for ln in row]
        while len(cells) < n:
            cells.append("")
        lines.append("| " + " | ".join(cells[:n]) + " |")
    return "\n".join(lines)


# ─── Procesamiento de página ──────────────────────────────────────────────────

def page_to_elements(page, base_size):
    """
    Devuelve lista de (y0, tipo, contenido) donde tipo es 'h1', 'h2', 'text' o 'table'.
    Maneja correctamente el layout de dos columnas (texto izq + tabla de verdad der).
    """
    lines = get_lines(page)
    rows  = group_into_rows(lines)

    result = []

    # Acumuladores para el patrón truth_split
    right_table_rows = []   # filas derecha (columnas de tabla de verdad)
    left_text_items  = []   # [(y0, texto)] del lado izquierdo

    def flush_truth(y_after=None):
        """Vuelca el acumulador de texto izquierdo + tabla de verdad derecha."""
        if left_text_items:
            combined = " ".join(t for _, t in left_text_items)
            y0 = left_text_items[0][0]
            result.append((y0, "text", combined))
            table_y0 = (left_text_items[-1][0] + 1) if right_table_rows else None
        else:
            table_y0 = right_table_rows[0][0]["y0"] if right_table_rows else None

        if len(right_table_rows) >= 2:
            md = build_md_table(right_table_rows)
            result.append((table_y0, "table", md))
        elif right_table_rows:
            # Solo 1 fila de tabla → emitir como texto
            text = " ".join(ln["text"] for ln in right_table_rows[0])
            result.append((right_table_rows[0][0]["y0"], "text", text))

        right_table_rows.clear()
        left_text_items.clear()

    i = 0
    while i < len(rows):
        row   = rows[i]
        spread = row_x_spread(row)

        # ── Fila de una sola columna (texto / heading) ────────────────────────
        # Excepción: si TODOS los spans son TABLE_TOKENs (o secuencias de tokens como "p p",
        # "V V"), tratarlo como tabla aunque el spread sea menor al umbral.
        all_tokens = len(row) >= 2 and all(is_multi_token_span(ln["text"]) for ln in row)
        if len(row) == 1 or (spread < TABLE_SPREAD_MIN and not all_tokens):
            text = " ".join(ln["text"] for ln in row)
            size = row[0]["size"]
            is_heading = (size >= base_size + 0.8) and not is_math_formula(text)

            # Si hay filas de tabla acumuladas, decidir si diferir o hacer flush
            # usando el y-gap respecto a la última fila de datos acumulada:
            #   gap ≤ 30px → descripción interna a la sección → diferir
            #   gap > 30px → inicio de nueva sección             → flush
            if right_table_rows and not is_heading and not is_math_formula(text):
                last_right_y = right_table_rows[-1][0]["y0"]
                y_gap = row[0]["y0"] - last_right_y
                if y_gap <= 30:
                    left_text_items.append((row[0]["y0"], text))
                    i += 1
                    continue

            flush_truth()
            if size >= base_size + 3.0 and not is_math_formula(text):
                kind = "h1"
            elif is_heading:
                kind = "h2"
            else:
                kind = "text"
            result.append((row[0]["y0"], kind, text))
            i += 1
            continue

        cls = classify_row(row)

        # ── truth_split: texto a la izquierda + tabla de verdad a la derecha ──
        if cls == "truth_split":
            left  = [ln for ln in row if ln["x0"] <  SPLIT_X]
            right = [ln for ln in row if ln["x0"] >= SPLIT_X]

            # Si cambia el número de columnas de la tabla, volver a empezar
            if right_table_rows and len(right) != len(right_table_rows[0]):
                flush_truth()

            if left:
                left_text_items.append((row[0]["y0"], " ".join(ln["text"] for ln in left)))
            if right:
                right_table_rows.append(right)

            i += 1
            continue

        # ── full_table: tabla de ancho completo (ej. tabla de conectivos) ────
        flush_truth()

        full_rows = [row]
        j = i + 1
        while j < len(rows):
            nxt = rows[j]
            nxt_right = [ln for ln in nxt if ln["x0"] >= SPLIT_X]
            if (row_x_spread(nxt) >= TABLE_SPREAD_MIN - 20
                    and rows_x_compatible(row, nxt)
                    and classify_row(nxt) == "full_table"):
                full_rows.append(nxt)
                j += 1
            else:
                break

        if len(full_rows) >= 2:
            expanded = [expand_row(r) for r in full_rows]
            md = build_md_table(expanded)
            result.append((row[0]["y0"], "table", md))
        else:
            text = " ".join(ln["text"] for ln in row)
            result.append((row[0]["y0"], "text", text))

        i = j

    flush_truth()
    result.sort(key=lambda e: e[0])
    return result


# ─── Fusión de líneas de texto continuas ─────────────────────────────────────

def merge_text_elements(elements):
    """
    Fusiona elementos 'text' consecutivos que son continuación del mismo párrafo
    (gap vertical < 20px).
    """
    if not elements:
        return []
    merged = [list(elements[0])]
    for y0, kind, content in elements[1:]:
        prev = merged[-1]
        prev_y0, prev_kind = prev[0], prev[1]
        if kind == "text" and prev_kind == "text" and 0 < (y0 - prev_y0) < 20:
            prev[2] = prev[2] + " " + content
        else:
            merged.append([y0, kind, content])
    return [tuple(e) for e in merged]


# ─── Corrección de cabeceras de tablas de verdad ─────────────────────────────

def fix_table_headers(elements):
    """
    Post-procesado: si el texto inmediatamente anterior a una tabla de verdad
    termina con TABLE_TOKENS, los extrae como cabecera real de la tabla.

    Ejemplo: "Negación: ～p (no p) p ～p" → tabla | V | F | / | F | V |
    Se convierte en:
      texto: "Negación: ～p (no p)"
      tabla: | p | ～p | / | V | F | / | F | V |
    """
    result = list(elements)

    for i in range(len(result)):
        if result[i] is None:
            continue
        y0, kind, content = result[i]
        if kind != "table":
            continue

        # Número de columnas de la tabla actual
        table_lines = content.split("\n")
        if len(table_lines) < 2:
            continue
        n_cols = len([c for c in table_lines[0].strip("|").split("|") if c.strip()])

        # Buscar hacia atrás (hasta 5 elementos) un texto que termine en TABLE_TOKENS
        for j in range(i - 1, max(i - 6, -1), -1):
            if j < 0 or result[j] is None:
                continue
            prev_y0, prev_kind, prev_content = result[j]
            if prev_kind != "text":
                continue
            words = prev_content.split()
            # Quick-exit: la ÚLTIMA PALABRA sola debe ser un TOKEN.
            # (No usamos N>1 aquí para evitar que textos como "...mediante (p ⇒ q) ˄ (q ⇒ p)"
            # pasen el filtro y provoquen un break prematuro antes de llegar al texto correcto.)
            if not words or not is_table_token(words[-1]):
                continue

            # Extraer exactamente n_cols TABLE_TOKENS del final,
            # verificando primero los tokens multi-palabra (más específicos)
            header_tokens = []
            temp = list(words)
            while temp and len(header_tokens) < n_cols:
                found = False
                for N in (7, 5, 3, 2, 1):
                    if len(temp) >= N and is_table_token(" ".join(temp[-N:])):
                        header_tokens.insert(0, " ".join(temp[-N:]))
                        temp = temp[:-N]
                        found = True
                        break
                if not found:
                    break

            if len(header_tokens) != n_cols:
                break  # No se pudo: detenerse (no seguir buscando más atrás)

            # Actualizar el texto previo (sin los tokens extraídos)
            new_text = " ".join(temp).strip()
            result[j] = (prev_y0, "text", new_text) if new_text else None

            # Reconstruir tabla: nueva cabecera + antigua cabecera como fila de datos
            new_hdr = "| " + " | ".join(header_tokens) + " |"
            new_sep = "| " + " | ".join(["---"] * n_cols) + " |"
            old_hdr_row = table_lines[0]   # era cabecera falsa → ahora primera fila
            old_data    = table_lines[2:]  # saltar el antiguo separador
            result[i] = (y0, "table", "\n".join([new_hdr, new_sep, old_hdr_row] + old_data))
            break

    return [r for r in result if r is not None]


# ─── Extracción de módulos ────────────────────────────────────────────────────

def extract_modules(doc, base_size):
    modules = []
    current = None

    for page in doc:
        raw_text = page.get_text("text")
        elements = page_to_elements(page, base_size)
        elements = merge_text_elements(elements)
        elements = fix_table_headers(elements)

        for y0, kind, content in elements:
            # Detectar inicio de nuevo módulo
            if MOD_RE.match(content) and kind in ("h1", "h2", "text"):
                if current:
                    modules.append(current)
                current = {
                    "title": content,
                    "raw":   raw_text + "\n",
                    "lines": [f"## {content}"],
                }
                continue

            if current is None:
                continue

            if kind == "h1":
                current["lines"].append(f"## {content}")
            elif kind == "h2":
                current["lines"].append(f"### {content}")
            elif kind == "table":
                current["lines"].append(content)
            else:  # text
                current["lines"].append(content)

        # Acumular texto crudo en páginas sin inicio de módulo nuevo
        if current and not any(
            MOD_RE.match(c) and k in ("h1", "h2", "text")
            for _, k, c in elements
        ):
            current["raw"] += raw_text + "\n"

    if current:
        modules.append(current)

    for mod in modules:
        # El primer elemento es siempre "## Modulo. X" (el título), lo excluimos del body
        # para que el body empiece directamente con el contenido (el título ya está en mod["title"])
        content_lines = mod["lines"][1:]
        mod["body"] = "\n\n".join(p for p in content_lines if p.strip())

    return modules


# ─── Supabase ─────────────────────────────────────────────────────────────────

def get_db_modules():
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/subjects",
        headers=HEADERS,
        params={"slug": "eq.logica-matematica", "select": "id"},
    )
    subs = r.json()
    if not subs:
        sys.exit("❌ No se encontró logica-matematica en Supabase")
    sid = subs[0]["id"]
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/modules",
        headers=HEADERS,
        params={
            "subject_id": f"eq.{sid}",
            "select":     "id,title,order_index",
            "order":      "order_index",
        },
    )
    return r.json()


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true",
                        help="Solo imprime, no sube a Supabase")
    parser.add_argument("--modulo", type=int, default=0,
                        help="Solo procesar este número de módulo (1-6)")
    parser.add_argument("--show-full", action="store_true",
                        help="Mostrar todo el body (sin el límite de 1200 chars)")
    args = parser.parse_args()

    print("=== seed_logica_columnas v3 — Layout multi-columna ===\n")

    doc       = fitz.open(PDF)
    base_size = get_base_size(doc)
    print(f"Fuente base: {base_size}pt\n")

    modules = extract_modules(doc, base_size)
    print(f"Módulos detectados: {len(modules)}\n")

    target = modules
    if args.modulo:
        idx = args.modulo - 1
        if 0 <= idx < len(modules):
            target = [modules[idx]]
        else:
            sys.exit(f"❌ Módulo {args.modulo} no existe")

    if args.dry_run:
        for mod in target:
            n = modules.index(mod) + 1
            print(f"{'─'*60}")
            print(f"MÓDULO {n}: {mod['title'][:80]}")
            print(f"{'─'*60}")
            body = mod["body"]
            if not args.show_full and len(body) > 1500:
                print(body[:1500] + "\n... [truncado] ...")
            else:
                print(body)
            print()
        return

    # Verificar paridad
    all_ok = True
    for mod in target:
        ok = verify_parity(mod["raw"], mod["body"], mod["title"])
        if not ok:
            all_ok = False

    if not all_ok:
        resp = input("\n⚠️  Diferencias de paridad. ¿Subir de todos modos? (s/N): ").strip().lower()
        if resp != "s":
            print("Cancelado.")
            return

    db_mods = get_db_modules()
    print(f"\nSubiendo {len(target)} módulo(s)...\n")
    for mod in target:
        idx = modules.index(mod)
        if idx >= len(db_mods):
            continue
        db = db_mods[idx]
        r = requests.patch(
            f"{SUPABASE_URL}/rest/v1/modules",
            headers={**HEADERS, "Prefer": "return=minimal"},
            params={"id": f"eq.{db['id']}"},
            json={"body": mod["body"]},
        )
        ok = r.status_code in (200, 201, 204)
        print(f"  {'✓' if ok else '❌'} Módulo {idx+1}: {db['title'][:45]} ({r.status_code})")

    print("\n✓ Listo. Corré: python -X utf8 scripts/seed_embeddings.py --subject logica-matematica")


if __name__ == "__main__":
    main()
