#!/usr/bin/env python3
"""
fix_m10_fragments.py
En biociencias M10 (autoevaluación) muchas respuestas quedaron promovidas a
'###' y cortadas a mitad de oración. Los headings reales del módulo son cortos
("MODULO 1", "Actividad 4", "Parte A", "Opción correcta:"); los de >8 palabras
son respuestas. Este pase degrada esos a párrafo y los fusiona con su
continuación. Verifica que letras y dígitos no cambien.
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

LETTER = r'A-Za-zÁÉÍÓÚÜÑáéíóúüñ'
HEAD_RE = re.compile(r'^(#{3,4})\s+(.*\S)\s*$')
SHORT_WORDS = {'a','e','o','y','u','de','la','el','lo','un','mi','tu','su','se','si',
               'no','es','en','al','ni','le','me','te','da','va','ya','he','os','re'}


def is_marker(line):
    s = line.lstrip()
    if not s: return True
    if s[0] in '#|>!': return True
    if s[0] in '-•*·–': return True
    if re.match(r'^\d{1,2}[.\)]\s', s): return True
    if re.match(r'^[A-Za-z]\)\s', s): return True
    if re.match(r'^[ivxIVX]{1,4}[.\)]\s', s): return True
    return False


def can_absorb(prev):
    p = prev.lstrip()
    return not (p.startswith('#') or p.startswith('|') or p.startswith('!['))


def smart_join(a, b):
    a, b = a.rstrip(), b.lstrip()
    if not b: return a
    if not a: return b
    if a.endswith('(') and b.startswith('('):
        return a + b[1:]
    m = re.match(r'^([a-záéíóúüñ]{1,2})(\s+)(.*)$', b)
    if m and re.search(rf'[{LETTER}]$', a):
        frag, rest = m.group(1), m.group(3)
        prev_tok = a.split()[-1] if a.split() else ''
        prev_single = len(re.sub(rf'[^{LETTER}]', '', prev_tok)) == 1
        if frag.lower() not in SHORT_WORDS or prev_single:
            return a + frag + (' ' + rest if rest else '')
    return a + ' ' + b


def reflow_demote(body):
    out, demoted = [], 0
    for line in body.split('\n'):
        if line.strip() == '':
            out.append(line); continue
        m = HEAD_RE.match(line)
        if m and len(m.group(2).split()) > 8:    # heading largo = respuesta promovida
            line = m.group(2)                      # degradar a párrafo
            demoted += 1
        if not out or out[-1].strip() == '' or is_marker(line) or not can_absorb(out[-1]):
            out.append(line)
        else:
            out[-1] = smart_join(out[-1], line)
    return '\n'.join(out), demoted


def letters(s): return len(re.sub(rf'[^{LETTER}]', '', s))
def digits(s):  return len(re.sub(r'[^0-9]', '', s))


def main():
    r = requests.get(f'{SUPABASE_URL}/rest/v1/modules', headers=HEADERS,
                     params={'select': 'id,order_index,body,subjects!inner(slug)',
                             'subjects.slug': 'eq.biociencias', 'order_index': 'eq.10'})
    rows = r.json()
    if not rows:
        print('⚠ No se encontró biociencias M10'); return
    m = rows[0]
    body = m['body']
    new_body, demoted = reflow_demote(body)
    if new_body == body:
        print('Sin cambios.'); return
    if letters(body) != letters(new_body) or digits(body) != digits(new_body):
        print(f'✗ VERIF FALLIDA (letras {letters(body)}→{letters(new_body)}, '
              f'dígitos {digits(body)}→{digits(new_body)}), NO se sube'); return
    p = requests.patch(f'{SUPABASE_URL}/rest/v1/modules?id=eq.{m["id"]}',
                       headers={**HEADERS, 'Prefer': 'return=minimal'}, json={'body': new_body})
    ok = p.status_code in (200, 204)
    print(f'{"✓" if ok else "✗"} biociencias M10: {demoted} headings-respuesta degradados '
          f'({len(body)}→{len(new_body)} chars, letras OK)')


if __name__ == '__main__':
    main()
