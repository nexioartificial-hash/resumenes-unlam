import fitz, sys
sys.stdout.reconfigure(encoding="utf-8")

PDF = "docs/logica-matematica/Resumen de Logica Matematica 2026.pdf"
pdf = fitz.open(PDF)
print(f"Paginas: {len(pdf)}")

total = 0
for i, page in enumerate(pdf):
    text = page.get_text("text")
    words = []
    for line in text.split("\n"):
        s = line.strip()
        if not s:
            continue
        if s.isdigit() and len(s) <= 3:
            continue
        if "@RESUMENES.UNLAM" in s:
            continue
        words.extend(s.split())
    total += len(words)
    preview = " ".join(words[:10])
    print(f"Pag {i+1:2d}: {len(words):4d} palabras | {preview}")

print(f"\nTOTAL PDF:           {total} palabras")
print(f"Extraido actualmente: 3061 palabras")
print(f"Diferencia:           {total - 3061} palabras faltantes")
