import fitz
import requests
import sys, io
from datetime import datetime, timezone

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

PDF_PATH = r"c:\Users\Noxi-PC\Desktop\resumenes.unlam\docs\Resumen de Historia Argentina 2026.pdf"
SUPABASE_URL = "https://dtbouycelkjgyddpftir.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Ym91eWNlbGtqZ3lkZHBmdGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg4MTkwOSwiZXhwIjoyMDk0NDU3OTA5fQ.JKJygGS7S5vfa8Pw5HhnsbcH5OHS2gJ6Qjud4-fgEPg"

MODULES = [
    {"id": "5c7f9bee-bedd-4394-8cf2-dc5868beffe7", "start": 1,  "end": 5,  "name": "Módulo 1"},
    {"id": "835bb16b-30b7-48d9-910d-a0b8ff774d72", "start": 6,  "end": 12, "name": "Módulo 2"},
    {"id": "ce360e34-672d-4fae-b238-6d2c5aa6069b", "start": 13, "end": 19, "name": "Módulo 3"},
    {"id": "d2ff129e-56fe-40d2-88a2-300f06b138fe", "start": 20, "end": 47, "name": "Módulo 4"},
    {"id": "b05322ce-fb73-4226-bae8-f7a1677962c8", "start": 48, "end": 60, "name": "Módulo 5"},
    {"id": "449205c2-a153-483a-b2b3-935be65555db", "start": 61, "end": 69, "name": "Módulo 6"},
    {"id": "da8eb683-dfca-48ed-b48e-a091ae8f5473", "start": 70, "end": 85, "name": "Módulo 7"},
    {"id": "b40fceaf-4331-437b-8ea2-57d45f0168d9", "start": 86, "end": 88, "name": "Módulo 8"},
]

WATERMARK = '@RESUMENES.UNLAM'


# ── Paridad ───────────────────────────────────────────────────────────────────

def count_content_words(text):
    """
    Cuenta palabras omitiendo:
    - Números de página solos (dígitos ≤3 chars)
    - Watermark @RESUMENES.UNLAM
    - Pipes y separadores de tablas markdown (| --- | --- |)
    """
    words = []
    for line in text.split('\n'):
        s = line.strip()
        if not s:
            continue
        if s.isdigit() and len(s) <= 3:
            continue
        if WATERMARK in s or WATERMARK.lower() in s.lower():
            continue
        # Líneas de tabla markdown: strip pipes y saltar separadores
        if s.startswith('|'):
            s = s.replace('|', ' ').strip()
            if not s or all(c in '- ' for c in s):
                continue
        words.extend(s.split())
    return len(words)


def verify_parity(raw_pages_text, extracted_body, module_name):
    """
    Verifica que el texto extraído tenga las mismas palabras que el PDF fuente.
    Aborta si hay diferencia — nunca subir contenido incompleto.
    """
    raw_count = count_content_words(raw_pages_text)
    clean_body = extracted_body.replace('## ', '').replace('### ', '')
    ext_count = count_content_words(clean_body)
    if raw_count != ext_count:
        print(f"  PARIDAD FALLIDA en {module_name}: PDF={raw_count} palabras, extraido={ext_count} palabras")
        return False
    print(f"  Paridad OK: {raw_count} palabras")
    return True


# ── Headings ──────────────────────────────────────────────────────────────────

def build_size_map(page):
    """
    {texto_de_línea: tamaño_de_fuente_máximo} via get_text("dict").
    Solo para detectar headings — nunca para filtrar contenido.
    """
    size_map = {}
    for block in page.get_text("dict")["blocks"]:
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            spans = line.get("spans", [])
            if not spans:
                continue
            text = ''.join(s["text"] for s in spans).strip()
            if text:
                size_map[text] = max(s["size"] for s in spans)
    return size_map


# ── Tablas ────────────────────────────────────────────────────────────────────

