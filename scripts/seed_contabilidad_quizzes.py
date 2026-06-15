import requests, sys, io
from datetime import datetime, timezone

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

SUPABASE_URL = "https://dtbouycelkjgyddpftir.supabase.co"
SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Ym91eWNlbGtqZ3lkZHBmdGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg4MTkwOSwiZXhwIjoyMDk0NDU3OTA5fQ.JKJygGS7S5vfa8Pw5HhnsbcH5OHS2gJ6Qjud4-fgEPg"
SUBJECT_ID   = "e4eacaa7-a178-4dbf-9f51-265d5b4c41eb"

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


# ── MÓDULO 1: Conceptos Contables Básicos ─────────────────────────────────────

MOD1 = [
    q("¿Cómo define la contabilidad al concepto de 'ente'?",
      "Todo aquello que existe o puede existir, distinguiendo entre personas humanas y personas jurídicas",
      "Solo las personas jurídicas formalmente constituidas según la Ley de Sociedades",
      "Cualquier persona física o jurídica que tenga actividad económica lucrativa",
      "La organización que lleva contabilidad obligatoria según el Código Civil y Comercial",
      "El módulo define 'ente' como todo lo que es, existe o puede existir, distinguiendo personas humanas de personas jurídicas (organizaciones).", "easy"),

    q("¿Cuál es la diferencia entre organizaciones públicas y privadas?",
      "Las públicas involucran participación estatal; las privadas están formadas por personas físicas o jurídicas para obtener un beneficio",
      "Las públicas son solo municipales; las privadas incluyen a las nacionales y provinciales",
      "Las públicas tienen fines de lucro; las privadas tienen fines sociales exclusivamente",
      "Las públicas no pueden tener deudas; las privadas sí pueden contraer obligaciones",
      "Las organizaciones públicas involucran participación estatal o brindan servicios sociales (dependen del Estado). Las privadas son formadas por personas para obtener un beneficio.", "easy"),

    q("¿Qué representa la ecuación contable ACTIVO = PASIVO + PATRIMONIO NETO?",
      "Que todos los recursos del ente (Activo) deben estar financiados por fuentes ajenas (Pasivo) o propias (PN)",
      "Que el activo siempre es mayor que el pasivo en una empresa solvente",
      "Que el patrimonio neto nunca puede ser negativo en una empresa en marcha",
      "Que el pasivo representa los bienes de la empresa y el activo sus deudas",
      "La ecuación muestra que todos los Recursos (Activo) están financiados por fuentes: Ajenas (Pasivo = deudas con terceros) o Propias (PN = aportes de los propietarios).", "easy"),

    q("¿Qué son las variaciones patrimoniales permutativas?",
      "Modificaciones en la composición del patrimonio que no alteran el total del Patrimonio Neto",
      "Variaciones que siempre aumentan simultáneamente el activo y el pasivo",
      "Cambios en el patrimonio que siempre generan un resultado positivo o negativo",
      "Operaciones exclusivas entre el ente y sus propietarios que modifican el capital",
      "Las variaciones permutativas modifican la composición del patrimonio pero no el monto total del PN. Ejemplos: depósito de efectivo en banco (+A; -A), pago a proveedor (-A; -P).", "medium"),

    q("Una empresa paga un servicio de electricidad en efectivo. ¿Qué tipo de variación patrimonial genera?",
      "Modificativa, porque aumenta un resultado negativo y disminuye el activo",
      "Permutativa, porque disminuye el activo y también disminuye el pasivo",
      "Permutativa, porque solo cambia la composición del activo sin afectar el PN",
      "Modificativa, porque aumenta el activo y genera un resultado positivo",
      "Es una variación modificativa: aumenta un Resultado Negativo (Gasto) y disminuye el Activo (Caja/Banco). Esto afecta el monto total del PN.", "medium"),

    q("¿Cuál es la diferencia entre 'ingresos' y 'ganancias' en el contexto del Patrimonio Neto?",
      "Los ingresos provienen de la actividad principal; las ganancias, de operaciones secundarias o accesorias",
      "Los ingresos siempre se cobran en efectivo; las ganancias pueden ser no monetarias",
      "Los ingresos aumentan el activo; las ganancias solo disminuyen el pasivo",
      "Los ingresos son resultados del cierre del ejercicio; las ganancias son del período corriente",
      "Los Ingresos son aumentos del PN por la actividad principal (ventas). Las Ganancias son aumentos del PN por operaciones secundarias o accesorias (ej: venta de un activo fijo con ganancia).", "hard"),

    q("¿En qué momento el Patrimonio Neto de un ente es igual al capital?",
      "Al inicio de la vida del ente, antes de registrar resultados",
      "Al cierre de cada ejercicio, una vez distribuidas las ganancias",
      "Solo en las Sociedades Anónimas Unipersonales (SAU)",
      "Cuando el ente no tiene deudas con terceros (Pasivo = 0)",
      "Al inicio de la vida del ente, el Patrimonio Neto es igual al Capital aportado por los propietarios. Con el tiempo varía por resultados, nuevos aportes o retiros.", "medium"),
]

