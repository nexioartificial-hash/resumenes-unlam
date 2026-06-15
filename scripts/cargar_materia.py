#!/usr/bin/env python3
"""
cargar_materia.py — Carga completa de una materia en Supabase.

Orquesta en orden:
  1. Módulos del PDF principal          → seed_modulos.py
  2. Guía de estudio (opcional)         → seed_material_apoyo.py --type guide
  3. Modelo de examen (opcional)        → seed_material_apoyo.py --type exam_model
  4. Genera mapa de conocimiento        → Claude Haiku (IA) + registro en index.ts
     Si ANTHROPIC_API_KEY no está disponible, genera un template vacío.

Uso mínimo (solo módulos):
    python scripts/cargar_materia.py \\
        --subject-slug geometria \\
        --pdf-modulos docs/Geometria.pdf

Uso completo:
    python scripts/cargar_materia.py \\
        --subject-slug geometria \\
        --pdf-modulos docs/Geometria.pdf \\
        --pdf-guia    docs/Guia_Geometria.pdf \\
        --pdf-examen  docs/Examen_Geometria.pdf \\
        --titulo-guia   "Guía de Estudio de Geometría" \\
        --titulo-examen "Modelo de Examen 2026 — Geometría"

Al finalizar muestra un resumen con todo lo que queda pendiente.
"""

import subprocess, sys, os, re, json, argparse
from pathlib import Path

# ── Rutas ─────────────────────────────────────────────────────────────────────

_HERE     = Path(__file__).parent
_ROOT     = _HERE.parent
_SEED_MOD = _HERE / 'seed_modulos.py'
_SEED_MAT = _HERE / 'seed_material_apoyo.py'
_MAPS_DIR = _ROOT / 'src' / 'data' / 'knowledge-maps'

PYTHON = sys.executable


# ── Helpers generales ─────────────────────────────────────────────────────────

def run(cmd: list, label: str) -> bool:
    """Ejecuta un comando y devuelve True si fue exitoso."""
    print(f"\n{'─'*60}")
    print(f"▶  {label}")
    print(f"{'─'*60}")
    result = subprocess.run(cmd, cwd=str(_ROOT))
    ok = result.returncode == 0
    print(f"\n{'✓' if ok else '✗'}  {label} — {'OK' if ok else 'FALLÓ (código ' + str(result.returncode) + ')'}")
    return ok


def _esc(s: str) -> str:
    """Escapa caracteres para un string literal TypeScript con comillas simples."""
    return s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', ' ').replace('\r', '')


# ── Supabase REST — obtener módulos ───────────────────────────────────────────

def fetch_module_titles(slug: str) -> list:
    """
    Consulta Supabase y devuelve [(module_id, title), ...] ordenados por order_index.
    Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_KEY en el entorno.
    """
    try:
        import requests
    except ImportError:
        print("  ⚠  requests no instalado. Instalá con: pip install requests")
        return []

    url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL', os.environ.get('SUPABASE_URL', ''))
    key = os.environ.get('SUPABASE_SERVICE_KEY', os.environ.get('SUPABASE_KEY', ''))

    if not url or not key:
        print("  ⚠  NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_KEY no encontradas en el entorno.")
        return []

    headers = {'apikey': key, 'Authorization': f'Bearer {key}'}

    try:
        r = requests.get(
            f"{url}/rest/v1/subjects",
            params={'slug': f'eq.{slug}', 'select': 'id'},
            headers=headers, timeout=10,
        )
        subjects = r.json()
        if not subjects:
            print(f"  ⚠  Subject '{slug}' no encontrado en Supabase.")
            return []

        subject_id = subjects[0]['id']

        r = requests.get(
            f"{url}/rest/v1/modules",
            params={
                'subject_id': f'eq.{subject_id}',
                'select': 'id,title',
                'order': 'order_index.asc',
            },
            headers=headers, timeout=10,
        )
        modules = r.json()
        print(f"  ✓  {len(modules)} módulos obtenidos de Supabase.")
        return [(m['id'], m['title']) for m in modules]

    except Exception as e:
        print(f"  ⚠  Error consultando Supabase: {e}")
        return []


# ── Generación de mapa con IA (Claude Haiku) ──────────────────────────────────

