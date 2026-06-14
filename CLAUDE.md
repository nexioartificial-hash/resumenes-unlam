# Instrucciones del proyecto ResumenesUNLAM

## Regla #1 — Paridad absoluta PDF ↔ plataforma

**Todo texto cargado en la plataforma debe contener exactamente las mismas palabras que el PDF fuente. Ninguna palabra puede omitirse.**

### Reglas de extracción PDF

- Librería: `fitz` (PyMuPDF). Nunca usar `pdfplumber`.
- Fuente de verdad: `page.get_text("text")` — garantiza que ninguna palabra se pierde.
- `page.get_text("dict")` se usa ÚNICAMENTE para detectar tamaños de fuente (headings markdown). Nunca para filtrar contenido.
- Omisiones permitidas (no son contenido académico):
  - Números de página solos: dígito ≤ 3 chars (`"2"`, `"42"`)
  - Watermark: `@RESUMENES.UNLAM`
- Cualquier otra lógica de filtrado (tablas, columnas, bloques) que descarte texto está PROHIBIDA.

### Validación obligatoria antes de subir a Supabase

Todo script de extracción debe correr `verify_parity()` por módulo antes del `requests.patch`. Si la validación falla, el script debe imprimir el error y **no subir nada**.

```python
def count_content_words(text, is_raw=False):
    words = []
    for line in text.split('\n'):
        s = line.strip()
        if s.isdigit() and len(s) <= 3:
            continue
        if '@RESUMENES.UNLAM' in s:
            continue
        words.extend(s.split())
    return len(words)

def verify_parity(raw_pdf_text, extracted_text, module_name):
    raw_count = count_content_words(raw_pdf_text)
    # Sacar marcadores ## / ### del conteo
    clean = extracted_text.replace('## ', '').replace('### ', '')
    ext_count = count_content_words(clean)
    if raw_count != ext_count:
        print(f"  ❌ PARIDAD FALLIDA en {module_name}: PDF={raw_count} palabras, extraído={ext_count} palabras")
        return False
    print(f"  ✓ Paridad OK: {raw_count} palabras")
    return True
```

## Stack técnico

- **Frontend**: Next.js App Router (TypeScript)
- **Base de datos**: Supabase (PostgreSQL con RLS)
- **Pagos**: MercadoPago Checkout Pro
- **Email**: Resend (dominio resumenesunlam.site)
- **Automatización**: n8n con Redis como memoria
- **Deploy**: Vercel

## Estructura de contenido

- Subjects → Modules → body (markdown con headings `##` y `###`)
- Scripts de extracción en `scripts/`
- PDFs fuente en `docs/`
