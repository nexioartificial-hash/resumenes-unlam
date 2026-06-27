#!/usr/bin/env python3
"""Diagnóstico: ¿el PDF de Biociencias parte palabras a mitad o las introdujo el extractor?"""
import fitz, re

doc = fitz.open(r"docs/biociencias/Resumen de Biociencias 2026.pdf")
print(f"Pages: {doc.page_count}")

needle = "ambientales"
for i, page in enumerate(doc):
    raw = page.get_text("text")
    if needle in raw:
        idx = raw.find(needle)
        ctx = raw[max(0, idx - 80):idx + 60]
        print(f"\n── p{i+1} ──")
        print(repr(ctx))
