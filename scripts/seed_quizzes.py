import requests, sys, io, json
from datetime import datetime, timezone

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

SUPABASE_URL = "https://dtbouycelkjgyddpftir.supabase.co"
SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Ym91eWNlbGtqZ3lkZHBmdGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg4MTkwOSwiZXhwIjoyMDk0NDU3OTA5fQ.JKJygGS7S5vfa8Pw5HhnsbcH5OHS2gJ6Qjud4-fgEPg"
SUBJECT_ID   = "edf0976e-6d44-4a14-a657-5a14807b1bd0"

MODULES = {
    1: "5c7f9bee-bedd-4394-8cf2-dc5868beffe7",
    2: "835bb16b-30b7-48d9-910d-a0b8ff774d72",
    3: "ce360e34-672d-4fae-b238-6d2c5aa6069b",
    4: "d2ff129e-56fe-40d2-88a2-300f06b138fe",
    5: "b05322ce-fb73-4226-bae8-f7a1677962c8",
    6: "449205c2-a153-483a-b2b3-935be65555db",
    7: "da8eb683-dfca-48ed-b48e-a091ae8f5473",
    8: "b40fceaf-4331-437b-8ea2-57d45f0168d9",
}

def q(question, correct, wrong1, wrong2, wrong3, explanation, difficulty="medium"):
    return {
        "question": question,
        "options": [
            {"text": correct,  "is_correct": True},
            {"text": wrong1,   "is_correct": False},
            {"text": wrong2,   "is_correct": False},
            {"text": wrong3,   "is_correct": False},
        ],
        "explanation": explanation,
        "difficulty":  difficulty,
    }

# ── Preguntas por módulo ───────────────────────────────────────────────────────

