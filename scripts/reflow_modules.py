#!/usr/bin/env python3
"""
reflow_modules.py
Reflujo determinista de los módulos: el PDF original hard-wrapea el texto
(corta renglones a ~85 caracteres) y a veces parte palabras a mitad. Como
ModuleContent renderiza con remarkBreaks (cada \\n simple → <br>), eso se ve
cortado.

Este script reúne los renglones de un mismo párrafo en una sola línea fluida:
  - Une wraps con espacio.
  - Rejunta palabras partidas: "política" + "s ambientales" → "políticas ambientales".
  - NO toca: encabezados (#), tablas (|), imágenes (![), listas (-, •, 1., a), i)).
  - Separa párrafos por renglón en blanco (se respeta).

Sin IA. Verifica por módulo que la cantidad de letras y dígitos no cambie
(las uniones no pierden contenido; solo se quitan saltos de línea y espacios).
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

# Palabras españolas de 1-2 letras: si un fragmento inicial ES una de estas,
# probablemente es una palabra real (no la cola de una palabra partida).
SHORT_WORDS = {
    'a','e','o','y','u',
    'de','la','el','lo','un','mi','tu','su','se','si','no','es','en','al','ni',
    'le','me','te','da','va','ya','he','ah','oh','ex','re','un','os',
}

LETTER = r'A-Za-zÁÉÍÓÚÜÑáéíóúüñ'


def is_marker(line):
    """Línea que arranca un ítem estructural (no se fusiona con la anterior)."""
    s = line.lstrip()
    if not s:
        return True
    if s[0] in '#|>!':                       # heading, tabla, cita, imagen (!)
        return True
    if s[0] in '-•*·–':                       # viñeta
        return True
    if re.match(r'^\d{1,2}[.\)]\s', s):       # 1.  2)  01.
        return True
    if re.match(r'^[A-Za-z]\)\s', s):         # a)  b)
        return True
    if re.match(r'^[ivxIVX]{1,4}[.\)]\s', s): # i)  ii.
        return True
    return False


def can_absorb(prev):
    """¿La línea previa puede absorber una continuación? (no si es heading/tabla/imagen)"""
    p = prev.lstrip()
    return not (p.startswith('#') or p.startswith('|') or p.startswith('!['))


def smart_join(a, b):
    a = a.rstrip()
    b = b.lstrip()
    if not b:
        return a
    if not a:
        return b
    # Paréntesis duplicado en el corte: "(" + "(alfa" → "(alfa"
    if a.endswith('(') and b.startswith('('):
        return a + b[1:]
    # Fragmento inicial de 1-2 letras minúsculas = cola de palabra partida
    m = re.match(rf'^([a-záéíóúüñ]{{1,2}})(\s+)(.*)$', b)
    if m and re.search(rf'[{LETTER}]$', a):
        frag, rest = m.group(1), m.group(3)
        prev_tok = a.split()[-1] if a.split() else ''
        prev_letters = re.sub(rf'[^{LETTER}]', '', prev_tok)
        prev_single = len(prev_letters) == 1
        if frag.lower() not in SHORT_WORDS or prev_single:
            merged = a + frag                       # pega la cola a la palabra previa
            return merged + (' ' + rest if rest else '')
    # Wrap normal: unir con espacio
    return a + ' ' + b


def reflow(body):
    out, merges = [], 0
    for line in body.split('\n'):
        if line.strip() == '':
            out.append(line)
            continue
        if not out or out[-1].strip() == '' or is_marker(line) or not can_absorb(out[-1]):
            out.append(line)
        else:
            before = out[-1]
            out[-1] = smart_join(out[-1], line)
            # contar fusiones de palabra (heurística para el log)
            if re.match(rf'^[a-záéíóúüñ]{{1,2}}\s', line.lstrip()):
                merges += 1
    return '\n'.join(out), merges


def letters(s):
    return len(re.sub(rf'[^{LETTER}]', '', s))


def digits(s):
    return len(re.sub(r'[^0-9]', '', s))


def get_modules():
    r = requests.get(f'{SUPABASE_URL}/rest/v1/modules', headers=HEADERS,
                     params={'select': 'id,order_index,body,subjects!inner(slug)',
                             'order': 'order_index'})
    return r.json()


def patch(mid, body):
    r = requests.patch(f'{SUPABASE_URL}/rest/v1/modules?id=eq.{mid}',
                       headers={**HEADERS, 'Prefer': 'return=minimal'},
                       json={'body': body})
    return r.status_code in (200, 204)


def main():
    apply = '--apply' in sys.argv
    sample_slug = None
    for a in sys.argv:
        if a.startswith('--sample='):
            sample_slug = a.split('=', 1)[1]

    mods = get_modules()
    if not isinstance(mods, list):
        print(f'⚠ Error: {mods}')
        return
    print('MODO:', 'APLICAR (escribe en DB)' if apply else 'DRY-RUN (no escribe)')
    total = 0
    for m in mods:
        slug = (m.get('subjects') or {}).get('slug', '?')
        body = m.get('body') or ''
        new_body, merges = reflow(body)
        if new_body == body:
            continue
        if letters(body) != letters(new_body) or digits(body) != digits(new_body):
            print(f'  ✗ [{slug} M{m["order_index"]}] VERIF FALLIDA '
                  f'(letras {letters(body)}→{letters(new_body)}, '
                  f'dígitos {digits(body)}→{digits(new_body)}), NO se sube')
            continue
        total += 1
        if apply:
            ok = patch(m['id'], new_body)
            print(f'  {"✓" if ok else "✗"} [{slug} M{m["order_index"]}] '
                  f'{len(body)}→{len(new_body)} chars, {merges} palabras rejuntadas')
        else:
            print(f'  · [{slug} M{m["order_index"]}] cambiaría {len(body)}→{len(new_body)} chars, '
                  f'{merges} palabras rejuntadas')
            if sample_slug and slug == sample_slug:
                print('    ── MUESTRA (después) ──')
                for ln in new_body.split('\n')[:14]:
                    print('    | ' + ln[:110])
    print(f'\n{"✅ APLICADO" if apply else "🔎 DRY-RUN"} — {total} módulos '
          f'{"actualizados" if apply else "cambiarían"}.')


if __name__ == '__main__':
    main()
