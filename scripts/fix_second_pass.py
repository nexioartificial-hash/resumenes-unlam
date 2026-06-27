#!/usr/bin/env python3
"""
fix_second_pass.py
Segunda pasada de correcciones post-extracción:
  - Biología M3: elimina artifact "### QUÍMICAS" al inicio del body
  - Biología M6: elimina "### MÓDULO 6 LA MEMBRANA PLASMÁTICA" repetido al inicio
  - Word-breaks detectados en auditoría: biología, biociencias, filosofía
"""
import sys, io, os, re, requests

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# ─── Credenciales vía seed_modulos ──────────────────────────────────────────
_SCRIPTS = os.path.dirname(__file__)
import importlib.util as _ilu
_spec = _ilu.spec_from_file_location('seed_modulos', os.path.join(_SCRIPTS, 'seed_modulos.py'))
seed = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(seed)

SUPABASE_URL = seed.SUPABASE_URL
HEADERS      = seed.HTTP_HEADERS


# ─── Subjects a procesar ─────────────────────────────────────────────────────
SUBJECTS = ['biologia', 'biociencias', 'filosofia', 'historia-argentina', 'fundamentos-ed-fisica', 'seminario', 'contabilidad']


def get_subject_id(slug):
    r = requests.get(
        f'{SUPABASE_URL}/rest/v1/subjects',
        headers=HEADERS,
        params={'select': 'id', 'slug': f'eq.{slug}'},
    )
    rows = r.json()
    if isinstance(rows, list) and rows:
        return rows[0]['id']
    return None


def fetch_modules(subject_id):
    r = requests.get(
        f'{SUPABASE_URL}/rest/v1/modules',
        headers=HEADERS,
        params={
            'select': 'id,order_index,title,body',
            'subject_id': f'eq.{subject_id}',
            'order': 'order_index',
        },
    )
    return r.json()


def patch_module(module_id, body):
    r = requests.patch(
        f'{SUPABASE_URL}/rest/v1/modules?id=eq.{module_id}',
        headers={**HEADERS, 'Prefer': 'return=minimal'},
        json={'body': body},
    )
    return r.status_code in (200, 204)


# ─── Word-break fixes (string replacement) ──────────────────────────────────
GLOBAL_WORD_BREAKS = [
    # Biología M3
    ('com o oxígeno',          'como oxígeno'),
    ('com o el oxígeno',       'como el oxígeno'),
    ('disuel to ',             'disuelto '),
    ('disuel to\n',            'disuelto\n'),
    # Biología M4
    ('d e plástico',           'de plástico'),
    # Biología M6
    ('s u complejidad',        'su complejidad'),
    # Biología M7
    ('su s componentes',       'sus componentes'),
    # Biociencias M4
    ('l múscul o cardíaco',    'músculo cardíaco'),
    ('múscul o cardíaco',      'músculo cardíaco'),
    # Biociencias M6
    (' mo movilización',       ' movilización'),
    # Biociencias M10
    ('en f forma de glucosa',  'en forma de glucosa'),
    ('libera en f forma',      'libera en forma'),
    ('en f  orma',             'en forma'),
    ('libera en forma de glucosa', 'libera en forma de glucosa'),
    # Filosofía M1/M2
    ('área s e ',              'áreas e '),
    ('área s ',                'áreas '),
    ('área s\n',               'áreas\n'),
    # Filosofía M3
    ('Est a disciplina',       'Esta disciplina'),
    # Patrones generales comunes
    (' qu e ',                 ' que '),
    (' d e ',                  ' de '),
    (' s u ',                  ' su '),
    ('su s ',                  'sus '),
    ('mú músculos',            'músculos'),
    ('mú músculas',            'músculas'),
    # Espacios dentro de palabras típicos de extracción PDF
    ('l múscul',               'músculo'),
    ('célula s ',              'células '),
    ('célula s\n',             'células\n'),
]

