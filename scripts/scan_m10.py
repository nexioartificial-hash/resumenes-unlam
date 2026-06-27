#!/usr/bin/env python3
"""scan_m10.py — muestra ventanas de corrupción en biociencias M10 (análisis local)."""
import sys, io, os, re, requests

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

_SCRIPTS = os.path.dirname(__file__)
import importlib.util as _ilu
_spec = _ilu.spec_from_file_location('seed_modulos', os.path.join(_SCRIPTS, 'seed_modulos.py'))
seed = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(seed)

r = requests.get(f'{seed.SUPABASE_URL}/rest/v1/modules', headers=seed.HTTP_HEADERS,
                 params={'select': 'body,subjects!inner(slug)',
                         'subjects.slug': 'eq.biociencias', 'order_index': 'eq.10'})
body = r.json()[0]['body']
print(f'M10: {len(body)} chars\n')

patterns = {
    'consonante_suelta':  r'[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,}\s[bcdfghjklmnpqrstvwxz]\s',
    'sílaba_duplicada':   r'\b([a-záéíóúüñ]{2,4})\s+\1[a-záéíóúüñ]',
    'palabra+letra_final':r'[a-záéíóúüñ]{3,}\s[a-záéíóúüñ]\b(?=\s)',
}
seen = set()
for name, pat in patterns.items():
    print(f'── {name} ──')
    for m in re.finditer(pat, body):
        s = max(0, m.start() - 30)
        e = min(len(body), m.end() + 30)
        win = body[s:e].replace('\n', '⏎')
        if win not in seen:
            seen.add(win)
            print(f'  …{win}…')
    print()