# ── MÓDULO 2: La Contabilidad ─────────────────────────────────────────────────

MOD2 = [
    q("Según Fowler Newton, ¿cuál es la función principal de la Contabilidad?",
      "Procesar datos sobre la composición y evolución del patrimonio de un ente para producir información útil",
      "Registrar cronológicamente todas las operaciones económicas de una empresa",
      "Determinar el impuesto a pagar por una organización ante los organismos estatales",
      "Elaborar presupuestos y proyecciones para la toma de decisiones estratégicas",
      "Según Fowler Newton, la Contabilidad procesa datos sobre el patrimonio del ente y contingencias, para producir información para la toma de decisiones de administradores y terceros.", "easy"),

    q("¿Qué diferencia hay entre la contabilidad para uso externo y para uso interno?",
      "La externa provee información a terceros fuera del ente; la interna sirve para la dirección interna",
      "La externa es obligatoria por ley; la interna es siempre voluntaria y no regulada",
      "La externa solo incluye datos del pasado; la interna solo incluye proyecciones futuras",
      "La externa la elaboran auditores independientes; la interna solo la prepara el área de RRHH",
      "La contabilidad externa informa a terceros (inversores, bancos, gobierno). La interna sirve para que la dirección fije políticas, evalúe la gestión y controle presupuestos.", "easy"),

    q("¿Qué tipo de información contable se produce cuando una empresa elabora proyecciones de ventas para el próximo año?",
      "Información del futuro, que permite anticiparse a hechos futuros y gestionar acciones",
      "Información del pasado, porque se basa en datos históricos de ventas anteriores",
      "Información del presente, porque refleja la realidad concreta a una fecha actual",
      "Información complementaria, que acompaña a los estados contables obligatorios",
      "Los presupuestos y proyecciones son información del futuro: el ente las utiliza para anticiparse y gestionar acciones (planes de inversión, proyecciones de ventas).", "medium"),

    q("¿Cuáles son los componentes de un Sistema Contable?",
      "Medios de registración, cuentas, registros contables, métodos de trabajo, archivos y normas contables",
      "Solo el Libro Diario, el Libro Mayor y el Balance de Sumas y Saldos",
      "Las facturas, recibos y extractos bancarios que respaldan las operaciones del ente",
      "El software contable, los formularios impositivos y los estados financieros finales",
      "El sistema contable se apoya en: medios de registración (documentos), cuentas, registros (libros), métodos de trabajo, archivos y normas contables.", "medium"),

    q("¿Para qué sirve la información contable para uso externo según el módulo?",
      "Para que inversores, bancos, proveedores, el Estado y otros evalúen la situación económica y financiera del ente",
      "Solo para que el Estado calcule los impuestos que debe pagar el ente",
      "Para que los empleados conozcan si recibirán su sueldo del próximo mes",
      "Para que los auditores internos controlen el desempeño de los gerentes",
      "La contabilidad externa permite a posibles inversores, bancos, el gobierno, proveedores y clientes evaluar la situación económica y financiera del ente.", "easy"),
]

# ── MÓDULO 3: La Información Contable ────────────────────────────────────────

