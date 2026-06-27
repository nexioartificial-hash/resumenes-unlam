#!/usr/bin/env python3
"""Quick scan: detect module headings in Seminario PDF."""
import fitz, re

doc = fitz.open(r"docs/seminario/Resumen de Seminario 2026.pdf")
print(f"Pages: {doc.page_count}")
heading_re = re.compile(r'M[oó]dulo[\.\s]+\d+', re.IGNORECASE)
for i, page in enumerate(doc):
    lines = page.get_text("text").split("\n")
    for line in lines:
        s = line.strip()
        if heading_re.search(s):
            print(f"  p{i+1}: {repr(s[:100])}")