MODULE_QUESTIONS = {

1: [
    q("¿En qué siglo se originó el proceso de globalización según el módulo?",
      "Siglo XV, con la conquista de América por españoles y portugueses",
      "Siglo XIX, con la Revolución Industrial inglesa",
      "Siglo XX, tras la Primera Guerra Mundial",
      "Siglo XVIII, con la Revolución Francesa",
      "El módulo señala que la globalización no es reciente: sus orígenes se remontan al Siglo XV con la conquista de América.", "easy"),

    q("¿Quién desarrolló los conceptos de Centro y Periferia en 1949?",
      "Raúl Prebisch, a través de la CEPAL",
      "Aldo Ferrer, en su análisis del ámbito nacional",
      "Carlos Nino, desde la teoría jurídica",
      "John Maynard Keynes, en el contexto de la posguerra",
      "Raúl Prebisch sistematizó el esquema Centro-Periferia en 1949 desde la CEPAL para caracterizar las economías industriales vs. las exportadoras de materias primas."),

    q("¿Qué caracteriza a los países de la periferia según el esquema de Prebisch?",
      "Economías heterogéneas, especializadas en exportar productos primarios con dificultades para incorporar tecnología",
      "Economías industriales, integradas y diversificadas con rápida difusión tecnológica",
      "Economías de servicios financieros con alto nivel de innovación",
      "Economías autárquicas que evitan el comercio internacional",
      "Los países periféricos exportan materias primas (agropecuarias, forestales, mineras) y tienen dificultades para incorporar tecnología; los beneficios se concentran en minorías."),

    q("Según Aldo Ferrer, ¿qué porcentaje del consumo e inversión mundial se abastece de producción interna?",
      "Más del 80%",
      "Más del 50%",
      "Más del 60%",
      "Más del 95%",
      "Ferrer (2001) relativiza los alcances de la globalización señalando que más del 80% del consumo e inversión mundial se abastece de producción interna, por lo que el escenario nacional sigue siendo decisivo."),

    q("¿A qué se refiere el concepto de 'anomia' en el marco teórico del módulo?",
      "El incumplimiento de la ley como característica estructural de la sociedad argentina",
      "El exceso de normas legales que paraliza la acción del Estado",
      "La globalización virtual y su impacto en los valores sociales",
      "La violencia física ejercida por el Estado contra la ciudadanía",
      "La anomia es definida como el incumplimiento de la ley, un rasgo estructural que genera inestabilidad política y social en Argentina, según Carlos Nino.", "easy"),
],

2: [
    q("¿Quién refundó Buenos Aires en 1580 y con qué población?",
      "Juan de Garay, con mestizos guaraníes",
      "Pedro de Mendoza, con soldados españoles de la expedición original",
      "Francisco Pizarro, con conquistadores provenientes del Perú",
      "Hernán Cortés, con indígenas aliados de México",
      "La refundación de Buenos Aires en 1580 por Juan de Garay con mestizos guaraníes ejemplifica el vasto proceso de mestizaje que caracterizó la formación social americana."),

    q("¿Cuál era la condición real de los indígenas en el sistema colonial, más allá de su estatus legal?",
      "Eran legalmente súbditos libres, pero en la práctica sometidos a encomiendas, tributos y trabajo forzado (mita)",
      "Gozaban de plenos derechos civiles y políticos equiparables a los españoles",
      "Eran esclavos propiedad de sus amos sin ningún tipo de reconocimiento legal",
      "Tenían autonomía política completa dentro de sus territorios ancestrales",
      "Los indígenas eran 'legalmente súbditos libres' pero en la práctica eran explotados mediante encomiendas, tributos obligatorios y la mita; carecían de capacidad legal plena."),

    q("¿Qué diferencia establece el módulo entre 'etnicidad' y 'raza'?",
      "La etnicidad refiere a prácticas culturales aprendidas; las razas biológicamente distintas no existen",
      "La raza es cultural y aprendida; la etnicidad es un hecho biológico",
      "Son sinónimos y el módulo los usa de forma intercambiable",
      "La etnicidad solo refiere al idioma; la raza abarca todas las características físicas",
      "El módulo señala que la etnicidad se refiere a prácticas culturales aprendidas (lengua, historia, religión), mientras que las 'razas' biológicamente distintas no existen: solo hay variaciones físicas en un continuo humano."),

    q("¿Qué se entiende por 'manumisión' en el contexto de la esclavitud colonial?",
      "La liberación de un esclavo por voluntad de su propietario",
      "El sistema de trabajo forzado en las minas conocido como mita",
      "La compra y venta de esclavos entre colonos españoles",
      "El proceso de mestizaje entre esclavos africanos e indígenas",
      "La manumisión era la posibilidad de liberación de un esclavo por voluntad del propietario, una de las pocas vías de escape del sistema esclavista colonial."),

    q("¿Cuál era el grupo que ocupaba el escalafón más bajo en el régimen de castas colonial?",
      "Los negros esclavos traídos de África",
      "Los indígenas sometidos a la encomienda",
      "Los mestizos hijos de español e indígena",
      "Los 'libres de color' de origen mixto",
      "Los negros esclavos eran considerados 'propiedad' de sus amos y carecían de derechos, ocupando el lugar más bajo del sistema. Existía la manumisión, pero era excepcional."),
],

3: [
    q("¿Cuáles fueron los dos fenómenos europeos que impulsaron la revolución burguesa mundial?",
      "La Revolución Industrial inglesa y la Revolución Francesa",
      "La Revolución Americana y el absolutismo ilustrado",
      "La expansión otomana y la Reforma Protestante",
      "El Renacimiento italiano y la Ilustración alemana",
      "El módulo establece que la emancipación americana se enmarca en la 'revolución burguesa mundial' impulsada por la Revolución Industrial (innovación económica) y la Revolución Francesa (reforma política, libertad, igualdad)."),

    q("¿Qué forma de gobierno propuso Manuel Belgrano en el Congreso de Tucumán?",
      "Una monarquía incaica para legitimar la independencia y sumar apoyo indígena",
      "Una república federal con presidentes rotativos entre las provincias",
      "Una monarquía constitucional de origen europeo",
      "Un protectorado temporal bajo tutela de Gran Bretaña",
      "Belgrano propuso la monarquía incaica como una forma de legitimar la independencia apelando a la historia precolonial y sumando el apoyo de las masas indígenas."),

    q("¿Cuál fue el resultado político de la emancipación hispanoamericana?",
      "La fragmentación en veinte frágiles repúblicas, inestables y desequilibradas",
      "La formación de un gran Estado continental unificado bajo San Martín",
      "La integración en dos grandes repúblicas: Río de la Plata y Gran Colombia",
      "El retorno voluntario al control español bajo condiciones pactadas",
      "A pesar de los ideales de unidad continental de Moreno, Belgrano y San Martín, la América Hispana se fragmentó en veinte frágiles repúblicas, favorecido por el nuevo orden económico mundial e intereses británicos.", "hard"),

    q("¿Quién lideró la Reconquista de Buenos Aires tras la Primera Invasión Inglesa de 1806?",
      "Santiago de Liniers",
      "José de San Martín",
      "Manuel Belgrano",
      "Cornelio Saavedra",
      "Santiago de Liniers lideró las fuerzas criollas y españolas que reconquistaron Buenos Aires el 12 de agosto de 1806, destituyendo al virrey Sobremonte en el proceso."),

    q("¿En qué fecha se formó la Primera Junta de Gobierno en Buenos Aires?",
      "25 de mayo de 1810",
      "9 de julio de 1816",
      "22 de mayo de 1810",
      "25 de mayo de 1808",
      "La Primera Junta de Gobierno se formó el 25 de mayo de 1810, presidida por Cornelio Saavedra, con Mariano Moreno y Manuel Belgrano como secretarios.", "easy"),
],

4: [
    q("¿Qué modelo político-económico defendían los federales en el período de las guerras civiles?",
      "Federalismo y proteccionismo económico, con autonomía provincial",
      "Libre comercio y centralismo político concentrado en Buenos Aires",
      "Librecambismo y forma republicana unitaria",
      "Monarquía constitucional con apoyo de Gran Bretaña",
      "Los federales, liderados por figuras como Artigas y luego Rosas, defendían la autonomía provincial y el proteccionismo económico frente al centralismo porteño y el librecambismo unitario."),

    q("¿Con qué atribución especial asumió Rosas su segundo gobierno en 1835?",
      "Con la 'suma del poder público'",
      "Con un mandato de la Constitución Nacional de 1826",
      "Con el respaldo de un tratado firmado con Gran Bretaña",
      "Como representante de la Liga Federal encabezada por Artigas",
      "En marzo de 1835, Rosas asumió su segundo gobierno con la 'suma del poder público', concentrando las funciones ejecutivas, legislativas y judiciales en su persona."),

    q("¿Quién lanzó el 'Pronunciamiento' contra Rosas en 1851?",
      "Justo José de Urquiza",
      "Domingo F. Sarmiento",
      "Manuel Dorrego",
      "Bartolomé Mitre",
      "El 1° de mayo de 1851, Urquiza lanzó su 'Pronunciamiento' separándose de Rosas, lo que derivó en la Batalla de Caseros (febrero 1852) y la caída del régimen rosista."),

    q("¿Qué caracterizó a la Constitución de 1853?",
      "Era federal y presidencialista, sancionada sin la participación de Buenos Aires",
      "Era unitaria y centralizaba el poder en Buenos Aires",
      "Establecía una monarquía constitucional de tipo europeo",
      "Fue redactada con la participación plena de todas las provincias, incluyendo Buenos Aires",
      "La Constitución de 1853 fue federal y presidencialista; Buenos Aires rechazó adherirse y se mantuvo separada como 'Estado de Buenos Aires' hasta el Pacto de San José de Flores (1859)."),

    q("¿Cuál era la postura de Rivadavia respecto al modelo económico?",
      "Libre comercio, orientado al librecambismo y la integración al mercado mundial",
      "Proteccionismo, para defender la incipiente industria nacional",
      "Autarquía económica y autosuficiencia comercial",
      "Mercantilismo con monopolios estatales controlados por Buenos Aires",
      "Rivadavia aplicó el modelo librecambista: libre comercio, enfiteusis de tierras y apertura al capital británico. Esto lo identificó con los intereses de la élite porteña exportadora.", "hard"),
],

5: [
    q("¿Qué ley federalizó la ciudad de Buenos Aires como capital de la República en 1880?",
      "Ley 1.029",
      "Ley 1.420",
      "Ley Sáenz Peña",
      "Ley de Bancos Garantidos",
      "La Ley 1.029 de septiembre de 1880 federalizó la ciudad de Buenos Aires, convirtiéndola en capital de la República durante la primera presidencia de Julio A. Roca.", "easy"),

    q("¿Qué estableció la Ley 1.420 sancionada en 1884?",
      "La educación primaria gratuita, obligatoria y laica",
      "La federalización de la ciudad de Buenos Aires",
      "El sufragio universal, secreto y obligatorio para todos los varones",
      "La creación del Banco Central de la República Argentina",
      "La Ley 1.420 estableció la educación primaria común, gratuita, obligatoria y laica, siendo una de las medidas más importantes de la Generación del Ochenta para la integración nacional.", "easy"),

    q("¿Quiénes fundaron la Unión Cívica Radical en 1891?",
      "Leandro Alem e Hipólito Yrigoyen",
      "Bartolomé Mitre e Hipólito Yrigoyen",
      "Julio A. Roca y Carlos Pellegrini",
      "Domingo F. Sarmiento y Nicolás Avellaneda",
      "Alem e Yrigoyen fundaron la UCR en 1891 como respuesta al fraude electoral del régimen oligárquico, aunque pronto tuvieron diferencias internas sobre la estrategia política."),

    q("¿Qué consecuencia política tuvo la crisis de la casa Baring en 1890 en Argentina?",
      "La Revolución del Parque y la renuncia del presidente Juárez Celman",
      "La devaluación del peso y la quiebra del Banco de la Nación",
      "La intervención militar que derrocó al gobierno radical",
      "La federalización de Buenos Aires para garantizar ingresos aduaneros",
      "La crisis financiera de 1890 (quiebra de Baring Brothers) provocó la Revolución del Parque en Argentina, que forzó la renuncia del presidente Juárez Celman; lo sucedió Carlos Pellegrini."),

    q("¿Qué caracterizó al Modelo Agroexportador (MAE) consolidado por la Generación del Ochenta?",
      "Dependencia económica del Imperio Británico, renuncia a la industrialización y exportación de productos primarios",
      "Industrialización diversificada con capital nacional e independencia económica",
      "Proteccionismo estatal y sustitución de importaciones desde 1880",
      "Desarrollo equilibrado entre la agricultura pampeana y la industria urbana",
      "El MAE implicó una profunda dependencia económica y política del Imperio Británico, la renuncia a la industrialización y una estructura vulnerable a las crisis externas, como quedó demostrado en 1890.", "hard"),
],

6: [
    q("¿Qué estableció la Ley Sáenz Peña (N° 8.871) de 1912?",
      "El sufragio universal masculino, secreto y obligatorio",
      "El voto femenino en todas las elecciones nacionales",
      "La elección directa del presidente sin colegio electoral",
      "La representación proporcional de los partidos en el Congreso",
      "La Ley Sáenz Peña (1912) estableció el sufragio universal masculino, secreto y obligatorio, terminando con el fraude que sostenía el régimen oligárquico y abriendo el camino a la victoria radical de 1916.", "easy"),

    q("¿Qué posición mantuvo Argentina durante la Primera Guerra Mundial bajo el gobierno de Yrigoyen?",
      "Neutralidad activa, resistiendo las presiones de las potencias en conflicto",
      "Ingresó a la guerra junto a los Aliados (Francia y Gran Bretaña)",
      "Se alió con las Potencias Centrales (Alemania y Austria)",
      "Colaboró logísticamente con Estados Unidos sin declarar la guerra",
      "Yrigoyen mantuvo la neutralidad argentina durante toda la Primera Guerra Mundial, una decisión que generó tensiones con las potencias aliadas pero respondía a los intereses nacionales y la autonomía política.", "easy"),

    q("¿Qué fue la 'Semana Trágica' de enero de 1919?",
      "La represión violenta de una huelga obrera en Buenos Aires",
      "El golpe de Estado que derrocó al gobierno de Yrigoyen",
      "Una revolución radical que intentó tomar el poder en la Capital",
      "La semana en que estalló la crisis económica que derivó en el golpe de 1930",
      "La Semana Trágica fue la represión sangrienta de una huelga obrera en enero de 1919, durante el primer gobierno de Yrigoyen. Fue uno de los conflictos laborales más graves de la Argentina del siglo XX."),

    q("¿Quién encabezó el golpe de Estado del 6 de septiembre de 1930?",
      "El general José Félix Uriburu",
      "El general Agustín P. Justo",
      "El almirante Isaac Rojas",
      "El general Eduardo Lonardi",
      "El 6 de septiembre de 1930, el general José Félix Uriburu derrocó a Hipólito Yrigoyen, inaugurando el primer golpe de Estado de la Argentina del siglo XX y la 'Década Infame'.", "easy"),

    q("¿Qué fue el Acuerdo Roca-Runciman de 1933?",
      "Un tratado comercial entre Argentina y Gran Bretaña que garantizaba cuotas de carne y condiciones favorables al capital inglés",
      "Un acuerdo limítrofe con Brasil sobre la navegación del Río Paraná",
      "Un pacto de defensa mutua entre Argentina y Gran Bretaña ante la amenaza alemana",
      "Un tratado de libre comercio con Estados Unidos negociado tras la crisis de 1929",
      "El Pacto Roca-Runciman (1933) garantizó a Gran Bretaña cuotas de importación de carne argentina y condiciones comerciales favorables para el capital inglés, a cambio de mantener el mercado británico para las exportaciones argentinas.", "hard"),
],

7: [
    q("¿Qué movimiento político se consolidó como consecuencia del golpe militar de 1943?",
      "El peronismo, de carácter popular, nacionalista e industrialista",
      "El desarrollismo de Frondizi, orientado al capital extranjero",
      "El radicalismo intransigente liderado por Arturo Illia",
      "El conservadurismo de la Generación del Ochenta",
      "El golpe de 1943 abrió el camino al peronismo, que fue apoyado en los sindicatos y buscó transformar el Estado para impulsar la prosperidad económica y mejoras sociales.", "easy"),

    q("¿Qué caracterizó a los gobiernos civiles de la 'Democracia Tutelada' según el módulo?",
      "Carecían de plena legitimidad democrática porque el peronismo estaba proscripto y los militares actuaban como tutores",
      "Eran democracias plenas con alternancia entre el peronismo y el radicalismo",
      "Eran gobiernos militares que permitían elecciones sólo a nivel provincial",
      "Contaban con el respaldo pleno de todas las fuerzas políticas y sociales",
      "Los gobiernos de Frondizi e Illia fueron 'tutelados' porque el peronismo estaba proscripto (la opción política mayoritaria estaba excluida) y los militares se arrogaban el derecho de intervenir si sus intereses eran afectados.", "hard"),

    q("¿Cuál fue el impacto económico y social del Proceso de Reorganización Nacional (1976-1983)?",
      "Desindustrialización, deuda externa exponencial y redistribución regresiva del ingreso",
      "Industrialización acelerada, pleno empleo y crecimiento sostenido",
      "Equilibrio fiscal, baja inflación y expansión del mercado interno",
      "Aumento de salarios reales y reducción de la pobreza estructural",
      "El Proceso dejó una deuda externa sin precedentes, desindustrializó el país, redujo salarios y concentró la riqueza, configurando un 'cuadro social regresivo' heredado por la democracia.", "hard"),

    q("¿Cuál era el papel asignado al Ejército en el discurso de Lugones ('La Hora de la Espada')?",
      "El actor principal, la institución más pura y capaz de imponer el orden nacional",
      "Un instrumento subordinado al poder civil democrático",
      "Un cuerpo profesional neutral sin intervención en la política",
      "Un árbitro entre los partidos que debía garantizar elecciones limpias",
      "Para Lugones, el Ejército era el actor principal, la institución más disciplinada y moralmente superior, la única capaz de salvar a la nación del caos de la democracia liberal que consideraba intrínsecamente corrupta."),

    q("¿Bajo qué doctrina actuaron las dictaduras militares latinoamericanas durante la Guerra Fría?",
      "Doctrina de Seguridad Nacional",
      "Doctrina Monroe",
      "Doctrina Truman",
      "Doctrina del Shock",
      "La Doctrina de Seguridad Nacional, promovida por Estados Unidos en el marco de la Guerra Fría, justificó la intervención militar en América Latina para combatir al 'enemigo interno' comunista, dando sustento ideológico a las dictaduras de la región."),
],

8: [
    q("¿Qué significó históricamente la victoria de Raúl Alfonsín en las elecciones de 1983?",
      "La primera derrota electoral del peronismo en elecciones presidenciales",
      "La primera victoria del radicalismo en elecciones nacionales",
      "El retorno del peronismo al poder tras la dictadura",
      "El triunfo del voto femenino por primera vez desde 1952",
      "La victoria de Alfonsín sobre Ítalo Luder (PJ) en 1983 fue la primera derrota electoral del peronismo en elecciones presidenciales, marcando el inicio de un voto más coyuntural y personalista.", "easy"),

    q("¿Cómo se resolvió el conflicto limítrofe del Canal de Beagle durante el gobierno de Alfonsín?",
      "A través de un plebiscito popular y mediación papal, culminando en un tratado de paz",
      "Mediante una breve guerra ganada por Argentina",
      "Por arbitraje del Tribunal Internacional de La Haya sin consulta ciudadana",
      "Por negociación directa con Chile sin intervención de terceros",
      "El conflicto del Beagle, que había estado a punto de derivar en guerra en 1978, se resolvió durante el gobierno de Alfonsín mediante un plebiscito (donde el 'Sí' a la paz ganó ampliamente) y mediación papal."),

    q("¿Qué promovió el 'Consenso de Washington' para las economías latinoamericanas?",
      "Reducción del déficit fiscal, liberalización de mercados y Estado mínimo",
      "Mayor intervención estatal, proteccionismo industrial y control de capitales",
      "Inversión pública masiva en infraestructura y servicios sociales universales",
      "Nacionalización de empresas estratégicas y sustitución de importaciones",
      "El Consenso de Washington estableció pautas de ajuste: reducción del gasto público, liberalización de mercados, privatizaciones y focalización de la protección social. Fue la hoja de ruta de las reformas de los '90 en Argentina.", "hard"),

    q("¿Qué fue el 'Pacto de Olivos' durante la presidencia de Menem?",
      "Un acuerdo político con el radicalismo que habilitó la Reforma Constitucional de 1994",
      "Un acuerdo económico de libre comercio con Brasil que dio origen al MERCOSUR",
      "Un plan de ajuste fiscal firmado con el Fondo Monetario Internacional",
      "Un tratado de paz limítrofe con Chile por la Cordillera de los Andes",
      "El Pacto de Olivos fue un acuerdo político entre Menem y Alfonsín (PJ y UCR) que allanó el camino a la Reforma Constitucional de 1994, que habilitó la reelección presidencial entre otros cambios.", "hard"),

    q("¿Qué contexto internacional caracterizó el inicio de la apertura democrática argentina en la década de 1980?",
      "El ascenso del liberalismo económico con Reagan y Thatcher, y la Caída del Muro de Berlín",
      "El auge del socialismo y la expansión soviética en América Latina",
      "El crecimiento del proteccionismo y los bloques comerciales regionales",
      "La estabilidad financiera global tras los acuerdos de Bretton Woods",
      "La década de 1980 estuvo marcada por el ascenso de Reagan y Thatcher (desmantelamiento del Estado de bienestar), la crisis de deuda latinoamericana y, al cierre de la década, la Caída del Muro de Berlín.", "easy"),
],

}  # fin MODULE_QUESTIONS


