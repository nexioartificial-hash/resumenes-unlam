import os, requests, sys
try:
    from dotenv import load_dotenv
    load_dotenv(".env.local")
except ImportError:
    pass

sys.stdout.reconfigure(encoding="utf-8")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://dtbouycelkjgyddpftir.supabase.co")
KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")
HEADERS = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}
SUBJECT_ID = "56bf0335-6de6-45cc-9272-9c92afa9125a"

GUIA_BODY = """## Cómo usar esta guía

Leé cada módulo completo antes de usar las preguntas orientadoras. Los **conceptos en negrita** son los más frecuentes en los parciales. El objetivo es que puedas responder cada pregunta sin mirar el resumen.

---

## Módulo 1 — Biodiversidad y Evolución

### Conceptos clave

- **Biodiversidad**: variedad de seres vivos en la Tierra en todos sus niveles: genes, especies y ecosistemas. Surge del proceso evolutivo.
- **Evolución**: proceso de transformación de los seres vivos a lo largo del tiempo. Explica el origen de las distintas formas de vida y la historia compartida de todos los organismos.
- **Propiedades de los seres vivos**: movimiento, crecimiento, reproducción, metabolismo, irritabilidad (respuesta a estímulos), homeostasis y muerte. Las distinguen de la materia inerte.
- **Niveles de organización biológica**: átomo → molécula → organela → célula → tejido → órgano → sistema → organismo → población → comunidad → ecosistema → biósfera.
- **Taxonomía**: ciencia que clasifica a los seres vivos. Categorías jerárquicas: dominio, reino, filo, clase, orden, familia, género, especie. El nombre científico usa binomio latín (*Homo sapiens*).
- **Teoría de la evolución** (Darwin/Wallace): la selección natural actúa sobre variaciones heredables. Los individuos mejor adaptados al ambiente sobreviven y se reproducen más, transmitiendo sus características.

### Preguntas orientadoras

1. ¿Cuáles son las propiedades que distinguen a los seres vivos de la materia inerte? ¿Por qué ninguna propiedad por sí sola es suficiente?
2. ¿Qué es la evolución y cómo explica la biodiversidad actual?
3. ¿Para qué sirve clasificar a los seres vivos? ¿Qué información contiene el nombre científico?
4. ¿Cómo funciona la selección natural según Darwin?
5. ¿En qué nivel de organización biológica aparece la "vida"? ¿Por qué es importante el concepto de propiedad emergente?
6. ¿Podría existir biodiversidad sin evolución? Fundamentá.

---

## Módulo 2 — Química de la Vida

### Conceptos clave

- **Átomo**: unidad básica de la materia. Compuesto por protones y neutrones (núcleo) y electrones (orbitales). El número atómico (Z) define el elemento.
- **Bioelementos primarios**: C, H, O, N, S, P. Forman el 99% de la materia viva. El carbono es fundamental por su tetravalencia y capacidad de formar cadenas.
- **Enlace covalente**: compartición de electrones entre átomos. Fuerte y específico. Base de las moléculas orgánicas. Puede ser polar (O-H, N-H) o apolar (C-C, C-H).
- **Enlace iónico**: transferencia de electrones. Forma sales. Ejemplos: NaCl, sales minerales en el plasma sanguíneo.
- **Puente de hidrógeno**: interacción débil entre H unido a O o N y otro átomo electronegativo. Fundamental para la estructura del agua, ADN y proteínas.
- **Agua**: molécula polar con alta capacidad calorífica, adhesión y cohesión (puentes H). Solvente universal. Sin agua no hay vida conocida.
- **Reacciones químicas en biología**: anabólicas (construyen, gastan energía) y catabólicas (degradan, liberan energía). Las enzimas actúan como catalizadores biológicos.

### Preguntas orientadoras

1. ¿Por qué el carbono es el elemento central de la química de la vida?
2. ¿Qué diferencia hay entre un enlace covalente y uno iónico? Dá un ejemplo biológico de cada uno.
3. ¿Qué propiedades del agua son esenciales para la vida?
4. ¿Por qué los puentes de hidrógeno, siendo débiles, son tan importantes en biología?
5. ¿Cuál es la diferencia entre reacciones anabólicas y catabólicas? Dá un ejemplo de cada tipo.
6. ¿Qué relación hay entre los bioelementos y la composición de las biomoléculas?

---

## Módulo 3 — Soluciones y Equilibrio Químico

### Conceptos clave

- **Solución**: mezcla homogénea de solvente (el más abundante, generalmente agua) y soluto (la sustancia disuelta). Concentración = cantidad de soluto / volumen de solución.
- **Molaridad (M)**: moles de soluto por litro de solución. 1 M = 1 mol/L. Fundamental para calcular concentraciones en biología.
- **pH**: medida de acidez. pH = -log[H⁺]. pH 7 = neutro; < 7 = ácido; > 7 = básico. La sangre humana tiene pH entre 7,35 y 7,45.
- **Buffer (tampón)**: sistema que resiste cambios de pH. En sangre: bicarbonato/CO₂ (HCO₃⁻/CO₂). En células: proteínas y fosfatos.
- **Ósmosis**: difusión del agua a través de una membrana semipermeable desde la solución hipotónica (menos soluto) a la hipertónica (más soluto). Determina si las células se hinchan o arrugan.
- **Presión osmótica**: fuerza que genera la diferencia de concentración a través de una membrana. Las células tienen mecanismos para regularlo (osmorregulación).
- **Estequiometría**: relaciones cuantitativas entre reactivos y productos en una reacción química. Permite calcular cuánto producto se forma a partir de una cantidad dada de reactivo.

### Preguntas orientadoras

1. ¿Qué sucede con un glóbulo rojo si lo colocamos en agua destilada? ¿Y en solución hipertónica? ¿Por qué?
2. ¿Por qué el pH de la sangre se mantiene estable aunque generemos CO₂ constantemente?
3. ¿Qué es la molaridad y para qué sirve conocer la concentración de una solución biológica?
4. ¿Cuál es la diferencia entre difusión y ósmosis?
5. ¿Qué rol cumplen los buffers en el organismo?
6. ¿Cómo se usa la estequiometría para calcular cuánto ATP se produce en la respiración celular?

---

## Módulo 4 — Biomoléculas

### Conceptos clave

- **Hidratos de carbono** (glúcidos): fórmula Cₙ(H₂O)ₙ. Función energética (glucosa, glucógeno, almidón) y estructural (celulosa en plantas, quitina en hongos). Monosacáridos → disacáridos → polisacáridos.
- **Proteínas**: polímeros de aminoácidos unidos por enlaces peptídicos. Estructura primaria (secuencia), secundaria (alfa-hélice/lámina-beta), terciaria (plegamiento) y cuaternaria (varias cadenas). Función enzimática, estructural, hormonal, inmune.
- **Lípidos**: moléculas hidrofóbicas. Grasas (reserva energética), fosfolípidos (membrana), colesterol (membrana y hormonas esteroides). No son polímeros.
- **Ácidos nucleicos**: ADN (doble hélice, desoxirribosa, bases A/T/G/C) y ARN (simple hebra, ribosa, bases A/U/G/C). Función: almacenamiento y transmisión de información genética.
- **Monómero-polímero**: la vida usa reacciones de condensación (síntesis por deshidratación, libera H₂O) para unir monómeros y reacciones de hidrólisis (agrega H₂O) para degradarlos.
- **Enzimas**: proteínas catalizadoras. Específicas (sitio activo complementario al sustrato). Reguladas por temperatura, pH, inhibidores competitivos/no competitivos.

### Preguntas orientadoras

1. ¿Cuál es la diferencia entre glucosa, glucógeno y celulosa? ¿Tienen la misma función?
2. ¿Por qué una proteína desnaturalizada pierde su función, aunque su secuencia de aminoácidos no cambie?
3. ¿Qué tienen en común los lípidos y por qué no son solubles en agua?
4. ¿Cuál es la diferencia entre ADN y ARN en estructura y función?
5. ¿Cómo se unen los monómeros para formar polímeros? ¿Qué reacción química ocurre?
6. ¿Qué relación hay entre la estructura primaria de una proteína y su función?

---

## Módulo 5 — La Célula

### Conceptos clave

- **Célula**: unidad anatómica y funcional de todos los seres vivos. Mínima expresión de vida capaz de metabolismo, reproducción y respuesta a estímulos.
- **Célula procariota**: sin núcleo verdadero (ADN circular en nucleoide), sin organelas membranosas, tamaño pequeño (1-10 µm). Bacterias y arqueas.
- **Célula eucariota**: con núcleo verdadero y organelas membranosas. Tamaño mayor (10-100 µm). Animales, plantas, hongos, protistas.
- **Relación forma-función**: la forma celular determina su función. Eritrocito: bicóncavo → máxima superficie para intercambio de gases. Neurona: axón largo → conducción eléctrica a distancia. Espermatozoide: flagelo → movilidad.
- **Organelas**: compartimentos con función específica. Mitocondria (energía), ribosoma (síntesis proteica), núcleo (información genética), vacuola (almacenamiento), cloroplasto (fotosíntesis en plantas).
- **Microscopía**: óptica (resolución ~200 nm, células vivas) y electrónica (resolución ~0,2 nm, organelas detalladas). La tinción diferencial permite visualizar estructuras específicas.

### Preguntas orientadoras

1. ¿Cuáles son las tres características universales de toda célula?
2. ¿Qué diferencias estructurales hay entre una célula procariota y una eucariota?
3. ¿Por qué la forma del eritrocito es perfecta para su función?
4. ¿Por qué se dice que la célula es la "unidad de vida"?
5. ¿Qué ventaja ofrece el microscopio electrónico sobre el óptico?
6. ¿Cómo se relacionan las organelas entre sí para que la célula funcione?

---

## Módulo 6 — Membrana Plasmática

### Conceptos clave

- **Membrana plasmática**: bicapa de fosfolípidos con proteínas integradas y periféricas. Modelo del mosaico fluido (Singer y Nicolson, 1972).
- **Permeabilidad selectiva**: la membrana permite el paso de algunas moléculas y bloquea otras. Depende del tamaño, polaridad y carga de la molécula.
- **Difusión simple**: pequeñas moléculas no polares (O₂, CO₂) atraviesan la membrana sin proteínas, a favor del gradiente. No gasta energía.
- **Difusión facilitada**: moléculas polares (glucosa) usan proteínas de canal o transportadoras. A favor del gradiente. Sin gasto de ATP.
- **Transporte activo**: contra el gradiente, requiere ATP. Ejemplo: bomba Na⁺/K⁺ (3 Na⁺ salen, 2 K⁺ entran por cada ATP). Mantiene el potencial de membrana.
- **Endocitosis y exocitosis**: transporte de vesículas. Fagocitosis (sólidos), pinocitosis (líquidos), exocitosis (secreción de proteínas, neurotransmisores).
- **Glucocáliz**: capa de carbohidratos en la cara externa. Reconocimiento celular, adhesión y protección.

### Preguntas orientadoras

1. ¿Por qué la membrana plasmática tiene permeabilidad selectiva?
2. ¿En qué se diferencia la difusión simple de la difusión facilitada?
3. ¿Por qué la bomba Na⁺/K⁺ requiere ATP? ¿Qué pasaría sin ella?
4. ¿Cuál es la función del glucocáliz?
5. ¿Cómo puede una célula incorporar una partícula grande como una bacteria?
6. ¿Por qué el modelo de Singer y Nicolson se llama "mosaico fluido"?

---

## Módulo 7 — Citoplasma y Organelas

### Conceptos clave

- **Citoplasma**: todo el contenido celular entre la membrana plasmática y el núcleo. Incluye el citosol y las organelas.
- **Citosol**: fase líquida del citoplasma (agua, iones, proteínas solubles, ARN). Donde ocurre la glucólisis y la síntesis de proteínas en ribosomas libres.
- **Mitocondria**: organela con doble membrana. En la membrana interna (crestas) ocurre la fosforilación oxidativa. En la matriz: ciclo de Krebs. Posee ADN propio (evidencia de endosimbiosis).
- **Retículo endoplasmático rugoso (RER)**: con ribosomas. Síntesis de proteínas de membrana y secreción.
- **Retículo endoplasmático liso (REL)**: sin ribosomas. Síntesis de lípidos, metabolismo de esteroides, detoxificación en hígado.
- **Aparato de Golgi**: cisternas apiladas. Modifica, empaqueta y dirige proteínas y lípidos a su destino final.
- **Lisosomas**: vesículas con enzimas hidrolíticas (pH 5). Digestión intracelular. Déficit enzimático → enfermedades de almacenamiento.
- **Ribosomas**: complejos ARNr-proteínas. 70S en procariotas y mitocondrias; 80S en eucariotas. Traducen el ARNm en proteínas.

### Preguntas orientadoras

1. ¿Qué diferencia hay entre el citoplasma y el citosol?
2. ¿Por qué las mitocondrias tienen ADN propio y qué teoría lo explica?
3. ¿Cuál es el "camino de una proteína de secreción" desde que se sintetiza hasta que sale de la célula?
4. ¿En qué se diferencia el RER del REL?
5. ¿Qué sucede si los lisosomas no funcionan correctamente?
6. ¿Por qué los ribosomas de los procariotas son distintos a los eucariotas y qué importancia tiene eso?

---

## Módulo 8 — Núcleo Celular

### Conceptos clave

- **Núcleo**: organela exclusiva de las células eucariotas. Contiene el ADN (genoma) y es el centro de control de la expresión génica.
- **Envoltura nuclear**: doble membrana con poros nucleares. Regula el intercambio de moléculas entre núcleo y citoplasma.
- **Cromatina**: complejo de ADN + histonas. En interfase: cromatina laxa (eucromatina, activa) y compacta (heterocromatina, silenciada). En división: se condensa en cromosomas.
- **Cromosoma**: ADN compactado alrededor de histonas formando nucleosomas. Cada especie tiene un número característico de cromosomas (cariotipo). Humanos: 46 cromosomas (23 pares).
- **Nucléolo**: región densa del núcleo sin membrana. Produce ARN ribosómico (ARNr) y ensambla las subunidades ribosomales.
- **Replicación del ADN**: proceso semiconservativo. Cada hebra sirve de molde para una nueva. Ocurre en la fase S del ciclo celular.
- **Transcripción**: síntesis de ARNm en el núcleo a partir del ADN molde. El ARNm sale al citoplasma para ser traducido.

### Preguntas orientadoras

1. ¿Por qué se dice que el núcleo es el "centro de control" de la célula?
2. ¿Cuál es la diferencia entre cromatina y cromosoma?
3. ¿Qué función cumplen los poros nucleares?
4. ¿Qué ocurre en el nucléolo y por qué es importante para la síntesis de proteínas?
5. ¿Por qué la replicación del ADN es semiconservativa? ¿Qué garantiza eso?
6. ¿Qué diferencia hay entre replicación y transcripción? ¿Cuándo ocurre cada una?

---

## Módulo 9 — Reproducción Celular

### Conceptos clave

- **Ciclo celular**: G1 (crecimiento, síntesis de proteínas) → S (replicación del ADN) → G2 (preparación para división) → M (mitosis + citocinesis). Puntos de control en G1, G2 y metafase.
- **Células somáticas vs. germinales**: somáticas forman el cuerpo, se dividen por mitosis (2n → 2n). Germinales son las que originarán gametos, se dividen por meiosis (2n → n).
- **Mitosis**: produce 2 células hijas diploides (2n) idénticas. Etapas: profase (condensación), metafase (alineación en ecuador), anafase (separación), telofase (descondensación). Seguida de citocinesis.
- **Meiosis I**: división reduccional. Separa cromosomas homólogos (2n → n). Incluye crossing-over en profase I (variabilidad genética).
- **Meiosis II**: similar a mitosis, separa cromátidas hermanas. Resultado final: 4 células haploides.
- **Control del ciclo celular**: ciclinas y quinasas dependientes de ciclinas (CDK) regulan los puntos de control. Pérdida del control → cáncer.
- **Apoptosis**: muerte celular programada. Elimina células dañadas o innecesarias durante el desarrollo. Si falla → tumor.

### Preguntas orientadoras

1. ¿Cuándo ocurre la replicación del ADN en el ciclo celular? ¿Por qué es importante hacerlo antes de la mitosis?
2. ¿Qué diferencia hay entre mitosis y meiosis en cuanto a ploidía y variabilidad genética?
3. ¿Para qué sirven los puntos de control del ciclo celular? ¿Qué pasa si fallan?
4. ¿Cómo genera variabilidad genética el crossing-over?
5. ¿Por qué la apoptosis es necesaria para el desarrollo normal?
6. ¿En qué tipos de célula ocurre la meiosis y para qué?

---

## Módulo 10 — Salud y Ambiente

### Conceptos clave

- **Ambiente**: entorno físico, químico y biológico que rodea a un organismo. Incluye factores bióticos (otros seres vivos) y abióticos (temperatura, luz, agua).
- **Crisis ambiental**: deterioro global del ambiente por actividades humanas: contaminación, deforestación, sobreexplotación, cambio climático. Amenaza los servicios ecosistémicos.
- **Servicios ecosistémicos**: beneficios que los ecosistemas proporcionan a los seres humanos: alimento, agua potable, regulación del clima, polinización, depuración del aire.
- **Salud ambiental** (OMS): rama de la salud pública que estudia la relación entre el ambiente y la salud humana. Los contaminantes ambientales (agroquímicos, metales pesados, plásticos) son determinantes de salud.
- **Desarrollo sustentable**: desarrollo que satisface las necesidades del presente sin comprometer la capacidad de las generaciones futuras de satisfacer las suyas (Brundtland, 1987).
- **Biodiversidad y salud**: la pérdida de biodiversidad puede facilitar la aparición de enfermedades infecciosas (efecto dilución vs. amplificación). Los ecosistemas saludables regulan vectores y patógenos.
- **Ecología**: ciencia que estudia las relaciones entre seres vivos y su ambiente. Niveles: individuo, población, comunidad, ecosistema, biósfera.

### Preguntas orientadoras

1. ¿Por qué el deterioro del ambiente impacta directamente en la salud humana?
2. ¿Qué son los servicios ecosistémicos y por qué su pérdida es una crisis de salud pública?
3. ¿Cuál es la diferencia entre biótico y abiótico? Dá ejemplos de cada uno.
4. ¿Qué significa el desarrollo sustentable y por qué es relevante para la biología?
5. ¿Cómo se relaciona la pérdida de biodiversidad con el aumento de enfermedades infecciosas?
6. ¿Cuál es la diferencia entre ecología y biología ambiental?

---

## Cuadro comparativo — Célula procariota vs. eucariota

| Característica | Procariota | Eucariota |
|----------------|-----------|-----------|
| **Núcleo** | No (nucleoide) | Sí (envoltura nuclear) |
| **Organelas membranosas** | No | Sí (mitocondria, Golgi, etc.) |
| **Tamaño** | 1-10 µm | 10-100 µm |
| **ADN** | Circular, en nucleoide | Lineal, en cromosomas |
| **Ribosomas** | 70S | 80S (70S en mitocondria) |
| **Representantes** | Bacterias, arqueas | Animales, plantas, hongos |

---

## Cuadro comparativo — Biomoléculas

| Biomolécula | Monómero | Función principal | Ejemplos |
|-------------|---------|-------------------|---------|
| **Hidratos de carbono** | Monosacáridos | Energía y estructura | Glucosa, glucógeno, celulosa |
| **Proteínas** | Aminoácidos | Enzimática, estructural, inmune | Hemoglobina, colágeno, anticuerpos |
| **Lípidos** | Glicerol + ácidos grasos (no polímero) | Membrana y reserva | Fosfolípidos, colesterol, grasas |
| **Ácidos nucleicos** | Nucleótidos | Información genética | ADN, ARN |

---

## Cuadro comparativo — Mitosis vs. Meiosis

| Aspecto | Mitosis | Meiosis |
|---------|---------|---------|
| **Divisiones** | 1 | 2 |
| **Células producidas** | 2 | 4 |
| **Ploidía** | 2n → 2n | 2n → n |
| **Variabilidad** | No (idénticas) | Sí (crossing-over + dist. independiente) |
| **Ocurre en** | Células somáticas | Células germinales (gónadas) |
| **Función** | Crecimiento, reparación | Producción de gametos |
"""

