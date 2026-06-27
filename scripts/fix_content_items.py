#!/usr/bin/env python3
"""
fix_content_items.py
Aplica a content_items (guide / exam_model / summary) la misma limpieza de
calidad que se aplicó a `modules`:
  - Libro mayor "T" (cuenta T) → tabla markdown Debe/Haber (resumen de Contabilidad).
  - Fusiona headings partidos en dos renglones.
  - Degrada a párrafo los '###'/'####' que son texto, no títulos.
Verifica paridad por ítem (cuenta solo tokens con alfanuméricos: ignora
guiones, pipes y demás sintaxis de tabla, que no son palabras académicas).
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

# Solo subheadings ### / #### (los ## son títulos de módulo)
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
            if (text.count('(') - text.count(')')) > 0:    # "(" sin cerrar → continuación
                text = (text + ' ' + nm.group(2)).strip()
                consumed, scan = k, k + 1
            else:
                break
        out.append(f'{level} {text}')
        i = consumed + 1
    return out


def is_fake_heading(text):
    """True si el texto del heading es en realidad cuerpo de texto, no un título."""
    core = text.strip().strip('*').strip()
    if not core:
        return True
    if core[0].islower():                          # empieza en minúscula
        return True
    if core.endswith(('.', ',', ';')):             # termina como oración
        return True
    if re.search(r'[.?!]\s+[A-ZÁÉÍÓÚÜÑ¿¡]', core): # multi-oración
        return True
    if len(core.split()) > 14:                     # demasiado largo para un título
        return True
    return False


def demote_fake_headings(lines):
    out, demoted = [], []
    for line in lines:
        m = HEAD_RE.match(line)
        if m and is_fake_heading(m.group(2)):
            out.append(m.group(2))
            demoted.append(m.group(2))
        else:
            out.append(line)
    return out, demoted


def content_words(text):
    """Paridad robusta: solo tokens con algún carácter alfanumérico."""
    clean = re.sub(r'^#{2,4}\s+', '', text, flags=re.MULTILINE)
    n = 0
    for line in clean.split('\n'):
        s = line.strip()
        if '@RESUMENES.UNLAM' in s:
            continue
        for tok in s.split():
            if tok.isdigit() and len(tok) <= 3:
                continue
            if re.search(r'[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ]', tok):
                n += 1
    return n


# ── Libro mayor "T" de Caja — tabla destino ──────────────────────────────────
LEDGER_TABLE = (
    '**CUENTA: Caja**\n\n'
    '| Debe (Aumentos) | Haber (Disminuciones) |\n'
    '| --- | --- |\n'
    '| 20.000 (Venta) | 7.000 (Compra) |\n'
    '|  | 5.000 (Depósito) |\n'
    '| **Total Débitos: 20.000** | **Total Créditos: 12.000** |\n'
    '| **Saldo: 8.000 (Deudor)** |  |'
)

# Variante "summary": guiones en línea propia, pipes presentes, espacios finales
SUMMARY_LEDGER_RE = re.compile(
    r'CUENTA:[ \t]*Caja[ \t]*\n'
    r'[ \t]*-{5,}[ \t]*\n'
    r'[ \t]*Debe \(Aumentos\)[ \t]*\|[ \t]*Haber \(Disminuciones\)[ \t]*\n'
    r'[ \t]*-{5,}[ \t]*\n'
    r'[ \t]*20\.000 \(Venta\)[ \t]*\|[ \t]*7\.000 \(Compra\)[ \t]*\n'
    r'[ \t]*\|[ \t]*5\.000 \(Depósito\)[ \t]*\n'
    r'[ \t]*-{5,}[ \t]*\n'
    r'[ \t]*Total Débitos: 20\.000[ \t]*\|[ \t]*Total Créditos: 12\.000[ \t]*\n'
    r'[ \t]*-{5,}[ \t]*\n'
    r'[ \t]*Saldo: 8\.000 \(Deudor\)'
)

# Variante "module": guiones prefijados a cada línea de contenido
MODULE_LEDGER_RE = re.compile(
    r'CUENTA:\s*Caja\s*\n'
    r'-{5,}\s*Debe \(Aumentos\) \| Haber \(Disminuciones\)\s*\n'
    r'-{5,}\s*20\.000 \(Venta\)\s*\n+'
    r'\|\s*7\.000 \(Compra\)\s*\n+'
    r'\|\s*5\.000 \(Depósito\)\s*\n'
    r'-{5,}\s*Total Débitos: 20\.000 \| Total Créditos: 12\.000\s*\n'
    r'-{5,}\s*Saldo: 8\.000 \(Deudor\)'
)


def get_items():
    r = requests.get(f'{SUPABASE_URL}/rest/v1/content_items', headers=HEADERS,
                     params={'select': 'id,type,title,body,subjects!inner(slug)'})
    return r.json()


def patch(item_id, body):
    r = requests.patch(f'{SUPABASE_URL}/rest/v1/content_items?id=eq.{item_id}',
                       headers={**HEADERS, 'Prefer': 'return=minimal'},
                       json={'body': body})
    return r.status_code in (200, 204)


def main():
    items = get_items()
    if not isinstance(items, list):
        print(f'⚠ Error al traer content_items: {items}')
        return
    total = 0
    for it in items:
        slug = (it.get('subjects') or {}).get('slug', '?')
        body = it.get('body') or ''
        original = body

        if slug == 'contabilidad':
            body, n1 = SUMMARY_LEDGER_RE.subn(LEDGER_TABLE, body)
            body, n2 = MODULE_LEDGER_RE.subn(LEDGER_TABLE, body)
            if n1 or n2:
                print(f'  [{slug}/{it["type"]}] libro mayor "T" → tabla ✓')

        lines = body.split('\n')
        lines = merge_wrapped_headings(lines)
        lines, demoted = demote_fake_headings(lines)
        body = '\n'.join(lines)

        if body == original:
            continue

        before, after = content_words(original), content_words(body)
        if before != after:
            print(f'  ✗ [{slug}/{it["type"]}] PARIDAD FALLIDA ({before} → {after}), NO se sube')
            continue

        ok = patch(it['id'], body)
        total += 1
        extra = f', {len(demoted)} headings degradados' if demoted else ''
        print(f'  {"✓" if ok else "✗"} [{slug}/{it["type"]}] {len(original)} → {len(body)} chars'
              f'{extra} (paridad {after} OK)')

    print(f'\n✅ fix_content_items done — {total} ítems actualizados.')


if __name__ == '__main__':
    main()
