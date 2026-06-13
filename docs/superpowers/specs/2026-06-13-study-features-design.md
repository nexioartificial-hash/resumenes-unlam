# Study Features Design — ResumenesUNLAM
**Fecha:** 2026-06-13  
**Estado:** Aprobado por usuario

---

## Resumen

Implementar 4 features de estudio en 3 sprints:

| Sprint | Feature | Tablas nuevas | Dependencias nuevas |
|--------|---------|--------------|-------------------|
| 1A | Modo Repaso Rápido | ninguna | ninguna |
| 1B | Predictor de Nota | ninguna | ninguna |
| 2 | Flashcards SM-2 | `flashcard_reviews` | ninguna |
| 3 | Mapa de Conocimiento Visual | ninguna | `reactflow` |

---

## Contexto técnico

- **Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, Supabase (PostgreSQL + RLS)
- **`quiz_attempts`** ya guarda el campo JSONB `answers` con resultados por pregunta: `{ question_id, question, selected_index, correct_index, is_correct, options, explanation }`
- **No hay librería de gráficos instalada** — Sprint 1B usa SVG puro; Sprint 3 instala `reactflow`
- **Botón "QUIZ →"** en `SubjectContent.tsx` lleva al simulacro; agregar botones análogos para Repaso, Flashcards y Mapa

---

## Sprint 1A — Modo Repaso Rápido

### Objetivo
Mostrar al alumno las preguntas que más erró en sus simulacros anteriores, en formato flip card, sin guardar estado nuevo.

### Ruta
`/dashboard/[subject]/repaso`  
Archivo: `src/app/(platform)/dashboard/[subject]/repaso/page.tsx`

### API
**`GET /api/subjects/[slug]/repaso`**

Lógica:
1. Autenticar usuario
2. Fetch `quiz_attempts` del usuario para esa materia (todos los intentos, campo `answers` JSONB)
3. Desempaquetar cada `answers[]`, agrupar por `question_id`
4. Calcular `failure_rate = wrong_count / total_appearances` por pregunta
5. Ordenar DESC por `failure_rate`, limit 20
6. Enriquecer con datos actuales de `quiz_questions` (opciones, explicación)
7. Devolver array

Respuesta:
```ts
{
  questions: {
    id: string
    question: string
    options: string[]
    correct_index: number
    explanation: string | null
    failure_rate: number   // 0.0 – 1.0
    times_seen: number
  }[]
}
```

Si el usuario no tiene intentos previos → devolver preguntas aleatorias (fallback sin `failure_rate`).

### UI — `page.tsx` (client component)

**Pantalla inicio:**
- Título "REPASO INTELIGENTE"
- Subtítulo: "Las X preguntas que más te costaron"
- Botón INICIAR

**Pantalla flip card:**
- Frente: enunciado de la pregunta
- Dorso: opción correcta destacada + explicación
- Animación: CSS `rotateY(180deg)` con `transform-style: preserve-3d`
- Botones tras voltear: "No lo sabía" → siguiente | "Lo sabía" → marca como dominada y siguiente
- Barra de progreso superior (cards restantes)

**Pantalla resultado:**
- % de cards dominadas en esta sesión
- Botón "Repetir las que no dominé" | "Volver"

### Entrada desde SubjectContent
Agregar botón "REPASO →" en el header de `SubjectContent.tsx` junto a "QUIZ →".

---

## Sprint 1B — Predictor de Nota

### Objetivo
Mostrar al alumno su probabilidad estimada de aprobar el parcial, los módulos donde más falla, y la evolución histórica de sus simulacros.

### Ruta
Nuevo tab `'predictor'` en `SubjectContent.tsx` (tab junto a MÓDULOS y MATERIAL DE APOYO). Renderiza `<PredictorPanel subject_id={subject.id} />` como client component.

### API
**`GET /api/subjects/[slug]/predictor`**

Lógica:
1. Autenticar usuario
2. Fetch todos los `quiz_attempts` del usuario para esa materia, ORDER BY `attempted_at` ASC
3. Si < 1 intento → responder `{ no_data: true }`
4. **Historia:** mapear cada intento a `{ score, total, pct, attempted_at }`
5. **Promedio ponderado** (últimos 3 intentos): pesos [0.5, 0.3, 0.2] al más reciente
6. **Tendencia:** comparar avg(últimos 2) vs avg(anteriores 2) → "up" | "stable" | "down"
7. **Módulos débiles:** desempaquetar `answers` JSONB de últimos 3 intentos, cruzar `question_id` con `quiz_questions.module_id`, calcular failure_rate por módulo, JOIN con `modules.title`
8. Devolver todo