def generate_map_ai(slug: str, modules: list) -> 'str | None':
    """
    Llama a Claude Haiku para generar nodos y edges del mapa de conocimiento.
    Devuelve el contenido TypeScript como string, o None si falla.
    """
    try:
        import anthropic
    except ImportError:
        print("  ⚠  anthropic no instalado. Instalá con: pip install anthropic")
        return None

    if not modules:
        print("  ⚠  Sin módulos para generar el mapa con IA.")
        return None

    api_key = os.environ.get('ANTHROPIC_API_KEY', '')
    if not api_key:
        print("  ⚠  ANTHROPIC_API_KEY no encontrada. Usando template básico.")
        return None

    const_prefix = slug.replace('-', '_').upper()
    subject_name = slug.replace('-', ' ').title()

    modules_list = '\n'.join(
        f"  Módulo {i+1} (uuid={uuid}): {title}"
        for i, (uuid, title) in enumerate(modules)
    )

    prompt = f"""Sos un experto en pedagogía universitaria argentina. Generá un mapa de conocimiento para la materia "{subject_name}".

Módulos (con sus UUIDs de Supabase):
{modules_list}

Para cada módulo identificá autores/pensadores y conceptos clave relevantes al contenido del módulo.

Respondé ÚNICAMENTE con JSON válido (sin markdown, sin texto adicional):
{{
  "modules": [
    {{
      "id": "mod-1",
      "module_uuid": "el-uuid-real-del-modulo-aquí",
      "label": "tema del módulo (breve, sin 'Módulo N:')",
      "children": [
        {{"id": "id-unico-kebab", "label": "Nombre Corto", "type": "author", "description": "Descripción de 1-2 oraciones sobre este autor."}},
        {{"id": "otro-id-kebab", "label": "Concepto", "type": "concept", "description": "Qué es este concepto y por qué importa en el módulo."}}
      ]
    }}
  ],
  "cross_edges": [
    {{"from": "id-nodo-origen", "to": "id-nodo-destino"}}
  ]
}}

Reglas:
- id de nodos hijo: únicos, kebab-case, descriptivos (ej: "aristoteles", "silogismo", "verdad-formal")
- Generá 4-6 nodos hijo por módulo (mezcla de autores y conceptos)
- cross_edges: 3-6 conexiones entre nodos de DISTINTOS módulos que estén relacionados temáticamente
- Los module_uuid deben ser EXACTAMENTE los UUIDs que te di arriba, copiados tal cual"""

    print("  ⏳  Llamando a Claude Haiku para generar el mapa...")

    try:
        client = anthropic.Anthropic(api_key=api_key)
        msg = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=4096,
            messages=[{'role': 'user', 'content': prompt}],
        )
        raw = msg.content[0].text.strip()

        # Remover bloques markdown si Claude los agrega
        if raw.startswith('```'):
            raw = raw.split('\n', 1)[-1]
            if '```' in raw:
                raw = raw.rsplit('```', 1)[0]
        raw = raw.strip()

        data = json.loads(raw)
        n_children = sum(len(m.get('children', [])) for m in data.get('modules', []))
        n_cross    = len(data.get('cross_edges', []))
        print(f"  ✓  Mapa generado: {n_children} nodos hijo, {n_cross} conexiones cruzadas")

        return build_ts_from_ai(slug, const_prefix, data)

    except json.JSONDecodeError as e:
        print(f"  ✗  JSON inválido devuelto por Claude: {e}")
        return None
    except Exception as e:
        print(f"  ✗  Error llamando a Claude API: {e}")
        return None