# ── Quiz general (subject_id) ─────────────────────────────────────────────────

GENERAL_QUESTIONS = [
    q("¿En qué institución y año desarrolló Raúl Prebisch el esquema Centro-Periferia?",
      "CEPAL, en 1949",
      "ONU, en 1945",
      "FMI, en 1955",
      "Banco Mundial, en 1960",
      "Raúl Prebisch sistematizó el esquema Centro-Periferia desde la CEPAL en 1949 para describir la desigualdad entre países industriales (centro) y exportadores de materias primas (periferia).", "easy"),

    q("¿Cómo define el módulo a los países de la 'periferia' en el esquema de Prebisch?",
      "Economías especializadas en exportación de productos primarios, con dificultades para incorporar tecnología",
      "Economías industriales integradas con rápida difusión tecnológica",
      "Economías de servicios financieros con acceso libre al capital global",
      "Economías autárquicas que evitan el comercio internacional",
      "Las economías periféricas son heterogéneas, especializadas en exportar materias primas y con dificultades para incorporar tecnología; los beneficios se concentran en minorías."),

    q("¿Qué significó la llegada de los europeos a América en 1492 para los pueblos originarios?",
      "El fin de una historia independiente y el inicio de un violento proceso de dominación",
      "Un encuentro pacífico que enriqueció a ambas civilizaciones por igual",
      "El comienzo de un período de intercambio comercial voluntario",
      "La integración de América al sistema feudal europeo",
      "Para los pueblos amerindios, 1492 significó el fin de una historia independiente. Para Latinoamérica, fue el doloroso nacimiento de nuevas culturas a partir del choque entre europeos, indígenas y africanos.", "easy"),

    q("¿Cuándo y dónde se declaró la Independencia de las Provincias Unidas del Río de la Plata?",
      "9 de julio de 1816, en el Congreso de Tucumán",
      "25 de mayo de 1810, en el Cabildo de Buenos Aires",
      "9 de julio de 1810, en el Congreso de Córdoba",
      "25 de mayo de 1816, en Buenos Aires",
      "El 9 de julio de 1816, el Congreso de Tucumán proclamó la Independencia de las Provincias Unidas de Sud América. La Revolución de Mayo de 1810 fue el inicio del proceso, pero no la declaración formal.", "easy"),

    q("¿Cuál fue el principal eje de conflicto entre unitarios y federales durante las guerras civiles?",
      "Los unitarios defendían el libre comercio y el centralismo porteño; los federales, el proteccionismo y la autonomía provincial",
      "Los unitarios eran republicanos; los federales querían restablecer la monarquía",
      "Los unitarios apoyaban a España; los federales defendían la independencia",
      "Los unitarios representaban a los sectores populares; los federales, a la élite",
      "El conflicto central fue entre el libre comercio y centralismo unitario (favorable a los intereses porteños y británicos) y el proteccionismo federal (favorable a las economías del interior).", "hard"),

    q("¿Qué fue el Modelo Agroexportador (MAE) consolidado por la Generación del Ochenta?",
      "Un modelo basado en la exportación de productos primarios con dependencia del capital británico y renuncia a la industrialización",
      "Un modelo de industrialización protegida con capitales nacionales",
      "Un plan de desarrollo equilibrado entre la actividad agropecuaria y la industria",
      "Una estrategia de sustitución de importaciones impulsada por el Estado",
      "El MAE implicó profunda dependencia del Imperio Británico, exportación de materias primas, importación de manufacturas y una estructura económica vulnerable a las crisis externas.", "easy"),

    q("¿Qué cambio fundamental introdujo la Ley Sáenz Peña de 1912 en el sistema político argentino?",
      "El sufragio universal masculino, secreto y obligatorio, que terminó con el fraude oligárquico",
      "La extensión del voto a las mujeres por primera vez",
      "La creación de un sistema de representación proporcional para los partidos",
      "La eliminación del Colegio Electoral y la elección directa del presidente",
      "La Ley Sáenz Peña (1912) estableció el sufragio universal masculino, secreto y obligatorio. Fue el mecanismo que permitió la primera victoria electoral de la UCR con Yrigoyen en 1916.", "easy"),

    q("¿Cuál fue la primera consecuencia política del golpe del 6 de septiembre de 1930?",
      "La instauración de la 'Década Infame', caracterizada por el fraude y la corrupción",
      "El inicio del ciclo peronista con Juan Domingo Perón",
      "La sanción de una nueva constitución que restringía los derechos políticos",
      "El retorno inmediato de Yrigoyen al poder tras una contrarreforma",
      "El golpe de Uriburu en 1930 inauguró la 'Década Infame' (1930-1943), un período de gobiernos fraudulentos, corrupción y represión, que representó el fin del experimento democrático radical.", "easy"),

    q("¿Cómo se vinculan el Modelo Agroexportador y la relación Centro-Periferia en Argentina a fines del Siglo XIX?",
      "Argentina actuó como país periférico exportando materias primas e importando manufacturas, con ferrocarriles e inversiones financiadas por capital británico",
      "Argentina logró industrializarse con capitales propios e independencia económica",
      "Argentina se convirtió en país del centro gracias a las exportaciones agrícolas",
      "Argentina diversificó su economía equilibrando exportaciones primarias e industriales",
      "El MAE es el ejemplo más claro de la condición periférica de Argentina: exportaba granos y carnes, importaba manufacturas inglesas, y dependía del capital británico para ferrocarriles e inversiones.", "hard"),

    q("¿Qué fue el peronismo según el análisis del módulo?",
      "Un movimiento popular, nacionalista e industrialista, apoyado en los sindicatos",
      "Un movimiento conservador, libre-cambista y favorable al capital extranjero",
      "Un partido político de izquierda marxista formado por inmigrantes europeos",
      "Un movimiento militar sin base popular significativa",
      "El peronismo fue un movimiento popular y nacionalista que, apoyado en los sindicatos, buscó transformar el Estado para impulsar la industria y las mejoras sociales, en un contexto de declinación del imperialismo británico.", "easy"),

    q("¿Cuánto duró el Proceso de Reorganización Nacional y cuáles fueron sus principales consecuencias económicas?",
      "1976-1983; desindustrialización, deuda externa exponencial y redistribución regresiva del ingreso",
      "1966-1976; industrialización acelerada y equilibrio fiscal",
      "1973-1983; crisis inflacionaria y apertura económica sin precedentes",
      "1955-1976; nationalización de empresas y expansión del gasto público",
      "El Proceso (1976-1983) dejó un cuadro económico y social devastador: desindustrialización, deuda externa sin precedentes, reducción de salarios reales y concentración de la riqueza que condicionó las décadas siguientes.", "hard"),

    q("¿Qué significó la victoria de Alfonsín en 1983 para la historia política argentina?",
      "Fue la primera derrota electoral del peronismo en elecciones presidenciales",
      "Fue la primera victoria de la UCR en toda su historia",
      "Marcó el inicio del sistema bipartidista definitivo en Argentina",
      "Fue la primera vez que se aplicó el voto femenino en elecciones presidenciales",
      "La victoria de Alfonsín sobre Ítalo Luder (PJ) representó la primera derrota electoral del peronismo en elecciones presidenciales desde 1946, evidenciando un voto más personalista y coyuntural.", "easy"),

    q("¿Qué aportó la crisis de la casa Baring de 1890 al desarrollo político argentino?",
      "Demostró los límites del Modelo Agroexportador y fortaleció el movimiento que daría origen a la UCR",
      "Consolidó el poder del roquismo y la oligarquía conservadora",
      "Provocó la intervención militar que instauró la primera dictadura argentina",
      "Generó la inmediata industrialización del país como alternativa al MAE",
      "La crisis Baring (1890) evidenció la fragilidad del MAE y desencadenó la Revolución del Parque. La UCR se formó en 1891 como respuesta política a la crisis del régimen oligárquico.", "hard"),

    q("¿Cuál era la postura del texto de Lugones 'La Hora de la Espada' respecto a la democracia?",
      "La democracia liberal era intrínsecamente corrupta e ineficaz; solo el Ejército podía salvar a la nación",
      "La democracia era el único sistema legítimo para resolver los conflictos nacionales",
      "La democracia debía reformarse para incluir la participación militar en el gobierno",
      "El texto reivindicaba la democracia popular frente a la oligarquía conservadora",
      "Para Lugones, la democracia liberal era corrupta, ineficaz y 'extranjerizante'. Solo el Ejército, la institución más pura y disciplinada, podía imponer el orden y salvar a la nación. Este discurso fue el sustento ideológico del golpe de 1930.", "hard"),

    q("¿Por qué el módulo considera que los gobiernos de Frondizi e Illia fueron 'tutelados'?",
      "Porque el peronismo estaba proscripto y los militares se arrogaban el derecho de intervenir si sus intereses eran afectados",
      "Porque gobernaban bajo la supervisión directa de organismos internacionales",
      "Porque necesitaban el voto afirmativo del Ejército para cada decisión de gobierno",
      "Porque sus mandatos fueron establecidos por decretos militares y no por el voto popular",
      "La 'Democracia Tutelada' implicaba gobiernos civiles elegidos pero condicionados: el peronismo estaba proscripto (la opción mayoritaria excluida) y los militares podían intervenir cuando lo consideraran necesario, como efectivamente ocurrió.", "hard"),

    q("¿Qué fue el Consenso de Washington y cómo influyó en Argentina en la década de 1990?",
      "Un conjunto de pautas de ajuste que promovió privatizaciones, reducción del Estado y liberalización económica, aplicadas masivamente durante el gobierno de Menem",
      "Un acuerdo de libre comercio entre todos los países del continente americano",
      "Un plan Marshall de inversión estadounidense para América Latina",
      "Una declaración de principios democráticos sin consecuencias económicas directas",
      "El Consenso de Washington promovió Estado mínimo, privatizaciones y apertura de mercados. Fue la hoja de ruta del gobierno de Menem en los '90, con la Convertibilidad y las privatizaciones masivas como expresiones más visibles.", "hard"),

    q("¿Qué relación existe entre el régimen de castas colonial y la anomia argentina según el marco teórico?",
      "El régimen de castas generó una concepción de 'los de arriba' que no respetan las normas igualitarias, perpetuando la anomia",
      "El régimen de castas fue eliminado totalmente con la independencia, sin dejar secuelas",
      "La anomia surgió exclusivamente como consecuencia de la industrialización del siglo XX",
      "El régimen de castas y la anomia son fenómenos independientes sin relación causal",
      "Carlos Nino vincula la 'anomia argentina' con la herencia del régimen de castas: la concepción de 'los de arriba' que desprecia la ley igualitaria se perpetuó en la cultura política argentina.", "hard"),

    q("¿Qué papel jugó Gran Bretaña en la historia económica argentina desde la independencia hasta mediados del siglo XX?",
      "Fue el principal socio comercial y fuente de inversiones, consolidando la dependencia argentina como economía periférica",
      "Fue un aliado político que apoyó la industrialización argentina",
      "Tuvo un rol marginal; la economía argentina dependió principalmente de Estados Unidos",
      "Intentó recolonizar Argentina militarmente en varias ocasiones sin lograrlo",
      "Gran Bretaña financió los ferrocarriles, fue el destino de las exportaciones agropecuarias y el origen de las importaciones manufactureras. El Acuerdo Roca-Runciman (1933) es un ejemplo tardío de esta dependencia periférica.", "hard"),

    q("¿Cómo explica el módulo la fragmentación de América Latina en múltiples repúblicas tras la independencia?",
      "Por la combinación del nuevo orden económico mundial (división internacional del trabajo) y los intereses de Gran Bretaña que favorecían la fragmentación",
      "Por la incapacidad personal de San Martín y Bolívar para ponerse de acuerdo",
      "Por la resistencia de los pueblos indígenas a la unificación continental",
      "Por la intervención directa de España para impedir la unidad hispanoamericana",
      "A pesar de los ideales bolivarianos de unidad, el nuevo orden económico (que requería naciones pequeñas y dependientes para el libre comercio) y los intereses británicos contribuyeron activamente a la fragmentación en veinte repúblicas frágiles.", "hard"),

    q("¿Qué legado dejó el Proceso de Reorganización Nacional (1976-1983) a la democracia inaugurada en 1983?",
      "Una deuda externa exponencial, desindustrialización profunda y un cuadro social regresivo que condicionó al gobierno de Alfonsín",
      "Un país industrializado con baja inflación y superávit fiscal",
      "Una sociedad más igualitaria y con menor dependencia del capital extranjero",
      "Un sistema financiero sólido que permitió enfrentar la crisis de la deuda",
      "El Proceso dejó una herencia devastadora: deuda externa sin precedentes, desindustrialización, reducción del poder adquisitivo de los trabajadores y concentración económica. Alfonsín heredó un país hipotecado que condicionó toda su gestión.", "hard"),
]


