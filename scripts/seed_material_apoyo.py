#!/usr/bin/env python3
"""
seed_material_apoyo.py — Sube cualquier material de apoyo a content_items en Supabase.

Reemplaza: upload_seminario_guia.py, upload_seminario_examen.py,
           upload_contabilidad_resumen.py, seed_filosofia_material.py, etc.

Uso:
    python scripts/seed_material_apoyo.py \\
        --pdf docs/Guia.pdf \\
        --subject-slug seminario \\
        --type guide \\
        --title "Guía de Estudio"

    python scripts/seed_material_apoyo.py \\
        --pdf docs/Examen.pdf \\
        --subject-slug seminario \\
        --type exam_model \\
        --title "Modelo de Examen 2026" \\
        --order-index 2

Tipos válidos: guide | exam_model | summary | timeline | practice
"""

import fitz
import requests
import sys, io, re, os, argparse
from datetime import datetime, timezone

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Cargar .env.local
_ENV_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.local')
if os.path.exists(_ENV_FILE):
    with open(_ENV_FILE, encoding='utf-8') as _ef:
        for _line in _ef:
            _line = _line.strip()
            if _line and not _line.startswith('#') and '=' in _line:
                _k, _, _v = _line.partition('=')
                if _k.strip() not in os.environ:
                    os.environ[_k.strip()] = _v.strip().strip('"').strip("'")

SUPABASE_URL = "https://dtbouycelkjgyddpftir.supabase.co"
SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Ym91eWNlbGtqZ3lkZHBmdGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg4MTkwOSwiZXhwIjoyMDk0NDU3OTA5fQ.JKJygGS7S5vfa8Pw5HhnsbcH5OHS2gJ6Qjud4-fgEPg"
WATERMARK    = '@RESUMENES.UNLAM'

HTTP_HEADERS = {
    'apikey':        SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type':  'application/json',
}

# Chars de bullet unicode → prefijo markdown
_BULLET_MAP = {'●': '- ', '○': '  - ', '■': '    - ', '•': '- ', '▪': '    - '}
_BULLET_STANDALONE = set(_BULLET_MAP.keys())


# ── Font maps ─────────────────────────────────────────────────────────────────

def _is_bold(span):
    return 'Bold' in span.get('font', '') or bool(span.get('flags', 0) & 16)


def build_size_map(page):
    """Mapea texto de línea → tamaño de fuente máximo."""
    size_map = {}
    for block in page.get_text('dict')['blocks']:
        if block.get('type') != 0:
            continue
        for line in block.get('lines', []):
            spans = line.get('spans', [])
            if not spans:
                continue
            text = ''.join(s['text'] for s in spans).strip()
            size = max((s['size'] for s in spans), default=11.0)
            if text:
                size_map[text] = size
    return size_map


def build_bold_map(page):
    """Mapea texto plano de línea → texto con negritas markdown inline."""
    bold_map = {}
    for block in page.get_text('dict')['blocks']:
        if block.get('type') != 0:
            continue
        for line in block.get('lines', []):
            spans = line.get('spans', [])
            if not spans:
                continue
            plain = ''.join(sp.get('text', '') for sp in spans).strip()
            if not plain:
                continue
            has_bold = any(_is_bold(sp) for sp in spans if sp.get('text', '').strip())
            if not has_bold:
                continue
            parts = []
            for sp in spans:
                t = sp.get('text', '')
                if not t:
                    continue
                if _is_bold(sp) and t.strip():
                    s  = t.strip()
                    lp = t[:len(t) - len(t.lstrip())]
                    tp = t[len(t.rstrip()):]
                    parts.append(f'{lp}**{s}**{tp}')
                else:
                    parts.append(t)
            bold_map[plain] = ''.join(parts).strip()
    return bold_map


# ── Extracción ────────────────────────────────────────────────────────────────

def _preprocess_bullets(text):
    """Separa bullets unicode embebidos en párrafos en su propia línea."""
    for ch in _BULLET_STANDALONE:
        text = re.sub(re.escape(ch), f'\n{ch}\n', text)
    return text


