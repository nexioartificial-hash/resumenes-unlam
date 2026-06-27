# Metodología — Auditoría y reconstrucción fiel multiagente

Cómo se reconstruyó el material de las materias (Historia Argentina, Biología, Biociencias, Filosofía, Contabilidad) para dejarlo **fiel al PDF y premium**, usando workflows de agentes. Acompaña a la skill `auditoria-fiel`.

---

## 1. El problema

La extracción original (`get_text("text")`) garantiza paridad de palabras pero **destruye la estructura visual** del PDF:

- Tablas/cuadros → aplastados a texto plano.
- Negritas → perdidas (solo sobrevivían algunos `##`).
- Palabras pegadas por salto de línea/columna (`deRivadavia`, `enAmérica`).
- A veces contenido que vive **dentro de una imagen** (no en la capa de texto) → omitido.

La paridad de palabras NO garantiza paridad de **renderizado** ni calidad premium. Eso exige mirar la página real.

## 2. Dos estrategias

### 2a. Auditoría find/replace (cambios quirúrgicos)
Cuando el contenido está bien salvo artefactos puntuales (caso Historia, primera pasada). Los agentes devuelven **pares find/replace verbatim** justificados contra el PDF; un verificador valida que el `find` exista y que el `replace` sea fiel; se aplican programáticamente. Ventaja: trazable, no toca lo que ya está bien, salida acotada. Limitación: no reconstruye tablas ni restaura negritas masivas.

### 2b. Reconstrucción multimodal (la principal)
Cuando hay que **rehacer la forma** (tablas, negritas, estructura). Cada agente **lee la página renderizada (PNG)** además del texto plano, y reescribe el módulo como markdown premium. La imagen es la "verdad visual"; el texto plano es la "verdad de palabras". Es la que se usó en las 4 materias con cuadros/negritas.

**Por qué multimodal y no heurístico**: `PyMuPDF.find_tables()` es poco confiable en estos PDFs (extrae las tablas reales con celdas vacías/columnas de más, y detecta viñetas `● ○` como tablas falsas). Un agente que ve la imagen distingue tabla real de lista.

## 3. El pipeline de agentes: generar → verificar

Patrón central (lo provee `Workflow` con `pipeline()`):

```
ITEM (módulo / chunk / doc)
   │
   ├─ Etapa 1: GENERADOR ──────► borrador markdown
   │     lee imagen+texto+cuerpo actual
   │
   └─ Etapa 2: VERIFICADOR ADVERSARIAL ──► corrected_markdown + issues
         re-abre las imágenes, compara, corrige, pule
```

- Es un **pipeline, no una barrera**: cada módulo fluye por sus 2 etapas independientemente (el módulo 1 se verifica mientras el módulo 7 todavía se genera). Wall-clock ≈ la cadena más lenta, no la suma.
- El **verificador es adversarial**: su trabajo es *encontrar fallas*, no aprobar. En la práctica atrapó: tablas inventadas (Biociencias M9, Contabilidad examen), regresiones factuales que metió el primer editor (Biociencias guía: Krebs 1 ATP→1 GTP; Filosofía examen: Marx "4 dimensiones"), imágenes borradas (Biociencias M2 Figura 5), omisiones de párrafos (Filosofía M3 Nietzsche; Contabilidad M5/M7), errores de dato (Biología `770S`→`70S`).
- El verificador **devuelve el texto final** (`corrected_markdown`), así su corrección queda incorporada sin una pasada extra.

### Variante "find → verificar" (estrategia 2a)
Mismo pipeline pero la etapa 1 devuelve `issues:[{find, replace, evidencia_pdf}]` y la etapa 2 valida cada uno contra el PDF (existe el `find`, el `replace` es fiel, no borra contenido) + hace su propia pasada por omisiones.

## 4. Distribución de los agentes

### Unidad de trabajo
- **Módulo** si es chico (≤ ~8 págs) → 1 generador + 1 verificador.
- **Chunk de páginas** (≤7-8) si el módulo es grande → se trocea y se ensambla después por orden de página. Se usó en Historia (módulo 4 de 28 págs) y Filosofía.
- **Documento** (guía, examen) → 1+1.

### Conteo real por materia

| Materia | Estrategia resumen | Agentes resumen | Guía+Examen | Extra |
|---|---|---|---|---|
| Historia Argentina | find/replace (10 ítems) + verify | 20 | examen expandido: 8 gen + 8 verify = 16 | — |
| Biología | multimodal, 10 módulos | 20 | 4 | — |
| Biociencias | multimodal, 10 módulos | 20 | 4 | Actividades faltantes (5 mód): 5 gen + 5 verify = 10 |
| Filosofía | multimodal, 9 chunks | 18 | 4 | — |
| Contabilidad | multimodal, 7 módulos (×2 por re-run de bordes) | 14 (+14 re-run) | 4 | — |

Regla general: **resumen = 2 × (nº de módulos o chunks)**; guía+examen = 4. El cap de concurrencia del runtime es ~min(16, cores−2), así que los ~20 agentes corren en tandas; el total por materia rondó 24-40 agentes y 0,5-1,3M tokens.