def bbox_in_table(block_bbox, table_bboxes):
    """True si el bloque se solapa en X e Y con alguna tabla (chequeo de 4 coordenadas)."""
    bx0, by0, bx1, by1 = block_bbox
    for tx0, ty0, tx1, ty1 in table_bboxes:
        if (min(bx1, tx1) - max(bx0, tx0) > 0
                and min(by1, ty1) - max(by0, ty0) > 0):
            return True
    return False


def fmt_table_clean(table, fallback_headers=None):
    """
    Convierte una tabla PyMuPDF a markdown con paridad absoluta.

    Maneja:
    - Celdas horizontalmente mergeadas (representadas como None en columnas adyacentes)
    - Filas de continuación (primera columna lógica vacía → se une a la fila anterior)
    - Tablas de continuación (sin fila de encabezado propia — página siguiente del mismo cuadro)

    Algoritmo de territorios:
    Para N columnas lógicas en posiciones [p0, p1, ..., pN-1] (del encabezado),
    el "territorio" de la columna k es el rango de índices raw que le pertenece:
        start_k = 0                            si k == 0
                  (p[k-1] + p[k]) // 2 + 1    si k > 0
        end_k   = total_cols                   si k == N-1
                  (p[k] + p[k+1]) // 2 + 1    si k < N-1
    Se toma el primer valor no-vacío dentro del territorio para cada celda.

    fallback_headers: lista de strings a usar como encabezado cuando la tabla no tiene
    encabezado propio (tabla de continuación de una página anterior).
    """
    rows = table.extract()
    if not rows:
        return ''

    def non_empty(row):
        return sum(1 for c in row if c and str(c).strip())

    # Fila de encabezado: primera fila con el máximo de celdas no-vacías
    max_count = max(non_empty(r) for r in rows)
    if max_count < 1:
        return ''
    header_idx = next(i for i, r in enumerate(rows) if non_empty(r) == max_count)

    header_row = rows[header_idx]
    total_cols = len(header_row)

    header_positions = [(i, str(c).strip().replace('\n', ' ')) for i, c in enumerate(header_row)
                        if c and str(c).strip()]
    if not header_positions:
        return ''

    col_positions = [p for p, _ in header_positions]
    col_headers_detected = [h for _, h in header_positions]
    n = len(col_positions)

    def get_territory(k):
        start = 0 if k == 0 else (col_positions[k-1] + col_positions[k]) // 2 + 1
        end   = total_cols if k == n - 1 else (col_positions[k] + col_positions[k+1]) // 2 + 1
        return start, end

    territories = [get_territory(k) for k in range(n)]

    def get_cell_text(row, k):
        start, end = territories[k]
        for j in range(start, min(end, len(row))):
            if row[j] is not None and str(row[j]).strip():
                return str(row[j]).strip().replace('\n', ' ')
        return ''

    def _is_label_row(values):
        """True si los valores parecen etiquetas de columna (no datos).
        Una fila de datos suele empezar con dígito (ej: '2. La Independencia', '1800-1870')."""
        return not any(v and v[0].isdigit() for v in values)

    # Determinar si la fila detectada es un encabezado real (labels) o datos
    is_real_header = (header_idx > 0) and _is_label_row(col_headers_detected)

    if is_real_header:
        # Encabezado genuino con etiquetas de texto
        col_headers = col_headers_detected
        data_start  = header_idx + 1
    else:
        # La "fila de encabezado" es en realidad un dato (tabla de continuación).
        # Usar celdas vacías como encabezado: no agrega palabras extra al conteo de paridad
        # (las palabras de la columna real ya fueron contadas en la página del encabezado original).
        col_headers = [''] * n
        data_start = 0  # procesar TODOS los rows desde el inicio (incluye el "header" como dato)

    logical_rows = []
    for row in rows[data_start:]:
        values = [get_cell_text(row, k) for k in range(n)]
        if not any(values):
            continue
        # Fila de continuación: primera columna vacía → agregar al último row lógico
        if not values[0] and logical_rows:
            for k in range(n):
                if values[k]:
                    if logical_rows[-1][k]:
                        logical_rows[-1][k] += ' ' + values[k]
                    else:
                        logical_rows[-1][k] = values[k]
        else:
            logical_rows.append(values[:])

    if not logical_rows:
        return ''

    lines = [
        '| ' + ' | '.join(col_headers) + ' |',
        '| ' + ' | '.join(['---'] * n) + ' |',
    ]
    for row in logical_rows:
        lines.append('| ' + ' | '.join(row) + ' |')
    return '\n'.join(lines)