def build_ts_from_ai(slug: str, const_prefix: str, data: dict) -> str:
    """Convierte el JSON generado por IA a código TypeScript."""
    lines_nodes: list[str] = []
    lines_edges: list[str] = []

    for i, mod in enumerate(data.get('modules', [])):
        x_mod = i * 400 + 175
        lines_nodes.append(
            f"  {{ id: '{mod['id']}', label: '{_esc(mod['label'])}', type: 'module', "
            f"module_id: '{mod['module_uuid']}', "
            f"description: '{_esc(mod['label'])}', x: {x_mod}, y: 30 }},"
        )

        children = mod.get('children', [])
        for j, child in enumerate(children):
            row = j // 3
            col = j % 3
            n_in_row = min(3, len(children) - row * 3)
            total_w  = (n_in_row - 1) * 160
            x_child  = x_mod - total_w // 2 + col * 160
            y_child  = 200 + row * 150
            lines_nodes.append(
                f"  {{ id: '{child['id']}', label: '{_esc(child['label'])}', "
                f"type: '{child['type']}', parent: '{mod['id']}', "
                f"module_id: '{mod['module_uuid']}', "
                f"description: '{_esc(child['description'])}', "
                f"x: {x_child}, y: {y_child} }},"
            )
            lines_edges.append(
                f"  {{ id: 'e-{mod['id']}-{child['id']}', "
                f"source: '{mod['id']}', target: '{child['id']}', type: 'hierarchy' }},"
            )

    for ce in data.get('cross_edges', []):
        lines_edges.append(
            f"  {{ id: 'cx-{ce['from']}-{ce['to']}', "
            f"source: '{ce['from']}', target: '{ce['to']}', type: 'cross' }},"
        )

    nodes_str = '\n'.join(lines_nodes)
    edges_str = '\n'.join(lines_edges)

    return (
        f"// src/data/knowledge-maps/{slug}.ts\n"
        f"// Generado automáticamente por cargar_materia.py + Claude AI\n"
        f"// Revisá y ajustá los nodos y conexiones según sea necesario\n\n"
        f"import type {{ KnowledgeNode, KnowledgeEdge }} from './filosofia'\n\n"
        f"export const {const_prefix}_NODES: KnowledgeNode[] = [\n"
        f"{nodes_str}\n"
        f"]\n\n"
        f"export const {const_prefix}_EDGES: KnowledgeEdge[] = [\n"
        f"{edges_str}\n"
        f"]\n"
    )


# ── Template básico (fallback sin IA) ────────────────────────────────────────

MODULE_TEMPLATE = '''\
export const {CONST_PREFIX}_NODES: KnowledgeNode[] = [
  // ── Módulos (completar module_id con el UUID real de Supabase) ──────────
{module_lines}

  // ── Nodos hijo — Módulo 1 ─────────────────────────────────────────────────
  // { id: 'concepto1', label: 'Nombre', type: 'concept', parent: 'mod-1', module_id: 'TODO-UUID-1', description: '...', x: 30,  y: 240 },
  // { id: 'autor1',    label: 'Autor',  type: 'author',  parent: 'mod-1', module_id: 'TODO-UUID-1', description: '...', x: 200, y: 240 },
]'''

MAP_TEMPLATE_SKELETON = '''\
// src/data/knowledge-maps/{slug}.ts
// ─────────────────────────────────────────────────────────────────────────────
// MAPA DE CONOCIMIENTO — {title}
// Template básico generado por cargar_materia.py
// Para generar con IA: asegurate de tener ANTHROPIC_API_KEY en el entorno
// ─────────────────────────────────────────────────────────────────────────────

import type {{ KnowledgeNode, KnowledgeEdge }} from './filosofia'

{module_nodes}

export const {CONST_PREFIX}_EDGES: KnowledgeEdge[] = [
  // ── Jerarquía módulo → hijos ──────────────────────────────────────────────
  // {{ id: 'e-m1-concepto1', source: 'mod-1', target: 'concepto1', type: 'hierarchy' }},

  // ── Conexiones cruzadas entre módulos ─────────────────────────────────────
  // {{ id: 'cx-a-b', source: 'concepto-a', target: 'concepto-b', type: 'cross' }},
]
'''


def generate_map_template(slug: str, n_modules: int) -> str:
    """Template vacío (fallback cuando no hay IA disponible)."""
    title        = slug.replace('-', ' ').title()
    const_prefix = slug.replace('-', '_').upper()

    module_lines = []
    for i in range(1, n_modules + 1):
        x = (i - 1) * 400 + 175
        module_lines.append(
            f"  {{ id: 'mod-{i}', label: 'Módulo {i}', type: 'module', "
            f"module_id: 'TODO-UUID-{i}', "
            f"description: 'Descripción del módulo {i}.', x: {x}, y: 30 }},"
        )

    module_nodes_str = MODULE_TEMPLATE.format(
        CONST_PREFIX=const_prefix,
        module_lines='\n'.join(module_lines),
    )

    return MAP_TEMPLATE_SKELETON.format(
        slug=slug,
        title=title,
        CONST_PREFIX=const_prefix,
        module_nodes=module_nodes_str,
    )


