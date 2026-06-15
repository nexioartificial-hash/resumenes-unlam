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

# UUIDs de módulos
MODULES = {
    1: "5c7f9bee-bedd-4394-8cf2-dc5868beffe7",  # Marco Teórico
    2: "835bb16b-30b7-48d9-910d-a0b8ff774d72",  # Formación Social Americana
    3: "ce360e34-672d-4fae-b238-6d2c5aa6069b",  # Revolución de la Independencia
    4: "d2ff129e-56fe-40d2-88a2-300f06b138fe",  # Guerras Civiles / Confederación
    5: "b05322ce-fb73-4226-bae8-f7a1677962c8",  # República Liberal
    6: "449205c2-a153-483a-b2b3-935be65555db",  # Oligárquico / Reformas
    7: "da8eb683-dfca-48ed-b48e-a091ae8f5473",  # Estado Justicialista
    8: "b40fceaf-4331-437b-8ea2-57d45f0168d9",  # Apertura Democrática
}

# 5 preguntas MCQ por módulo derivadas de los temas de "Preguntas para practicar"
QUESTIONS = {
    1: [  # Marco Teórico: Globalización y Anomia
        {
            "question": "¿Qué describe el esquema 'Centro-Periferia' en el contexto de la globalización en América Latina?",
            "options": [
                {"text": "Países industrializados que exportan capital y manufactura, y países periféricos que proveen materias primas", "is_correct": True},
                {"text": "La división entre zonas urbanas y rurales dentro de cada país latinoamericano", "is_correct": False},
                {"text": "El conflicto político entre partidos centristas y partidos radicales", "is_correct": False},
                {"text": "La relación entre el gobierno central y los gobiernos provinciales en Argentina", "is_correct": False},
            ],
            "explanation": "El esquema centro-periferia describe la relación asimétrica entre países industrializados (centros) que producen manufactura y exportan capital, y países periféricos que proveen materias primas y dependen del mercado externo.",
            "difficulty": "medium",
        },
        {
            "question": "Según el marco teórico del curso, ¿qué es la Anomia?",
            "options": [
                {"text": "El incumplimiento sistemático de la ley y la falta de correspondencia entre las normas formales y la conducta real", "is_correct": True},
                {"text": "La ausencia total de leyes en un Estado", "is_correct": False},
                {"text": "El fenómeno de migración masiva hacia las ciudades", "is_correct": False},
                {"text": "La crisis económica producida por la dependencia del mercado externo", "is_correct": False},
            ],
            "explanation": "La anomia es el incumplimiento de la ley y la inestabilidad e incongruencia de las instituciones. La 'anomia argentina' describe la tendencia histórica a no respetar las reglas formales del sistema.",
            "difficulty": "medium",
        },
        {
            "question": "¿Cuál de las siguientes características corresponde a la primera etapa de la globalización en América Latina (período colonial)?",
            "options": [
                {"text": "Extracción de metales preciosos y productos tropicales bajo el pacto colonial con la metrópoli ibérica", "is_correct": True},
                {"text": "Industrialización sustitutiva de importaciones impulsada por el Estado", "is_correct": False},
                {"text": "Integración financiera y apertura comercial bajo el Consenso de Washington", "is_correct": False},
                {"text": "Exportación de manufacturas hacia los mercados europeos en expansión", "is_correct": False},
            ],
            "explanation": "En la etapa colonial, América Latina fue incorporada a la economía mundial como proveedora de metales preciosos y productos tropicales bajo el monopolio comercial de las metrópolis ibéricas.",
            "difficulty": "medium",
        },
        {
            "question": "¿Qué concepto describe la situación en la que la violencia es generada por la propia estructura social y económica, sin necesidad de un agente individual que la ejerza?",
            "options": [
                {"text": "Violencia estructural", "is_correct": True},
                {"text": "Violencia política", "is_correct": False},
                {"text": "Violencia simbólica", "is_correct": False},
                {"text": "Anomia institucional", "is_correct": False},
            ],
            "explanation": "La violencia estructural es aquella que surge de las condiciones de desigualdad e injusticia en la organización social, sin requerir un agresor individual. Incluye la pobreza, la exclusión y la falta de acceso a derechos básicos.",
            "difficulty": "medium",
        },
        {
            "question": "¿Cómo se denomina el enfoque historiográfico que el curso propone para analizar la Historia Argentina en contraste con el enfoque enciclopédico?",
            "options": [
                {"text": "Análisis estructural basado en la globalización y la anomia como marcos conceptuales transversales", "is_correct": True},
                {"text": "Descripción cronológica de presidencias y batallas militares", "is_correct": False},
                {"text": "Estudio biográfico de los grandes hombres que cambiaron la historia", "is_correct": False},
                {"text": "Periodización basada en ciclos económicos de expansión y contracción", "is_correct": False},
            ],
            "explanation": "El curso propone alejarse del enfoque enciclopédico (enumeración de hechos) para analizar la historia como proceso dinámico usando el esquema centro-periferia y el concepto de anomia como herramientas interpretativas.",
            "difficulty": "easy",
        },
    ],
    2: [  # La Formación Social Americana (Colonia)
        {
            "question": "¿Cuál era la posición de los 'criollos' en el régimen de castas colonial hispanoamericano?",
            "options": [
                {"text": "Españoles nacidos en América: gozaban de privilegios pero estaban excluidos de los cargos más altos de gobierno reservados a los peninsulares", "is_correct": True},
                {"text": "Mestizos descendientes de españoles e indígenas, sin derechos políticos ni económicos", "is_correct": False},
                {"text": "Esclavos africanos liberados que habían comprado su manumisión", "is_correct": False},
                {"text": "Indígenas que habían adoptado la cultura española y recibían trato especial de la Corona", "is_correct": False},
            ],
            "explanation": "Los criollos eran españoles nacidos en América. Aunque ocupaban posiciones económicas privilegiadas, estaban excluidos de los cargos gubernamentales más altos (reservados a peninsulares), lo que generó tensiones que contribuirían a la independencia.",
            "difficulty": "medium",
        },
        {
            "question": "¿En qué consistía la 'mita' como sistema de trabajo colonial?",
            "options": [
                {"text": "Trabajo forzado rotativo impuesto a los indígenas, especialmente en las minas", "is_correct": True},
                {"text": "Sistema de arrendamiento de tierras donde los indígenas pagaban con trabajo", "is_correct": False},
                {"text": "Impuesto en especie que debían pagar las comunidades indígenas a la Corona", "is_correct": False},
                {"text": "Contrato libre de trabajo entre indígenas y hacendados españoles", "is_correct": False},
            ],
            "explanation": "La mita era un sistema de trabajo forzado y rotativo, especialmente en las minas de plata (como Potosí). Los indígenas estaban obligados a trabajar períodos determinados en condiciones muy duras, con alta mortalidad.",
            "difficulty": "medium",
        },
        {
            "question": "¿Qué fue la 'manumisión' en el contexto de la esclavitud colonial?",
            "options": [
                {"text": "El acto por el cual un amo liberaba a un esclavo, voluntariamente o por compra de la libertad", "is_correct": True},
                {"text": "El castigo aplicado a los esclavos que intentaban escapar de las haciendas", "is_correct": False},
                {"text": "El sistema de trabajo esclavo aplicado en las plantaciones azucareras", "is_correct": False},
                {"text": "La abolición legal de la esclavitud decretada por la Corona española", "is_correct": False},
            ],
            "explanation": "La manumisión era la liberación de un esclavo, ya sea por decisión voluntaria del amo o mediante la compra de la propia libertad por parte del esclavo. Era la única vía de salida legal del sistema esclavista.",
            "difficulty": "medium",
        },
        {
            "question": "¿Cuál era el objetivo principal del 'pacto colonial' que regulaba las relaciones entre la metrópoli y las colonias americanas?",
            "options": [
                {"text": "Reservar el comercio colonial exclusivamente para la metrópoli, impidiendo el comercio directo con otras potencias", "is_correct": True},
                {"text": "Garantizar la evangelización de los pueblos indígenas por las órdenes religiosas", "is_correct": False},
                {"text": "Establecer instituciones de autogobierno en las colonias para facilitar la administración", "is_correct": False},
                {"text": "Promover la inmigración europea para poblar los territorios americanos despoblados", "is_correct": False},
            ],
            "explanation": "El pacto colonial (o monopolio comercial) reservaba el comercio exclusivamente para la metrópoli: las colonias solo podían comerciar con España, a través de puertos habilitados. Esto generó contrabando y tensiones económicas.",
            "difficulty": "medium",
        },
        {
            "question": "¿Cuál de los siguientes grupos ocupaba el escalafón más bajo de la pirámide social colonial en Hispanoamérica?",
            "options": [
                {"text": "Los esclavos africanos, que eran propiedad de sus amos y carecían de derechos", "is_correct": True},
                {"text": "Los indígenas sometidos al régimen de encomiendas", "is_correct": False},
                {"text": "Los mestizos hijos de españoles e indígenas", "is_correct": False},
                {"text": "Los mulatos hijos de europeos y africanos", "is_correct": False},
            ],
            "explanation": "En la pirámide colonial, los esclavos africanos ocupaban el escalafón más bajo: eran considerados propiedad, carecían de derechos y podían ser vendidos. Aunque los indígenas también eran explotados, tenían reconocimiento legal como 'súbditos libres' de la Corona.",
            "difficulty": "easy",
        },
    ],
    3: [  # La Revolución de la Independencia
        {
            "question": "¿Cuál fue la consecuencia más importante de las Invasiones Inglesas de 1806-1807 para el proceso de independencia rioplatense?",
            "options": [
                {"text": "Demostraron la debilidad militar española y fortalecieron la identidad y autoconfianza de las milicias locales", "is_correct": True},
                {"text": "Lograron que Gran Bretaña se convirtiera en aliada formal del Virreinato del Río de la Plata", "is_correct": False},
                {"text": "Provocaron la expulsión definitiva de los virreyes españoles del territorio", "is_correct": False},
                {"text": "Iniciaron un período de dominio comercial británico formalmente reconocido por la Corona española", "is_correct": False},
            ],
            "explanation": "Las Invasiones Inglesas mostraron que la defensa del territorio fue realizada por las milicias locales (no por España), lo que fortaleció la identidad criolla y la confianza para la futura emancipación. Además, establecieron vínculos con el comercio británico.",
            "difficulty": "medium",
        },
        {
            "question": "¿Qué ocurrió en el Cabildo Abierto del 22 de mayo de 1810?",
            "options": [
                {"text": "Se debatió si el virrey Cisneros debía continuar en el poder tras la caída de la Junta Central española y se decidió su remoción", "is_correct": True},
                {"text": "Se proclamó formalmente la independencia del Virreinato del Río de la Plata de España", "is_correct": False},
                {"text": "Se eligió a San Martín como primer gobernador del Río de la Plata", "is_correct": False},
                {"text": "Se sancionó la primera Constitución del territorio rioplatense", "is_correct": False},
            ],
            "explanation": "El Cabildo Abierto del 22 de mayo debatió la legitimidad del virrey Cisneros tras la caída de la Junta Central española (que lo había nombrado). El 25 de mayo se formó la Primera Junta, que asumió el gobierno en nombre de Fernando VII.",
            "difficulty": "medium",
        },
        {
            "question": "¿Cuál fue el proyecto de Manuel Belgrano para la forma de gobierno del Río de la Plata, propuesto en el Congreso de Tucumán?",
            "options": [
                {"text": "Una monarquía constitucional con un descendiente de la dinastía incaica como rey", "is_correct": True},
                {"text": "Una república federalista con autonomía plena de las provincias", "is_correct": False},
                {"text": "Un protectorado bajo la tutela del Imperio Británico", "is_correct": False},
                {"text": "Una república unitaria centralizada en Buenos Aires", "is_correct": False},
            ],
            "explanation": "Belgrano propuso en el Congreso de Tucumán una monarquía constitucional con un príncipe de la dinastía incaica (para conciliar el apoyo indígena y dotar de legitimidad histórica al nuevo Estado). La propuesta fue rechazada.",
            "difficulty": "hard",
        },
        {
            "question": "¿Qué misión cumplió el Ejército de los Andes comandado por San Martín?",
            "options": [
                {"text": "Cruzar la cordillera para liberar Chile y luego avanzar por mar sobre el Perú, completando la independencia en el sur del continente", "is_correct": True},
                {"text": "Defender el territorio del Río de la Plata de la reconquista española desde el norte", "is_correct": False},
                {"text": "Suprimir los levantamientos federales en el interior del Virreinato", "is_correct": False},
                {"text": "Expulsar a las fuerzas portuguesas que avanzaban desde el Brasil sobre la Banda Oriental", "is_correct": False},
            ],
            "explanation": "El cruce de los Andes (1817) fue la clave estratégica de San Martín: liberar Chile primero y luego atacar el corazón del poder español en América del Sur (Lima, Perú) por vía marítima, evitando el desgaste de una guerra terrestre directa.",
            "difficulty": "easy",
        },
        {
            "question": "¿Qué fue el 'Congreso de Oriente' realizado en Arroyo de la China (1815)?",
            "options": [
                {"text": "Una reunión de las provincias del Litoral y la Banda Oriental que declaró su autonomía y defendió el modelo federalista bajo el liderazgo de Artigas", "is_correct": True},
                {"text": "El congreso en el que se aprobó el Reglamento Provisorio de 1817 para las Provincias Unidas", "is_correct": False},
                {"text": "Una asamblea convocada por el Directorio para resolver el conflicto con el Imperio del Brasil", "is_correct": False},
                {"text": "El encuentro diplomático entre San Martín y el virrey del Perú que precedió a la batalla de Maipú", "is_correct": False},
            ],
            "explanation": "El Congreso de Oriente (1815) fue convocado por Artigas y reunió a las provincias del Litoral y la Banda Oriental. Declararon su autonomía respecto al gobierno centralizado de Buenos Aires y sentaron las bases del federalismo artiguista.",
            "difficulty": "hard",
        },
    ],
    4: [  # Guerras Civiles / Confederación
        {
            "question": "¿Qué fue la 'enfiteusis' implementada por Rivadavia y por qué fue criticada?",
            "options": [
                {"text": "Un sistema de arrendamiento de tierras públicas que en la práctica concentró el uso de la tierra en pocas familias sin transferir la propiedad", "is_correct": True},
                {"text": "Un impuesto progresivo a la tierra que buscaba redistribuir la riqueza entre los sectores rurales pobres", "is_correct": False},
                {"text": "Un programa de colonización que entregaba tierras en propiedad a los inmigrantes europeos", "is_correct": False},
                {"text": "La expropiación de tierras de la Iglesia para financiar la educación pública laica", "is_correct": False},
            ],
            "explanation": "La enfiteusis de Rivadavia arrendaba tierras públicas a largo plazo para obtener rentas. En la práctica, las grandes familias terratenientes acapararon los arrendamientos, concentrando el uso de la tierra sin que cambiara la estructura de propiedad.",
            "difficulty": "hard",
        },
        {
            "question": "¿Quiénes formaron el 'Ejército Grande' que derrotó a Rosas en la Batalla de Caseros (1852)?",
            "options": [
                {"text": "Una coalición de Brasil, Uruguay y las provincias argentinas opositoras de Entre Ríos y Corrientes, comandada por Urquiza", "is_correct": True},
                {"text": "El Ejército de los Andes reorganizado por San Martín en colaboración con Chile", "is_correct": False},
                {"text": "Las fuerzas unitarias exiliadas en Chile que regresaron con apoyo inglés", "is_correct": False},
                {"text": "Una alianza entre Buenos Aires y las provincias del interior opositoras al federalismo de Rosas", "is_correct": False},
            ],
            "explanation": "El Ejército Grande fue una coalición internacional: el Imperio del Brasil, el Estado Oriental del Uruguay y las provincias argentinas de Entre Ríos y Corrientes (opositoras a Rosas), todos comandados por Justo José de Urquiza.",
            "difficulty": "medium",
        },
        {
            "question": "¿Cuál fue la consecuencia inmediata de la Batalla de Pavón (1861)?",
            "options": [
                {"text": "La hegemonía de Buenos Aires sobre la Confederación y el inicio del proceso de unificación nacional bajo la dirección porteña", "is_correct": True},
                {"text": "La creación de la Confederación Argentina con capital en Paraná y exclusión de Buenos Aires", "is_correct": False},
                {"text": "El retorno de Rosas desde el exilio y la recuperación del poder por los federales", "is_correct": False},
                {"text": "La firma de un tratado de paz definitivo entre unitarios y federales que puso fin a las guerras civiles", "is_correct": False},
            ],
            "explanation": "Tras Pavón, Buenos Aires impuso su hegemonía sobre la Confederación. Mitre aprovechó la victoria para intervenir en las provincias del interior con las armas y dirigir el proceso de organización nacional desde Buenos Aires.",
            "difficulty": "medium",
        },
        {
            "question": "¿Por qué Manuel Dorrego es una figura central en la transición entre el período rivadaviano y el rosismo?",
            "options": [
                {"text": "Como gobernador federal de Buenos Aires negoció la paz con el Brasil y fue fusilado por Lavalle en 1828, lo que radicalizó el conflicto unitario-federal", "is_correct": True},
                {"text": "Fue el primero en proponer una constitución federal para las Provincias Unidas y presidió el Congreso de 1826", "is_correct": False},
                {"text": "Lideró la Liga del Interior que se opuso al Bloqueo Francés y negoció la retirada de las fuerzas europeas", "is_correct": False},
                {"text": "Fundó el Partido Federal y fue el mentor político de Juan Manuel de Rosas en sus primeros años de gobierno", "is_correct": False},
            ],
            "explanation": "Dorrego fue gobernador federal de Buenos Aires y firmó la paz con el Brasil (1828). Fue derrocado y fusilado por el unitario Lavalle, lo que exacerbó el conflicto civil y allanó el camino para el ascenso de Rosas.",
            "difficulty": "hard",
        },
        {
            "question": "¿Qué diferencia fundamental separaba a 'unitarios' y 'federales' en el contexto de las guerras civiles argentinas del siglo XIX?",
            "options": [
                {"text": "Los unitarios querían un gobierno centralizado con sede en Buenos Aires; los federales defendían la autonomía de las provincias y la distribución de los ingresos aduaneros", "is_correct": True},
                {"text": "Los unitarios apoyaban el libre comercio con Europa; los federales defendían el proteccionismo y la industria nacional", "is_correct": False},
                {"text": "Los unitarios eran terratenientes del interior; los federales eran comerciantes y artesanos urbanos de Buenos Aires", "is_correct": False},
                {"text": "Los unitarios buscaban la independencia de España; los federales querían mantener el vínculo con la metrópoli", "is_correct": False},
            ],
            "explanation": "La disputa central era sobre el modelo de organización política: los unitarios querían centralizar el poder en Buenos Aires; los federales defendían la autonomía provincial y que los recursos de la Aduana (controlada por Buenos Aires) se distribuyeran entre todas las provincias.",
            "difficulty": "easy",
        },
    ],
    5: [  # República Liberal / Modelo Agroexportador
        {
            "question": "¿Cuál fue el papel de los ferrocarriles en el modelo agroexportador argentino de fines del siglo XIX?",
            "options": [
                {"text": "Conectar las zonas productivas del interior con el puerto de Buenos Aires, facilitando la exportación de materias primas y profundizando la dependencia del mercado externo", "is_correct": True},
                {"text": "Fomentar el desarrollo industrial del interior conectando fábricas con mercados urbanos nacionales", "is_correct": False},
                {"text": "Permitir la colonización de la Patagonia y el Chaco mediante líneas de transporte de inmigrantes", "is_correct": False},
                {"text": "Integrar a Argentina en una red ferroviaria latinoamericana para reducir la dependencia del comercio marítimo", "is_correct": False},
            ],
            "explanation": "Los ferrocarriles de capital británico articularon la economía argentina en función del modelo agroexportador: conectaban las zonas productivas (Pampa húmeda, especialmente) con el puerto de Buenos Aires para facilitar la exportación, no para desarrollar el mercado interno.",
            "difficulty": "medium",
        },
        {
            "question": "¿Por qué la crisis de 1890 ('Crisis del 90') puso de manifiesto los límites del modelo agroexportador?",
            "options": [
                {"text": "Reveló la vulnerabilidad de una economía dependiente de los precios internacionales de materias primas y del crédito externo, sin capacidad de generar riqueza propia", "is_correct": True},
                {"text": "Demostró que Argentina no tenía suficiente mano de obra para sostener el crecimiento productivo del sector agropecuario", "is_correct": False},
                {"text": "Mostró que el proteccionismo europeo impedía el acceso de los productos argentinos a los mercados del continente", "is_correct": False},
                {"text": "Reveló los límites de la extensión territorial disponible para la expansión agrícola pampeana", "is_correct": False},
            ],
            "explanation": "La Crisis del 90 fue una crisis financiera provocada por el endeudamiento externo excesivo y la caída de los precios internacionales. Mostró que el modelo agroexportador dependía de factores externos (precios y crédito) sobre los que Argentina no tenía control.",
            "difficulty": "medium",
        },
        {
            "question": "¿Cuál era la función principal de la inmigración masiva en el modelo agroexportador argentino?",
            "options": [
                {"text": "Proveer mano de obra barata para la producción agrícola pampeana y poblar el territorio según el proyecto liberal de 'gobernar es poblar'", "is_correct": True},
                {"text": "Traer capital extranjero para financiar la industrialización del país", "is_correct": False},
                {"text": "Reemplazar a la población indígena en las zonas conquistadas durante la Campaña del Desierto", "is_correct": False},
                {"text": "Aportar conocimientos técnicos para desarrollar una industria nacional competitiva", "is_correct": False},
            ],
            "explanation": "La inmigración masiva (principalmente europea) fue funcional al modelo agroexportador: proveyó la mano de obra necesaria para la expansión agrícola y cumplió el programa liberal de 'gobernar es poblar', integrando a Argentina al mercado mundial.",
            "difficulty": "easy",
        },
        {
            "question": "¿Cuál fue el mecanismo de distribución de la tierra más característico de la época de Roca?",
            "options": [
                {"text": "La entrega de grandes extensiones de tierra a especuladores, terratenientes y militares tras la Campaña del Desierto, consolidando el latifundio pampeano", "is_correct": True},
                {"text": "La creación de colonias agrícolas para inmigrantes con parcelas medianas en propiedad", "is_correct": False},
                {"text": "La nacionalización de las tierras fiscales para financiar la educación pública obligatoria", "is_correct": False},
                {"text": "La reforma agraria que limitó el tamaño de las propiedades y distribuyó el excedente entre los campesinos sin tierra", "is_correct": False},
            ],
            "explanation": "Tras la Campaña del Desierto (1879), las tierras conquistadas fueron distribuidas principalmente entre especuladores, militares y terratenientes en grandes extensiones. Esto consolidó el latifundio como estructura dominante y limitó el acceso a la tierra de los inmigrantes.",
            "difficulty": "medium",
        },
        {
            "question": "¿Cuál era la principal cuestión pendiente en Argentina inmediatamente antes del primer período presidencial de Roca (1880)?",
            "options": [
                {"text": "La federalización de la ciudad de Buenos Aires como capital de la República, que resolvió el conflicto entre el Estado nacional y la provincia más poderosa", "is_correct": True},
                {"text": "La firma de la Constitución Nacional, que aún no había sido ratificada por todas las provincias", "is_correct": False},
                {"text": "La deuda externa con Gran Bretaña contraída durante las presidencias de Mitre y Sarmiento", "is_correct": False},
                {"text": "La resolución del conflicto limítrofe con Chile por la Patagonia sur", "is_correct": False},
            ],
            "explanation": "La federalización de Buenos Aires (1880) fue la condición previa para la consolidación del Estado nacional. Buenos Aires, que era simultáneamente capital provincial y sede del gobierno nacional, debía ser cedida como capital federal, lo que generó una guerra civil menor.",
            "difficulty": "medium",
        },
    ],
    6: [  # Oligárquico / Reformas Democráticas
        {
            "question": "¿Cuáles fueron los tres principios fundamentales de la Ley Sáenz Peña (N° 8.871) de 1912?",
            "options": [
                {"text": "Sufragio universal masculino, secreto y obligatorio", "is_correct": True},
                {"text": "Sufragio universal (hombres y mujeres), secreto y proporcional", "is_correct": False},
                {"text": "Voto directo, público y censitario para los mayores contribuyentes", "is_correct": False},
                {"text": "Representación proporcional, voto indirecto y padrón electoral voluntario", "is_correct": False},
            ],
            "explanation": "La Ley Sáenz Peña estableció el voto universal (solo varones mayores de 18 años), secreto (para eliminar el fraude y la presión) y obligatorio (para garantizar la participación). Permitió la llegada de la UCR al poder en 1916.",
            "difficulty": "easy",
        },
        {
            "question": "¿Por qué el levantamiento cívico-militar de 1890 ('La Revolución del Parque') es considerado el antecedente de la Unión Cívica Radical?",
            "options": [
                {"text": "Fue liderado por la Unión Cívica, que luego se dividió entre quienes aceptaron el acuerdo con Roca (Unión Cívica Nacional) y quienes se negaron, formando la UCR bajo Alem", "is_correct": True},
                {"text": "Fue el primer movimiento que exigió el sufragio universal y secreto como condición para la democratización", "is_correct": False},
                {"text": "Llevó a Hipólito Yrigoyen al poder como primer presidente surgido del voto popular libre", "is_correct": False},
                {"text": "Fue liderado directamente por los fundadores de la UCR que redactaron la Carta Orgánica del partido", "is_correct": False},
            ],
            "explanation": "La Revolución del Parque fue protagonizada por la Unión Cívica. Tras el fracaso, el sector que aceptó negociar con Mitre y Roca formó la Unión Cívica Nacional; el sector que rechazó el 'Acuerdo' (liderado por Leandro Alem) fundó la Unión Cívica Radical.",
            "difficulty": "hard",
        },
        {
            "question": "¿Cuál fue el argumento central de 'La hora de la Espada' de Leopoldo Lugones (1924) y su relación con el golpe de 1930?",
            "options": [
                {"text": "Propuso que el Ejército debía tomar el poder para salvar a la Nación de la 'decadencia' democrática, inspirando ideológicamente al golpe de Uriburu", "is_correct": True},
                {"text": "Defendió la intervención militar solo en casos de invasión extranjera, rechazando los golpes de Estado internos", "is_correct": False},
                {"text": "Argumentó que la democracia radical de Yrigoyen era el camino correcto para el progreso argentino", "is_correct": False},
                {"text": "Propuso la alianza con el fascismo italiano como modelo político para superar el liberalismo", "is_correct": False},
            ],
            "explanation": "En 'La hora de la Espada' (Ayacucho, 1924), Lugones proclamó que había llegado 'la hora de la espada' (el Ejército) para superar la 'demagogia' democrática. Este discurso fue el sustento ideológico del nacionalismo militar que ejecutó el golpe de Uriburu en 1930.",
            "difficulty": "hard",
        },
        {
            "question": "¿En qué consistió el Proceso de Industrialización por Sustitución de Importaciones (ISI) iniciado en la década de 1930?",
            "options": [
                {"text": "El desarrollo de industrias nacionales para producir en el país los bienes manufacturados que antes se importaban, impulsado por la crisis internacional y el cierre del comercio externo", "is_correct": True},
                {"text": "La privatización de las empresas extranjeras para ponerlas en manos de capitales nacionales", "is_correct": False},
                {"text": "La sustitución de cultivos de exportación por producción de alimentos para el mercado interno", "is_correct": False},
                {"text": "Un plan de obras públicas financiado con créditos del Banco Mundial para reemplazar las importaciones de maquinaria pesada", "is_correct": False},
            ],
            "explanation": "El ISI fue el proceso por el cual Argentina desarrolló industrias nacionales para producir los bienes manufacturados que antes importaba de Europa. La Gran Depresión de 1929 y la Segunda Guerra Mundial cortaron el comercio externo, forzando la industrialización.",
            "difficulty": "easy",
        },
        {
            "question": "¿Qué fue la 'disidencia de Alvear' y cómo impactó en la UCR?",
            "options": [
                {"text": "El conflicto entre los sectores yrigoyenistas y los alvearistas dentro de la UCR, que llevó a la división entre 'personalistas' (seguidores de Yrigoyen) y 'antipersonalistas' (seguidores de Alvear)", "is_correct": True},
                {"text": "El abandono de Alvear de la UCR para fundar un partido propio de centroderecha que apoyó el golpe de 1930", "is_correct": False},
                {"text": "La ruptura de Alvear con el radicalismo tras ser vetado por Yrigoyen como candidato presidencial en 1928", "is_correct": False},
                {"text": "El acuerdo de Alvear con el Partido Socialista para formar un frente antiyrigoyenista en las elecciones de 1924", "is_correct": False},
            ],
            "explanation": "Durante la presidencia de Alvear (1922-1928), la UCR se dividió entre 'personalistas' (leales a Yrigoyen, que seguía controlando el partido) y 'antipersonalistas' (que apoyaban a Alvear y rechazaban el caudillismo yrigoyenista).",
            "difficulty": "medium",
        },
    ],
    7: [  # Estado Justicialista / Democracia Tutelada
        {
            "question": "¿Cuáles fueron los principales factores estructurales que posibilitaron el surgimiento del peronismo en la década de 1940?",
            "options": [
                {"text": "La migración interna del campo a las ciudades que creó una nueva clase obrera industrial sin representación política, y el crecimiento del Estado como empleador", "is_correct": True},
                {"text": "La crisis del liberalismo económico y la influencia ideológica directa del fascismo italiano en las fuerzas armadas argentinas", "is_correct": False},
                {"text": "El apoyo de los terratenientes pampeanos al gobierno de Farrell que nombró a Perón en la Secretaría de Trabajo", "is_correct": False},
                {"text": "La alianza entre el Partido Socialista y el sindicalismo anarquista que creó las condiciones para un movimiento obrero unificado", "is_correct": False},
            ],
            "explanation": "El proceso de industrialización sustitutiva generó una migración masiva del interior hacia Buenos Aires. Estos 'cabecitas negras' eran trabajadores urbanos nuevos, sin tradición sindical y sin partidos que los representaran. Perón los captó desde la Secretaría de Trabajo.",
            "difficulty": "medium",
        },
        {
            "question": "¿Qué fue el IAPI y cuál era su función en el modelo económico del primer peronismo?",
            "options": [
                {"text": "El Instituto Argentino de Promoción del Intercambio, que monopolizaba el comercio exterior y transfería parte de las ganancias del sector agropecuario al Estado para financiar la industria", "is_correct": True},
                {"text": "El Instituto de Ayuda a la Población Inmigrante, que coordinaba el arribo y radicación de trabajadores europeos", "is_correct": False},
                {"text": "El organismo de planificación económica que elaboraba los Planes Quinquenales del gobierno peronista", "is_correct": False},
                {"text": "La agencia estatal que administraba las empresas públicas nacionalizadas durante el primer peronismo", "is_correct": False},
            ],
            "explanation": "El IAPI (Instituto Argentino de Promoción del Intercambio) era el organismo estatal que monopolizaba las exportaciones agropecuarias: compraba los granos a los productores a precios menores que los internacionales y los vendía al exterior a precios de mercado, reteniendo la diferencia para financiar la industrialización y el gasto social.",
            "difficulty": "hard",
        },
        {
            "question": "¿Qué se entiende por 'Democracia Tutelada' en el contexto de la historia argentina de 1955 a 1983?",
            "options": [
                {"text": "Gobiernos civiles elegidos por voto pero condicionados por el poder militar, que proscribía al peronismo y amenazaba con golpes si se tomaban medidas que afectaran sus intereses", "is_correct": True},
                {"text": "Dictaduras militares que realizaban elecciones periódicas de carácter consultivo para validar sus decisiones de gobierno", "is_correct": False},
                {"text": "Gobiernos provinciales supervisados por interventores federales nombrados por el Ejecutivo nacional", "is_correct": False},
                {"text": "El período de transición entre la última dictadura y la consolidación democrática de los años 90", "is_correct": False},
            ],
            "explanation": "La 'democracia tutelada' describe los gobiernos civiles (Frondizi 1958-62, Illia 1963-66) que operaban con el peronismo proscripto y bajo la permanente amenaza de intervención militar. Las Fuerzas Armadas actuaban como 'tutores' del sistema político.",
            "difficulty": "medium",
        },
        {
            "question": "¿Cuáles fueron las principales medidas del gobierno de la dictadura militar conocida como 'Proceso de Reorganización Nacional' (1976-1983) en materia económica?",
            "options": [
                {"text": "Apertura comercial y financiera, desindustrialización, endeudamiento externo masivo y reducción de salarios reales", "is_correct": True},
                {"text": "Estatización de las empresas extranjeras, proteccionismo industrial y redistribución del ingreso hacia los sectores populares", "is_correct": False},
                {"text": "Continuación del ISI con fuerte inversión en industria pesada y restricción de las importaciones", "is_correct": False},
                {"text": "Reforma agraria que limitó el latifundio y distribuyó tierras entre los trabajadores rurales", "is_correct": False},
            ],
            "explanation": "El Proceso implementó una política económica liberal: apertura comercial que destruyó la industria nacional, liberalización financiera que estimuló la especulación, endeudamiento externo exponencial y reducción de los salarios reales mediante la represión sindical.",
            "difficulty": "medium",
        },
        {
            "question": "¿Cuál fue el concepto de 'desarrollismo' implementado durante la presidencia de Arturo Frondizi (1958-1962)?",
            "options": [
                {"text": "Una política de industrialización que priorizaba la radicación de capital extranjero en sectores clave (petróleo, acero, petroquímica) para superar el 'cuello de botella' energético-industrial", "is_correct": True},
                {"text": "Un programa de desarrollo rural que buscaba modernizar el agro argentino mediante la mecanización y los agroquímicos", "is_correct": False},
                {"text": "Una estrategia de desarrollo sustentable basada en el aprovechamiento de los recursos naturales con participación estatal mayoritaria", "is_correct": False},
                {"text": "Un plan de desarrollo social que combinaba educación, vivienda y salud para reducir la pobreza estructural", "is_correct": False},
            ],
            "explanation": "El desarrollismo de Frondizi (influenciado por Rogelio Frigerio) buscaba superar el 'cuello de botella' que frenaba la industrialización: la dependencia energética y la falta de industria pesada. Para ello, atrajo inversión extranjera en petróleo (contratos petroleros) y sectores estratégicos, aunque esto generó tensiones políticas.",
            "difficulty": "hard",
        },
    ],
    8: [  # La Apertura Democrática
        {
            "question": "¿Cuáles fueron las principales causas que llevaron a la dictadura militar a convocar elecciones en 1983?",
            "options": [
                {"text": "La derrota en la Guerra de Malvinas (1982), la crisis económica con hiperinflación y el aislamiento internacional por las violaciones a los derechos humanos", "is_correct": True},
                {"text": "La presión de la Junta de los tres comandantes que acordó ceder el poder ante la imposibilidad de acordar un sucesor interno", "is_correct": False},
                {"text": "El acuerdo político entre la dictadura y los partidos mayoritarios para una transición gradual y ordenada", "is_correct": False},
                {"text": "La intervención de Estados Unidos que condicionó el crédito del FMI a la realización de elecciones democráticas", "is_correct": False},
            ],
            "explanation": "La combinación de la derrota en Malvinas (que destruyó la legitimidad del régimen), la crisis económica galopante y el aislamiento internacional por las denuncias de derechos humanos hicieron insostenible la continuidad del Proceso y forzaron la convocatoria a elecciones.",
            "difficulty": "easy",
        },
        {
            "question": "¿Cuál fue el principal logro del gobierno de Raúl Alfonsín en materia de derechos humanos?",
            "options": [
                {"text": "El Juicio a las Juntas Militares (1985), que condenó a prisión a los comandantes de las tres juntas por crímenes de lesa humanidad", "is_correct": True},
                {"text": "La firma del Pacto de San José de Costa Rica que ratificó la Convención Americana de Derechos Humanos", "is_correct": False},
                {"text": "La creación de la CONADEP y la publicación del informe 'Nunca Más', que documentó los crímenes de la dictadura", "is_correct": False},
                {"text": "La aprobación de la Ley de Amnistía que permitió el regreso de todos los exiliados políticos", "is_correct": False},
            ],
            "explanation": "El Juicio a las Juntas (1985) fue el primer juicio a líderes militares por crímenes de lesa humanidad en América Latina durante la democracia. Videla y Massera fueron condenados a prisión perpetua. La CONADEP y el Nunca Más fueron el paso previo de investigación.",
            "difficulty": "easy",
        },
        {
            "question": "¿Qué fue el 'Plan de Convertibilidad' implementado durante la presidencia de Menem y cuál fue su consecuencia final?",
            "options": [
                {"text": "Fijó el tipo de cambio a 1 peso = 1 dólar para eliminar la inflación, lo que generó una revaluación artificial que destruyó la competitividad exportadora y terminó en la crisis de 2001", "is_correct": True},
                {"text": "Convirtió las empresas públicas en sociedades anónimas con capital mixto estatal y privado para mejorar su eficiencia", "is_correct": False},
                {"text": "Estableció la convertibilidad entre el peso argentino y las monedas del Mercosur para facilitar el comercio regional", "is_correct": False},
                {"text": "Creó un fondo soberano para convertir la deuda externa en inversión productiva dentro del país", "is_correct": False},
            ],
            "explanation": "La Convertibilidad (1991, ministro Cavallo) fijó 1 peso = 1 dólar y eliminó la inflación. Pero la paridad artificial encareció las exportaciones argentinas, generó déficit comercial y fiscal creciente, deuda externa explosiva y recesión, que culminaron en la crisis de 2001.",
            "difficulty": "medium",
        },
        {
            "question": "¿Qué fue el 'Pacto de Olivos' (1993) y qué reformas introdujo en la Constitución de 1994?",
            "options": [
                {"text": "El acuerdo entre Menem (PJ) y Alfonsín (UCR) para habilitar la reelección presidencial a cambio de reformas institucionales como el Consejo de la Magistratura y el Jefe de Gabinete", "is_correct": True},
                {"text": "El tratado de integración regional entre Argentina y Brasil que fue el antecedente inmediato del Mercosur", "is_correct": False},
                {"text": "El acuerdo entre el gobierno y los militares que cerró los juicios por derechos humanos a cambio de la subordinación institucional de las FFAA", "is_correct": False},
                {"text": "El pacto fiscal entre Nación y Provincias que redistribuyó la coparticipación federal durante el menemismo", "is_correct": False},
            ],
            "explanation": "El Pacto de Olivos fue el acuerdo entre Menem y Alfonsín: el PJ obtuvo la reelección presidencial; la UCR consiguió reformas institucionales (Consejo de la Magistratura, Jefe de Gabinete, senador por la minoría, constitucionalización de los tratados internacionales).",
            "difficulty": "medium",
        },
        {
            "question": "¿Cuál fue la política económica central del gobierno de Fernando De la Rúa (1999-2001) frente a la recesión?",
            "options": [
                {"text": "Ajuste fiscal permanente para mantener el déficit cero, profundizando la recesión sin poder salir de la Convertibilidad, hasta el colapso de diciembre de 2001", "is_correct": True},
                {"text": "Devaluación controlada del peso para recuperar la competitividad exportadora y reactivar la economía", "is_correct": False},
                {"text": "Aumento del gasto público y expansión del crédito para estimular la demanda interna en recesión", "is_correct": False},
                {"text": "Renegociación de la deuda externa con quita de capital para reducir el peso del endeudamiento sobre el presupuesto", "is_correct": False},
            ],
            "explanation": "De la Rúa mantuvo la Convertibilidad y aplicó ajustes fiscales sucesivos (Machinea, López Murphy, Cavallo) para cumplir con el FMI. El ajuste profundizó la recesión, generó desempleo masivo y la crisis de legitimidad que terminó con su renuncia el 20 de diciembre de 2001.",
            "difficulty": "medium",
        },
    ],
}


def insert_questions(module_order, questions):
    module_id = MODULES[module_order]
    ok_count = 0
    for i, q in enumerate(questions, 1):
        payload = {
            "subject_id": SUBJECT_ID,
            "module_id": module_id,
            "question": q["question"],
            "options": q["options"],
            "explanation": q["explanation"],
            "difficulty": q["difficulty"],
            "order_index": 100 + i,  # índice alto para no conflictar con los 5 existentes
            "is_published": True,
        }
        r = requests.post(
            f"{SUPABASE_URL}/rest/v1/quiz_questions",
            headers=HEADERS,
            json=payload,
        )
        ok = r.status_code in (200, 201)
        if ok:
            ok_count += 1
        else:
            print(f"    [ERR] M{module_order} q{i}: HTTP {r.status_code} — {r.text[:150]}")
    return ok_count


if __name__ == "__main__":
    print("=== Historia Argentina — quizzes extra (5 por modulo) ===")
    total = 0
    for mod_order in sorted(QUESTIONS.keys()):
        n = insert_questions(mod_order, QUESTIONS[mod_order])
        total += n
        print(f"  Modulo {mod_order}: {n}/{len(QUESTIONS[mod_order])} OK")
    print(f"\nTotal insertadas: {total}/40")
