import os, requests
try:
    from dotenv import load_dotenv
    load_dotenv(".env.local")
except ImportError:
    pass

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://dtbouycelkjgyddpftir.supabase.co")
KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")
HEADERS = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}
SUBJECT_ID = "7697c0de-2478-4d50-9e43-0eedb07d8c44"

GUIA_BODY = """## Cómo usar esta guía

Leé cada módulo completo antes de usar las preguntas orientadoras. Los **conceptos en negrita** son los más frecuentes en los parciales. El objetivo es que puedas responder cada pregunta sin mirar el resumen.

---

## Módulo 1 — Salud, Ambiente y Sociedad

### Conceptos clave

- **Salud (OMS/OPS)**: estado de completo bienestar físico, mental y social — no solo ausencia de enfermedad. La OPS amplía la definición incorporando el entorno social y ambiental como determinantes.
- **Ciclo económico de la enfermedad**: modelo que explica cómo la pobreza genera condiciones de riesgo sanitario (hacinamiento, desnutrición, falta de acceso), lo que produce más enfermedad y más pobreza. Es un ciclo retroalimentado.
- **Pensamiento mágico**: atribución de causas sobrenaturales a fenómenos naturales (enfermedades, fenómenos climáticos). Se opone al pensamiento científico y puede retrasar el diagnóstico y tratamiento.
- **Adaptación diferencial**: distintos organismos o poblaciones responden de manera distinta ante el mismo factor ambiental según su genética, historia evolutiva o condiciones de vida.
- **Agroquímicos**: sustancias químicas (pesticidas, herbicidas, fertilizantes) usadas en agricultura. Su impacto en la salud incluye intoxicaciones agudas y efectos crónicos (cáncer, alteraciones hormonales) por exposición prolongada.
- **Determinantes sociales de la salud**: factores no biológicos que inciden en la salud: ingresos, educación, vivienda, acceso a servicios. Explican las desigualdades en salud entre grupos sociales.

### Preguntas orientadoras

1. ¿Por qué la definición de salud de la OMS es considerada un avance respecto a la simple ausencia de enfermedad?
2. ¿Cómo funciona el ciclo económico de la enfermedad? ¿Por qué es un ciclo y no una causa lineal?
3. ¿En qué se diferencia el pensamiento mágico del pensamiento científico frente a una epidemia?
4. ¿Qué relación hay entre los agroquímicos y los determinantes sociales de la salud en comunidades rurales?
5. ¿Por qué la adaptación diferencial es relevante para entender la respuesta de distintas poblaciones a una misma enfermedad?
6. ¿Puede existir bienestar social sin bienestar ambiental? Fundamentá con ejemplos del módulo.

---

## Módulo 2 — Biología como Ciencia

### Conceptos clave

- **Teoría celular**: postulada por Schleiden (1838, plantas), Schwann (1839, animales) y Virchow (1858, "toda célula proviene de otra célula"). Establece que la célula es la unidad estructural y funcional de todo ser vivo.
- **Mecanicismo**: corriente que interpreta los organismos como máquinas gobernadas por leyes físico-químicas, sin necesidad de fuerzas vitales. Descartés y Newton son referentes.
- **Vitalismo**: posición opuesta al mecanicismo; sostiene que los seres vivos poseen una "fuerza vital" irreducible a la química. Fue superada experimentalmente en el siglo XIX.
- **Homeostasis**: capacidad del organismo de mantener su ambiente interno estable frente a cambios externos. Ejemplo: regulación de temperatura corporal, pH sanguíneo.
- **Autopoiesis**: (Maturana y Varela) propiedad de los seres vivos de producirse y regenerarse a sí mismos. El sistema vivo construye sus propios componentes.
- **Propiedades emergentes**: características que surgen en niveles de organización superiores y no pueden predecirse a partir de las partes por separado. La conciencia emerge del sistema nervioso; la vida emerge de la célula.
- **Proyecto Genoma Humano**: iniciativa internacional (1990-2003) que secuenció los ~3.000 millones de pares de bases del ADN humano. Abrió la era de la genómica y la medicina personalizada.

### Preguntas orientadoras

1. ¿Cuál fue el aporte específico de cada uno de los tres autores de la teoría celular?
2. ¿Por qué el experimento de síntesis de urea por Wöhler (1828) fue un golpe al vitalismo?
3. ¿En qué se diferencia homeostasis de autopoiesis?
4. ¿Por qué la vida es considerada una propiedad emergente?
5. ¿Cómo el Proyecto Genoma Humano cambió la visión de la biología como ciencia?
6. ¿Puede el mecanicismo explicar la autopoiesis? ¿Por qué sí o por qué no?

---

## Módulo 3 — Química de la Vida

### Conceptos clave

- **Bioelementos**: elementos químicos presentes en los seres vivos. Los primarios (C, H, O, N, S, P) forman el 99% de la materia viva. El carbono es central por su capacidad de formar cadenas y estructuras complejas.
- **Enlace iónico**: transferencia de electrones entre átomos de distinta electronegatividad. Forma sales como el NaCl. Importante en la conducción nerviosa (Na⁺, K⁺, Ca²⁺).
- **Enlace covalente**: compartición de electrones. Forma la mayoría de las moléculas orgánicas. Puede ser polar (C-O) o apolar (C-H).
- **Puente de hidrógeno** (puente H): interacción entre un H unido a O o N y otro átomo electronegativo. Fundamental para la estructura del agua, del ADN (entre bases) y de las proteínas (estructura secundaria).
- **pH y buffer**: pH = -log[H⁺]. Escala 0-14 (7 = neutro). Los buffers o tampones son sistemas que resisten cambios de pH. En sangre: sistema bicarbonato (HCO₃⁻/CO₂), mantiene pH entre 7,35 y 7,45.
- **ATP (adenosín trifosfato)**: moneda energética universal. Libera energía al hidrolizarse el tercer fosfato (ATP → ADP + Pi + ~30 kJ/mol). Se sintetiza en la mitocondria por fosforilación oxidativa.
- **Desnaturalización proteica**: pérdida de la estructura tridimensional (3° o 4°) de una proteína por calor, pH extremo o solventes. Implica pérdida de función. No siempre rompe los enlaces peptídicos.
- **Modelo de Watson y Crick (1953)**: doble hélice del ADN con apareamiento específico de bases (A-T con 2 puentes H; G-C con 3 puentes H). Publicado en Nature, basado en cristalografía de Rosalind Franklin.

### Preguntas orientadoras

1. ¿Por qué el carbono es el elemento fundamental de la química orgánica?
2. ¿En qué situaciones fisiológicas el pH puede cambiar peligrosamente y qué mecanismos lo regulan?
3. ¿Qué diferencia hay entre desnaturalización y hidrólisis de una proteína?
4. ¿Por qué el ATP es llamado "moneda energética" y no "reserva energética"?
5. ¿Cómo el apareamiento específico de bases (A-T, G-C) garantiza la fidelidad en la replicación del ADN?
6. ¿Qué rol juegan los puentes de hidrógeno en la estructura del ADN y de las proteínas?

---

## Módulo 4 — La Célula

### Conceptos clave

- **Modelo del mosaico fluido** (Singer y Nicolson, 1972): la membrana plasmática es una bicapa lipídica fluida con proteínas que se mueven lateralmente. Los lípidos se organizan con las colas hidrofóbicas hacia adentro y las cabezas hidrofílicas hacia afuera.
- **Glucocáliz**: capa de carbohidratos unida a proteínas y lípidos de la membrana. Funciona en reconocimiento celular, adhesión y protección.
- **Teoría endosimbiótica** (Lynn Margulis, 1967): mitocondrias y cloroplastos son prokariotas que fueron engullidos sin ser digeridos hace ~2.000 millones de años. Evidencia: tienen ADN circular propio, ribosomas 70S y se dividen por fisión binaria.
- **Retículo endoplasmático rugoso (RER)**: membrana con ribosomas. Sintetiza proteínas destinadas a secreción, lisosomas o membrana plasmática.
- **Retículo endoplasmático liso (REL)**: sin ribosomas. Síntesis de lípidos, metabolismo de lípidos y desintoxicación (hígado).
- **Aparato de Golgi**: sistema de cisternas (cis → trans) que modifica, clasifica y empaqueta proteínas en vesículas. Funciona como "oficina postal" de la célula.
- **Lisosomas**: vesículas con enzimas hidrolíticas (pH 5). Digieren organelas dañadas (autofagia) y material externo (heterofagia). Su disfunción causa enfermedades de almacenamiento lisosómico.
- **Enfermedad de Tay-Sachs**: déficit de la enzima hexosaminidasa A → acumulación de gangliósido GM2 en neuronas → daño neuronal progresivo. Ejemplo de enfermedad lisosómica.

### Preguntas orientadoras

1. ¿Por qué el modelo del mosaico fluido reemplazó al modelo del sandwich lipídico?
2. ¿Qué evidencias apoyan la teoría endosimbiótica de Lynn Margulis?
3. ¿Cuál es la diferencia funcional entre RER y REL?
4. ¿Cómo se relacionan el RER, el aparato de Golgi y la secreción de proteínas?
5. ¿Por qué los lisosomas necesitan un pH ácido para funcionar?
6. ¿Qué es la enfermedad de Tay-Sachs y cómo ilustra la función de los lisosomas?

---

## Módulo 5 — Metabolismo Celular

### Conceptos clave

- **Glucólisis**: primera etapa del metabolismo de la glucosa. Ocurre en el citoplasma. Rompe la glucosa (6C) en dos piruvatos (3C). Rendimiento neto: 2 ATP + 2 NADH. Anaeróbica.
- **Ciclo de Krebs** (ciclo del ácido cítrico): ocurre en la matriz mitocondrial en presencia de O₂. Cada vuelta produce: 3 NADH + 1 FADH₂ + 1 GTP. 2 vueltas por molécula de glucosa. No produce ATP directamente.
- **Fosforilación oxidativa** (cadena de transporte de electrones): ocurre en la membrana interna mitocondrial. Los electrones de NADH y FADH₂ generan un gradiente de H⁺ que impulsa la ATP sintasa. Rendimiento: ~32-34 ATP por glucosa.
- **Fermentación láctica**: vía anaeróbica. El piruvato se convierte en lactato por la lactato deshidrogenasa. Regenera NAD⁺ para continuar la glucólisis. Ocurre en músculo bajo ejercicio intenso y en bacterias lácticas.
- **Enzimas**: catalizadores biológicos de naturaleza proteica. Disminuyen la energía de activación sin consumirse. Específicas (llave-cerradura o inducción por ajuste). Reguladas por temperatura, pH, inhibidores.
- **Metabolismo**: conjunto de todas las reacciones químicas del organismo. El anabolismo construye moléculas complejas (gasta ATP); el catabolismo las degrada (libera ATP).

### Preguntas orientadoras

1. ¿Por qué la glucólisis puede ocurrir sin oxígeno pero el ciclo de Krebs no?
2. ¿Qué diferencia hay entre el rendimiento de ATP en condiciones aeróbicas vs. anaeróbicas?
3. ¿Cuál es la función del NAD⁺ en la glucólisis y por qué la fermentación láctica lo regenera?
4. ¿Por qué decimos que el ciclo de Krebs no produce ATP directamente, pero es esencial para producirlo?
5. ¿Cómo regulan las enzimas la velocidad de las reacciones metabólicas?
6. ¿Qué pasa con el piruvato en presencia y en ausencia de oxígeno?

---

## Módulo 6 — Transporte Celular

### Conceptos clave

- **Difusión simple**: movimiento de moléculas de mayor a menor concentración (a favor del gradiente) sin gasto de energía. Moléculas pequeñas y no polares (O₂, CO₂, ácidos grasos).
- **Difusión facilitada**: igual dirección (favor del gradiente), pero requiere proteínas de canal o transportadoras. Glucosa, aminoácidos, iones. No gasta ATP.
- **Ósmosis**: difusión del agua a través de una membrana semipermeable desde solución hipotónica (menos soluto) a hipertónica (más soluto). Esencial para turgencia celular y equilibrio hídrico.
- **Bomba Na⁺/K⁺**: proteína transportadora activa. Por cada ciclo usa 1 ATP para expulsar 3 Na⁺ y entrar 2 K⁺. Mantiene el potencial de membrana (negativo interior) esencial para la conducción nerviosa.
- **Cotransporte**: transporta dos sustancias simultáneamente. Si van en el mismo sentido: simporte (glucosa + Na⁺ en intestino). Si van en sentido contrario: antiporte (Na⁺/H⁺).
- **Endocitosis**: la célula engloba material externo formando vesículas. La clatrina es una proteína que recubre las vesículas de endocitosis mediada por receptor. Fagocitosis (sólidos), pinocitosis (líquidos).
- **Exocitosis**: las vesículas se fusionan con la membrana y liberan contenido al exterior. Esencial para secreción de hormonas, neurotransmisores y enzimas digestivas.

### Preguntas orientadoras

1. ¿En qué se diferencia la difusión simple de la difusión facilitada?
2. ¿Por qué la bomba Na⁺/K⁺ es un transporte activo y no pasivo?
3. ¿Qué sucede con una célula animal si la colocamos en una solución hipertónica?
4. ¿Cuál es el rol de la clatrina en la endocitosis?
5. ¿Por qué la bomba Na⁺/K⁺ es esencial para la conducción nerviosa?
6. ¿Cómo se relacionan exocitosis y la secreción de neurotransmisores en la sinapsis?

---

## Módulo 7 — Síntesis de Proteínas

### Conceptos clave

- **Código genético**: relación entre tripletes de bases (codones) y aminoácidos. Es redundante (varios codones para el mismo aminoácido), no ambiguo (un codón = un solo aminoácido), universal (igual en todos los seres vivos) y no superpuesto.
- **Transcripción**: síntesis de ARNm a partir del ADN. La ARN polimerasa lee el molde 3'→5' y sintetiza el ARNm 5'→3'. Ocurre en el núcleo (eucariotas).
- **Traducción**: síntesis de proteínas en ribosomas. El ARNm es leído por el ribosoma en codones; el ARNt trae el aminoácido correspondiente mediante su anticodón. Produce la cadena polipeptídica.
- **ARN mensajero (ARNm)**: copia del gen que lleva la información al ribosoma.
- **ARN de transferencia (ARNt)**: molécula en trébol que reconoce el codón del ARNm con su anticodón y lleva el aminoácido correspondiente.
- **Mutaciones puntales**: cambio de una sola base. Ejemplo: anemia falciforme (mutación en el gen de la hemoglobina: GAG → GTG; ácido glutámico → valina). Altera la forma del glóbulo rojo.
- **Mutaciones inducidas vs. espontáneas**: espontáneas ocurren sin causa externa (errores de replicación); inducidas son causadas por agentes mutagénicos (radiación UV, agentes químicos).

### Preguntas orientadoras

1. ¿Qué significa que el código genético es redundante pero no ambiguo?
2. ¿Cuál es la diferencia entre transcripción y traducción? ¿Dónde ocurre cada una?
3. ¿Cuál es el rol del ARNt en la traducción y cómo "reconoce" el codón correcto?
4. ¿Cómo una mutación puntual en el gen de la hemoglobina produce anemia falciforme?
5. ¿Todas las mutaciones son perjudiciales? ¿Por qué sí o por qué no?
6. ¿Por qué la universalidad del código genético es evidencia de evolución común?

---

## Módulo 8 — Reproducción Celular

### Conceptos clave

- **Ciclo celular**: G1 (crecimiento) → S (replicación del ADN) → G2 (preparación) → M (mitosis + citocinesis). En G1, S y G2 hay puntos de control que pueden detener el ciclo si hay daño en el ADN.
- **Replicación semiconservativa**: cada hebra del ADN sirve de molde. Resultado: 2 moléculas de ADN, cada una con una hebra original y una nueva. Demostrado por Meselson y Stahl (1958).
- **Mitosis**: división celular que produce 2 células hijas genéticamente idénticas a la madre (2n → 2n). Etapas: profase, metafase, anafase, telofase. Función: crecimiento y reparación de tejidos.
- **Meiosis**: produce 4 células haploides (n) genéticamente distintas. Dos divisiones (meiosis I y II). Ocurre en gónadas. Función: producción de gametos.
- **Crossing-over** (entrecruzamiento): intercambio de segmentos entre cromátidas no hermanas en profase I de la meiosis. Genera variabilidad genética.
- **Citocinesis**: división del citoplasma tras la mitosis. En células animales: anillo contráctil de actina-miosina. En vegetales: placa celular de Golgi.

### Preguntas orientadoras

1. ¿Por qué la replicación es semiconservativa y no conservativa ni dispersiva?
2. ¿En qué se diferencia la mitosis de la meiosis en cuanto a número de células producidas y ploidía?
3. ¿Cuál es la importancia del crossing-over para la variabilidad genética?
4. ¿Qué sucede si los puntos de control del ciclo celular fallan?
5. ¿Por qué la meiosis produce gametos y la mitosis no?
6. ¿Cómo se divide el citoplasma en células animales vs. vegetales?

---

## Módulo 9 — Genética

### Conceptos clave

- **Leyes de Mendel**: 1ª Ley (segregación): los alelos se separan en la formación de gametos. 2ª Ley (distribución independiente): genes de distintos cromosomas se combinan al azar. 3ª Ley (dominancia): el alelo dominante se expresa sobre el recesivo en heterocigotos.
- **Codominancia**: ambos alelos se expresan simultáneamente en el fenotipo. Ejemplo: grupo sanguíneo AB (alelos IA e IB codominantes).
- **Herencia ligada al sexo**: genes ubicados en el cromosoma X (o Y). En humanos, las hembras (XX) pueden ser portadoras; los machos (XY) expresan el rasgo si tienen el alelo en su único X. Ejemplos: hemofilia, daltonismo.
- **Mutaciones germinales**: ocurren en células reproductoras (gametos). Se heredan a la descendencia.
- **Mutaciones somáticas**: ocurren en células somáticas (del cuerpo). No se heredan, pero pueden causar cáncer.
- **Trisomía 21 (Síndrome de Down)**: presencia de un cromosoma 21 extra (47 cromosomas). Causa: no disyunción en meiosis. Presenta rasgos físicos característicos y discapacidad intelectual variable.

### Preguntas orientadoras

1. ¿Por qué los alelos se separan en la formación de los gametos? ¿Qué proceso celular lo explica?
2. ¿En qué se diferencia la codominancia de la dominancia incompleta?
3. ¿Por qué la hemofilia afecta principalmente a varones?
4. ¿Qué diferencia hay entre una mutación germinal y una somática en cuanto a su transmisión?
5. ¿Cómo se produce la Trisomía 21 y por qué aumenta el riesgo con la edad materna?
6. ¿En qué situaciones las leyes de Mendel no se cumplen? Mencioná al menos un caso.

---

## Módulo 10 — Tejidos, Sistemas y Nutrición

### Conceptos clave

- **Tejido epitelial**: reviste superficies y cavidades. Células muy juntas, sin vasos sanguíneos. Funciones: protección, secreción, absorción.
- **Tejido conectivo**: sostén y unión. Abundante matriz extracelular. Incluye hueso, cartílago, sangre, tejido adiposo.
- **Tejido muscular**: contráctil. Tres tipos: esquelético (voluntario, estriado), cardíaco (involuntario, estriado), liso (involuntario, no estriado).
- **Tejido nervioso**: comunicación eléctrica y química. Compuesto por neuronas y neuroglía.
- **Neurona**: unidad funcional del sistema nervioso. Partes: soma (cuerpo celular, núcleo), axón (conduce impulso hacia afuera), dendritas (reciben señales). El axón puede estar cubierto por mielina.
- **Neuroglía**: células de sostén del sistema nervioso. Astrocitos (barrera hematoencefálica), oligodendrocitos (mielina en SNC), células de Schwann (mielina en SNP), microglía (inmunidad del SNC).
- **Nutrición vs. alimentación**: alimentación es el acto de ingerir alimentos (voluntario, consciente). Nutrición es el proceso fisiológico de aprovechamiento de los nutrientes (involuntario). Se puede comer mal y estar mal nutrido.
- **Sistemas de nutrición**: digestivo (absorción de nutrientes), respiratorio (intercambio de gases), circulatorio (transporte) y excretor (eliminación de desechos). Son interdependientes.

### Preguntas orientadoras

1. ¿Por qué el tejido epitelial no tiene vasos sanguíneos y cómo recibe nutrientes?
2. ¿Cuál es la diferencia entre los tres tipos de tejido muscular?
3. ¿Cuál es la función de la mielina en el axón y qué enfermedades se asocian a su pérdida?
4. ¿En qué se diferencia alimentación de nutrición? Dá un ejemplo donde la diferencia es importante.
5. ¿Cómo se relacionan los 4 sistemas de nutrición entre sí?
6. ¿Qué papel cumple la neuroglía y por qué no es solo un "tejido de relleno"?

---

## Cuadro comparativo — Procesos metabólicos

| Proceso | Localización | O₂ requerido | ATP producido | Producto final |
|---------|-------------|--------------|---------------|----------------|
| **Glucólisis** | Citoplasma | No | 2 ATP neto | 2 Piruvato + 2 NADH |
| **Ciclo de Krebs** | Matriz mitocondrial | Sí | 2 GTP | CO₂ + NADH + FADH₂ |
| **Fosforilación oxidativa** | Membrana interna mit. | Sí | ~32-34 ATP | H₂O |
| **Fermentación láctica** | Citoplasma | No | 0 (recicla NAD⁺) | Lactato |

---

## Cuadro comparativo — Tipos de transporte celular

| Tipo | Energía | Dirección | Proteína | Ejemplo |
|------|---------|-----------|----------|---------|
| **Difusión simple** | No | Favor gradiente | No | O₂, CO₂ |
| **Difusión facilitada** | No | Favor gradiente | Sí (canal/transportador) | Glucosa, iones |
| **Transporte activo** | Sí (ATP) | Contra gradiente | Sí (bomba) | Bomba Na⁺/K⁺ |
| **Endocitosis** | Sí | Entrada | Clatrina | Fagocitosis |
| **Exocitosis** | Sí | Salida | Vesícula | Secreción hormonal |

---

## Cuadro comparativo — Mitosis vs. Meiosis

| Aspecto | Mitosis | Meiosis |
|---------|---------|---------|
| **Células producidas** | 2 | 4 |
| **Ploidía** | 2n → 2n | 2n → n |
| **Genéticamente** | Idénticas a la madre | Distintas (variabilidad) |
| **Divisiones** | 1 | 2 (I y II) |
| **Ocurre en** | Células somáticas | Gónadas (gametos) |
| **Crossing-over** | No | Sí (profase I) |
| **Función** | Crecimiento y reparación | Reproducción sexual |

---

## Cuadro comparativo — Autores y teorías clave

| Autor/es | Año | Aporte |
|----------|-----|--------|
| **Schleiden** | 1838 | Células en plantas |
| **Schwann** | 1839 | Células en animales |
| **Virchow** | 1858 | "Toda célula de otra célula" |
| **Singer y Nicolson** | 1972 | Modelo mosaico fluido |
| **Lynn Margulis** | 1967 | Teoría endosimbiótica |
| **Watson y Crick** | 1953 | Estructura doble hélice ADN |
| **Meselson y Stahl** | 1958 | Replicación semiconservativa |
| **Maturana y Varela** | 1972 | Autopoiesis |
| **Mendel** | 1865-66 | Leyes de la herencia |
"""