Respuesta:
```ts
{
  no_data?: boolean
  probability: number          // 0–100
  trend: 'up' | 'stable' | 'down'
  history: { pct: number; attempted_at: string }[]
  weak_modules: { module_id: string; title: string; failure_rate: number }[]
}
```

### UI — `PredictorPanel.tsx` (client component)

**Si no hay datos:** card con texto "Hacé al menos un simulacro para ver tu predicción".

**Si hay datos:**

1. **Gauge circular** (SVG puro):
   - Círculo de 240° de arco (semicírculo extendido)
   - `stroke-dashoffset` animado al % de probabilidad
   - Color: verde ≥60%, amarillo 40–59%, rojo <40%
   - Número grande en el centro: "73%"
   - Subtexto: "PROBABILIDAD DE APROBAR"

2. **Badge de tendencia** al lado del gauge:
   - ↑ Mejorando (verde) | → Estable (gris) | ↓ Bajando (rojo)

3. **Gráfico de evolución** (SVG puro, línea simple):
   - Eje X: fechas de los intentos
   - Eje Y: 0–100%
   - Línea del 60% punteada (umbral de aprobación)
   - Puntos clickeables con tooltip del score

4. **Módulos débiles:**
   - Lista de hasta 3 módulos con mayor failure_rate
   - Barra de progreso roja por módulo
   - Botón "Repasar" → navega a `/dashboard/[subject]/repaso` (en el futuro: filtrado por módulo)

---

## Sprint 2 — Flashcards con SM-2

### Objetivo
Sistema de repetición espaciada completo: cada pregunta tiene su propio intervalo de revisión calculado con el algoritmo SM-2. El alumno ve "X cards para revisar hoy" y la app agenda cuándo volver a mostrar cada una.

### Ruta
`/dashboard/[subject]/flashcards`  
Archivo: `src/app/(platform)/dashboard/[subject]/flashcards/page.tsx`

### Migración Supabase
```sql
CREATE TABLE flashcard_reviews (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id    UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  subject_id     UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  interval_days  INT NOT NULL DEFAULT 1,
  ease_factor    FLOAT NOT NULL DEFAULT 2.5,
  repetitions    INT NOT NULL DEFAULT 0,
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own flashcards"
  ON flashcard_reviews FOR ALL
  USING (auth.uid() = user_id);
```

### Algoritmo SM-2 (server-side)

```
Input: ease_factor, interval_days, repetitions, quality (0|3|5)

If quality < 3:
  repetitions = 0
  interval_days = 1
Else:
  If repetitions == 0: interval_days = 1
  Elif repetitions == 1: interval_days = 6
  Else: interval_days = round(interval_days * ease_factor)
  repetitions += 1
  ease_factor = max(1.3, ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

next_review_at = NOW() + interval_days days
```

### APIs

**`GET /api/subjects/[slug]/flashcards`**
- Fetch `flashcard_reviews` del usuario para esa materia donde `next_review_at <= NOW()`
- Si ninguna → `{ due: [], next_review_at: <próxima fecha> }`
- Si hay cards → `{ due: [{ review_id, question, options, correct_index, explanation }] }`
- **Inicialización idempotente:** en cada llamada, hacer upsert (ON CONFLICT DO NOTHING) de todas las `quiz_questions` publicadas de la materia en `flashcard_reviews` con valores default. Seguro de llamar múltiples veces — solo crea filas que no existen.

**`POST /api/subjects/[slug]/flashcards/review`**
- Body: `{ question_id: string, quality: 0 | 3 | 5 }`
- Aplica SM-2, upsert en `flashcard_reviews`
- Responde `{ next_review_at, interval_days }`

### UI — `page.tsx` (client component)

**Pantalla inicio:**
- "FLASHCARDS" título
- Card central: "X para revisar hoy" (grande) | "Próxima revisión: mañana (Y cards)" si no hay ninguna
- Botón INICIAR (disabled si no hay cards due)
- Barra de progreso global: cards nuevas / en revisión / dominadas

**Pantalla flip card:**
- Idéntica al modo repaso en apariencia
- Tras voltear: 3 botones con colores diferenciados:
  - 🔴 "No lo sabía" (quality=0)
  - 🟡 "Dudé" (quality=3)  
  - 🟢 "Lo sabía" (quality=5)
- Subtexto bajo cada botón: "Vuelve mañana" / "Vuelve en 3 días" / "Vuelve en 7 días"