def extract(doc, cover_parts):
    """
    Extrae el texto completo del PDF como un único body markdown.
    - Detecta headings por tamaño de fuente (≥14pt → ##, ≥12.5pt → ###)
    - Convierte bullets unicode (●○■•▪) a markdown
    - Preserva negritas inline del PDF
    - Omite watermark, portada y números de página
    """
    raw_text_all = ''
    lines_out    = []

    for page_num in range(len(doc)):
        page     = doc[page_num]
        raw_text = page.get_text('text')
        raw_text_all += raw_text

        if page_num == 0:
            continue  # portada: solo acumular raw_text para paridad

        size_map = build_size_map(page)
        bold_map = build_bold_map(page)

        processed = _preprocess_bullets(raw_text)
        raw_lines = processed.split('\n')

        i = 0
        while i < len(raw_lines):
            line = raw_lines[i]
            s    = line.strip()

            if not s:
                lines_out.append('')
                i += 1
                continue

            if s.isdigit() and len(s) <= 3:
                i += 1
                continue

            if WATERMARK in s or s in cover_parts:
                i += 1
                continue

            # Bullet unicode standalone (tras preprocess)
            if s in _BULLET_STANDALONE:
                prefix = _BULLET_MAP[s]
                j = i + 1
                while j < len(raw_lines) and not raw_lines[j].strip():
                    j += 1
                if j < len(raw_lines):
                    content_plain = raw_lines[j].strip()
                    content       = bold_map.get(content_plain, content_plain)
                    if prefix == '- ' and lines_out and lines_out[-1] not in ('', '\n'):
                        lines_out.append('')
                    lines_out.append(prefix + content)
                    i = j + 1
                else:
                    i += 1
                continue

            # Heading / subheading por tamaño de fuente
            size = size_map.get(s, 11.0)
            if size >= 14.0:
                if lines_out and lines_out[-1] != '':
                    lines_out.append('')
                lines_out.append(f'## {s}')
                i += 1
                continue

            if size >= 12.5:
                lines_out.append(f'### {s}')
                i += 1
                continue

            # Contenido regular — preservar negritas inline si existen
            lines_out.append(bold_map.get(s, line))
            i += 1

    return raw_text_all, lines_out


# ── Paridad ───────────────────────────────────────────────────────────────────

def _strip_markers(text):
    lines = []
    for line in text.split('\n'):
        s = line.strip()
        if s.startswith('## '):     lines.append(s[3:])
        elif s.startswith('### '):  lines.append(s[4:])
        elif s.startswith('- '):    lines.append(s[2:])
        elif s.startswith('  - '): lines.append(s[4:])
        elif s.startswith('    - '): lines.append(s[6:])
        else:                        lines.append(s)
    return '\n'.join(lines)


def count_content_words(text, cover_parts):
    words = []
    for line in text.split('\n'):
        s = line.strip()
        if not s: continue
        if s.isdigit() and len(s) <= 3: continue
        if WATERMARK in s: continue
        if s in cover_parts: continue
        if s in _BULLET_STANDALONE: continue
        if s == 'o': continue  # ○ extraído como 'o' en algunos PDFs
        for token in s.split():
            if token not in _BULLET_STANDALONE:
                words.append(token)
    return len(words)


# ── Auditoría genérica ────────────────────────────────────────────────────────

def audit_body(body):
    """
    Chequeos estructurales genéricos aplicables a cualquier material de apoyo.
    No hace validaciones específicas de materia.
    """
    issues = []
    lines  = body.split('\n')

    # 1. Sin bullets unicode embebidos mezclados con texto
    for i, line in enumerate(lines, 1):
        for ch in _BULLET_STANDALONE:
            if ch in line and len(line.strip()) > 2:
                issues.append(f"Línea {i}: bullet '{ch}' embebido → '{line.strip()[:80]}'")

    # 2. Sin líneas demasiado largas (posible fusión de secciones)
    for i, line in enumerate(lines, 1):
        if len(line.strip()) > 600:
            issues.append(
                f"Línea {i} demasiado larga ({len(line)} chars): '{line.strip()[:100]}...'"
            )

    # 3. Sin encabezados ## consecutivos sin contenido entre ellos
    for i in range(len(lines) - 1):
        if lines[i].startswith('## ') and lines[i + 1].startswith('## '):
            issues.append(
                f"Dos ## consecutivos:\n"
                f"  [{i+1}] {lines[i].strip()}\n"
                f"  [{i+2}] {lines[i+1].strip()}"
            )

    return len(issues) == 0, issues


# ── Supabase ──────────────────────────────────────────────────────────────────

def resolve_subject_id(slug):
    resp = requests.get(
        f'{SUPABASE_URL}/rest/v1/subjects?slug=eq.{slug}&select=id,name',
        headers=HTTP_HEADERS,
    )
    if resp.status_code != 200:
        print(f"ERROR: No se pudo consultar Supabase ({resp.status_code}): {resp.text[:100]}")
        sys.exit(1)
    rows = resp.json()
    if not rows:
        print(f"ERROR: No se encontró ningún subject con slug='{slug}'.")
        all_resp = requests.get(
            f'{SUPABASE_URL}/rest/v1/subjects?select=name,slug&order=name',
            headers=HTTP_HEADERS,
        )
        if all_resp.status_code == 200:
            for s in all_resp.json():
                print(f"  {s['slug']:<30} {s['name']}")
        sys.exit(1)
    print(f"Subject: {rows[0]['name']} → {rows[0]['id']}")
    return rows[0]['id']