# ── Inserción en Supabase ─────────────────────────────────────────────────────

HEADERS = {
    'apikey':        SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type':  'application/json',
    'Prefer':        'return=minimal',
}

total_ok = 0
total_err = 0

# Preguntas por módulo
for mod_num, questions in MODULE_QUESTIONS.items():
    mod_id = MODULES[mod_num]
    rows = []
    for idx, q_data in enumerate(questions, start=1):
        rows.append({
            'subject_id':  SUBJECT_ID,
            'module_id':   mod_id,
            'question':    q_data['question'],
            'options':     q_data['options'],
            'explanation': q_data['explanation'],
            'difficulty':  q_data['difficulty'],
            'order_index': idx,
            'is_published': True,
        })
    resp = requests.post(
        f'{SUPABASE_URL}/rest/v1/quiz_questions',
        headers=HEADERS,
        json=rows,
    )
    if resp.status_code in [200, 201]:
        print(f'  Módulo {mod_num}: {len(rows)} preguntas insertadas ✓')
        total_ok += len(rows)
    else:
        print(f'  Módulo {mod_num}: ERROR {resp.status_code} — {resp.text[:200]}')
        total_err += len(rows)

# Preguntas generales
rows_gen = []
for idx, q_data in enumerate(GENERAL_QUESTIONS, start=1):
    rows_gen.append({
        'subject_id':  SUBJECT_ID,
        'question':    q_data['question'],
        'options':     q_data['options'],
        'explanation': q_data['explanation'],
        'difficulty':  q_data['difficulty'],
        'order_index': idx,
        'is_published': True,
    })

resp = requests.post(
    f'{SUPABASE_URL}/rest/v1/quiz_questions',
    headers=HEADERS,
    json=rows_gen,
)
if resp.status_code in [200, 201]:
    print(f'  Quiz general: {len(rows_gen)} preguntas insertadas ✓')
    total_ok += len(rows_gen)
else:
    print(f'  Quiz general: ERROR {resp.status_code} — {resp.text[:200]}')
    total_err += len(rows_gen)

print(f'\nTotal: {total_ok} insertadas, {total_err} con error.')