EXAMEN_BODY = """## Instrucciones

- Tiempo estimado: 90 minutos
- Respondé con fundamentación: no basta con definir un concepto, hay que relacionarlo con el proceso o autor y explicar el "por qué"
- Usá los términos técnicos aprendidos en el curso
- Total: 10 puntos

---

## Parte I — Conceptos fundamentales (3 puntos)

### Pregunta 1 (1 punto)

Explicá la **teoría celular** indicando el aporte específico de cada uno de sus tres autores principales (Schleiden, Schwann y Virchow) y por qué el postulado de Virchow fue el más revolucionario.

**Respuesta modelo:**

La teoría celular es uno de los pilares de la biología moderna y fue construida por tres aportes sucesivos. Matthias Schleiden, en 1838, demostró que todos los tejidos vegetales están compuestos por células, lo que lo convirtió en el primer científico en generalizar la idea de la célula como unidad de los organismos. Al año siguiente, en 1839, Theodor Schwann extendió esta conclusión al reino animal, unificando así la biología bajo un principio común: todo ser vivo, vegetal o animal, está formado por células.

Sin embargo, fue Rudolf Virchow quien en 1858 formuló el postulado más disruptivo de la teoría: "omnis cellula e cellula", es decir, toda célula proviene de otra célula preexistente. Este principio fue revolucionario porque eliminó la posibilidad de la generación espontánea de células (y por extensión, de la vida) y estableció la continuidad de la vida como una cadena ininterrumpida. Impuso también una lógica causal en la medicina: si toda célula viene de otra célula, las enfermedades celulares (como el cáncer) tienen un origen celular detectable.

En conjunto, los tres postulados establecen que: (1) todo ser vivo está formado por células, (2) la célula es la unidad funcional y estructural de la vida, y (3) toda célula proviene de otra célula.

---

### Pregunta 2 (1 punto)

Describí el **modelo del mosaico fluido** (Singer y Nicolson, 1972). ¿Qué elementos lo componen y por qué el término "fluido" es central para entender la función de la membrana?

**Respuesta modelo:**

El modelo del mosaico fluido, propuesto por Singer y Nicolson en 1972, describe la membrana plasmática como una bicapa de fosfolípidos en la que las proteínas están embebidas de manera dinámica, como un mosaico sobre un fondo líquido.

La bicapa lipídica está formada por fosfolípidos con una cabeza hidrofílica (que mira hacia el agua, tanto al interior celular como al exterior) y dos colas hidrofóbicas (que se orientan hacia el interior de la bicapa, alejándose del agua). Esta organización es termodinámicamente estable y permite que la membrana sea selectivamente permeable.

Las proteínas pueden ser integrales (atraviesan la bicapa total o parcialmente, como los canales iónicos o la bomba Na⁺/K⁺) o periféricas (asociadas a la superficie). El glucocáliz —una capa de carbohidratos unida a proteínas y lípidos de la cara externa— cumple funciones de reconocimiento celular y protección.

El término "fluido" es central porque los fosfolípidos y las proteínas se mueven lateralmente a lo largo de la membrana a temperatura fisiológica (37°C). Esta fluidez permite el movimiento de proteínas hacia donde son necesarias, la fusión de vesículas con la membrana (exocitosis) y la endocitosis. Una membrana rígida no podría realizar estas funciones dinámicas esenciales para la vida celular.

---

### Pregunta 3 (1 punto)

Explicá la diferencia entre **homeostasis** y **autopoiesis**. ¿Son conceptos equivalentes o complementarios?

**Respuesta modelo:**

Homeostasis y autopoiesis son conceptos distintos pero complementarios que describen diferentes dimensiones de la organización de los seres vivos.

La homeostasis se refiere a la capacidad del organismo de mantener su ambiente interno estable frente a perturbaciones externas. Es un concepto funcional y regulatorio: el sistema vivo detecta desviaciones de un estado de referencia y activa mecanismos correctores. Por ejemplo, cuando la temperatura corporal sube, el organismo suda y dilata los vasos periféricos para disipar calor; cuando baja, tirita y contrae los vasos para conservarlo. Otro ejemplo es el pH sanguíneo, mantenido entre 7,35 y 7,45 por el sistema buffer del bicarbonato.

La autopoiesis, concepto desarrollado por Humberto Maturana y Francisco Varela en 1972, describe una propiedad más fundamental: la capacidad de los seres vivos de producirse y regenerarse a sí mismos. Un sistema autopoiético fabrica sus propios componentes (proteínas, lípidos, ácidos nucleicos) usando esos mismos componentes como máquinas de producción. La célula es el ejemplo paradigmático: produce sus membranas, sus enzimas y su material genético mediante procesos que requieren exactamente esas mismas estructuras.

Son complementarios porque la autopoiesis describe qué es un ser vivo (un sistema que se autoproduce), mientras que la homeostasis describe cómo ese sistema se mantiene estable en el tiempo. Sin autopoiesis no habría organismo; sin homeostasis, el organismo no podría mantenerse viable en un ambiente cambiante.

---

## Parte II — Análisis y comparación (4 puntos)

### Pregunta 4 (2 puntos)

Compará la **mitosis** y la **meiosis** en cuanto a: número de células producidas, ploidía, variabilidad genética y función biológica. ¿Por qué ambos procesos son necesarios para la vida?

**Respuesta modelo:**

Mitosis y meiosis son los dos tipos de división celular de los eucariotas y tienen funciones biológicas complementarias pero distintas.

En cuanto al número de células producidas: la mitosis genera 2 células hijas a partir de 1 célula madre; la meiosis genera 4 células hijas. Esta diferencia se debe a que la meiosis implica dos divisiones sucesivas (meiosis I y meiosis II), mientras que la mitosis tiene una sola.

Respecto a la ploidía: la mitosis conserva el número cromosómico (2n → 2n), produciendo células diploides idénticas a la madre. La meiosis reduce el número cromosómico a la mitad (2n → n), produciendo células haploides. Esto es esencial para la reproducción sexual: si los gametos fueran diploides, la fecundación duplicaría el número de cromosomas en cada generación.

En cuanto a variabilidad genética: las células producidas por mitosis son genéticamente idénticas a la madre (salvo mutaciones de replicación). Las células producidas por meiosis son genéticamente distintas entre sí y distintas a la madre, por dos mecanismos: el crossing-over (intercambio de segmentos entre cromátidas no hermanas en profase I) y la distribución independiente de cromosomas homólogos (ley de distribución independiente de Mendel, aplicada a nivel de la meiosis I).

Funcionalmente: la mitosis es responsable del crecimiento orgánico, la reparación de tejidos y la reproducción asexual. La meiosis es exclusiva de las células germinales (en las gónadas) y es la base de la reproducción sexual.

Ambos procesos son necesarios: sin mitosis no habría desarrollo ni regeneración de tejidos; sin meiosis no habría gametos ni reproducción sexual, y con ella, no habría la variabilidad genética sobre la que actúa la selección natural.

---

### Pregunta 5 (2 puntos)

Describí el proceso completo de **síntesis de proteínas** (desde el gen hasta la proteína funcional), indicando dónde ocurre cada etapa y qué moléculas participan. ¿Cómo una mutación puntual puede cambiar completamente la función de la proteína resultante?

**Respuesta modelo:**

La síntesis de proteínas es el proceso central de la expresión génica y se resume en el dogma central de la biología molecular: ADN → ARN → Proteína.

La primera etapa es la **transcripción**, que ocurre en el núcleo (en eucariotas). La ARN polimerasa se une al promotor del gen y lee la hebra molde del ADN en dirección 3'→5', sintetizando una cadena de ARN mensajero (ARNm) en dirección 5'→3'. Las bases del ARNm son complementarias a las del ADN molde, salvo que el ARN usa uracilo (U) en lugar de timina (T). En eucariotas, el ARNm primario (pre-ARNm) sufre procesamiento: se eliminan los intrones (splicing), se añade una caperuza 5' y una cola poli-A en 3'. El ARNm maduro sale al citoplasma.

La segunda etapa es la **traducción**, que ocurre en los ribosomas (libres en citoplasma o asociados al RER). El ribosoma lee el ARNm en tripletes (codones) desde el codón de inicio (AUG, que codifica metionina) hasta un codón de parada (UAA, UAG, UGA). El ARN de transferencia (ARNt) actúa como adaptador: su anticodón reconoce el codón del ARNm por complementariedad de bases, y su extremo 3' lleva el aminoácido correspondiente. Los aminoácidos se unen mediante enlaces peptídicos, formando la cadena polipeptídica.

Una vez sintetizada, la proteína adopta su estructura tridimensional (plegamiento), proceso que puede requerir proteínas auxiliares llamadas chaperonas. Las proteínas destinadas a secreción o a la membrana pasan por el RER y el Golgi antes de llegar a su destino.

Una mutación puntual cambia una sola base del ADN, lo que puede alterar un codón. Si el cambio produce un aminoácido diferente (mutación de sentido erróneo), la proteína resultante puede tener una estructura tridimensional distinta, perdiendo o alterando su función. El ejemplo clásico es la anemia falciforme: una sustitución de A por T en el codón 6 del gen de la β-globina cambia el codon GAG (ácido glutámico) por GTG (valina). Este único cambio de aminoácido hace que la hemoglobina HbS se polimerice en condiciones de baja oxigenación, deformando el glóbulo rojo en forma de hoz, obstruyendo capilares y causando crisis hemolíticas. Una sola base, un aminoácido diferente, una proteína disfuncional, una enfermedad sistémica grave.

---

## Parte III — Reflexión integradora (3 puntos)

### Pregunta 6 (1,5 puntos)

"La célula no es solo una bolsa de química: es un sistema que se autoproduce, se regula y se comunica con su entorno." A partir de esta afirmación, explicá cómo los conceptos de **autopoiesis**, **homeostasis**, **transporte celular** y **metabolismo** se integran en la vida de una célula.

**Respuesta modelo:**

La afirmación captura una de las ideas más profundas de la biología celular moderna: la célula no es simplemente un recipiente donde ocurren reacciones químicas, sino un sistema organizado que se produce a sí mismo, mantiene su estabilidad y se relaciona activamente con su entorno.

La **autopoiesis** describe la propiedad más fundamental: la célula fabrica sus propios componentes usando los mismos componentes que fabrica. Las proteínas producen las membranas; las membranas delimitan el espacio donde se sintetizan las proteínas; los ácidos nucleicos guardan la información para sintetizar todo lo demás. Este sistema se autoperpetúa: mientras haya energía y materia prima disponibles, la célula puede reproducirse y repararse.

El **metabolismo** es el motor energético de ese sistema autopoiético. Sin ATP, la célula no puede sintetizar proteínas, duplicar su ADN, mover moléculas ni mantener sus gradientes iónicos. La glucólisis, el ciclo de Krebs y la fosforilación oxidativa convierten la glucosa en ATP. La fermentación láctica permite continuar la producción de energía cuando falta oxígeno, aunque con un rendimiento mucho menor. El metabolismo es, en esencia, lo que "paga" todas las actividades celulares.

La **homeostasis** mantiene las condiciones internas necesarias para que el metabolismo funcione. Las enzimas metabólicas son sensibles al pH, la temperatura y la concentración de sustratos. Si el pH del citoplasma cae por debajo de 7, las enzimas glucolíticas se desnaturalizan y la célula deja de producir ATP. Los mecanismos homeostáticos (buffers intracelulares, bombas iónicas, termorregulación en organismos complejos) garantizan que las condiciones del ambiente interno se mantengan dentro de rangos compatibles con la vida.

El **transporte celular** es la interfaz entre la célula y su entorno. Sin transporte, la glucosa no entraría para alimentar el metabolismo, el CO₂ no saldría (produciría acidosis), y las señales moleculares del exterior no llegarían al interior. La difusión simple y facilitada permiten el intercambio pasivo; el transporte activo (bomba Na⁺/K⁺, cotransportadores) permite acumular moléculas contra el gradiente. La endocitosis incorpora nutrientes complejos; la exocitosis expulsa productos y señales.

Estos cuatro sistemas no son independientes: el metabolismo paga el transporte activo; el transporte abastece al metabolismo; la homeostasis protege al metabolismo; y la autopoiesis usa todo lo anterior para perpetuarse. La célula viva es el resultado de su integración.

---

### Pregunta 7 (1,5 puntos)

Explicá cómo la **teoría endosimbiótica** de Lynn Margulis cambió nuestra comprensión de la evolución celular. ¿Qué evidencias la apoyan? ¿Cómo se relaciona este concepto con la idea de propiedades emergentes?

**Respuesta modelo:**

La teoría endosimbiótica, propuesta por Lynn Margulis en 1967, postuló que las mitocondrias y los cloroplastos (en el caso de las células vegetales) son el resultado de una simbiosis antigua: hace aproximadamente 2.000 millones de años, una célula anfitriona (probablemente una arquea) engulló bacterias aeróbicas (ancestros de las mitocondrias) y cianobacterias (ancestros de los cloroplastos) sin digerirlas. La simbiosis fue mutuamente beneficiosa: la célula huésped obtuvo energía y capacidad fotosintética; las bacterias engullidas obtuvieron protección y nutrientes.

Esta teoría fue inicialmente rechazada por la comunidad científica pero hoy está ampliamente aceptada porque está respaldada por múltiples líneas de evidencia:

Primera: las mitocondrias y cloroplastos tienen **ADN propio**, circular y sin histonas, similar al ADN bacteriano.

Segunda: sus ribosomas son del tipo **70S** (como los de las bacterias), no 80S como los del citoplasma eucariota. Los antibióticos que inhiben ribosomas 70S (estreptomicina, tetraciclina) afectan a las mitocondrias.

Tercera: se **dividen por fisión binaria**, igual que las bacterias, no por mitosis.

Cuarta: tienen **doble membrana**: la interna es similar a la membrana bacteriana; la externa corresponde a la membrana del fagosoma que las engulló.

Quinta: la **secuenciación genómica** muestra que el ADN mitocondrial es más similar al de ciertas alfaproteobacterias que al del núcleo eucariota.

La relación con las **propiedades emergentes** es profunda. La célula eucariota, con sus mitocondrias y cloroplastos, no es simplemente la suma de una prokariota y unas bacterias simbiontes. De esa asociación emergieron propiedades que ninguno de los participantes tenía individualmente: la capacidad de producir 32-34 ATP por glucosa en vez de 2 (que tenía la fermentación), la posibilidad de crecer en tamaño y complejidad (gracias al suministro energético eficiente), y en última instancia la posibilidad de la multicelularidad. La vida compleja que conocemos —animales, plantas, hongos— emergió de esa simbiosis. Es uno de los ejemplos más poderosos de que el todo biológico puede ser cualitativamente distinto de la suma de sus partes.

---

## Criterios de corrección

| Criterio | Descripción |
|----------|-------------|
| **Conceptual** | Define y aplica correctamente los términos técnicos del curso |
| **Autoral** | Vincula los conceptos con los autores y fechas cuando corresponde |
| **Argumentativo** | Explica el "por qué", no solo describe o enumera |
| **Integrador** | En las preguntas de Parte III, cruza conceptos de al menos 2 módulos distintos |
"""


