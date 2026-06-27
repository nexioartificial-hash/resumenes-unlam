#!/usr/bin/env python3
"""
fix_ledger_contabilidad.py
Convierte el libro mayor (cuenta "T") de Contabilidad M4 de guiones ASCII
a una tabla markdown Debe/Haber, en formato de libro contable.
Preserva todas las palabras académicas; solo descarta las reglas de guiones.
También corrige espacios pegados específicos de Contabilidad.
"""
import sys, io, os, re, requests

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

_SCRIPTS = os.path.dirname(__file__)
import importlib.util as _ilu
_spec = _ilu.spec_from_file_location('seed_modulos', os.path.join(_SCRIPTS, 'seed_modulos.py'))
seed = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(seed)

SUPABASE_URL = seed.SUPABASE_URL
HEADERS      = seed.HTTP_HEADERS


def get_subject_id(slug):
    r = requests.get(f'{SUPABASE_URL}/rest/v1/subjects', headers=HEADERS,
                     params={'select': 'id', 'slug': f'eq.{slug}'})
    rows = r.json()
    return rows[0]['id'] if rows else None


def fetch_modules(subject_id):
    r = requests.get(f'{SUPABASE_URL}/rest/v1/modules', headers=HEADERS,
                     params={'select': 'id,order_index,body',
                             'subject_id': f'eq.{subject_id}', 'order': 'order_index'})
    return r.json()


def patch(module_id, body):
    r = requests.patch(f'{SUPABASE_URL}/rest/v1/modules?id=eq.{module_id}',
                       headers={**HEADERS, 'Prefer': 'return=minimal'},
                       json={'body': body})
    return r.status_code in (200, 204)


# ── Libro mayor "T" de Caja (M4) ─────────────────────────────────────────────
LEDGER_RE = re.compile(
    r'CUENTA:\s*Caja\s*\n'
    r'-{5,}\s*Debe \(Aumentos\) \| Haber \(Disminuciones\)\s*\n'
    r'-{5,}\s*20\.000 \(Venta\)\s*\n+'
    r'\|\s*7\.000 \(Compra\)\s*\n+'
    r'\|\s*5\.000 \(Depósito\)\s*\n'
    r'-{5,}\s*Total Débitos: 20\.000 \| Total Créditos: 12\.000\s*\n'
    r'-{5,}\s*Saldo: 8\.000 \(Deudor\)'
)

LEDGER_TABLE = (
    '**CUENTA: Caja**\n\n'
    '| Debe (Aumentos) | Haber (Disminuciones) |\n'
    '| --- | --- |\n'
    '| 20.000 (Venta) | 7.000 (Compra) |\n'
    '|  | 5.000 (Depósito) |\n'
    '| **Total Débitos: 20.000** | **Total Créditos: 12.000** |\n'
    '| **Saldo: 8.000 (Deudor)** |  |'
)

# Espacios pegados específicos de Contabilidad
SPACING_FIXES = [
    ('Subdiario deCompras', 'Subdiario de Compras'),
    ('(+PN)Capital Social', '(+PN) Capital Social'),
    ('(+PN)Capital',        '(+PN) Capital'),
    ('(+A)Caja',            '(+A) Caja'),
    ('(-A)Accionistas',     '(-A) Accionistas'),
]


def main():
    sid = get_subject_id('contabilidad')
    mods = fetch_modules(sid)
    total = 0
    for mod in mods:
        body = mod['body']
        original = body
        oi = mod['order_index']

        if oi == 4:
            new_body, n = LEDGER_RE.subn(LEDGER_TABLE, body)
            if n:
                body = new_body
                print(f'  M4: libro mayor "T" → tabla markdown ✓')
            else:
                print(f'  M4: ⚠ patrón de libro mayor no encontrado')

        for old, new in SPACING_FIXES:
            if old in body:
                body = body.replace(old, new)
                print(f'  M{oi}: "{old}" → "{new}"')

        if body != original:
            ok = patch(mod['id'], body)
            print(f'  {"✓" if ok else "✗"} M{oi} patched ({len(original)} → {len(body)} chars)')
            total += 1

    print(f'\n✅ fix_ledger_contabilidad done — {total} módulos actualizados.')


if __name__ == '__main__':
    main()