# Prefijos que NUNCA son palabras solas en español — solo estos pueden ser removidos
# (excluye: de, se, es, en, su, al, el, la, lo, un, me, mi, si, ni, no, con, por, etc.)
NON_WORD_PREFIXES = {
    'ne', 'añ', 'ac', 'tr', 'in', 'ci', 'fo', 'ob', 'cu', 'hi', 'sa', 'gl', 'du',
    'os', 'az', 'ge', 'au', 'am', 'pr', 'mu', 'cr', 'rá', 'ad',
    'op', 'bu', 'pi', 'ét', 'fu', 'et', 'ec', 'pu',
    'ab', 'ap', 'ex', 'gr', 'bl', 'fl', 'pl', 'cl', 'br', 'dr', 'fr',
    'nú', 'hé', 'cé', 'mú', 'gé', 'pé', 'úl', 'hé',
}

# Regex: sílaba duplicada "XY XY..." → solo para prefijos non-word
DUP_SYLLABLE_RE = re.compile(
    r'\b([a-záéíóúüñ]{2,4})\s+(\1[a-záéíóúüñ]{3,})\b',
    re.UNICODE,
)


def apply_fixes(body, slug, order_index):
    """Aplica todos los fixes y retorna el body corregido."""
    original = body

    # ── Fixes de headers específicos de Biología ─────────────────────────────
    if slug == 'biologia':
        if order_index == 3:
            if body.startswith('### QUÍMICAS\n\n'):
                body = body[len('### QUÍMICAS\n\n'):]
                print(f'    [M{order_index}] ✓ Eliminado header artifact "### QUÍMICAS"')
            elif body.startswith('### QUÍMICAS\n'):
                body = body[len('### QUÍMICAS\n'):]
                print(f'    [M{order_index}] ✓ Eliminado header artifact "### QUÍMICAS"')
        if order_index == 6:
            if body.startswith('### MÓDULO 6 LA MEMBRANA PLASMÁTICA\n'):
                body = body[len('### MÓDULO 6 LA MEMBRANA PLASMÁTICA\n'):]
                print(f'    [M{order_index}] ✓ Eliminado header redundante "### MÓDULO 6"')
            # Promover #### a ### si es el primer heading del body
            if body.startswith('#### INTRODUCCIÓN\n'):
                body = '### INTRODUCCIÓN\n' + body[len('#### INTRODUCCIÓN\n'):]
                print(f'    [M{order_index}] ✓ Promovido #### INTRODUCCIÓN → ###')

    # ── Word-break string replacements ───────────────────────────────────────
    for old, new in GLOBAL_WORD_BREAKS:
        if old in body:
            count = body.count(old)
            body = body.replace(old, new)
            print(f'    [M{order_index}] "{old}" → "{new}" ({count}x)')

    # ── Regex: sílaba duplicada (solo prefijos que no son palabras en español) ───
    def safe_dup_replace(m):
        prefix = m.group(1).lower().rstrip('áéíóú')  # strip accent for lookup
        prefix_plain = m.group(1).lower()
        if prefix_plain in NON_WORD_PREFIXES or prefix in NON_WORD_PREFIXES:
            print(f'    [M{order_index}] DUP_SYL ✓: "{m.group()}" → "{m.group(2)}"')
            return m.group(2)
        return m.group()  # preservar: el prefijo es una palabra real en español

    new_body = DUP_SYLLABLE_RE.sub(safe_dup_replace, body)
    if new_body != body:
        body = new_body

    return body


def main():
    total_patched = 0
    for slug in SUBJECTS:
        subject_id = get_subject_id(slug)
        if not subject_id:
            print(f'⚠ Subject not found: {slug}')
            continue
        modules = fetch_modules(subject_id)
        print(f'\n── {slug} ({len(modules)} módulos) ──')
        for mod in modules:
            body = mod.get('body') or ''
            fixed = apply_fixes(body, slug, mod['order_index'])
            if fixed != body:
                ok = patch_module(mod['id'], fixed)
                status = '✓' if ok else '✗'
                print(f'  {status} M{mod["order_index"]} patched ({len(body)} → {len(fixed)} chars)')
                total_patched += 1
            else:
                print(f'  · M{mod["order_index"]} sin cambios')

    print(f'\n✅ fix_second_pass done — {total_patched} módulos actualizados.')


if __name__ == '__main__':
    main()
