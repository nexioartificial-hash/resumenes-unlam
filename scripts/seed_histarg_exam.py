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
SUBJECT_ID = "edf0976e-6d44-4a14-a657-5a14807b1bd0"

EXAM = """## Instrucciones

- Tiempo estimado: 90 minutos
- Respondé con fundamentación: no basta con nombrar un concepto, hay que relacionarlo con el proceso histórico y explicar el "por qué"
- Usá los términos técnicos aprendidos en el curso (globalización, anomia, centro-periferia, ISI, etc.)
- Total: 10 puntos

---

## Parte I — Marco teórico e historia colonial (3 puntos)

### Pregunta 1 (1,5 puntos)

Explicá qué es la **anomia** y cómo se manifiesta como una constante a lo largo de la historia argentina. Ilustrá con al menos dos ejemplos de distintos períodos históricos.

**Respuesta modelo:**

La anomia, en el contexto del curso, describe la situación en la que existe un incumplimiento sistemático de las normas formales: las instituciones y las leyes existen, pero no se respetan en la práctica. La historia argentina exhibe esta constante en múltiples momentos.

Un primer ejemplo es la inestabilidad constitucional del siglo XIX: a pesar de los sucesivos intentos de organización nacional (Constituciones de 1819, 1826, 1853), la práctica política estuvo dominada por el fraude, los pronunciamientos militares y el desconocimiento de los resultados electorales, lo que convirtió a las reglas formales en letra muerta.

Un segundo ejemplo es la ruptura democrática de 1930: la Constitución de 1853/1860 establecía el orden republicano, pero el Ejército derrocó al gobierno constitucional de Yrigoyen. Esta fue la primera vez que las Fuerzas Armadas interrumpieron un gobierno elegido por el sufragio universal, inaugurando un ciclo de "democracia tutelada" que se extendería hasta 1983. La anomia aparece aquí como el incumplimiento del pacto constitucional por parte de actores que se autoproclamaban defensores del orden.

En ambos casos, la anomia no es un defecto individual sino el producto de estructuras históricas: la desigualdad de poder entre actores, la debilidad del Estado y la ausencia de mecanismos efectivos de sanción al incumplimiento de las normas.

---

### Pregunta 2 (1,5 puntos)

¿En qué consistía el **régimen de castas** colonial? Describí al menos tres grupos de la jerarquía social y explicá qué función cumplía este sistema en la economía colonial.

**Respuesta modelo:**

El régimen de castas era el sistema de estratificación social construido por la corona española en América, que combinaba el origen étnico, el lugar de nacimiento y la condición jurídica para determinar el lugar de cada persona en la sociedad colonial. No era un sistema de clases en sentido moderno (basado en la propiedad), sino un orden corporativo heredado del antiguo régimen europeo y adaptado a la realidad americana.

En la cúspide se encontraban los **peninsulares** (españoles nacidos en España), que ocupaban los cargos más altos de la administración colonial (virreyes, oidores, obispos). Por debajo estaban los **criollos** (españoles nacidos en América): aunque compartían el origen europeo, estaban excluidos de los puestos de mayor jerarquía, lo que generó un resentimiento que fue motor de la independencia. Los **mestizos** (hijos de español e indígena), **mulatos** (hijos de europeo y africano) y otras "castas de mezcla" ocupaban posiciones intermedias con restricciones de acceso a ciertos oficios y derechos. En el escalafón más bajo estaban los **indígenas**, sometidos al pago del tributo y a la mita (trabajo forzado rotativo en minas y haciendas), y los **esclavos africanos**, considerados propiedad de sus dueños y carentes de todo derecho.

Económicamente, el régimen de castas garantizaba el acceso diferencial a la fuerza de trabajo: los grupos subordinados (indígenas y esclavos) proveían el trabajo no remunerado o forzado que sostenía la extracción de metales preciosos y la producción agrícola. Esto era funcional al "pacto colonial": el monopolio comercial que reservaba las ganancias de las colonias para la metrópoli ibérica.

---

## Parte II — Siglo XIX: independencia y organización nacional (3 puntos)

### Pregunta 3 (1,5 puntos)

¿Cuáles fueron las **causas** de la Revolución de Mayo de 1810 y en qué sentido fue un proceso "ambiguo": simultáneamente ruptura con España y continuidad del orden social colonial?

**Respuesta modelo:**

La Revolución de Mayo fue el resultado de la confluencia de factores estructurales de largo plazo y coyunturales de corto plazo. Entre los estructurales, la crisis del pacto colonial venía erosionándose desde fines del siglo XVIII: las reformas borbónicas (creación del Virreinato del Río de la Plata en 1776, apertura comercial del Reglamento de Libre Comercio de 1778) habían cambiado las relaciones entre la metrópoli y las élites criollas. Las Invasiones Inglesas de 1806-1807, por su parte, mostraron que la defensa del territorio era obra de las milicias locales y no del Imperio español, fortaleciendo la identidad y la autoconfianza criolla.

El detonante coyuntural fue la invasión napoleónica a España en 1808 y la caída de la Junta Central española en 1810: sin una autoridad legítima en la metrópoli, los criollos argumentaron que la soberanía "revertía al pueblo", lo que justificaba la formación de un gobierno local. El 25 de mayo de 1810 se constituyó la Primera Junta, que gobernaba "en nombre de Fernando VII": formalmente no era una declaración de independencia, sino una medida provisoria ante el vacío de poder.

En su dimensión de **continuidad**, la Revolución fue un movimiento de la élite criolla que no buscaba transformar el orden social: la esclavitud continuó (solo se prohibió el tráfico de esclavos en 1813 y la abolición tardó décadas), la situación de los indígenas no mejoró sustancialmente, y el poder económico permaneció en manos de los mismos grupos terratenientes y comerciantes que existían antes de 1810. La independencia formal (1816) fue la independencia de los criollos, no una revolución social que igualara a todos los habitantes.

---

### Pregunta 4 (1,5 puntos)

¿Cuál era el conflicto central entre **unitarios** y **federales**? ¿Cómo lo resolvió la Constitución de 1853 y por qué esta resolución fue incompleta hasta 1880?

**Respuesta modelo:**

El conflicto unitario-federal fue la disputa central de la política argentina durante casi medio siglo. En su núcleo estaba la pregunta por cómo organizar el Estado: los unitarios querían un gobierno centralizado en Buenos Aires que controlara la totalidad del territorio; los federales (caudillos del interior, provincias del Litoral) defendían la autonomía provincial y, sobre todo, la distribución de los ingresos de la Aduana del Puerto de Buenos Aires, que era la principal fuente de renta del Estado.

La Constitución de 1853, sancionada tras la derrota de Rosas en Caseros (1852), estableció un sistema federal: el poder se distribuía entre el gobierno nacional y las provincias, con representación proporcional en la Cámara de Diputados y representación igualitaria en el Senado. Sin embargo, fue redactada y aplicada sin la participación de Buenos Aires, que se separó de la Confederación y funcionó como Estado autónomo hasta 1859-1861.

La resolución fue **incompleta** hasta 1880 porque el conflicto de fondo (quién controla Buenos Aires y su Aduana) no se había resuelto. La Batalla de Pavón (1861), ganada por Mitre, inició la hegemonía de Buenos Aires sobre el país, pero sin resolver el estatus de la ciudad. La tensión continuó hasta que la "Revolución de 1880" (la batalla de Barracas) y la posterior federalización de la ciudad de Buenos Aires (convertida en capital federal) pusieron fin al conflicto: Buenos Aires cedió su ciudad al Estado nacional a cambio del dominio político y económico sobre el país. Solo entonces la organización nacional quedó definitivamente consolidada.

---

## Parte III — Siglo XX: masas, Estado y democracia (4 puntos)

### Pregunta 5 (2 puntos)

Explicá el surgimiento del **peronismo** como fenómeno histórico: ¿qué condiciones estructurales lo hicieron posible y qué transformaciones introdujo en la relación entre el Estado y la sociedad argentina?

**Respuesta modelo:**

El peronismo no puede entenderse sin el proceso de industrialización sustitutiva que se desarrolló a partir de la crisis de 1929 y se aceleró durante la Segunda Guerra Mundial. La ISI (Industrialización por Sustitución de Importaciones) transformó la estructura social argentina: generó una nueva clase obrera industrial, compuesta en gran parte por migrantes del interior del país (los "cabecitas negras") que llegaban a Buenos Aires y el Gran Buenos Aires en busca de trabajo en las fábricas. Esta clase obrera nueva no tenía tradición sindical propia ni partidos políticos que la representaran: el socialismo y el anarquismo habían sido mayoritariamente movimientos de los inmigrantes europeos de la generación anterior.

En este contexto, Juan Domingo Perón, desde la Secretaría de Trabajo y Previsión del gobierno militar de Farrell (1943), construyó una alianza con la CGT y los sindicatos: implementó legislación laboral (jornada de 8 horas, aguinaldo, convenios colectivos, tribunales de trabajo) que mejoró concretamente las condiciones de vida de los trabajadores. Esto le permitió construir una base de masas que lo llevó a la presidencia en 1946 con el 54% de los votos.

En cuanto a las **transformaciones**, el peronismo introdujo una redefinición profunda de la relación Estado-sociedad:

1. **Expansión del Estado social**: el Estado asumió un papel activo en la redistribución del ingreso, la salud pública, la vivienda y la educación. La Fundación Eva Perón canalizó recursos hacia los sectores más vulnerables.
2. **Incorporación política de los trabajadores**: los obreros pasaron a ser actores políticos reconocidos. El movimiento obrero organizado en la CGT fue el principal apoyo electoral y político del peronismo.
3. **Modelo económico**: el IAPI (Instituto Argentino de Promoción del Intercambio) transfería excedentes del sector agropecuario al Estado para financiar la industrialización y el gasto social. El plan quinquenal de 1947 priorizó la industria nacional y las obras públicas.
4. **Identidad política**: el peronismo creó una nueva identidad política ("los descamisados") que dividió durablemente a la sociedad argentina entre peronistas y antiperonistas, una fractura que persistió durante décadas.

---

### Pregunta 6 (1 punto)

¿Qué fue la **"democracia tutelada"** y cómo condicionó la política argentina entre 1955 y 1983?

**Respuesta modelo:**

La "democracia tutelada" describe el período en que Argentina tuvo formalmente gobiernos civiles elegidos por voto, pero en la práctica estos operaban bajo la permanente supervisión y amenaza de intervención militar. Las condiciones estructurales de este sistema eran dos: la proscripción del peronismo (que representaba a la mayoría del electorado) y la auto-atribución de las Fuerzas Armadas del rol de "árbitro" del sistema político.

En la práctica, esto significaba que cualquier gobierno civil debía mantenerse dentro de los límites que el establishment militar consideraba aceptables: no reincorporar al peronismo, no cuestionar los intereses económicos de las FFAA, no modificar ciertos aspectos de la política exterior. Cuando un gobierno transgredía esos límites, era derrocado. Arturo Frondizi (1958-1962) cayó cuando levantó la proscripción del peronismo y este ganó las elecciones provinciales; Arturo Illia (1963-1966) fue derrocado por Onganía cuando su gobierno resultó "débil" e "ineficiente" a los ojos de los militares.

Este sistema produjo una paradoja: la persistente exclusión del peronismo radicalizó a sus seguidores y generó la violencia política de los años 70, que a su vez sirvió de justificación para el golpe más brutal de la historia argentina (el Proceso de Reorganización Nacional, 1976-1983).

---

### Pregunta 7 (1 punto)

¿Cuáles fueron las principales causas y consecuencias de la **crisis de 2001** en Argentina?

**Respuesta modelo:**

La crisis de 2001 fue el resultado de la acumulación de contradicciones del modelo de Convertibilidad (1991-2001). La Convertibilidad (1 peso = 1 dólar) había eliminado la inflación, pero generó una revaluación artificial del peso que destruyó la competitividad de la industria exportadora argentina. Durante los años 90, el país financió el déficit fiscal y comercial con endeudamiento externo: la deuda externa creció exponencialmente, de 65.000 millones de dólares en 1991 a más de 140.000 millones en 2001.

La recesión que comenzó en 1998 hizo insostenible el esquema: los sucesivos ajustes fiscales del gobierno de De la Rúa (2000-2001) profundizaron la caída del PBI y el desempleo (que llegó al 21,5%), sin lograr reducir el déficit. El "corralito" (restricción al retiro de depósitos bancarios, diciembre 2001) detonó la crisis política: el 19 y 20 de diciembre de 2001, protestas masivas llevaron a la renuncia de De la Rúa con más de 30 muertos en la represión.

Las **consecuencias** inmediatas fueron: la cesación de pagos de la deuda (default de 100.000 millones de dólares, el mayor de la historia hasta ese momento), la devaluación del peso y la "pesificación asimétrica" de los depósitos y deudas, que redistribuyó riqueza de ahorristas hacia deudores y el sistema financiero. A mediano plazo, la recuperación posterior (2003-2007, liderada por Néstor Kirchner) se basó en el superávit fiscal y comercial, la renegociación de la deuda con quita y el regreso al modelo de intervención estatal.

---

## Criterios de corrección

| Criterio | Descripción |
|----------|-------------|
| **Conceptual** | Define y aplica correctamente los conceptos técnicos del curso (anomia, centro-periferia, ISI, etc.) |
| **Procesual** | Analiza los hechos como procesos históricos, no como eventos aislados |
| **Relacional** | Vincula el período estudiado con otros períodos (perspectiva de largo plazo) |
| **Argumentativo** | Explica el "por qué" y no solo el "qué", con fundamentación teórica |
| **Integrador** | En preguntas comparativas, establece diferencias y similitudes con precisión |
"""