MOD3 = [
    q("¿Cuáles son los cuatro Estados Contables Básicos?",
      "Estado de Situación Patrimonial, Estado de Resultados, Estado de Evolución del PN y Estado de Flujo de Efectivo",
      "Balance General, Estado de Costos, Estado de Liquidez y Estado de Origen y Aplicación de Fondos",
      "Diario, Mayor, Balance de Sumas y Saldos y Estado de Resultados",
      "Estado de Resultados, Balance de Comprobación, Inventario y Estado de Flujo de Fondos",
      "Los 4 estados básicos obligatorios son: 1) Estado de Situación Patrimonial, 2) Estado de Resultados, 3) Estado de Evolución del PN y 4) Estado de Flujo de Efectivo.", "easy"),

    q("¿Qué principio contable establece que se asume que el ente tiene continuidad futura y no se espera su liquidación?",
      "Empresa en Marcha (Continuidad de la Empresa)",
      "Principio del Devengado",
      "Principio de Realización",
      "Principio del Ejercicio",
      "El principio de Empresa en Marcha (Continuidad) asume que el ente tiene existencia continua y proyección futura, sin liquidación a corto plazo.", "easy"),

    q("¿Qué diferencia hay entre informes contables puros y de gestión?",
      "Los puros son de presentación obligatoria y uso externo; los de gestión son internos y según disposiciones del ente",
      "Los puros son elaborados por auditores externos; los de gestión los preparan los empleados",
      "Los puros incluyen solo datos del pasado; los de gestión solo incluyen proyecciones futuras",
      "Los puros son siempre digitales; los de gestión siempre deben ser en papel",
      "Los informes puros (estados contables) son obligatorios y para uso externo. Los informes de gestión se elaboran según necesidades internas para la dirección.", "medium"),

    q("¿Qué establece el principio contable del Devengado?",
      "Las variaciones patrimoniales deben considerarse en el ejercicio en que ocurren los hechos, independientemente de si se cobraron o pagaron",
      "Las ganancias solo se reconocen cuando el dinero fue efectivamente cobrado en efectivo",
      "Los gastos se reconocen únicamente cuando se produce la salida real de efectivo",
      "La información debe expresarse en la moneda de curso legal del país donde opera el ente",
      "El principio del Devengado establece que los resultados se reconocen cuando ocurre el hecho generador, independientemente del cobro o pago.", "medium"),

    q("¿Cuál es la diferencia entre un Estado Contable estático y uno evolutivo?",
      "El estático muestra la situación en un momento específico (como una foto); el evolutivo muestra cambios durante un período",
      "El estático nunca puede compararse con períodos anteriores; el evolutivo siempre incluye comparaciones",
      "El estático se elabora mensualmente; el evolutivo solo al cierre del ejercicio anual",
      "El estático muestra solo el activo; el evolutivo muestra activo, pasivo y patrimonio neto",
      "El Estado de Situación Patrimonial es estático (fotografía de un momento). Los estados evolutivos (Resultados, Evolución del PN, Flujo de Efectivo) muestran cambios durante un período.", "medium"),

    q("¿Por qué el principio de Realización complementa al principio del Devengado?",
      "Porque el Devengado dice cuándo se reconoce el resultado y la Realización establece que la operación debe estar perfeccionada para reconocerlo",
      "Porque la Realización permite registrar ingresos futuros antes de que se produzca el hecho generador",
      "Porque la Realización reemplaza al Devengado cuando la operación se cobra en efectivo",
      "Porque ambos principios se aplican solo a las pérdidas, no a los ingresos",
      "El Devengado indica que el resultado se reconoce cuando ocurre el hecho. La Realización complementa indicando que el hecho debe estar 'perfeccionado' (completado y sus riesgos evaluados).", "hard"),
]

# ── MÓDULO 4: Las Cuentas ────────────────────────────────────────────────────

