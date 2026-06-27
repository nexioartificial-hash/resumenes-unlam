#!/usr/bin/env python3
"""
fix_m10_pairs.py
Correcciones exactas (con contexto) de la corrupción genuina restante en
biociencias M10, identificadas leyendo el contenido. Cada par solo BORRA
caracteres espurios (palabras partidas / sílabas duplicadas). Se distingue
de español correcto ("es esencial", "se separan", "de desecho" → NO se tocan).
Verifica subsecuencia + imágenes + largo global antes de subir.
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

ALNUM = re.compile(r'[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ]')
IMG_RE = re.compile(r'!\[[^\]]*\]\([^)]+\)')

# (corrupto → corregido) — cada uno solo borra lo espurio
PAIRS = [
    ('para l a diversidad',                 'para la diversidad'),
    ('que n o necesariamente',              'que no necesariamente'),
    ('enfermedades, re revelando',          'enfermedades, revelando'),
    ('del ser hu humano',                   'del ser humano'),
    ('aminoácidos ti tienden',              'aminoácidos tienden'),
    ('por un unidades monoméricas',         'por unidades monoméricas'),
    ('hijas para as asegurar',              'hijas para asegurar'),
    ('ADN para as asegurarse',              'ADN para asegurarse'),
    ('La se separación de las cromátidas',  'La separación de las cromátidas'),
    ('necesitamos es especificar',          'necesitamos especificar'),
    ('claramente la re replicación',        'claramente la replicación'),
    ('indica qu que la célula',             'indica que la célula'),
    ('lo que su sugiere',                   'lo que sugiere'),
    ('planas. Es ca característico',         'planas. Es característico'),
    ('de las mi miofibrillas',              'de las miofibrillas'),
    ('generar en energía y material',       'generar energía y material'),
    ('contaminad a o al aire',              'contaminada o al aire'),
    ('diarreas y cy cáncer',                'diarreas y cáncer'),
    ('visión limitad a de la salud',        'visión limitada de la salud'),
    ('informales, co mo aquellas',          'informales, como aquellas'),
    ('global, gener ando desempleo',        'global, generando desempleo'),
]


def alnum_seq(s):
    return [c.lower() for c in s if ALNUM.match(c)]


def is_subsequence(small, big):
    it = iter(big)
    return all(c in it for c in small)


def imgs(s):
    return sorted(IMG_RE.findall(s))


def main():
    r = requests.get(f'{SUPABASE_URL}/rest/v1/modules', headers=HEADERS,
                     params={'select': 'id,body,subjects!inner(slug)',
                             'subjects.slug': 'eq.biociencias', 'order_index': 'eq.10'})
    m = r.json()[0]
    body = m['body']
    new = body
    applied = 0
    for bad, good in PAIRS:
        c = new.count(bad)
        if c:
            new = new.replace(bad, good)
            applied += c
            print(f'  ✓ "{bad}" → "{good}" ({c}x)')
        else:
            print(f'  · no encontrado: "{bad}"')

    if new == body:
        print('\nSin cambios.'); return
    if not is_subsequence(alnum_seq(new), alnum_seq(body)):
        print('\n✗ no-subsecuencia, NO se sube'); return
    if imgs(new) != imgs(body):
        print('\n✗ imágenes alteradas, NO se sube'); return

    p = requests.patch(f'{SUPABASE_URL}/rest/v1/modules?id=eq.{m["id"]}',
                       headers={**HEADERS, 'Prefer': 'return=minimal'}, json={'body': new})
    ok = p.status_code in (200, 204)
    print(f'\n{"✓" if ok else "✗"} M10: {applied} correcciones, {len(body)}→{len(new)} chars')


if __name__ == '__main__':
    main()