def upsert(title, body, type_, order_index):
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/content_items",
        headers=HEADERS,
        params={"subject_id": f"eq.{SUBJECT_ID}", "type": f"eq.{type_}", "select": "id,title"},
    )
    existing = r.json() if r.status_code == 200 else []
    if not isinstance(existing, list):
        existing = []

    payload = {
        "subject_id": SUBJECT_ID,
        "title": title,
        "body": body,
        "type": type_,
        "order_index": order_index,
        "is_published": True,
    }

    if existing:
        item_id = existing[0]["id"]
        res = requests.patch(
            f"{SUPABASE_URL}/rest/v1/content_items?id=eq.{item_id}",
            headers=HEADERS,
            json=payload,
        )
        verb = "PATCH"
    else:
        res = requests.post(
            f"{SUPABASE_URL}/rest/v1/content_items",
            headers=HEADERS,
            json=payload,
        )
        verb = "POST"

    ok = res.status_code in (200, 201, 204)
    print(f"  [{verb}] {title}: {'OK' if ok else f'ERR {res.status_code} — {res.text[:200]}'}")

if __name__ == "__main__":
    print("=== Historia Argentina — Modelo de Examen ===")
    upsert("Modelo de Examen — Historia Argentina", EXAM, "exam_model", 3)
    print("Listo.")