MOD4 = [
    q("¿Cuál es el saldo habitual de una cuenta de Activo y cómo se incrementa?",
      "Saldo deudor; se incrementa debitando (anotando en el Debe)",
      "Saldo acreedor; se incrementa acreditando (anotando en el Haber)",
      "Saldo deudor; se incrementa acreditando (anotando en el Haber)",
      "Saldo acreedor; se incrementa debitando (anotando en el Debe)",
      "Las cuentas de Activo tienen saldo deudor habitual y se incrementan debitando (anotando en el Debe). Disminuyen acreditando (anotando en el Haber).", "easy"),

    q("¿Qué es el Plan de Cuentas?",
      "El conjunto ordenado y codificado de todas las cuentas que una empresa utiliza para registrar sus operaciones",
      "El libro donde se registran cronológicamente todos los asientos contables del ejercicio",
      "El documento que describe detalladamente cuándo se debita y acredita cada cuenta",
      "El resumen de los saldos de todas las cuentas al cierre del ejercicio contable",
      "El Plan de Cuentas es el conjunto ordenado y codificado de cuentas disponibles para el ente. Sirve como estructura central del sistema contable. El Manual de Cuentas lo complementa con descripción detallada.", "easy"),

    q("¿Qué distingue a las cuentas cancelables de las permanentes?",
      "Las cancelables transfieren su saldo al cierre y quedan en cero; las permanentes mantienen su saldo para el ejercicio siguiente",
      "Las cancelables son solo del activo; las permanentes son solo del pasivo y patrimonio neto",
      "Las cancelables se usan solo en empresas industriales; las permanentes en empresas comerciales",
      "Las cancelables tienen saldo acreedor; las permanentes siempre tienen saldo deudor",
      "Las cuentas cancelables (resultados y de movimiento) transfieren su saldo al cierre y quedan en cero. Las permanentes (patrimoniales) mantienen su saldo al inicio del siguiente ejercicio.", "medium"),

    q("¿Cuál es el principio fundamental de la Partida Doble?",
      "No hay deudor sin acreedor: cada operación afecta al menos dos cuentas y la suma de débitos siempre iguala la suma de créditos",
      "Cada operación afecta siempre exactamente dos cuentas, ni más ni menos",
      "El Debe siempre representa aumentos y el Haber siempre representa disminuciones",
      "Toda operación genera un aumento en el activo compensado por un aumento en el pasivo",
      "El principio es 'No hay deudor sin acreedor'. Cada operación afecta al menos dos cuentas y la suma total de débitos siempre iguala la suma total de créditos.", "medium"),

    q("¿Qué es una cuenta regularizadora del activo y cuál es su ejemplo típico?",
      "Una cuenta que ajusta el valor de un activo restándole importes; ejemplo: Previsión para Deudores Incobrables",
      "Una cuenta que representa bienes dados de baja del activo; ejemplo: Bienes de Cambio Vendidos",
      "Una cuenta transitoria del activo que se cancela al cierre; ejemplo: Gastos Pagados por Adelantado",
      "Una cuenta que aumenta el activo por corrección monetaria; ejemplo: Ajuste de Capital",
      "Las cuentas regularizadoras del activo ajustan el valor contable de un activo restándole importes. 'Previsión para Deudores Incobrables' resta valor a 'Deudores por Ventas'. Tienen saldo acreedor.", "hard"),

    q("¿Cuál es la función del Libro Mayor en el sistema contable?",
      "Registrar los movimientos individuales de cada cuenta para conocer su saldo en cualquier momento",
      "Registrar cronológicamente todas las operaciones del ente en orden de fecha",
      "Resumir mensualmente las operaciones repetitivas clasificadas por tipo",
      "Listar todos los saldos de las cuentas para verificar la igualdad contable",
      "El Libro Mayor registra los débitos y créditos de cada cuenta individualmente, permitiendo conocer el saldo de cualquier cuenta en cualquier momento.", "medium"),
]

# ── MÓDULO 5: Ciclo Operativo y Ciclo Contable ───────────────────────────────

MOD5 = [
    q("¿Qué es el ciclo operativo de una empresa?",
      "La secuencia de operaciones básicas que la empresa realiza para lograr sus objetivos (su actividad principal)",
      "El proceso sistemático que sigue la información financiera desde una operación hasta los estados contables",
      "El período de doce meses que abarca un ejercicio contable completo",
      "La secuencia de pasos para registrar una operación en el Libro Diario y el Libro Mayor",
      "El ciclo operativo es el día a día de la actividad principal: comprar, producir, vender, cobrar. Su duración puede ser mayor o menor que el ejercicio contable.", "easy"),

    q("¿Cuál es la secuencia correcta del ciclo contable?",
      "Comprobante → Diario → Mayor → Balance de Saldos → Estados Contables",
      "Mayor → Diario → Comprobante → Balance → Estados Contables",
      "Estados Contables → Balance → Mayor → Diario → Comprobante",
      "Comprobante → Balance de Saldos → Diario → Mayor → Estados Contables",
      "El ciclo contable sigue: Comprobante → Diario → Mayor → Balance de Saldos → Estados Contables. Es el proceso desde que nace una operación hasta los informes finales.", "easy"),

    q("¿Qué diferencia fundamental existe entre una S.A. y una S.R.L. en cuanto al capital?",
      "En la S.A. el capital se divide en acciones de igual VN; en la S.R.L. en cuotas sociales de igual VN con máximo 50 socios",
      "En la S.A. los socios tienen responsabilidad ilimitada; en la S.R.L. limitada a sus aportes",
      "En la S.A. el capital puede suscribirse parcialmente; en la S.R.L. debe suscribirse el 100% al inicio",
      "En la S.A. solo pueden aportar en efectivo; en la S.R.L. pueden aportar en especie",
      "La S.A. divide el capital en acciones, puede tener socios ilimitados. La S.R.L. divide el capital en cuotas sociales y tiene un máximo de 50 socios. Ambas limitan la responsabilidad al aporte.", "medium"),

    q("¿Qué porcentaje mínimo de los aportes en efectivo debe integrarse al constituir una S.A. o S.R.L.?",
      "Al menos el 25% en el acto constitutivo, con un plazo máximo de 2 años para el saldo",
      "El 100% debe integrarse en el acto constitutivo en ambos tipos de sociedades",
      "El 50% al inicio y el 50% en un plazo máximo de un año",
      "Solo el 10% al inicio; el resto puede integrarse sin plazo definido",
      "Tanto en S.A. como S.R.L., los aportes en efectivo deben integrarse al menos en un 25% al inicio, con un plazo máximo de 2 años para el saldo. La S.A.U. debe integrar el 100% desde el inicio.", "medium"),

    q("Al suscribir el capital de una S.A., ¿qué asiento contable se registra?",
      "(+A) Accionistas / (+PN) Acciones a emitir — refleja el compromiso de los accionistas",
      "(+A) Caja / (+PN) Capital Social — refleja el ingreso de efectivo al patrimonio",
      "(+PN) Acciones a emitir / (+A) Accionistas — refleja el capital comprometido como activo",
      "(+A) Caja / (-PN) Acciones en circulación — refleja la suscripción y la entrega de acciones",
      "En la suscripción de S.A.: se debita Accionistas (+A, compromiso de pago) y se acredita Acciones a emitir (+PN). Cuando integran: se debita Caja y se acredita Accionistas.", "hard"),
]

