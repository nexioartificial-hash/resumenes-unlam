#!/usr/bin/env python3
"""
fix_img_colors.py — Re-sube las imágenes de módulos con fondo blanco correcto.

Renderiza cada imagen desde la página del PDF (incluye el fondo blanco del
documento) en lugar de extraer el PNG/JPEG crudo. Sobreescribe en Supabase
Storage (x-upsert) sin modificar el contenido de los módulos ni quizzes.

Uso:
    python scripts/fix_img_colors.py --subject-slug biociencias
    python scripts/fix_img_colors.py --all
"""

import fitz
import requests
import sys, io, re, os, argparse

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

SUPABASE_URL   = "https://dtbouycelkjgyddpftir.supabase.co"
SERVICE_KEY    = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Ym91eWNlbGtqZ3lkZHBmdGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg4MTkwOSwiZXhwIjoyMDk0NDU3OTA5fQ.JKJygGS7S5vfa8Pw5HhnsbcH5OHS2gJ6Qjud4-fgEPg"
STORAGE_BUCKET = "module-images"

HTTP_HEADERS = {
    "apikey":        SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type":  "application/json",
}

_BASE = os.path.dirname(os.path.dirname(__file__))
PDF_MAP = {
    "biociencias":       os.path.join(_BASE, "docs", "biociencias",       "Resumen de Biociencias 2026.pdf"),
    "biologia":          os.path.join(_BASE, "docs", "biologia",          "Resumen de Biologia 2026.pdf"),
    "contabilidad":      os.path.join(_BASE, "docs", "contabilidad",      "Resumen de Contabilidad 2026.pdf"),
    "educacion-fisica":  os.path.join(_BASE, "docs", "educacion-fisica",  "Resumen de Fundamentos Ed. Fisica 2026.pdf"),
    "filosofia":         os.path.join(_BASE, "docs", "filosofia",         "Resumen de Filosofia 2026.pdf"),
    "logica-matematica": os.path.join(_BASE, "docs", "logica-matematica", "Resumen de Logica Matematica 2026.pdf"),
    "seminario":         os.path.join(_BASE, "docs", "seminario",         "Resumen de Seminario 2026.pdf"),
    "historia-argentina":os.path.join(_BASE, "docs", "historia-argentina","Resumen de Historia Argentina 2026.pdf"),
}


def _render_image_from_page(page, rect, ext):
    """
    Renderiza la rect de la página (2x resolución, fondo blanco del PDF incluido).
    Devuelve (bytes, mime) o (None, None) si falla.
    """
    try:
        mat  = fitz.Matrix(2, 2)
        pix  = page.get_pixmap(matrix=mat, clip=rect, colorspace=fitz.csRGB)
        fmt  = "jpeg" if ext in ("jpg", "jpeg") else "png"
        mime = "image/jpeg" if fmt == "jpeg" else "image/png"
        return pix.tobytes(fmt), mime
    except Exception as e:
        return None, None


def fix_subject(slug, pdf_path):
    print(f"\n{'='*60}")
    print(f"Materia: {slug}")
    print(f"PDF:     {pdf_path}")

    if not os.path.exists(pdf_path):
        print(f"  ✗ PDF no encontrado: {pdf_path}")
        return

    # Obtener subject_id
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/subjects?slug=eq.{slug}&select=id",
        headers=HTTP_HEADERS,
    )
    rows = resp.json()
    if not rows:
        print(f"  ✗ Subject '{slug}' no encontrado en Supabase")
        return
    subject_id = rows[0]["id"]

    # Obtener módulos con imágenes
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/modules?subject_id=eq.{subject_id}&select=id,body",
        headers=HTTP_HEADERS,
    )
    modules = resp.json()
    print(f"  Módulos: {len(modules)}")

    # Extraer URLs y construir mapa xref → {path, ext}
    img_targets = {}
    for mod in modules:
        body = mod.get("body", "") or ""
        for m in re.finditer(
            r"!\[.*?\]\(https://[^)]+/module-images/([^/]+)/(\d+)\.(\w+)\)", body
        ):
            storage_slug, xref_str, ext = m.group(1), m.group(2), m.group(3)
            xref = int(xref_str)
            if xref not in img_targets:
                img_targets[xref] = {"path": f"{storage_slug}/{xref_str}.{ext}", "ext": ext}

    if not img_targets:
        print("  Sin imágenes en los módulos — nada que hacer.")
        return

    print(f"  Imágenes a re-subir: {len(img_targets)}")

    doc = fitz.open(pdf_path)

    # Construir mapa xref → (page, rect)
    xref_page_map = {}
    for pnum in range(len(doc)):
        pg = doc[pnum]
        for img_info in pg.get_images(full=True):
            ix = img_info[0]
            if ix not in xref_page_map:
                rects = pg.get_image_rects(ix)
                if rects:
                    xref_page_map[ix] = (pg, rects[0])

    uploaded = 0
    errors   = 0

    for xref, info in sorted(img_targets.items()):
        pg_info = xref_page_map.get(xref)
        if pg_info is None:
            print(f"  ✗ xref {xref}: no encontrado en el PDF")
            errors += 1
            continue

        data, mime = _render_image_from_page(pg_info[0], pg_info[1], info["ext"])
        if data is None:
            print(f"  ✗ xref {xref}: error al renderizar")
            errors += 1
            continue

        resp = requests.post(
            f"{SUPABASE_URL}/storage/v1/object/{STORAGE_BUCKET}/{info['path']}",
            headers={
                "apikey":        SERVICE_KEY,
                "Authorization": f"Bearer {SERVICE_KEY}",
                "Content-Type":  mime,
                "x-upsert":      "true",
            },
            data=data,
        )
        if resp.status_code in (200, 201):
            print(f"  ✓ xref {xref:>5}  →  {info['path']}")
            uploaded += 1
        else:
            print(f"  ✗ xref {xref}: {resp.status_code} {resp.text[:80]}")
            errors += 1

    doc.close()
    print(f"\n  {uploaded} re-subidas, {errors} errores.")


def main():
    parser = argparse.ArgumentParser(
        description="Re-sube imágenes de módulos renderizando desde la página del PDF."
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--subject-slug", help="Slug de la materia (ej: biociencias)")
    group.add_argument("--all",          action="store_true", help="Procesar todas las materias")
    args = parser.parse_args()

    if args.all:
        for slug, pdf in PDF_MAP.items():
            fix_subject(slug, pdf)
    else:
        slug = args.subject_slug
        if slug not in PDF_MAP:
            print(f"ERROR: slug '{slug}' no está en PDF_MAP.")
            print("Slugs disponibles:", ", ".join(PDF_MAP.keys()))
            sys.exit(1)
        fix_subject(slug, PDF_MAP[slug])

    print("\nListo.")


if __name__ == "__main__":
    main()