# ── Auto-registro en index.ts ─────────────────────────────────────────────────

def register_in_index(slug: str, const_prefix: str) -> bool:
    """
    Agrega el import y la entrada al MAP_REGISTRY en src/data/knowledge-maps/index.ts.
    Devuelve True si el archivo fue modificado.
    """
    index_path = _MAPS_DIR / 'index.ts'
    if not index_path.exists():
        print(f"  ⚠  No se encontró {index_path}. Agregá manualmente la entrada.")
        return False

    content = index_path.read_text(encoding='utf-8')

    # Clave TypeScript: con guiones necesita comillas
    key          = f"'{slug}'" if '-' in slug else slug
    import_line  = f"import {{ {const_prefix}_NODES, {const_prefix}_EDGES }} from './{slug}'"
    registry_line = f"  {key}: {{ nodes: {const_prefix}_NODES, edges: {const_prefix}_EDGES }},"

    # ¿Ya está registrado?
    already = (f"from './{slug}'" in content)
    if already:
        print(f"  ℹ  '{slug}' ya está en index.ts")
        return False

    changed = False
    lines   = content.split('\n')

    # 1. Agregar import después de la última línea de import existente
    last_import_idx = -1
    for i, line in enumerate(lines):
        if line.startswith('import '):
            last_import_idx = i
    if last_import_idx >= 0:
        lines.insert(last_import_idx + 1, import_line)
        changed = True
    else:
        lines.insert(0, import_line)
        changed = True

    content = '\n'.join(lines)

    # 2. Agregar entrada en MAP_REGISTRY (después de la línea de filosofía)
    marker = "  filosofia: { nodes: FILOSOFIA_NODES, edges: FILOSOFIA_EDGES },"
    if marker in content:
        pos     = content.index(marker) + len(marker)
        content = content[:pos] + '\n' + registry_line + content[pos:]
        changed  = True
    else:
        print(f"  ⚠  No se encontró el marcador en index.ts. Agregá manualmente:")
        print(f"       {registry_line}")

    if changed:
        index_path.write_text(content, encoding='utf-8')
        print(f"  ✓  Registrado en src/data/knowledge-maps/index.ts")

    return changed


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description='Carga completa de una materia: módulos + material de apoyo + mapa de conocimiento.'
    )
    parser.add_argument('--subject-slug',  required=True, help='Slug de la materia (ej: logica-matematica)')
    parser.add_argument('--pdf-modulos',   required=True, help='PDF con los módulos de la materia')
    parser.add_argument('--pdf-guia',      default=None,  help='PDF de la guía de estudio (opcional)')
    parser.add_argument('--pdf-examen',    default=None,  help='PDF del modelo de examen (opcional)')
    parser.add_argument('--titulo-guia',   default=None,  help='Título de la guía (default: "Guía de Estudio")')
    parser.add_argument('--titulo-examen', default=None,  help='Título del examen (default: "Modelo de Examen")')
    parser.add_argument('--n-modulos',     type=int, default=8,
                        help='Cantidad de módulos para el template básico si no hay IA (default: 8)')
    parser.add_argument('--skip-map',      action='store_true',
                        help='No generar el mapa de conocimiento')
    args = parser.parse_args()

    slug          = args.subject_slug
    const_prefix  = slug.replace('-', '_').upper()
    titulo_guia   = args.titulo_guia   or 'Guía de Estudio'
    titulo_examen = args.titulo_examen or 'Modelo de Examen'
    results: dict = {}

    print(f"\n{'═'*60}")
    print(f"  CARGANDO MATERIA: {slug.upper()}")
    print(f"{'═'*60}")

    # ── 1. Módulos ─────────────────────────────────────────────────────────────
    ok = run(
        [PYTHON, str(_SEED_MOD), '--pdf', args.pdf_modulos, '--subject-slug', slug],
        f'Módulos — {args.pdf_modulos}',
    )
    results['modulos'] = ok

    # ── 2. Guía de estudio ─────────────────────────────────────────────────────
    if args.pdf_guia:
        ok = run(
            [PYTHON, str(_SEED_MAT),
             '--pdf', args.pdf_guia, '--subject-slug', slug,
             '--type', 'guide', '--title', titulo_guia],
            f'Guía de estudio — {args.pdf_guia}',
        )
        results['guia'] = ok

    # ── 3. Modelo de examen ───────────────────────────────────────────────────
    if args.pdf_examen:
        ok = run(
            [PYTHON, str(_SEED_MAT),
             '--pdf', args.pdf_examen, '--subject-slug', slug,
             '--type', 'exam_model', '--title', titulo_examen, '--order-index', '2'],
            f'Modelo de examen — {args.pdf_examen}',
        )
        results['examen'] = ok

    # ── 4. Mapa de conocimiento ────────────────────────────────────────────────
    if not args.skip_map:
        map_file = _MAPS_DIR / f'{slug}.ts'

        print(f"\n{'─'*60}")
        print(f"▶  Mapa de conocimiento — {slug}")
        print(f"{'─'*60}")

        if map_file.exists():
            print(f"\n⚠  El mapa ya existe: {map_file.relative_to(_ROOT)}")
            results['mapa'] = '(ya existía — no se sobreescribió)'
        else:
            _MAPS_DIR.mkdir(parents=True, exist_ok=True)

            # Intentar generación con IA
            modules    = fetch_module_titles(slug)
            ts_content = generate_map_ai(slug, modules)

            ai_used = ts_content is not None
            if not ai_used:
                print("  ℹ  Usando template básico (sin IA).")
                ts_content = generate_map_template(slug, args.n_modulos)

            map_file.write_text(ts_content, encoding='utf-8')
            label = 'con IA' if ai_used else 'template básico'
            print(f"\n  ✓  Mapa generado ({label}): {map_file.relative_to(_ROOT)}")

            # Auto-registrar en index.ts
            register_in_index(slug, const_prefix)

            results['mapa'] = str(map_file.relative_to(_ROOT))

    # ── Resumen ────────────────────────────────────────────────────────────────
    print(f"\n{'═'*60}")
    print(f"  RESUMEN — {slug.upper()}")
    print(f"{'═'*60}")

    for key, val in results.items():
        if isinstance(val, bool):
            icon = '✓' if val else '✗'
            print(f"  {icon}  {key}")
        else:
            print(f"  ℹ  {key}: {val}")

    ai_generated = results.get('mapa', '').endswith('.ts') and 'template básico' not in results.get('mapa', '')

    print(f"\n{'─'*60}")
    print("  PASOS PENDIENTES MANUALES:")
    print(f"{'─'*60}")

    if ai_generated:
        print(f"""
  1. REVISAR EL MAPA GENERADO
     └─ Archivo: src/data/knowledge-maps/{slug}.ts
     └─ Verificá que los nodos y conexiones sean correctos académicamente
     └─ Ajustá descripciones si es necesario
     └─ Podés agregar más nodos hijo o cross_edges

  2. QUIZZES (si no se cargaron aún):
     python scripts/seed_material_apoyo.py \\
       --subject-slug {slug} --type practice --pdf docs/...
""")
    else:
        print(f"""
  1. MAPA DE CONOCIMIENTO (template básico generado)
     └─ Archivo: src/data/knowledge-maps/{slug}.ts
     └─ Completar los module_id con los UUIDs reales:
        SELECT id, title FROM modules WHERE subject_id = (
          SELECT id FROM subjects WHERE slug = '{slug}'
        ) ORDER BY order_index;
     └─ Agregar nodos hijo (autores y conceptos) por módulo
     └─ Agregar conexiones cruzadas

     Para regenerar con IA (requiere ANTHROPIC_API_KEY):
     Borrar src/data/knowledge-maps/{slug}.ts y volver a ejecutar.

  2. QUIZZES (si no se cargaron aún):
     python scripts/seed_material_apoyo.py \\
       --subject-slug {slug} --type practice --pdf docs/...
""")


if __name__ == '__main__':
    main()