# ── MÓDULO 6: Operaciones Básicas ────────────────────────────────────────────

MOD6 = [
    q("¿Cuándo se considera 'perfeccionada' una compra para registrarla contablemente?",
      "Cuando se produce la entrega física del bien o, en bienes registrables, cuando se obtiene el título de propiedad",
      "Cuando se emite la orden de compra interna autorizando la adquisición",
      "Cuando se realiza el pago total al proveedor, sea en efectivo o cheque",
      "Cuando se recibe la factura del proveedor, independientemente de la entrega del bien",
      "La compra se perfecciona (y debe registrarse) con la entrega física del bien. Para bienes registrables (inmuebles, vehículos), cuando se obtiene el título de propiedad.", "easy"),

    q("¿Qué documento respalda la entrega de mercaderías sin incluir importes monetarios?",
      "El remito, que registra las cantidades entregadas y debe ser firmado por el receptor",
      "La factura, que es el comprobante principal de la venta con precio y detalle",
      "La nota de crédito, que disminuye la deuda del comprador con el vendedor",
      "El pagaré, que es una promesa de pago con fecha de vencimiento",
      "El remito respalda la entrega de mercaderías sin importes (solo cantidades). Una copia debe ser firmada por el receptor. El original es para el vendedor, el duplicado para el comprador.", "easy"),

    q("¿Qué incluye el valor de incorporación de un bien al patrimonio de la empresa?",
      "El precio de lista menos bonificaciones, más todos los costos necesarios para que el bien esté disponible (fletes, etc.)",
      "Solo el precio facturado por el proveedor, sin incluir ningún costo adicional",
      "El precio de lista más los intereses financieros y todos los gastos del período",
      "El valor de mercado del bien en el momento en que se incorpora al patrimonio",
      "El valor de incorporación = precio de lista menos bonificaciones y descuentos de intereses, MÁS costos para tener el bien disponible (fletes, carga). Los intereses financieros NO forman parte.", "medium"),

    q("¿Cómo se calcula el Costo de Mercaderías Vendidas (CMV) con el método global?",
      "CMV = Existencia Inicial + Compras del período – Existencia Final",
      "CMV = Precio de venta – Margen de ganancia esperado por la empresa",
      "CMV = Últimas compras × Unidades vendidas (método UEPS)",
      "CMV = Total de compras del período, independientemente de lo vendido",
      "Con el método global (diferencia de inventarios): CMV = Existencia Inicial + Compras – Existencia Final. No detecta faltantes inmediatos. Se usa para bienes de alta rotación y escaso valor.", "medium"),

    q("¿Cuál es la diferencia entre una bonificación y un descuento por pronto pago en una venta?",
      "La bonificación es un descuento comercial que reduce el precio de venta; el descuento por pronto pago es un interés implícito que representa un ingreso financiero",
      "La bonificación se aplica al contado; el descuento por pronto pago se aplica a las ventas a crédito",
      "Ambos reducen el precio de venta neto y se registran igual en la cuenta Ventas",
      "La bonificación es un ingreso financiero; el descuento por pronto pago reduce directamente el precio de venta",
      "Las bonificaciones son descuentos comerciales (por volumen) que reducen el precio de venta neto. El descuento por pronto pago oculta un interés incluido en el precio: es un ingreso financiero, no comercial.", "hard"),

    q("Al vender mercaderías, ¿cuántos asientos contables se realizan y qué registra cada uno?",
      "Dos asientos: uno registra la venta (ingreso) y otro registra el costo de la mercadería vendida (resultado negativo y baja del activo)",
      "Un solo asiento que registra simultáneamente el ingreso por ventas y el costo de la mercadería",
      "Tres asientos: uno por el ingreso, otro por el costo y otro por el IVA de la operación",
      "Un asiento solo al final del período cuando se calcula el resultado total de todas las ventas",
      "Se hacen 2 asientos: 1) Registrar la venta (+A o +cobro; +Ventas). 2) Registrar el CMV (+Costo de Merc. Vendida resultado negativo; -Mercaderías activo). El beneficio surge de la diferencia.", "hard"),
]

