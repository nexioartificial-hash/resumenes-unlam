import fitz
import requests
import sys, io
from datetime import datetime, timezone

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

PDF_PATH = r"c:\Users\Noxi-PC\Desktop\resumenes.unlam\docs\Resumen de Historia Argentina 2026.pdf"
SUPABASE_URL = "https://dtbouycelkjgyddpftir.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Ym91eWNlbGtqZ3lkZHBmdGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg4MTkwOSwiZXhwIjoyMDk0NDU3OTA5fQ.JKJygGS7S5vfa8Pw5HhnsbcH5OHS2gJ6Qjud4-fgEPg"
MODULE_ID = "835bb16b-30b7-48d9-910d-a0b8ff774d72"
PAGE_START = 6
PAGE_END = 12

doc = fitz.open(PDF_PATH)
content_pages = []
for i in range(PAGE_START, PAGE_END + 1):
    text = doc[i].get_text("text")
    if text and text.strip():
        content_pages.append(text)
doc.close()

body = '\n\n'.join(content_pages)
print(f"Extracted {len(body)} chars from pages {PAGE_START+1}-{PAGE_END+1}")
print("Preview:", body[:300])

resp = requests.patch(
    f'{SUPABASE_URL}/rest/v1/modules?id=eq.{MODULE_ID}',
    headers={'apikey': SERVICE_KEY, 'Authorization': f'Bearer {SERVICE_KEY}',
             'Content-Type': 'application/json', 'Prefer': 'return=minimal'},
    json={'body': body, 'updated_at': datetime.now(timezone.utc).isoformat()}
)
print(f'Status: {resp.status_code}')
if resp.status_code not in [200, 204]:
    print('Error:', resp.text)
else:
    print('SUCCESS - Modulo 2 updated in Supabase')
