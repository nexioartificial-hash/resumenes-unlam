#!/usr/bin/env python3
"""
fix_m10_ai.py
Limpieza con IA (OpenAI) de la corrupción inline en biociencias M10
(autoevaluación): palabras partidas ('limitad a'→'limitada') y sílabas/letras
duplicadas ('re revelando'→'revelando', 'diarreas y cy cáncer'→'diarreas y cáncer').

Garantía de integridad (sin tocar contenido): cada chunk corregido debe ser
SUBSECUENCIA alfanumérica del original (solo borra; nunca agrega ni reordena),
conservar ≥90% del largo y las mismas URLs de imagen. Si falla, se usa el original.
Solo patchea si el documento completo pasa la verificación.
"""
import sys, io, os, re, json, requests

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

_SCRIPTS = os.path.dirname(__file__)
import importlib.util as _ilu
_spec = _ilu.spec_from_file_location('seed_modulos', os.path.join(_SCRIPTS, 'seed_modulos.py'))
seed = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(seed)
SUPABASE_URL = seed.SUPABASE_URL
HEADERS      = seed.HTTP_HEADERS

OPENAI_KEY = os.environ.get('OPENAI_API_KEY', '')
MODEL = os.environ.get('M10_MODEL', 'gpt-4o')

ALNUM = re.compile(r'[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ]')
IMG_RE = re.compile(r'!\[[^\]]*\]\([^)]+\)')

SYSTEM = (
    "Sos un corrector de artefactos de extracción de PDF en español. "
    "Tu ÚNICA tarea es reparar palabras rotas:\n"
    "1) Unir palabras partidas por un espacio espurio: 'limitad a'→'limitada', "
    "'contaminad a'→'contaminada', 'de s sectores'→'de sectores'.\n"
    "2) Eliminar sílabas o letras duplicadas en el corte: 're revelando'→'revelando', "
    "'diarreas y cy cáncer'→'diarreas y cáncer'.\n\n"
    "REGLAS ABSOLUTAS: Solo podés BORRAR caracteres espurios (espacios de más, letras o "
    "sílabas repetidas). NUNCA cambies una palabra por otra, no reformules, no parafrasees, "
    "no traduzcas, no resumas, no agregues ni reordenes nada. Si una palabra ya está bien, "
    "dejala idéntica. Si una oración está incompleta, dejala como está (no la completes). "
    "Conservá EXACTAMENTE todo el markdown (encabezados ###, listas, tablas |, links de "
    "imagen ![](...)), la puntuación, los números y los saltos de línea. "
    "Devolvé SOLO el texto corregido, sin comentarios ni explicaciones."
)


def alnum_seq(s):
    return [c.lower() for c in s if ALNUM.match(c)]


def is_subsequence(small, big):
    """¿small es subsecuencia de big? (solo se borró, nada se agregó/reordenó)"""
    it = iter(big)
    return all(c in it for c in small)


def imgs(s):
    return sorted(IMG_RE.findall(s))


def looks_structural(chunk):
    """Chunk sin prosa real (solo tabla/heading/imagen/lista corta) → no enviar."""
    stripped = chunk.strip()
    if not stripped:
        return True
    # si casi todas las líneas son markers, no hay prosa que corregir
    lines = [l for l in stripped.split('\n') if l.strip()]
    markerish = sum(1 for l in lines if l.lstrip()[:1] in '#|!' )
    return markerish == len(lines)


def openai_fix(text):
    resp = requests.post(
        'https://api.openai.com/v1/chat/completions',
        headers={'Authorization': f'Bearer {OPENAI_KEY}', 'Content-Type': 'application/json'},
        json={
            'model': MODEL,
            'temperature': 0,
            'messages': [
                {'role': 'system', 'content': SYSTEM},
                {'role': 'user',   'content': text},
            ],
        },
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()['choices'][0]['message']['content']


def verify(original, cleaned):
    """True si cleaned es una corrección segura del original."""
    if not is_subsequence(alnum_seq(cleaned), alnum_seq(original)):
        return False, 'no-subsecuencia (¿inventó/parafraseó?)'
    if len(cleaned) < len(original) * 0.90:
        return False, f'largo {len(cleaned)}<{int(len(original)*0.9)} (¿borró?)'
    if imgs(cleaned) != imgs(original):
        return False, 'imágenes alteradas'
    return True, 'ok'


def chunk_body(body, max_chars=2500):
    """Trocea en chunks ≤ max_chars respetando límites de párrafo (lossless)."""
    parts = re.split(r'(\n{2,})', body)   # mantiene separadores
    chunks, cur = [], ''
    for p in parts:
        if len(cur) + len(p) > max_chars and cur:
            chunks.append(cur); cur = ''
        cur += p
    if cur:
        chunks.append(cur)
    assert ''.join(chunks) == body, 'reensamblado no coincide'
    return chunks


def main():
    if not OPENAI_KEY:
        print('⚠ Falta OPENAI_API_KEY'); return

    r = requests.get(f'{SUPABASE_URL}/rest/v1/modules', headers=HEADERS,
                     params={'select': 'id,order_index,body,subjects!inner(slug)',
                             'subjects.slug': 'eq.biociencias', 'order_index': 'eq.10'})
    rows = r.json()
    if not rows:
        print('⚠ No se encontró biociencias M10'); return
    m = rows[0]
    body = m['body']

    chunks = chunk_body(body)
    print(f'M10: {len(body)} chars en {len(chunks)} chunks')

    out, cleaned_n, fallback_n, skip_n = [], 0, 0, 0
    for i, ch in enumerate(chunks):
        if looks_structural(ch):
            out.append(ch); skip_n += 1; continue
        try:
            fixed = openai_fix(ch)
        except Exception as e:
            print(f'  chunk {i}: error API ({e}) → original'); out.append(ch); fallback_n += 1; continue
        # preservar separadores de borde exactos
        lead = ch[:len(ch) - len(ch.lstrip('\n'))]
        trail = ch[len(ch.rstrip('\n')):]
        fixed = lead + fixed.strip('\n') + trail
        ok, why = verify(ch, fixed)
        if ok and fixed != ch:
            out.append(fixed); cleaned_n += 1
        elif ok:
            out.append(ch); skip_n += 1            # sin cambios
        else:
            out.append(ch); fallback_n += 1
            print(f'  chunk {i}: descartado ({why}) → original')

    new_body = ''.join(out)

    # Verificación global
    ok, why = verify(body, new_body)
    print(f'\nChunks: {cleaned_n} corregidos, {fallback_n} fallback, {skip_n} sin tocar')
    print(f'Global: {len(body)}→{len(new_body)} chars — verificación: {why}')
    if not ok:
        print('✗ Verificación global falló — NO se sube.'); return
    if new_body == body:
        print('Sin cambios netos.'); return

    p = requests.patch(f'{SUPABASE_URL}/rest/v1/modules?id=eq.{m["id"]}',
                       headers={**HEADERS, 'Prefer': 'return=minimal'}, json={'body': new_body})
    print('✓ M10 actualizado' if p.status_code in (200, 204) else f'✗ {p.status_code}')


if __name__ == '__main__':
    main()