# ── MÓDULO 7: Determinación de Resultados ────────────────────────────────────

MOD7 = [
    q("¿Qué establece el principio del devengado para el registro contable de las operaciones?",
      "Una operación se registra cuando ocurre el hecho generador (cuando nace el derecho u obligación), independientemente del cobro o pago",
      "Una operación solo se registra cuando se cobra o paga efectivamente en dinero",
      "Los ingresos se registran cuando se emite la factura y los gastos cuando se paga el proveedor",
      "Los resultados se reconocen al cierre del ejercicio, cuando se elaboran los estados contables",
      "El principio del devengado establece que se registra cuando ocurre el hecho generador (nace el derecho o la obligación), no cuando hay movimiento de dinero.", "easy"),

    q("¿Cuál es la diferencia entre un 'ingreso' y una 'ganancia' como resultados positivos?",
      "Los ingresos provienen de la actividad principal del ente (ventas); las ganancias de operaciones secundarias o accesorias",
      "Los ingresos son siempre en efectivo; las ganancias pueden ser en bienes o derechos",
      "Los ingresos aumentan el activo; las ganancias solo disminuyen el pasivo del ente",
      "Los ingresos son anuales; las ganancias se acumulan durante varios ejercicios",
      "Los Ingresos surgen de la actividad principal (producción, ventas, prestaciones). Las Ganancias surgen de operaciones secundarias/accesorias o circunstancias no vinculadas a la actividad principal.", "easy"),

    q("¿Qué distingue a un 'gasto' de una 'pérdida' como resultados negativos?",
      "Los gastos están relacionados directamente con los ingresos de la actividad principal; las pérdidas no se relacionan con ingresos ni con el período",
      "Los gastos siempre implican una salida de efectivo; las pérdidas son siempre siniestros o daños físicos",
      "Los gastos disminuyen el activo; las pérdidas siempre aumentan el pasivo del ente",
      "Los gastos son resultados del ejercicio corriente; las pérdidas corresponden siempre al ejercicio anterior",
      "Los Gastos se relacionan directamente con los ingresos de la actividad principal (CMV, gastos de administración). Las Pérdidas no están relacionadas con ingresos (siniestros, gastos de juicio).", "medium"),

    q("¿Qué diferencia hay entre un hecho económico y un hecho financiero?",
      "El hecho económico genera resultados que modifican el PN; el hecho financiero implica movimiento de dinero sin necesariamente modificar el PN",
      "El hecho económico siempre implica cobros en efectivo; el financiero solo involucra transferencias bancarias",
      "El hecho económico afecta solo el activo; el financiero afecta solo el pasivo",
      "Ambos son sinónimos en la contabilidad moderna, ya que toda operación tiene impacto financiero",
      "El hecho económico modifica el PN (genera resultados). El hecho financiero implica movimiento de dinero (cobros/pagos). Una venta a crédito es económica; cobrar esa venta es financiero.", "medium"),

    q("El pago de un anticipo por mercaderías que aún no se recibieron, ¿qué tipo de variación patrimonial es?",
      "Permutativa: disminuye un activo (Caja) y aumenta otro activo (Anticipo a proveedores), sin modificar el PN",
      "Modificativa: genera un gasto (resultado negativo) porque se desembolsó dinero",
      "Modificativa: genera una pérdida porque el bien aún no fue recibido",
      "Permutativa: disminuye el activo (Caja) y disminuye el pasivo (Proveedores)",
      "El anticipo es un hecho financiero (egreso de dinero) que genera un derecho (activo). No es un gasto porque el bien/servicio aún no fue recibido. Es permutativo: -A (Caja); +A (Anticipo).", "hard"),

    q("Si una empresa recibe una boleta de luz pero aún no la paga, ¿cómo debe registrarla?",
      "Como un gasto (resultado negativo) y una deuda (pasivo), porque el consumo ya ocurrió según el devengado",
      "No debe registrarla hasta que se efectúe el pago, porque no hubo movimiento de dinero",
      "Como un anticipo de gasto (activo) hasta que sea pagado al proveedor",
      "Solo como una nota informativa sin efecto en los libros contables hasta el pago",
      "Por el principio del devengado: el consumo de energía ya ocurrió. Debe registrarse el gasto (resultado negativo) y la deuda (pasivo), aunque no haya habido pago.", "medium"),
]