EXAMEN_BODY = """## Instrucciones

- Tiempo estimado: 90 minutos
- Respondé con fundamentación: no basta con enumerar, hay que explicar el "por qué" y vincular conceptos
- Usá los términos técnicos aprendidos en el curso
- Total: 10 puntos

---

## Parte I — Conceptos fundamentales (3 puntos)

### Pregunta 1 (1 punto)

Explicá la diferencia entre una **célula procariota** y una **célula eucariota**. Mencioná al menos cuatro características estructurales y dá un ejemplo de cada tipo.

**Respuesta modelo:**

La distinción entre células procariotas y eucariotas es una de las más importantes en biología, ya que representa dos grandes dominios de la vida.

Las **células procariotas** carecen de núcleo verdadero: su material genético (ADN circular) se encuentra en una región del citoplasma llamada nucleoide, sin membrana que la delimite. No poseen organelas membranosas internas: no hay mitocondrias, retículo endoplasmático ni aparato de Golgi. Sus ribosomas son del tipo 70S (más pequeños que los eucariotas). Son organismos de tamaño reducido, entre 1 y 10 µm. Las bacterias y las arqueas son los representantes de este grupo. Ejemplo: *Escherichia coli*.

Las **células eucariotas** tienen un núcleo verdadero rodeado por una envoltura nuclear de doble membrana con poros. En ese núcleo se almacena el ADN lineal organizado en cromosomas. Poseen organelas membranosas especializadas: mitocondrias (energía), retículo endoplasmático rugoso y liso, aparato de Golgi, lisosomas, vacuolas, y en el caso de las plantas, cloroplastos. Sus ribosomas son del tipo 80S. Son más grandes, entre 10 y 100 µm. Animales, plantas, hongos y protistas son eucariotas. Ejemplo: célula hepática humana.

La diferencia más fundamental es la compartimentalización: la célula eucariota separa sus funciones en compartimentos especializados, lo que permite mayor complejidad y eficiencia. Esta compartimentalización hizo posible la evolución de los organismos pluricelulares.

---

### Pregunta 2 (1 punto)

¿Qué son las **biomoléculas**? Describí las cuatro grandes familias, su monómero (si aplica) y una función biológica de cada una.

**Respuesta modelo:**

Las biomoléculas son las moléculas orgánicas que forman la materia viva. Están compuestas principalmente por C, H, O, N, S y P, y se organizan en cuatro grandes familias.

Los **hidratos de carbono** (glúcidos) tienen la fórmula general Cₙ(H₂O)ₙ. Su monómero es el monosacárido (glucosa, fructosa, galactosa). Se polimerizan por reacciones de condensación en disacáridos (sacarosa, lactosa) y polisacáridos (almidón, glucógeno, celulosa). Función: energética (glucosa como combustible celular primario) y estructural (celulosa en paredes celulares vegetales, quitina en paredes fúngicas).

Las **proteínas** son polímeros de aminoácidos unidos por enlaces peptídicos. La secuencia de aminoácidos (estructura primaria) determina el plegamiento (estructuras secundaria, terciaria y cuaternaria). Sus funciones son muy diversas: enzimática (catalizan reacciones), estructural (colágeno, queratina), hormonal (insulina), inmune (anticuerpos), de transporte (hemoglobina) y receptora (receptores de membrana).

Los **lípidos** no son polímeros: son moléculas hidrofóbicas formadas por glicerol y ácidos grasos (en grasas y fosfolípidos). Los fosfolípidos forman la bicapa de las membranas celulares. Las grasas son reserva energética. El colesterol es componente de membranas y precursor de hormonas esteroides.

Los **ácidos nucleicos** son polímeros de nucleótidos. El ADN (ácido desoxirribonucleico) almacena la información genética en una doble hélice. El ARN (ácido ribonucleico) participa en la expresión génica: el ARNm lleva la información del ADN al ribosoma; el ARNt lleva los aminoácidos; el ARNr forma parte del ribosoma.

---

### Pregunta 3 (1 punto)

Explicá cómo funciona el **transporte activo** en la membrana plasmática. ¿Por qué es indispensable para la conducción nerviosa?

**Respuesta modelo:**

El transporte activo es el movimiento de moléculas o iones a través de la membrana plasmática en dirección contraria a su gradiente de concentración o electroquímico, es decir, de la zona de menor a la de mayor concentración. Requiere el consumo de energía en forma de ATP y la participación de proteínas transportadoras especializadas llamadas bombas.

El ejemplo más importante es la **bomba Na⁺/K⁺-ATPasa**. Esta proteína integral de membrana expulsa 3 iones Na⁺ hacia el exterior de la célula e introduce 2 iones K⁺ al interior, por cada molécula de ATP hidrolizada. El resultado es que la concentración de Na⁺ es alta extracelularmente y baja intracelularmente, mientras que el K⁺ es alto en el interior. Esta diferencia de concentración, combinada con la salida neta de cargas positivas (3 salen vs. 2 entran), genera un potencial eléctrico de membrana negativo en el interior (aproximadamente -70 mV en neuronas): el potencial de reposo.

Este potencial de reposo es indispensable para la conducción nerviosa. Cuando una neurona recibe un estímulo suficiente, los canales de Na⁺ se abren, el Na⁺ entra masivamente (a favor de su gradiente) y el potencial se invierte localmente: se genera el potencial de acción. Este potencial de acción se propaga a lo largo del axón y en la sinapsis libera neurotransmisores. Sin la bomba Na⁺/K⁺ funcionando continuamente (gasta ~30% del ATP neuronal), el potencial de reposo no existiría y el sistema nervioso no podría funcionar.

---

## Parte II — Análisis y comparación (4 puntos)

### Pregunta 4 (2 puntos)

Describí y comparé los procesos de **mitosis** y **meiosis**: etapas, resultado en términos de ploidía y variabilidad genética, y función biológica de cada uno. ¿Por qué ambos son necesarios para la vida de los organismos pluricelulares?

**Respuesta modelo:**

La mitosis y la meiosis son los dos tipos de división celular en los eucariotas y tienen funciones complementarias.

La **mitosis** produce dos células hijas diploides (2n) a partir de una célula madre diploide (2n). Sus etapas son: profase (el ADN se condensa en cromosomas visibles y desaparece la envoltura nuclear), metafase (los cromosomas se alinean en el ecuador celular), anafase (las cromátidas hermanas se separan hacia polos opuestos) y telofase (se reconstituye la envoltura nuclear). La citocinesis divide el citoplasma al final. Las dos células hijas son genéticamente idénticas a la madre: la mitosis conserva la ploidía y no genera variabilidad. Su función biológica es el crecimiento del organismo (de una célula fertilizada a trillones de células), la reparación de tejidos dañados y la reproducción asexual en algunos organismos.

La **meiosis** produce cuatro células hijas haploides (n) a partir de una célula madre diploide (2n). Se compone de dos divisiones. La meiosis I es la división reduccional: los cromosomas homólogos se separan. En la profase I ocurre el **crossing-over** (o entrecruzamiento): intercambio de segmentos de ADN entre cromátidas no hermanas de cromosomas homólogos. Esto genera recombinación genética. En la metafase I, los pares de cromosomas homólogos se alinean al azar en el ecuador (distribución independiente), generando aún más variabilidad. La meiosis II es similar a la mitosis: separa las cromátidas hermanas. El resultado son cuatro células haploides genéticamente distintas entre sí y distintas a la célula madre.

La variabilidad genética generada por la meiosis es crucial para la evolución: proporciona la materia prima sobre la cual actúa la selección natural. La fecundación de dos gametos haploides restaura la ploidía diploide en cada generación, manteniendo constante el número cromosómico de la especie.

Ambos procesos son necesarios: sin mitosis no habría crecimiento ni reparación de tejidos; sin meiosis no habría reproducción sexual ni la variabilidad genética que permite a las especies adaptarse a ambientes cambiantes.

---

### Pregunta 5 (2 puntos)

¿Cómo las células del cuerpo "saben" cuándo dividirse y cuándo no? Explicá el concepto de **ciclo celular**, sus puntos de control, y qué ocurre cuando ese control falla.

**Respuesta modelo:**

El ciclo celular es la secuencia ordenada de eventos que lleva a la duplicación y división de una célula. Se divide en:

**Interfase**: la célula crece y replica su ADN.
- G1 (primera brecha): la célula crece, sintetiza proteínas y ARN. Aquí está el punto de control G1 (también llamado punto de restricción), que verifica que el ambiente sea favorable, que la célula sea suficientemente grande y que el ADN esté íntegro. Si no se cumplen estas condiciones, la célula puede entrar en estado G0 (quiescencia).
- Fase S: replicación semiconservativa del ADN. El ADN se duplica: de 46 cromosomas (en humanos) con una cromátida cada uno, pasa a 46 cromosomas con dos cromátidas hermanas.
- G2: la célula sigue creciendo y verifica que la replicación haya sido completa y correcta (punto de control G2).

**Fase M** (mitótica): ocurre la mitosis (división del núcleo) seguida de la citocinesis (división del citoplasma). En la metafase hay un tercer punto de control (punto de ensamblaje del huso) que verifica que todos los cromosomas estén correctamente unidos al huso acromático.

El control del ciclo se realiza mediante proteínas reguladoras: las **ciclinas** y las **quinasas dependientes de ciclinas (CDK)**. La concentración de ciclinas fluctúa durante el ciclo; cuando se unen a su CDK correspondiente, activan la CDK que fosforila (activa o inhibe) proteínas clave para avanzar en el ciclo. También existen proteínas supresoras de tumores como p53, que detiene el ciclo si detecta daño en el ADN y puede activar la apoptosis.

Cuando el control del ciclo falla, las células se dividen sin control: esto produce **cáncer**. Existen dos tipos de genes implicados: los **proto-oncogenes** (que cuando mutan se convierten en oncogenes y aceleran la división) y los **genes supresores de tumores** (que cuando mutan o se inactivan, no pueden frenar la división). La acumulación de mutaciones en estos genes transforma una célula normal en una célula cancerosa que invade tejidos circundantes y puede metastatizar.

---

## Parte III — Reflexión integradora (3 puntos)

### Pregunta 6 (1,5 puntos)

"La vida es química organizada". A partir de esta afirmación, explicá cómo los niveles de organización molecular (átomos, moléculas, biomoléculas) se traducen en propiedades que caracterizan a los seres vivos.

**Respuesta modelo:**

La frase captura una verdad fundamental de la biología moderna: no existe un principio vital separado de la química. Lo que llamamos "vida" es el resultado de la organización de la materia en estructuras cada vez más complejas, donde en cada nivel emergen propiedades nuevas que no existían en el nivel anterior.

En el nivel más básico, los átomos (C, H, O, N, S, P) se combinan mediante enlaces covalentes, iónicos y puentes de hidrógeno para formar moléculas pequeñas: agua, CO₂, NH₃. Ningún átomo por sí solo "hace química de la vida". Pero cuando el carbono forma cadenas con hidrógeno y oxígeno, aparecen moléculas orgánicas con propiedades únicas: la posibilidad de almacenar información (secuencias de bases en el ADN), de catalizar reacciones (proteínas con sitio activo específico) y de compartimentalizar ambientes (fosfolípidos que forman bicapas espontáneamente en agua).

De las biomoléculas emerge la célula: el primer nivel en que se puede hablar de "un ser vivo". La célula tiene metabolismo (convierte glucosa en ATP mediante glucólisis, Krebs y fosforilación oxidativa), puede reproducirse (mitosis), responde a estímulos (receptores de membrana) y mantiene su ambiente interno estable (homeostasis, regulada en parte por la bomba Na⁺/K⁺ y los buffers). Ninguna biomolécula aislada puede hacer esto; son propiedades emergentes de su organización.

A nivel celular, la membrana plasmática establece el límite entre "el yo" y "el entorno", permitiendo la permeabilidad selectiva que mantiene las condiciones internas distintas del medio externo. El ADN en el núcleo almacena la información que permite a la célula reproducirse con fidelidad (replicación semiconservativa) y producir las proteínas necesarias (transcripción y traducción). El metabolismo energético (ATP) financia todo lo demás.

En los organismos pluricelulares, la especialización celular (gracias a la expresión diferencial de genes) agrega otro nivel de complejidad: distintos tipos de células forman tejidos, órganos y sistemas que realizan funciones que ninguna célula individual podría cumplir. La homeostasis del organismo emerge de la coordinación de millones de células.

Así, la "vida" no es una sustancia sino una organización: química organizada con jerarquías de complejidad donde, en cada nivel, emergen propiedades nuevas que hacen posible la biología.

---

### Pregunta 7 (1,5 puntos)

¿Por qué la **crisis ambiental** es también una crisis de salud humana? Explicá la relación entre la degradación del ambiente, la pérdida de biodiversidad y el bienestar humano desde una perspectiva biológica.

**Respuesta modelo:**

La relación entre ambiente y salud es uno de los ejes centrales de la biología contemporánea y tiene implicancias directas para la salud pública.

Los ecosistemas proveen servicios que son condiciones necesarias para la vida humana: producción de oxígeno por fotosíntesis, depuración del agua, regulación del clima, polinización de cultivos, control de plagas, producción de alimentos y medicamentos derivados de organismos vivos. Cuando los ecosistemas se deterioran por contaminación, deforestación, sobreexplotación o cambio climático, estos servicios se degradan, amenazando necesidades humanas básicas como el acceso a agua potable, alimento y aire limpio.

Los **contaminantes ambientales** tienen efectos directos sobre la salud. Los agroquímicos (pesticidas, herbicidas) se acumulan en la cadena alimentaria (biomagnificación) y se asocian con enfermedades cancerígenas, alteraciones hormonales y neurotoxicidad. Los metales pesados (plomo, mercurio, arsénico) generan daño neurológico, especialmente grave en niños. Las partículas finas del aire (PM2.5) penetran en los alvéolos y causan enfermedades cardiovasculares y respiratorias.

La **pérdida de biodiversidad** tiene consecuencias indirectas sobre la salud infecciosa. Según la hipótesis del efecto dilución, ecosistemas con alta biodiversidad "diluyen" la presencia de reservorios competentes de patógenos (como roedores en la enfermedad de Lyme): más diversidad → menos enfermedades vectoriales. Cuando se simplifica el ecosistema (deforestación, fragmentación), los reservorios competentes dominan y aumenta el riesgo de epidemias. El surgimiento de zoonosis (COVID-19, ébola, SARS) está vinculado a la destrucción de hábitats que pone a los humanos en contacto con reservorios animales.

Desde la perspectiva biológica, la salud no puede entenderse solo como ausencia de patología individual: depende de la integridad del sistema ecológico en el que vivimos. El deterioro del ambiente es, en última instancia, deterioro de las condiciones que hacen posible la vida humana. La biología aporta la base científica para entender estas relaciones y para diseñar estrategias de prevención y desarrollo sustentable.

---

## Criterios de corrección

| Criterio | Descripción |
|----------|-------------|
| **Conceptual** | Usa y define correctamente los términos técnicos del curso |
| **Explicativo** | No solo enumera: explica mecanismos y relaciones causales |
| **Relacional** | Vincula conceptos de distintos módulos cuando corresponde |
| **Preciso** | Usa datos específicos (nombres, años, números) cuando el módulo los provee |
"""


def upsert_item(title, body, item_type, order_index):
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

    ok = r2.status_code in (200, 201, 204)
    print(f"  [{'OK' if ok else 'ERR'}] {action} {item_type}: HTTP {r2.status_code}")
    if not ok:
        print(f"    {r2.text[:300]}")
    return ok


if __name__ == "__main__":
    print("=== Biologia - material de apoyo ===")
    ok1 = upsert_item("Guia de Estudio de Biologia", GUIA_BODY, "guide", 1)
    ok2 = upsert_item("Modelo de Examen - Biologia", EXAMEN_BODY, "exam_model", 2)
    if ok1 and ok2:
        print("\nOK - Todo subido correctamente.")
    else:
        print("\nERROR - Revisa la salida.")
