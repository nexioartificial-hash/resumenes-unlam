#!/usr/bin/env python3
"""
fix_m10_dedup.py
Corrige en biociencias M10 la corrupción dominante del PDF: una consonante
suelta duplicada antes de la palabra que empieza con esa misma consonante:
  "una g gestión" → "una gestión"   "de c cisteína" → "de cisteína"
  "por d dos" → "por dos"           "cromátidas h hermanas" → "cromátidas hermanas"
Se excluyen vocales que son palabras (y/o/a/e/u) para no romper "tú y yo", etc.
Verifica subsecuencia alfanumérica + imágenes + largo antes de patchear.
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

# Consonante suelta duplicada antes de palabra con la misma consonante inicial
DUP_CONS = re.compile(r'(?<!\S)([bcdfghjklmnpqrstvwxzñ])\s+(\1[a-záéíóúüñ]+)', re.UNICODE)


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
    rows = r.json()
    m = rows[0]
    body = m['body']

    samples = []
    def repl(mo):
        if len(samples) < 25:
            samples.append(f'{mo.group(0)!r} → {mo.group(2)!r}')
        return mo.group(2)

    new_body = DUP_CONS.sub(repl, body)
    n = len(samples)

    if new_body == body:
        print('Sin cambios.'); return

    # Verificación
    if not is_subsequence(alnum_seq(new_body), alnum_seq(body)):
        print('✗ no-subsecuencia, NO se sube'); return
    if imgs(new_body) != imgs(body):
        print('✗ imágenes alteradas, NO se sube'); return
    if len(new_body) > len(body):
        print('✗ creció (no debería), NO se sube'); return

    print(f'Correcciones (consonante duplicada): {DUP_CONS.subn(lambda x: x.group(2), body)[1]}')
    for s in samples:
        print(f'  {s}')

    p = requests.patch(f'{SUPABASE_URL}/rest/v1/modules?id=eq.{m["id"]}',
                       headers={**HEADERS, 'Prefer': 'return=minimal'}, json={'body': new_body})
    ok = p.status_code in (200, 204)
    print(f'\n{"✓" if ok else "✗"} M10: {len(body)}→{len(new_body)} chars')


if __name__ == '__main__':
    main()