# ── Generales: preguntas que cruzan módulos ───────────────────────────────────

GENERALS = [
    q("¿Cuál es la relación entre el principio del Devengado y la Igualdad Contable Dinámica?",
      "El devengado permite reconocer gastos e ingresos cuando ocurren, alimentando la igualdad ACTIVO + GASTOS + PÉRDIDAS = PASIVO + CAPITAL + INGRESOS + GANANCIAS",
      "El devengado reemplaza la igualdad estática cuando existen operaciones a crédito",
      "La igualdad dinámica solo aplica a operaciones pagadas; el devengado a las no pagadas",
      "Son conceptos independientes: el devengado afecta solo el Estado de Flujo de Efectivo",
      "La igualdad dinámica expande la estática para mostrar resultados: A + G.neg + P.neg = P + Capital + G.pos + I. El devengado determina cuándo se reconocen esos resultados.", "hard"),

    q("¿Qué información tiene en común el Estado de Situación Patrimonial con la ecuación A = P + PN?",
      "El Estado de Situación Patrimonial muestra exactamente el Activo, Pasivo y Patrimonio Neto del ente en un momento dado, reflejando esa igualdad",
      "El Estado de Situación Patrimonial muestra la ecuación solo al inicio del ejercicio",
      "La ecuación A = P + PN solo aplica al Diario General, no a los Estados Contables",
      "El Estado de Situación Patrimonial solo muestra el Activo; la ecuación también incluye el Pasivo y el PN",
      "El Estado de Situación Patrimonial (Balance) es la 'foto' del ente en un momento: muestra el Activo, Pasivo y PN, verificando la ecuación fundamental A = P + PN.", "medium"),

    q("¿En qué se diferencia el ciclo contable del ciclo operativo en su punto de partida?",
      "El ciclo contable se inicia cuando una operación ingresa al sistema de información contable; el ciclo operativo es el proceso real de producción y comercialización",
      "El ciclo contable comienza con la apertura del ejercicio; el operativo con la primera venta del año",
      "El ciclo contable dura siempre 12 meses; el operativo puede durar más o menos",
      "El ciclo contable es exclusivo de empresas industriales; el operativo de empresas comerciales",
      "El ciclo contable se activa cuando una operación entra al sistema contable (comprobante→Diario→Mayor→EC). El ciclo operativo es la realidad del negocio: comprar, producir, vender, cobrar.", "medium"),

    q("¿Por qué los intereses de una compra a crédito NO forman parte del valor de incorporación de la mercadería?",
      "Porque los intereses son un costo financiero separado, no un sacrificio necesario para obtener el bien",
      "Porque los intereses siempre benefician al vendedor y no al comprador",
      "Porque los intereses se registran directamente en el Estado de Flujo de Efectivo",
      "Porque la normativa impositiva argentina prohíbe incluirlos en el costo del bien",
      "El valor de incorporación incluye el precio neto MÁS costos necesarios para tener el bien disponible. Los intereses son un costo financiero (Resultado Negativo) separado, no parte del valor del bien.", "hard"),

    q("¿Qué tienen en común las cuentas 'cancelables' con los 'informes de gestión'?",
      "Ambos se 'resetean' al cierre del período: las cuentas cancelables quedan en cero; los informes de gestión se renuevan para el siguiente período",
      "Ambos son obligatorios por ley y deben ser auditados por un contador externo",
      "Ambos son exclusivos de empresas con más de 50 empleados según el CCyC",
      "No tienen ninguna característica en común; son conceptos completamente independientes",
      "Las cuentas cancelables (resultados) transfieren su saldo y quedan en cero al cierre. Los informes de gestión son renovados para cada período. Ambos son 'temporales' por naturaleza.", "hard"),

    q("Si una empresa realiza una venta a crédito, ¿cuántos hechos económicos y financieros se producen?",
      "Un hecho económico (la venta, que genera el ingreso) y un hecho financiero posterior (el cobro, cuando entra el dinero)",
      "Un solo hecho que es simultáneamente económico y financiero, porque implica tanto ingreso como cobro",
      "Dos hechos financieros: la entrega del bien y el cobro posterior del crédito",
      "Ningún hecho económico hasta que no se cobre; solo un hecho financiero al cobrar",
      "La venta es un hecho económico (genera ingreso, modifica el PN). El cobro posterior es un hecho financiero (movimiento de dinero). Son dos eventos distintos reconocidos por el devengado.", "hard"),

    q("¿Qué principio contable justifica que las mercaderías en stock figuren como activo y no como gasto?",
      "El principio del Devengado y el concepto de Costo no Consumido: aún no se vendieron, por lo que el ingreso futuro no se ha generado",
      "El principio de Empresa en Marcha: se asume que el ente seguirá operando y las venderá",
      "El principio de Realización: el resultado solo se reconoce cuando la venta esté perfeccionada",
      "El principio de Moneda de Cuenta: los bienes deben valuarse en moneda nacional para ser activo",
      "Las mercaderías son un Costo no Consumido: están en el activo porque se relacionan con ingresos FUTUROS. Cuando se venden, el costo se 'consume' y pasa a ser CMV (resultado negativo).", "hard"),

    q("¿Cómo se relacionan el Plan de Cuentas con los Estados Contables?",
      "El Plan de Cuentas organiza las cuentas que se usan para registrar operaciones, y sus saldos son la base para elaborar los Estados Contables",
      "Los Estados Contables son un resumen del Plan de Cuentas sin ningún procesamiento adicional",
      "El Plan de Cuentas solo se usa durante el ejercicio; los Estados Contables lo reemplazan al cierre",
      "No hay relación directa: el Plan de Cuentas es para uso interno y los Estados Contables solo para uso externo",
      "El Plan de Cuentas estructura las cuentas del sistema contable. Los saldos de esas cuentas (obtenidos en el Mayor y el Balance de Sumas y Saldos) son la materia prima para elaborar los Estados Contables.", "medium"),
]


