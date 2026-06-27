#!/usr/bin/env python3
"""
fix_contabilidad_post.py
Correcciones post-extracción para Contabilidad:
  - Convierte la tabla "Tipo de Cuenta" de M4 (### headings) a markdown table
  - Arregla palabras pegadas: CapitalSocial, LibroDiario, LibroMayor, etc.
"""
import sys, io, os, requests

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

_ENV = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.local')
if os.path.exists(_ENV):
    with open(_ENV, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, _, v = line.partition('=')
                if k.strip() not in os.environ:
                    os.environ[k.strip()] = v.strip().strip('"').strip("'")

_SCRIPTS = os.path.dirname(__file__)
sys.path.insert(0, _SCRIPTS)
import importlib.util as _ilu
_spec = _ilu.spec_from_file_location('seed_modulos', os.path.join(_SCRIPTS, 'seed_modulos.py'))
seed = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(seed)

SUPABASE_URL = seed.SUPABASE_URL
HEADERS      = seed.HTTP_HEADERS
SUBJECT_ID   = 'e4eacaa7-a178-4dbf-9f51-265d5b4c41eb'

r = requests.get(
    f'{SUPABASE_URL}/rest/v1/modules?select=id,order_index,body',
    headers=HEADERS,
    params={'subject_id': f'eq.{SUBJECT_ID}', 'order': 'order_index'},
)
modules = r.json()
print(f'Módulos obtenidos: {len(modules)}')

GLOBAL_FIXES = [
    ('CapitalSocial',        'Capital Social'),
    ('LibroDiario',          'Libro Diario'),
    ('LibroMayor',           'Libro Mayor'),
    ('SituaciónPatrimonial', 'Situación Patrimonial'),
    ('delEstado',            'del Estado'),
    ('yBalances',            'y Balances'),
    ('yBalance',             'y Balance'),
]

OLD_TABLE = (
    '### Tipo de Cuenta\n'
    '### Débitos por...\n'
    '### Créditos por...\n'
    '### Saldo Habitual\n\n'
    '### Activo\n'
    'Aumentos Disminuciones Deudor\n\n'
    '### Pasivo\n'
    'Disminuciones Aumentos Acreedor\n\n'
    '### Patrimonio Neto\n'
    'Disminuciones Aumentos Acreedor\n\n'
    '### Regularizadora Activo\n'
    'Disminuciones Aumentos Acreedor\n\n'
    '### Regularizadora Pasivo\n'
    'Aumentos Disminuciones Deudor\n\n'
    '### Resultado Positivo\n'
    'Disminuciones Aumentos Acreedor\n\n'
    '### Resultado Negativo\n'
    'Aumentos Disminuciones Deudor'
)

NEW_TABLE = (
    '| Tipo de Cuenta | Débitos por... | Créditos por... | Saldo Habitual |\n'
    '| --- | --- | --- | --- |\n'
    '| Activo | Aumentos | Disminuciones | Deudor |\n'
    '| Pasivo | Disminuciones | Aumentos | Acreedor |\n'
    '| Patrimonio Neto | Disminuciones | Aumentos | Acreedor |\n'
    '| Regularizadora Activo | Disminuciones | Aumentos | Acreedor |\n'
    '| Regularizadora Pasivo | Aumentos | Disminuciones | Deudor |\n'
    '| Resultado Positivo | Disminuciones | Aumentos | Acreedor |\n'
    '| Resultado Negativo | Aumentos | Disminuciones | Deudor |'
)

for mod in modules:
    body = mod['body']
    original = body
    oi = mod['order_index']

    for old, new in GLOBAL_FIXES:
        body = body.replace(old, new)

    if oi == 4:
        if OLD_TABLE in body:
            body = body.replace(OLD_TABLE, NEW_TABLE)
            print(f'  M{oi}: tabla "Tipo de Cuenta" → markdown ✓')
        else:
            print(f'  M{oi}: ⚠ tabla no encontrada exactamente')

    if body != original:
        p = requests.patch(
            f'{SUPABASE_URL}/rest/v1/modules?id=eq.{mod["id"]}',
            headers={**HEADERS, 'Prefer': 'return=minimal'},
            json={'body': body},
        )
        ok = '✓' if p.status_code in (200, 204) else f'✗ {p.status_code}'
        print(f'  M{oi}: {ok}  ({len(original)} → {len(body)} chars)')
    else:
        print(f'  M{oi}: sin cambios')

print('\n✅ fix_contabilidad_post done.')