### Esqueleto del workflow (multimodal)

```js
const MODS = [{ mod:1, pages:[2,3,4,5] }, /* ... */]
const results = await pipeline(
  MODS,
  // Etapa 1: generar
  (m) => agent(promptGenerar(m), { label:`build:m${m.mod}`, phase:'Reconstruir' }),
  // Etapa 2: verificar (con schema → devuelve objeto validado)
  (draft, m) => agent(promptVerificar(m, draft),
                      { label:`verify:m${m.mod}`, phase:'Verificar', schema: VSCHEMA })
)
```

Cada `agent()` recibe **rutas de archivo** (las abre con `Read`), no el contenido inline: imágenes `_img/x_pgNN.png`, textos `_txt/x_pgNN.txt`, cuerpo actual `estado/db_modulo_NN.md`. Eso mantiene los prompts chicos y deja que el agente maneje módulos grandes.

## 5. Capas de verificación (defensa en profundidad)

1. **Verificador adversarial** (en el workflow): fidelidad visual, tablas, negritas, factual.
2. **Paridad global automática** (`assemble_*.py`): word-set normalizado (≥6 chars, sin tildes) de **todo el PDF** vs **todos los módulos juntos**. Robusta a límites de mitad de página. Los "faltantes" se filtran por **cobertura de prefijo** (un fragmento de columna `teinas` está cubierto por `proteinas`) → los reales fueron siempre 0 o typos corregidos.
3. **Conteo de imágenes**: rebuild == original por módulo.
4. **Duplicación de bordes**: cada tema que cae en una página compartida debe estar en un solo módulo.
5. **Verificación en vivo**: re-fetch de Supabase post-upload (tabla presente, `## ` sueltos = 0, figura accesible en Storage con HTTP 200).

## 6. Preservación de imágenes

- Las imágenes ya cargadas se referencian como `![alt](https://…/storage/v1/object/public/module-images/{subject_id}/{xref}.{ext})`. El generador **debe conservarlas exactas**; el verificador reporta `imagenes_preservadas` y se chequea el conteo.
- **Imágenes nuevas** (p. ej. las Actividades de Biociencias que no estaban cargadas): se renderiza la **región** de la figura desde la página (`page.get_pixmap(matrix=2x, clip=rect)`, fondo blanco de la página) y se sube a `module-images/{subject_id}/{xref}.png` (bucket `module-images`, header `x-upsert: true`), luego se inserta con su URL pública.

## 7. Gotchas que costaron una re-corrida

- **Límites de módulo a mitad de página** (Contabilidad): los títulos "MÓDULO N" no estaban al tope de página, así que recortar por borde perdía el final de un módulo y duplicaba en el siguiente. Solución: rangos con **páginas-borde compartidas** + instrucción de **alcance** ("el cuerpo actual define dónde empieza y termina este módulo; ignorá en las páginas-borde lo del módulo vecino"). Se detecta escaneando en qué línea de la página aparece el marcador `MÓDULO`.
- **`parseSections` descarta lo previo al primer `## `**: el renderer de módulos parte por `## ` y tira lo que está antes. Por eso **todo heading de módulo va en `###`** (render de cuerpo entero). Los `content_items` no sufren esto (otro renderer).
- **El PDF a veces tiene typos** (`saboteda`, `Inautación`, `Eporozoos`): premium los corrige (no es violación de paridad). Pero hay que distinguirlos de palabras correctas — el verificador decide mirando.
- **El PDF puede tener páginas duplicadas** (Biociencias 94=95): incluir el contenido una sola vez.
- **El "examen" puede no ser transcripción del PDF**: en Historia el examen tenía respuestas generadas (no estaban en el PDF de consignas); en Contabilidad el PDF tenía solo consignas (no resoluciones). No inventar lo que el PDF no trae; decidir con el usuario si se expande.
- **Límite de sesión**: el Workflow se reanuda con `resumeFromRunId`; los agentes ya completados vuelven de caché.

## 8. Orden de operaciones por materia (checklist)

1. Relevar PDFs + Supabase (modules, content_items, summary oculto).
2. Diagnóstico: límites de módulo (¿mitad de página?), negritas, imágenes, tablas.
3. `prep_*.py`: dump (respaldo) + render páginas (img+txt) + recortes por módulo.
4. Workflow reconstrucción (gen → verify) → leer veredictos.
5. `assemble_*.py`: normalizar `###` + paridad global + imágenes + duplicación.
6. Revisar muestras (sobre todo tablas/figuras).
7. `upload_*.py`: PATCH módulos + regenerar summary oculto.
8. `seed_embeddings.py --subject <slug>` (re-indexar RAG).
9. Guía/examen: reconstruir (si hay PDF) o auditar contra el resumen.
10. Verificación en vivo.

Todo el scratch de cada materia queda en `scripts/_audit_<materia>/` y el estado previo (rollback) en su `estado/`.
