#!/usr/bin/env python3
"""
fix_all_modulos.py — Re-extrae cualquier materia y hace PATCH de los módulos
existentes en Supabase, preservando los module_id (y por ende los quiz_questions
vinculados via FK CASCADE).

Uso:
    python scripts/fix_all_modulos.py --pdf docs/X/Resumen.pdf --subject-slug X

Comportamiento:
  - Módulos existentes (mismo order_index) → UPDATE body + title
  - Módulos nuevos (order_index no existe) → INSERT
  - Módulos que desaparecen del PDF → quedan en Supabase sin modificar (safe)
"""

import sys, io, os, re, fitz, requests, argparse
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from datetime import datetime, timezone

# ── Cargar .env.local ─────────────────────────────────────────────────────────
_ENV_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.local')
if os.path.exists(_ENV_FILE):
    with open(_ENV_FILE, encoding='utf-8') as _ef:
        for _line in _ef:
            _line = _line.strip()
            if _line and not _line.startswith('#') and '=' in _line:
                _k, _, _v = _line.partition('=')
                if _k.strip() not in os.environ:
                    os.environ[_k.strip()] = _v.strip().strip('"').strip("'")

# ── Import seed_modulos como módulo (sin disparar su main) ────────────────────
_SCRIPTS = os.path.dirname(__file__)
sys.path.insert(0, _SCRIPTS)
import importlib.util as _ilu
_spec = _ilu.spec_from_file_location('seed_modulos', os.path.join(_SCRIPTS, 'seed_modulos.py'))
seed  = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(seed)

SUPABASE_URL = seed.SUPABASE_URL
SERVICE_KEY  = seed.SERVICE_KEY
HTTP_HEADERS = seed.HTTP_HEADERS


