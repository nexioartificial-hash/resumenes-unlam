#!/usr/bin/env python3
"""Prueba rápida de OCR en imágenes de texto del PDF."""
import fitz, sys, os

TESSERACT_CMD = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
TESSDATA_DIR  = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'tessdata')
MIN_PX = 80


def is_text_image(img_bytes):
    from PIL import Image
    import io
    img = Image.open(io.BytesIO(img_bytes)).convert('L')
    pixels = list(img.getdata())
    n = len(pixels)
    if n == 0:
        return False
    bw = sum(1 for p in pixels if p < 50 or p > 200)
    return (bw / n) >= 0.85


def ocr_image(img_bytes):
    import pytesseract, cv2
    import numpy as np
    from PIL import Image as PilImage
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD
    os.environ['TESSDATA_PREFIX'] = TESSDATA_DIR
    arr = np.frombuffer(img_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_GRAYSCALE)
    img = cv2.resize(img, None, fx=3, fy=3, interpolation=cv2.INTER_CUBIC)
    img = cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                cv2.THRESH_BINARY, 11, 2)
    pil_img = PilImage.fromarray(img)
    text = pytesseract.image_to_string(pil_img, lang='spa', config='--psm 6 --oem 1')
    return '\n'.join(l for l in text.splitlines() if l.strip())


pdf_path = sys.argv[1] if len(sys.argv) > 1 else 'docs/Resumen de Biologia 2026.pdf'
doc = fitz.open(pdf_path)
print(f"PDF: {len(doc)} paginas")
print(f"Tessdata: {TESSDATA_DIR}")

n_text = 0
n_photo = 0
shown = 0

for page_num in range(1, min(len(doc), 30)):
    page = doc[page_num]
    seen = set()
    for img_info in page.get_images(full=True):
        xref, w, h = img_info[0], img_info[2], img_info[3]
        if xref in seen or w < MIN_PX or h < MIN_PX:
            continue
        seen.add(xref)
        data = doc.extract_image(xref).get('image', b'')
        if not data:
            continue
        if is_text_image(data):
            n_text += 1
            if shown < 3:
                text = ocr_image(data)
                print(f"\n--- Imagen texto (xref={xref}, {w}x{h}, pag {page_num}) ---")
                print(text[:400] if text else '(sin texto)')
                shown += 1
        else:
            n_photo += 1

doc.close()
print(f"\nResumen: {n_text} imagenes de texto, {n_photo} fotos/graficos")