# ── Extracción por página ─────────────────────────────────────────────────────

def extract_page(page, prev_table_headers=None):
    """
    Extrae TODO el texto de la página con paridad absoluta respecto al PDF.

    - Páginas sin tablas: get_text("text") como fuente de verdad (original).
    - Páginas con tablas:
        · Texto fuera de tablas: get_text("dict") por bloques (con bbox para skip de tablas).
        · Tablas: fmt_table_clean() → markdown.
        · Todo ordenado por posición Y para mantener el orden de lectura.
    - Se omiten únicamente: números de página solos y watermark @RESUMENES.UNLAM.

    Retorna (texto, last_table_headers) para propagar encabezados a páginas de continuación.
    """
    tables = page.find_tables()

    def _has_multi_cell_row(t):
        """True si al menos una fila tiene ≥2 celdas con contenido (cuadro real).
        False = texto wrapeado mal detectado como tabla (1 celda útil por fila)."""
        rows = t.extract()
        if not rows:
            return False
        return any(sum(1 for c in row if c and str(c).strip()) >= 2 for row in rows)

    # Filtrar tablas falsas (texto wrapeado, listas de bullets) — solo conservar cuadros reales
    table_list = [t for t in tables if _has_multi_cell_row(t)]

    if not table_list:
        # Sin tablas reales — método original, paridad garantizada por get_text("text")
        size_map = build_size_map(page)
        result = []
        for raw_line in page.get_text("text").split('\n'):
            stripped = raw_line.strip()
            if stripped.isdigit() and len(stripped) <= 3:
                continue
            if WATERMARK in stripped or WATERMARK.lower() in stripped.lower():
                continue
            size = size_map.get(stripped, 11.0)
            if size >= 15:
                result.append(f'## {stripped}' if stripped else '')
            elif size >= 12:
                result.append(f'### {stripped}' if stripped else '')
            else:
                result.append(raw_line)
        return '\n'.join(result), prev_table_headers

    # Con tablas — intercalar bloques de texto + markdown de tablas por posición Y
    table_bboxes = [t.bbox for t in table_list]
    parts = []  # lista de (y_top, text)
    last_headers = prev_table_headers

    # Bloques de texto que NO están dentro de ninguna tabla
    for block in page.get_text("dict")["blocks"]:
        if block.get("type") != 0:
            continue
        bbox = block["bbox"]
        if bbox_in_table(bbox, table_bboxes):
            continue
        block_lines = []
        for line in block.get("lines", []):
            spans = line.get("spans", [])
            if not spans:
                continue
            text = ''.join(s["text"] for s in spans)
            stripped = text.strip()
            if stripped.isdigit() and len(stripped) <= 3:
                continue
            if WATERMARK in stripped or WATERMARK.lower() in stripped.lower():
                continue
            size = max((s["size"] for s in spans), default=11.0)
            if size >= 15:
                block_lines.append(f'## {stripped}' if stripped else '')
            elif size >= 12:
                block_lines.append(f'### {stripped}' if stripped else '')
            else:
                block_lines.append(text)
        if block_lines:
            parts.append((bbox[1], '\n'.join(block_lines)))

    # Tablas formateadas como markdown
    for t in table_list:
        md = fmt_table_clean(t, fallback_headers=last_headers)
        if md:
            parts.append((t.bbox[1], md))
        # Propagar encabezados reales a páginas de continuación
        t_rows = t.extract()
        if t_rows:
            def _ne(r): return sum(1 for c in r if c and str(c).strip())
            mc = max(_ne(r) for r in t_rows)
            hi = next(i for i, r in enumerate(t_rows) if _ne(r) == mc)
            if hi > 0:  # encabezado real detectado
                last_headers = [str(c).strip().replace('\n', ' ')
                                 for c in t_rows[hi] if c and str(c).strip()]

    # Ordenar por posición Y para mantener el orden de lectura
    parts.sort(key=lambda x: x[0])
    return '\n\n'.join(text for _, text in parts), last_headers