**Pantalla fin de sesión:**
- "¡Sesión completa!" 
- Resumen: X dominadas, Y a reforzar
- Próxima revisión disponible en: [fecha]

---

## Sprint 3 — Mapa de Conocimiento Visual

### Objetivo
Grafo interactivo de conceptos y autores de la materia, coloreado según el dominio real del alumno. Dos niveles: módulos → conceptos/autores → relaciones cruzadas.

### Ruta
`/dashboard/[subject]/mapa`  
Archivo: `src/app/(platform)/dashboard/[subject]/mapa/page.tsx`

### Dependencia nueva
```bash
npm install reactflow
```

### Estructura de datos — `src/data/knowledge-maps/`

Un archivo TypeScript por materia con la definición estática del grafo:

```ts
// src/data/knowledge-maps/filosofia.ts
export const FILOSOFIA_MAP = {
  nodes: [
    // Módulos (nivel 1)
    { id: 'mod-1', label: 'Introducción', type: 'module', module_id: '<uuid>' },
    { id: 'mod-2', label: 'Epistemología', type: 'module', module_id: '<uuid>' },
    // ... 5 módulos

    // Conceptos/autores (nivel 2)
    { id: 'socrates',   label: 'Sócrates',    type: 'author',  parent: 'mod-1' },
    { id: 'logos',      label: 'Lógos',       type: 'concept', parent: 'mod-1' },
    { id: 'episteme',   label: 'Episteme',    type: 'concept', parent: 'mod-2' },
    { id: 'kant',       label: 'Kant',        type: 'author',  parent: 'mod-5' },
    // ... todos los nodos
  ],
  edges: [
    // Módulo → concepto
    { id: 'e1', source: 'mod-1', target: 'socrates' },
    // Relaciones cruzadas
    { id: 'e-kant-ilustracion', source: 'kant', target: 'ilustracion', type: 'cross' },
    { id: 'e-platon-socrates',  source: 'platon', target: 'socrates',  type: 'cross' },
    // ...
  ],
}
```

### API
**`GET /api/subjects/[slug]/mapa`**

Lógica:
1. Fetch `quiz_attempts` del usuario, desempaquetar `answers`, calcular failure_rate por `module_id`
2. Devolver `{ mastery: { [module_id]: number } }` (0.0–1.0)

La UI combina esto con el mapa estático para colorear los nodos.

### Colores de nodos

| Mastery | Color |
|---------|-------|
| ≥ 0.70  | Verde (`#4CAF50`) |
| 0.40–0.69 | Amarillo (`#FFC107`) |
| < 0.40  | Rojo (`#F44336`) |
| sin datos | Gris (`#9E9E9E`) |

### UI — `page.tsx` (server + client)

**Server component:** fetch mastery desde API, pasa como prop al client component.

**Client component `<KnowledgeMap />`:**
- `<ReactFlow>` con nodos y edges del mapa estático + colores de mastery
- Nodos de módulo: círculo grande con número
- Nodos de concepto: círculo pequeño
- Nodos de autor: círculo pequeño con ícono de persona
- Click en módulo: expande/colapsa sus hijos (toggle visibility)
- Click en concepto/autor: panel lateral derecho con:
  - Nombre y descripción breve
  - Mastery % (si aplica)
  - Botón "Ir al módulo" → navega al módulo correspondiente
- Botón "Reset vista" en esquina

### Scope inicial
Implementar solo para Filosofía en Sprint 3. El sistema está diseñado para agregar nuevas materias agregando un archivo en `src/data/knowledge-maps/`.

---

## Cambios en SubjectContent.tsx

Agregar 2 botones en el header (junto a QUIZ → e IA →):

```tsx
<button onClick={() => router.push(`/dashboard/${slug}/repaso`)}>
  REPASO →
</button>
<button onClick={() => router.push(`/dashboard/${slug}/flashcards`)}>
  CARDS →
</button>
<button onClick={() => router.push(`/dashboard/${slug}/mapa`)}>
  MAPA →
</button>
```

Agregar tab `'predictor'` en el sistema de tabs existente.

---

## Orden de implementación

1. `GET /api/subjects/[slug]/repaso` + página repaso
2. `GET /api/subjects/[slug]/predictor` + `PredictorPanel.tsx` + tab en SubjectContent
3. Migración SQL `flashcard_reviews` + APIs flashcards + página flashcards
4. `npm install reactflow` + mapa estático de Filosofía + página mapa

Cada item es deployable de forma independiente.