def main():
    parser = argparse.ArgumentParser(description='Parchea módulos de una materia en Supabase.')
    parser.add_argument('--pdf',           required=True, help='Ruta al PDF fuente')
    parser.add_argument('--subject-slug',  required=True, help='Slug del subject (ej: filosofia)')
    args = parser.parse_args()

    pdf_path = os.path.abspath(args.pdf)
    if not os.path.exists(pdf_path):
        print(f'ERROR: no existe el PDF: {pdf_path}')
        sys.exit(1)

    # ── Resolver subject_id ───────────────────────────────────────────────────
    subject_id = seed._resolve_subject_id(args.subject_slug)

    # ── Módulos existentes {order_index: module_id} ───────────────────────────
    resp = requests.get(
        f'{SUPABASE_URL}/rest/v1/modules'
        f'?subject_id=eq.{subject_id}&select=id,order_index&order=order_index',
        headers=HTTP_HEADERS,
    )
    if resp.status_code != 200:
        print(f'ERROR al leer módulos existentes: {resp.status_code} {resp.text[:100]}')
        sys.exit(1)
    existing = {r['order_index']: r['id'] for r in resp.json()}
    print(f'Módulos en Supabase: {sorted(existing.keys())}')

    # ── Extraer PDF ───────────────────────────────────────────────────────────
    doc = fitz.open(pdf_path)
    n_pages = len(doc)
    print(f'\nPDF: {n_pages} páginas  |  {args.subject_slug}')

    print('\nDetectando formato…')
    cfg = seed.detect_config(doc)
    print(f'  Patrón módulo : {cfg["module_heading_re"]}  ({cfg["heading_count"]} encontrados)')
    print(f'  Título multilinea: {"Sí" if cfg["module_heading_multiline"] else "No"}')
    print(f'  Subheadings   : {cfg["subheading_mode"]}')
    if cfg['subheading_mode'] == 'size':
        print(f'    size range  : {cfg["size_h3_min"]}–{cfg["size_h3_max"]} pt')

    raw_text_all, lines_out = seed.extract(doc, cfg)
    lines_out = seed.fix_word_breaks(lines_out)
    body = '\n'.join(lines_out)
    body = re.sub(r'\n{3,}', '\n\n', body).strip()
    body = seed.fix_embedded_lists(body)

    # ── Paridad ───────────────────────────────────────────────────────────────
    raw_clean = seed.dedup_raw_chars(seed.clean_artifacts(raw_text_all))
    raw_count = seed.count_content_chars(raw_clean,                  cfg['cover_parts'])
    ext_count = seed.count_content_chars(seed._body_text_only(body), cfg['cover_parts'])
    tolerance = max(20, n_pages // 5)
    diff      = ext_count - raw_count
    print(f'\nParidad: PDF={raw_count}  extraído={ext_count}  diff={diff:+d}  límite=±{tolerance}')
    if abs(diff) > tolerance:
        print('  ❌ PARIDAD FALLIDA — abortando.')
        print('\nPreview body (800 chars):')
        print(body[:800])
        sys.exit(1)
    print(f'  ✓ Paridad OK{f" (artefacto: {diff:+d})" if diff != 0 else ""}')

    # ── Imágenes ──────────────────────────────────────────────────────────────
    n_imgs = len(re.findall(r'__IMG_\d+__', body))
    slug_for_storage = re.sub(r'[^a-z0-9]+', '-', subject_id.lower())
    if n_imgs > 0:
        print(f'\nProcesando {n_imgs} imagen(es)…')
        xref_to_url, xref_to_text = seed._upload_images(doc, body, slug_for_storage)
        # Reutilizar URLs existentes en Storage para imágenes sin procesar
        for xref in [int(m) for m in re.findall(r'__IMG_(\d+)__', body)]:
            if xref not in xref_to_url and xref not in xref_to_text:
                for ext in ('png', 'jpg', 'jpeg'):
                    candidate = (f'{SUPABASE_URL}/storage/v1/object/public/'
                                 f'module-images/{slug_for_storage}/{xref}.{ext}')
                    r = requests.head(candidate, headers=HTTP_HEADERS)
                    if r.status_code == 200:
                        xref_to_url[xref] = candidate
                        print(f'  📎 xref {xref}: URL existente en Storage reutilizada')
                        break
        body = seed._replace_img_markers(body, xref_to_url, xref_to_text)
    doc.close()

    # ── Post-procesado ────────────────────────────────────────────────────────
    body = re.sub(r'\*\*(?=\s*:)', '', body)
    body = seed.fix_double_chars(body)
    body = seed.split_inline_definitions(body)
    body = seed.mark_definition_terms(body)
    body = re.sub(r'\n{3,}', '\n\n', body)

    # ── Dividir en módulos ────────────────────────────────────────────────────
    _module_re    = re.compile(cfg['module_heading_re'])
    _module_split = re.compile(r'\n(?=## (?:' + cfg['module_heading_re'].lstrip('^') + r'))')

    parts   = _module_split.split(body)
    modules = []
    for part in parts:
        part = part.strip()
        if not part or not part.startswith('## '):
            continue
        heading_text = re.sub(r'\s+', ' ', part.split('\n')[0][3:].strip())
        if not _module_re.match(heading_text):
            continue
        content  = '\n'.join(part.split('\n')[1:]).strip()
        m        = re.search(cfg['module_number_re'], heading_text)
        order    = int(m.group(1)) if m else len(modules) + 1
        desc_m   = re.search(r'^### (.+)', content, re.MULTILINE)
        modules.append({
            'title':       heading_text,
            'body':        content,
            'order_index': order,
            'description': desc_m.group(1) if desc_m else None,
        })

    # Fusionar duplicados (mismo order_index)
    merged = []
    for mod in modules:
        if merged and merged[-1]['order_index'] == mod['order_index']:
            merged[-1]['body'] += '\n\n' + mod['body']
            if len(mod['title']) < len(merged[-1]['title']):
                merged[-1]['title'] = mod['title']
        else:
            merged.append(mod)
    if len(merged) < len(modules):
        print(f'  (Fusionados {len(modules) - len(merged)} módulo(s) duplicados)')
    modules = merged

    print(f'\nMódulos detectados: {len(modules)}')
    for mod in modules:
        print(f'  {mod["order_index"]}. {mod["title"][:70]}  ({len(mod["body"])} chars)')

    if not modules:
        print('ERROR: No se encontraron módulos.')
        sys.exit(1)

    # ── UPDATE / INSERT ───────────────────────────────────────────────────────
    now      = datetime.now(timezone.utc).isoformat()
    updated  = 0
    inserted = 0
    errors   = 0

    for mod in modules:
        module_id = existing.get(mod['order_index'])

        if module_id:
            r = requests.patch(
                f'{SUPABASE_URL}/rest/v1/modules?id=eq.{module_id}',
                headers={**HTTP_HEADERS, 'Prefer': 'return=minimal'},
                json={
                    'title':       mod['title'],
                    'body':        mod['body'],
                    'description': mod['description'],
                    'updated_at':  now,
                },
            )
            if r.status_code in (200, 204):
                print(f'  ✓ M{mod["order_index"]} actualizado — {mod["title"][:60]}  ({len(mod["body"])} chars)')
                updated += 1
            else:
                print(f'  ✗ M{mod["order_index"]} error {r.status_code}: {r.text[:100]}')
                errors += 1
        else:
            r = requests.post(
                f'{SUPABASE_URL}/rest/v1/modules',
                headers={**HTTP_HEADERS, 'Prefer': 'return=representation'},
                json={
                    'subject_id':   subject_id,
                    'title':        mod['title'],
                    'body':         mod['body'],
                    'description':  mod['description'],
                    'order_index':  mod['order_index'],
                    'is_published': True,
                    'created_at':   now,
                    'updated_at':   now,
                },
            )
            if r.status_code in (200, 201):
                print(f'  ✓ M{mod["order_index"]} insertado  — {mod["title"][:60]}  ({len(mod["body"])} chars)')
                inserted += 1
            else:
                print(f'  ✗ M{mod["order_index"]} error {r.status_code}: {r.text[:100]}')
                errors += 1

    parts = [f'{updated} actualizados']
    if inserted:
        parts.append(f'{inserted} insertados')
    if errors:
        parts.append(f'{errors} con error')
    print(f'\n✅ {args.subject_slug}: {", ".join(parts)}.')
    print('Los quiz_questions siguen vinculados (IDs de módulo preservados).')


if __name__ == '__main__':
    main()
