#!/usr/bin/env python3
"""
fix_headings.py
Limpieza de headings mal clasificados en todas las materias.

La extracción promovió a '###'/'####' muchas líneas que NO son títulos:
oraciones sueltas, preguntas de examen, fragmentos de párrafo. Eso ensucia
el índice (TOC) que se genera automáticamente desde los headings.

Dos pasadas, seguras para la paridad (solo se quita el marcador '###',
ninguna palabra se pierde):
  1) merge_wrapped_headings: fusiona un título partido en dos renglones
     (señal: paréntesis abierto sin cerrar en la 1ra línea).
  2) demote_fake_headings: degrada a párrafo los '###' que son texto:
     terminan en . , ;  |  empiezan en minúscula  |  son multi-oración.
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

SUBJECTS = ['biologia', 'biociencias', 'filosofia', 'historia-argentina',
            'fundamentos-ed-fisica', 'seminario', 'contabilidad', 'logica-matematica']

# Solo subheadings ### / #### (los ## son títulos de módulo, nunca se tocan)
HEAD_RE = re.compile(r'^(#{3,4})\s+(.*\S)\s*$')


def merge_wrapped_headings(lines):
    """Fusiona un heading partido en dos renglones (paréntesis abierto sin cerrar)."""
    out, i, n = [], 0, len(lines)
    while i < n:
        m = HEAD_RE.match(lines[i])
        if not m:
            out.append(lines[i]); i += 1; continue
        level, text = m.group(1), m.group(2)
        consumed, scan = i, i + 1
        while scan < n:
            k = scan
            while k < n and not lines[k].strip():
                k += 1
            if k >= n:
                break
            nm = HEAD_RE.match(lines[k])
            if not nm or nm.group(1) != level:
                break
            open_parens = text.count('(') - text.count(')')
            if open_parens > 0:           # 1ra línea tiene "(" sin cerrar → continuación
                text = (text + ' ' + nm.group(2)).strip()
                consumed, scan = k, k + 1
            else:
                break
        out.append(f'{level} {text}')
        i = consumed + 1
    return out


def is_fake_heading(text):
    """True si el texto del heading es en realidad cuerpo de texto, no un título."""
    t = text.strip()
    # quitar negritas para analizar el contenido real
    core = t.strip('*').strip()
    if not core:
        return True
    if core[0].islower():                          # empieza en minúscula → fragmento
        return True
    if core.endswith(('.', ',', ';')):             # termina como oración
        # excepción: abreviaturas tipo "S.A." o "etc." no suelen ser títulos igual
        return True
    if re.search(r'[.?!]\s+[A-ZÁÉÍÓÚÜÑ¿¡]', core): # multi-oración
        return True
    if len(core.split()) > 14:                     # demasiado largo para ser título
        return True
    return False


def demote_fake_headings(lines):
    """Degrada a párrafo (quita '###') los headings que son cuerpo de texto."""
    out, demoted = [], []
    for line in lines:
        m = HEAD_RE.match(line)
        if m and is_fake_heading(m.group(2)):
            out.append(m.group(2))                 # preserva el texto, quita el marcador
            demoted.append(m.group(2))
        else:
            out.append(line)
    return out, demoted


def content_words(text):
    """Conteo de palabras de contenido (ignora marcadores ## / ### y watermark)."""
    clean = re.sub(r'^#{2,4}\s+', '', text, flags=re.MULTILINE)
    words = []
    for line in clean.split('\n'):
        s = line.strip()
        if s.isdigit() and len(s) <= 3:
            continue
        if '@RESUMENES.UNLAM' in s:
            continue
        words.extend(s.split())
    return len(words)


def get_subject_id(slug):
    r = requests.get(f'{SUPABASE_URL}/rest/v1/subjects', headers=HEADERS,
                     params={'select': 'id', 'slug': f'eq.{slug}'})
    rows = r.json()
    return rows[0]['id'] if rows else None


def fetch_modules(subject_id):
    r = requests.get(f'{SUPABASE_URL}/rest/v1/modules', headers=HEADERS,
                     params={'select': 'id,order_index,title,body',
                             'subject_id': f'eq.{subject_id}', 'order': 'order_index'})
    return r.json()


def patch(module_id, body):
    r = requests.patch(f'{SUPABASE_URL}/rest/v1/modules?id=eq.{module_id}',
                       headers={**HEADERS, 'Prefer': 'return=minimal'},
                       json={'body': body})
    return r.status_code in (200, 204)


def main():
    grand_total = 0
    grand_demoted = 0
    for slug in SUBJECTS:
        sid = get_subject_id(slug)
        if not sid:
            print(f'⚠ Subject not found: {slug}')
            continue
        mods = fetch_modules(sid)
        print(f'\n── {slug} ──')
        for mod in mods:
            body = mod['body'] or ''
            lines = body.split('\n')

            lines = merge_wrapped_headings(lines)
            lines, demoted = demote_fake_headings(lines)
            new_body = '\n'.join(lines)

            # Verificación de paridad — ninguna palabra puede perderse
            before, after = content_words(body), content_words(new_body)
            if before != after:
                print(f'  ✗ M{mod["order_index"]}: PARIDAD FALLIDA ({before} → {after}), NO se sube')
                continue

            if new_body != body:
                ok = patch(mod['id'], new_body)
                grand_total += 1
                grand_demoted += len(demoted)
                print(f'  {"✓" if ok else "✗"} M{mod["order_index"]}: {len(demoted)} headings degradados '
                      f'({len(body)} → {len(new_body)} chars, paridad {after} palabras OK)')
            else:
                print(f'  · M{mod["order_index"]}: sin cambios')

    print(f'\n✅ fix_headings done — {grand_total} módulos, {grand_demoted} headings falsos degradados.')


if __name__ == '__main__':
    main()