# ── Fusión de tablas multi-página ────────────────────────────────────────────

def _is_empty_table_header(line):
    """True si la línea es un encabezado vacío: | | | | (solo pipes y espacios)."""
    s = line.strip()
    if not s.startswith('|'):
        return False
    return not s.replace('|', '').strip()

def _is_table_separator(line):
    """True si la línea es el separador de tabla markdown: | --- | --- | --- |"""
    s = line.strip()
    if not s.startswith('|'):
        return False
    return not s.replace('|', '').replace('-', '').replace(' ', '')

def merge_continuation_tables(pages_content):
    """
    Fusiona tablas de continuación (páginas que empiezan con encabezado vacío + separador)
    con la tabla final de la página anterior.

    Resultado: una única tabla markdown continua en lugar de cuadros separados por cada
    página del PDF, eliminando los separadores visuales en la plataforma.
    """
    result = []
    for page_text in pages_content:
        if not result:
            result.append(page_text)
            continue

        lines = page_text.split('\n')
        non_blank = [(i, lines[i]) for i in range(len(lines)) if lines[i].strip()]

        if len(non_blank) < 2:
            result.append(page_text)
            continue

        first_idx,  first_line  = non_blank[0]
        second_idx, second_line = non_blank[1]

        # ¿Empieza con tabla de continuación? (encabezado vacío + separador)
        if not (_is_empty_table_header(first_line) and _is_table_separator(second_line)):
            result.append(page_text)
            continue

        # ¿La página anterior termina con una fila de tabla?
        prev_non_blank = [l for l in result[-1].split('\n') if l.strip()]
        if not prev_non_blank or not prev_non_blank[-1].strip().startswith('|'):
            result.append(page_text)
            continue

        # Fusionar: quitar encabezado vacío + separador y unir filas de datos
        skip = {first_idx, second_idx}
        remaining_lines = [l for i, l in enumerate(lines) if i not in skip]
        # Eliminar líneas en blanco o solo-espacios al inicio (romperían la tabla markdown)
        while remaining_lines and not remaining_lines[0].strip():
            remaining_lines.pop(0)
        remaining = '\n'.join(remaining_lines)
        if remaining.strip():
            result[-1] = result[-1].rstrip() + '\n' + remaining

    return result


# ── Main ──────────────────────────────────────────────────────────────────────

headers = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
}

doc = fitz.open(PDF_PATH)

for mod in MODULES:
    pages_content = []
    raw_pages_text = []
    last_table_headers = None  # reset por módulo — no contaminar entre materias
    for i in range(mod['start'], mod['end'] + 1):
        try:
            raw = doc[i].get_text("text")
            raw_pages_text.append(raw)
            page_text, last_table_headers = extract_page(doc[i], prev_table_headers=last_table_headers)
            if page_text.strip():
                pages_content.append(page_text)
        except Exception as e:
            print(f"  Error en pag {i+1}: {e}")

    body = '\n\n'.join(merge_continuation_tables(pages_content))
    print(f"{mod['name']}: {len(body)} chars")
    print(f"  Preview: {body[:200]}")

    if not verify_parity('\n'.join(raw_pages_text), body, mod['name']):
        print(f"  ABORTANDO subida de {mod['name']} — corregir extraccion primero")
        print()
        continue

    resp = requests.patch(
        f'{SUPABASE_URL}/rest/v1/modules?id=eq.{mod["id"]}',
        headers=headers,
        json={'body': body, 'updated_at': datetime.now(timezone.utc).isoformat()},
    )
    if resp.status_code in [200, 204]:
        print(f"  SUCCESS en Supabase")
    else:
        print(f"  ERROR {resp.status_code}: {resp.text}")
    print()

doc.close()