def upsert_item(title, body, item_type, order_index):
    # Check if exists
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/content_items"
        f"?subject_id=eq.{SUBJECT_ID}&type=eq.{item_type}&select=id",
        headers=HEADERS,
    )
    existing = r.json() if r.status_code == 200 else []
    if not isinstance(existing, list):
        existing = []

    if existing:
        item_id = existing[0]["id"]
        r2 = requests.patch(
            f"{SUPABASE_URL}/rest/v1/content_items?id=eq.{item_id}",
            headers=HEADERS,
            json={"title": title, "body": body, "is_published": True},
        )
        action = "PATCH"
        status = r2.status_code
    else:
        r2 = requests.post(
            f"{SUPABASE_URL}/rest/v1/content_items",
            headers=HEADERS,
            json={
                "subject_id": SUBJECT_ID,
                "title": title,
                "body": body,
                "type": item_type,
                "order_index": order_index,
                "is_published": True,
            },
        )
        action = "POST"
        status = r2.status_code

    ok = status in (200, 201, 204)
    icon = "OK" if ok else "ERR"
    print(f"  [{icon}] {action} {item_type} ({title}): HTTP {status}")
    if not ok:
        print(f"    {r2.text[:300]}")
    return ok


if __name__ == "__main__":
    import sys; sys.stdout.reconfigure(encoding="utf-8")
    print("=== Biociencias - material de apoyo ===")
    ok1 = upsert_item("Guia de Estudio de Biociencias", GUIA_BODY, "guide", 1)
    ok2 = upsert_item("Modelo de Examen - Biociencias", EXAMEN_BODY, "exam_model", 2)
    if ok1 and ok2:
        print("\nOK - Todo subido correctamente.")
    else:
        print("\nERROR - Revisa la salida.")