# ── Inserción en Supabase ─────────────────────────────────────────────────────

HEADERS = {
    'apikey':        SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type':  'application/json',
    'Prefer':        'return=minimal',
}

# module_id de cada módulo (creados con seed_contabilidad_modulos.py)
MODULE_GROUPS = [
    ('7965bc54-2279-4f53-b595-d67cae310c1a', MOD1),
    ('8c015323-e451-42aa-ba18-1d65e0081ec5', MOD2),
    ('53d3cabb-999b-4d7a-9f16-765a6c33dad5', MOD3),
    ('298bd988-a765-4c32-888d-080e297b0685', MOD4),
    ('74597cdd-bad8-4ad5-ab5f-dca87964aaac', MOD5),
    ('17eb2e00-f5dd-481f-be36-ebfa293e45b1', MOD6),
    ('64281da0-be3f-4a02-995e-42bb8732e5e7', MOD7),
    (None,                                   GENERALS),
]

rows = []
for module_id, questions in MODULE_GROUPS:
    for idx, q_data in enumerate(questions, start=1):
        row = {
            'subject_id':   SUBJECT_ID,
            'module_id':    module_id,
            'question':     q_data['question'],
            'options':      q_data['options'],
            'explanation':  q_data['explanation'],
            'difficulty':   q_data['difficulty'],
            'order_index':  idx,
            'is_published': True,
        }
        rows.append(row)

ALL_QUESTIONS = [q for _, qs in MODULE_GROUPS for q in qs]

print(f"Insertando {len(rows)} preguntas para Contabilidad...")

resp = requests.post(
    f'{SUPABASE_URL}/rest/v1/quiz_questions',
    headers=HEADERS,
    json=rows,
)

if resp.status_code in [200, 201]:
    print(f'  {len(rows)} preguntas insertadas ✓')
else:
    print(f'  ERROR {resp.status_code}: {resp.text[:300]}')

easy   = sum(1 for q in ALL_QUESTIONS if q['difficulty'] == 'easy')
medium = sum(1 for q in ALL_QUESTIONS if q['difficulty'] == 'medium')
hard   = sum(1 for q in ALL_QUESTIONS if q['difficulty'] == 'hard')
print(f"\nDistribución: {easy} easy / {medium} medium / {hard} hard")
print(f"Módulo 1: {len(MOD1)} | Módulo 2: {len(MOD2)} | Módulo 3: {len(MOD3)} | Módulo 4: {len(MOD4)}")
print(f"Módulo 5: {len(MOD5)} | Módulo 6: {len(MOD6)} | Módulo 7: {len(MOD7)} | Generales: {len(GENERALS)}")