def find_existing_item(subject_id, content_type):
    """Busca un content_item existente por (subject_id, type)."""
    resp = requests.get(
        f'{SUPABASE_URL}/rest/v1/content_items'
        f'?subject_id=eq.{subject_id}&type=eq.{content_type}&select=id,title',
        headers=HTTP_HEADERS,
    )
    if resp.status_code == 200 and resp.json():
        return resp.json()[0]
    return None


def upsert_content_item(subject_id, content_type, title, body, order_index):
    now      = datetime.now(timezone.utc).isoformat()
    existing = find_existing_item(subject_id, content_type)

    if existing:
        print(f"Actualizando content_item existente: '{existing['title']}' ({existing['id']})")
        resp = requests.patch(
            f'{SUPABASE_URL}/rest/v1/content_items?id=eq.{existing["id"]}',
            headers={**HTTP_HEADERS, 'Prefer': 'return=representation'},
            json={'body': body, 'title': title, 'updated_at': now},
        )
    else:
        print(f"Creando nuevo content_item: '{title}'")
        resp = requests.post(
            f'{SUPABASE_URL}/rest/v1/content_items',
            headers={**HTTP_HEADERS, 'Prefer': 'return=representation'},
            json={
                'subject_id':   subject_id,
                'type':         content_type,
                'title':        title,
                'body':         body,
                'order_index':  order_index,
                'is_published': True,
                'created_at':   now,
                'updated_at':   now,
            },
        )

    if resp.status_code in (200, 201):
        row = resp.json()
        item_id = (row[0]['id'] if isinstance(row, list) else row.get('id')) or '?'
        action = 'actualizado' if existing else 'creado'
        print(f"  ✓ content_item {action} — id: {item_id}")
    else:
        print(f"  ✗ Error {resp.status_code}: {resp.text[:200]}")
        sys.exit(1)


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description='Sube material de apoyo (guías, exámenes, resúmenes) a Supabase.'
    )
    parser.add_argument('--pdf',           required=True,  help='Ruta al PDF fuente')
    parser.add_argument('--subject-slug',  required=True,  help='Slug de la materia (ej: seminario)')
    parser.add_argument('--type',          required=True,
                        choices=['guide', 'exam_model', 'summary', 'timeline', 'practice'],
                        help='Tipo de content_item')
    parser.add_argument('--title',         required=True,  help='Título del item')
    parser.add_argument('--order-index',   type=int, default=1,
                        help='Orden dentro de la materia (default: 1)')
    parser.add_argument('--skip-cover',    action='store_true',
                        help='No filtrar texto de la página 0 como portada')
    parser.add_argument('--skip-audit',    action='store_true',
                        help='Omitir la auditoría estructural')
    args = parser.parse_args()

    subject_id = resolve_subject_id(args.subject_slug)

    doc = fitz.open(args.pdf)
    print(f"PDF: {len(doc)} páginas")

    # Portada: líneas de la página 0 que se excluyen del cuerpo
    cover_parts = set()
    if not args.skip_cover and len(doc) > 0:
        for line in doc[0].get_text('text').split('\n'):
            s = line.strip()
            if s and not s.isdigit():
                cover_parts.add(s)
        print(f"Portada ignorada: {list(cover_parts)[:4]}{'...' if len(cover_parts) > 4 else ''}")

    # Extracción
    page_count = len(doc)
    raw_text_all, lines_out = extract(doc, cover_parts)
    doc.close()

    body = '\n'.join(lines_out)
    body = re.sub(r'\n{3,}', '\n\n', body).strip()

    print(f"\nChars extraídos: {len(body):,}")

    # Paridad
    raw_count = count_content_words(raw_text_all, cover_parts)
    ext_count = count_content_words(_strip_markers(body), cover_parts)
    diff      = ext_count - raw_count
    print(f"Palabras PDF:    {raw_count}")
    print(f"Palabras body:   {ext_count}")

    tolerance = max(10, page_count)
    if abs(diff) > tolerance:
        print(f"  ❌ PARIDAD FALLIDA: diferencia = {diff:+d} palabras")
        print("\nPreview body:")
        print(body[:800])
        sys.exit(1)
    print(f"  ✓ Paridad OK" + (f" (delta: {diff:+d})" if diff != 0 else ''))

    # Auditoría
    if not args.skip_audit:
        print("\nAuditoría de estructura...")
        ok, issues = audit_body(body)
        for issue in issues:
            print(f"  ⚠  {issue}")
        if not ok:
            print(f"\n  ❌ AUDITORÍA FALLIDA ({len(issues)} problema(s)). No se sube a Supabase.")
            sys.exit(1)
        print("  ✓ Auditoría OK")

    # Preview
    print("\nPreview:")
    print(body[:500])

    # Supabase
    print()
    upsert_content_item(subject_id, args.type, args.title, body, args.order_index)


if __name__ == '__main__':
    main()
