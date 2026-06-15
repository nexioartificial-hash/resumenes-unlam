import fitz
import requests
import sys, io, re
from datetime import datetime, timezone

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

PDF_PATH        = r"c:\Users\Noxi-PC\Desktop\resumenes.unlam\docs\Preguntas Teóricas de Contabilidad.pdf"
SUPABASE_URL    = "https://dtbouycelkjgyddpftir.supabase.co"
SERVICE_KEY     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Ym91eWNlbGtqZ3lkZHBmdGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg4MTkwOSwiZXhwIjoyMDk0NDU3OTA5fQ.JKJygGS7S5vfa8Pw5HhnsbcH5OHS2gJ6Qjud4-fgEPg"
CONTENT_ITEM_ID = "182a919d-0d9d-43f1-a143-8a9d47cbe513"

# Patrones de ruido Studocu — se omiten de extracción Y del conteo de paridad
NOISE = [
    'Preguntas teoricas examen de contabilidad y ejercicios',
    'resueltos para estudiar y pasar el curso de ingreso',
    'contabilidad(curso ingreso) (Universidad Nacional de La Matanza)',
    'Escanea para abrir en Studocu',
    'Studocu no está patrocinado ni avalado por ningún colegio o universidad.',
    'Descargado por resumenes unlam',
    'lOMoARcPSD|',
    'Esta página no es visible en la vista previa',
    '¡No te pierdas las partes importantes!',
]

def is_noise(s):
    return any(pat in s for pat in NOISE)


# ── Paridad ───────────────────────────────────────────────────────────────────

def strip_markers(text):
    lines = []
    for line in text.split('\n'):
        s = line.strip()
        if s.startswith('## '):    lines.append(s[3:])
        elif s.startswith('### '): lines.append(s[4:])
        elif s.startswith('- '):   lines.append(s[2:])
        else:                       lines.append(s)
    return '\n'.join(lines)

def count_content_words(text):
    words = []
    for line in text.split('\n'):
        s = line.strip()
        if not s: continue
        if s.isdigit() and len(s) <= 3: continue
        if is_noise(s): continue
        words.extend(s.split())
    return len(words)


# ── Extracción ────────────────────────────────────────────────────────────────

RESP    = re.compile(r'(?<!\w)Resp?\.?\s+')
MID_SEP = re.compile(r'[.?]\s+(?=[A-ZÀ-Ü])')  # ". Capital" a mitad de línea

doc = fitz.open(PDF_PATH)
print(f"PDF: {len(doc)} páginas")

raw_text_all = ''
lines_out    = []

for page_num in range(len(doc)):
    page     = doc[page_num]
    raw_text = page.get_text('text')
    raw_text_all += raw_text

    raw_lines = raw_text.split('\n')
    i = 0
    while i < len(raw_lines):
        line = raw_lines[i]
        s    = line.strip()

        # ── Omitir vacíos ─────────────────────────────────────────────────────
        if not s:
            lines_out.append('')
            i += 1
            continue

        # ── Omitir: página, ruido Studocu ─────────────────────────────────────
        if s.isdigit() and len(s) <= 3:
            i += 1
            continue
        if is_noise(s):
            i += 1
            continue

        # ── Pregunta numerada — 4 reglas en cascada ───────────────────────────
        if re.match(r'^\d+-', s):
            # Regla 1: "Resp." / "Res." ya en esta línea → separar ahí
            m = RESP.search(s)
            if m:
                lines_out.append(f'### {s[:m.start()].strip()}')
                lines_out.append(s[m.start():])
                i += 1
                continue

            # Regla 2: respuesta embebida sin marcador — ". Capital" a mitad
            q_end = MID_SEP.search(s)
            if q_end:
                lines_out.append(f'### {s[:q_end.start()+1].strip()}')
                answer = s[q_end.end():].strip()
                if answer:
                    lines_out.append(answer)
                i += 1
                continue

            # Regla 3: pregunta completa en esta línea (termina en . o ?)
            if s.endswith(('.', '?')):
                lines_out.append(f'### {s}')
                i += 1
                continue

            # Regla 4: pregunta multi-línea → recolectar hasta Resp. o corte
            full_q = s
            j = i + 1
            answer_start = None
            while j < len(raw_lines):
                ns = raw_lines[j].strip()
                if not ns or is_noise(ns) or re.match(r'^\d+-', ns):
                    break
                m2 = RESP.search(ns)
                if m2:
                    before = ns[:m2.start()].strip()
                    if before:
                        full_q += ' ' + before
                    answer_start = ns[m2.start():]
                    j += 1
                    break
                full_q += ' ' + ns
                j += 1
            lines_out.append(f'### {full_q}')
            if answer_start:
                lines_out.append(answer_start)
            i = j
            continue

        # ── Línea regular ─────────────────────────────────────────────────────
        lines_out.append(line)
        i += 1

doc.close()

body = '\n'.join(lines_out)
body = re.sub(r'\n{3,}', '\n\n', body).strip()


# ── Validación de paridad ─────────────────────────────────────────────────────

raw_count = count_content_words(raw_text_all)
ext_count = count_content_words(strip_markers(body))

print(f"Chars extraídos: {len(body):,}")
print(f"Palabras PDF:    {raw_count}")
print(f"Palabras body:   {ext_count}")

if raw_count != ext_count:
    diff = ext_count - raw_count
    print(f"  PARIDAD FALLIDA: diferencia = {diff:+d} palabras")
    print("\n  Preview body:")
    print(body[:800])
    sys.exit(1)

print("  Paridad OK")


# ── Subida a Supabase ─────────────────────────────────────────────────────────

print(f"\nActualizando content_item {CONTENT_ITEM_ID}...")
resp = requests.patch(
    f'{SUPABASE_URL}/rest/v1/content_items?id=eq.{CONTENT_ITEM_ID}',
    headers={
        'apikey':        SERVICE_KEY,
        'Authorization': f'Bearer {SERVICE_KEY}',
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal',
    },
    json={
        'body':       body,
        'updated_at': datetime.now(timezone.utc).isoformat(),
    }
)

if resp.status_code in [200, 204]:
    print('  Actualizado en Supabase')
else:
    print(f'  Error {resp.status_code}: {resp.text}')

print('\nPreview del body subido:')
print(body[:800])
