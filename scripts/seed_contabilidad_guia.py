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
SUBJECT_ID = "e4eacaa7-a178-4dbf-9f51-265d5b4c41eb"

GUIDE = """## Cómo usar esta guía

Leé cada módulo completo antes de usar las preguntas orientadoras. Los **conceptos en negrita** son los más frecuentes en los parciales. En Contabilidad, practicar con asientos es tan importante como entender las definiciones: no alcanza con saber la teoría si no podés registrar la operación.

---

## Módulo 1 — Conceptos Contables Básicos

### Conceptos clave

- **Ente**: todo aquello que existe o puede existir. En contabilidad interesa el ente económico (persona humana o jurídica), que es independiente de sus propietarios (principio de ente).
- **Patrimonio**: conjunto de bienes, derechos y obligaciones de un ente. Se divide en: Activo (bienes y derechos que generan beneficios futuros), Pasivo (obligaciones con terceros) y Patrimonio Neto (valor residual = Activo – Pasivo).
- **Ecuación Contable Estática**: `ACTIVO = PASIVO + PATRIMONIO NETO`. Todo recurso (Activo) tiene una fuente de financiación: ajena (Pasivo) o propia (PN).
- **Ecuación Contable Dinámica**: `ACTIVO + GASTOS + PÉRDIDAS = PASIVO + CAPITAL + INGRESOS + GANANCIAS`. Incorpora los resultados dentro de la igualdad.
- **Variaciones Permutativas**: cambian la composición del patrimonio sin modificar el total del PN (ej.: comprar mercadería al contado: +Mercaderías, -Caja).
- **Variaciones Modificativas**: cambian el monto total del PN (ej.: venta con ganancia: +Caja, +Ventas → el PN aumenta).
- **Ingresos / Ganancias**: resultados positivos. Ingresos provienen de la actividad principal; Ganancias de operaciones secundarias.
- **Gastos / Pérdidas**: resultados negativos. Gastos están relacionados con los ingresos; Pérdidas no tienen ingreso asociado.

### Preguntas orientadoras

1. ¿Qué diferencia hay entre un "bien tangible" y un "derecho" dentro del Activo? Dá un ejemplo de cada uno.
2. ¿Cuándo un bien tiene valor económico para la contabilidad? ¿Qué condición debe cumplir?
3. ¿En qué se diferencia una variación permutativa de una modificativa? Ilustrá con dos ejemplos de asientos.
4. ¿Por qué los propietarios pueden ser al mismo tiempo acreedores del ente? ¿En qué casos ocurre?
5. ¿Cómo evoluciona el Patrimonio Neto desde el inicio de la sociedad hasta el segundo ejercicio? Describí la fórmula de cada etapa.
6. Una empresa compra un inmueble pagando el 40% al contado y financiando el resto. ¿Cómo afecta a la ecuación contable? ¿Es permutativa o modificativa?

---

## Módulo 2 — La Contabilidad

### Conceptos clave

- **Contabilidad** (Fowler Newton): disciplina técnica que procesa datos sobre la composición y evolución del patrimonio de un ente para producir información útil para la toma de decisiones.
- **Contabilidad para uso externo**: informa a terceros (bancos, inversores, proveedores, Estado) sobre la situación económica del ente.
- **Contabilidad para uso interno**: informa a la dirección para tomar decisiones, fijar políticas y controlar presupuestos.
- **Información del pasado / presente / futuro**: la contabilidad puede generar los tres tipos de información. Las proyecciones y presupuestos son información del futuro.
- **Sistema Contable**: conjunto de elementos interrelacionados que permiten la función contable. Recibe datos → procesa → elabora informes.
- **Componentes del Sistema**: medios de registración (documentos), cuentas (agrupan operaciones homogéneas), registros (Diario, Mayor), métodos de trabajo (partida doble), archivos y normas contables.

### Preguntas orientadoras

1. ¿Cuál es la diferencia entre la contabilidad para uso externo y para uso interno? ¿Qué usuarios necesita cada una?
2. ¿Qué procesa el sistema contable y cuál es su producto final?
3. Una empresa quiere saber si podrá pagar sus deudas el próximo trimestre. ¿Qué tipo de información necesita (pasado, presente o futuro)? ¿Por qué?
4. ¿Qué son los "medios de registración" y cuál es su función dentro del sistema contable?
5. ¿En qué se diferencia un "registro contable" de una "cuenta"? ¿Qué rol cumple cada uno?

---

## Módulo 3 — La Información Contable

### Conceptos clave

- **Informes Contables Puros** (Estados Contables Básicos): obligatorios, regidos por normas, para uso externo. Los cuatro son: Estado de Situación Patrimonial (BSP), Estado de Resultados (ER), Estado de Evolución del Patrimonio Neto (EEPN) y Estado de Flujo de Efectivo.
- **Informes de Gestión**: confeccionados según normas internas, para uso interno (dirección y gerencia).
- **Estado Estático vs. Evolutivo**: el BSP es estático (foto de la situación en un momento); el ER, EEPN y EFE son evolutivos (muestran cambios en un período).
- **PCGA — 7 Principios fundamentales**:
  1. **Ente**: la contabilidad es del ente, no de sus propietarios.
  2. **Bienes Económicos**: solo bienes con valor monetario.
  3. **Moneda de Cuenta**: expresión en moneda común (con ajuste por inflación si corresponde).
  4. **Empresa en Marcha**: se asume continuidad, salvo indicación contraria.
  5. **Ejercicio**: gestión medida en períodos de igual duración.
  6. **Devengado**: las variaciones se registran cuando ocurren, independientemente del cobro/pago.
  7. **Realización**: solo se computan resultados de operaciones perfeccionadas.
- **Usuarios Externos**: bancos, inversores, proveedores, Estado, clientes.
- **Usuarios Internos**: socios, directores, gerentes, auditores internos, síndicos.

### Preguntas orientadoras

1. ¿En qué se diferencia un "informe contable puro" de un "informe de gestión"? ¿Para quién es cada uno?
2. ¿Cuál de los Estados Contables Básicos es estático y cuáles son evolutivos? ¿Por qué esta distinción importa?
3. ¿Qué establece el principio de "devengado"? ¿Cómo se relaciona con el principio de "realización"?
4. ¿Por qué el principio de "empresa en marcha" es importante para valuar los activos?
5. Un banco pide los estados contables antes de dar un préstamo. ¿Qué tipo de usuario es? ¿Qué información le interesa especialmente?
6. ¿Por qué el principio de "ente" es fundamental para separar el patrimonio del dueño del patrimonio de la empresa?

---

## Módulo 4 — Las Cuentas

### Conceptos clave

- **Cuenta Contable**: instrumento para representar variaciones patrimoniales. Tiene denominación, parte descriptiva y parte cuantitativa.
- **Cuentas Patrimoniales**: Activo (saldo deudor), Pasivo (saldo acreedor), PN (saldo acreedor).
- **Cuentas Regularizadoras**: ajustan el valor de la cuenta principal (ej.: Previsión para Deudores Incobrables, regularizadora del Activo — saldo acreedor).
- **Cuentas de Resultados**: Positivos (saldo acreedor, ej.: Ventas) y Negativos (saldo deudor, ej.: CMV, Sueldos).
- **Cuentas de Movimiento**: transitorias, se cancelan al cierre (ej.: "Ventas al Contado" que luego va a "Ventas").
- **Partida Doble**: por cada asiento, Débitos = Créditos. Regla: Activo debita al aumentar; Pasivo y PN acreditan al aumentar. Los Resultados Positivos acreditan; los Negativos debitan.
- **Plan de Cuentas**: conjunto ordenado y codificado de cuentas que usa un ente.
- **Manual de Cuentas**: complementa el Plan con descripción detallada, mecánica de uso y responsable.
- **Registros Contables**: Diario (cronológico), Mayor (sistemático por cuenta), Subdiarios y Submayores.
- **Requisitos legales** (Código Civil y Comercial): conservación 10 años, en idioma y moneda nacional, sin alteraciones.

### Preguntas orientadoras

1. ¿Cuál es la diferencia entre una cuenta "Acumulativa" y una "Residual"? ¿Y entre una cuenta "Cancelable" y una "Permanente"?
2. ¿Cuándo una cuenta tiene saldo "deudor" y cuándo tiene saldo "acreedor"? Explicá la regla para cada tipo de cuenta.
3. ¿Para qué sirve una cuenta Regularizadora? Dá el ejemplo de "Previsión para Deudores Incobrables" y explicá su mecánica.
4. ¿Qué diferencia hay entre el "Diario" y el "Mayor"? ¿Cuál es obligatorio por ley y cuál no?
5. ¿Por qué el Plan de Cuentas debe considerar aspectos jurídicos, económicos y financieros del ente?
6. Registrá en partida doble: "La empresa paga $5.000 de alquiler del local con transferencia bancaria". Indicá qué cuentas intervienen y cómo varían.

---

## Módulo 5 — Ciclo Operativo y Ciclo Contable

### Conceptos clave

- **Ciclo Operativo**: secuencia de operaciones que realiza la empresa para lograr sus objetivos (comprar → pagar → producir → vender → cobrar). Su duración es independiente del ejercicio contable.
- **Ciclo Contable**: proceso que sigue la información desde que nace la operación hasta los estados contables: Comprobante → Diario → Mayor → Balance de Saldos → Estados Contables.
- **Registración Centralizada**: todo al Diario directamente. **Descentralizada**: se usan Subdiarios por tipo de operación, luego se resumen en el Diario.
- **Sociedad Anónima (S.A.)**: capital en acciones; suscripción total en la constitución; efectivo: 25% al inicio + saldo en 2 años; aportes solo de "dar". Cuentas: Accionistas (Activo), Acciones a emitir (PN regularizadora), Acciones en circulación (PN).
- **Sociedad de Responsabilidad Limitada (S.R.L.)**: capital en cuotas sociales; máximo 50 socios; mismas reglas de integración que la S.A.; aportes solo de "dar". Cuentas: Socio XX Cuenta Aporte (Activo), Capital Social (PN).
- **Suscripción vs. Integración**: suscribir = comprometerse a aportar. Integrar = efectivamente entregar el capital.

### Preguntas orientadoras

1. ¿En qué se diferencia el ciclo operativo del ciclo contable? ¿Cuándo empieza y termina cada uno?
2. ¿Qué es la "suscripción" de capital y en qué se diferencia de la "integración"?
3. En una S.A., un accionista suscribe 1.000 acciones de $100 cada una. Integra el 25% en efectivo. ¿Qué asientos corresponden a la suscripción y a la integración?
4. ¿Por qué la S.R.L. tiene un límite de 50 socios? ¿En qué se diferencia de la S.A. en cuanto a las cuentas de capital?
5. ¿Qué pasa si un socio aporta un inmueble con una hipoteca? ¿Cómo se registra?
6. ¿En qué fase del ciclo contable se elaboran los Estados Contables Básicos?

---

## Módulo 6 — Operaciones Básicas. Fuentes de Registración

### Conceptos clave

- **Compra**: se registra cuando se perfecciona (entrega física o título de propiedad). El valor de incorporación incluye precio – bonificaciones + costos necesarios para disponer del bien (flete, descarga). Los intereses financieros son un costo financiero, NO parte del bien.
- **Venta**: se registra cuando ocurre el hecho generador (entrega del bien o prestación del servicio). Se registra siempre a valor de contado neto de bonificaciones.
- **Costo de Mercaderías Vendidas (CMV)**: resultado negativo que acompaña a cada venta. Métodos: **PEPS** (Primero Entrado, Primero Salido), **UEPS** (Último Entrado, Primero Salido), **PPP** (Precio Promedio Ponderado), **Inventario Global** (CMV = EI + Compras – EF), **Identificación Específica** (bienes de alto valor).
- **Cobro**: cancelación de un derecho (de venta a crédito). Activa el devengo de los intereses positivos.
- **Pago**: cancelación de una obligación (de compra a crédito). Activa el devengo de los intereses negativos.
- **Documentación**: Factura (comprobante principal), Remito (entrega sin importes), Recibo (pago/entrega de valores), Nota de Crédito (disminuye deuda), Nota de Débito (aumenta deuda), Pagaré (promesa de pago), Cheque (común o diferido).

### Preguntas orientadoras

1. ¿Cuándo se "perfecciona" una compra según la normativa contable? ¿Qué documentos la respaldan?
2. ¿Por qué los intereses financieros (descuento por pronto pago) no forman parte del valor del bien comprado?
3. Explica la diferencia entre el método PEPS y el PPP para determinar el CMV. ¿Cuándo conviene cada uno?
4. Una empresa vende mercadería a crédito a 30 días. ¿Cuántos asientos se deben hacer en ese momento? ¿Qué cuentas intervienen?
5. ¿Qué diferencia hay entre una Nota de Crédito y una Nota de Débito? ¿Quién emite cada una y para qué?
6. ¿Cuándo el descuento al comprador es un "ingreso financiero" y no un "descuento comercial"? ¿Por qué importa esta distinción?

---

## Módulo 7 — Determinación de Resultados. Hechos Generadores

### Conceptos clave

- **Principio del Devengado**: el resultado se reconoce cuando ocurre el **hecho generador** (el evento que origina el derecho o la obligación), independientemente del cobro o pago. Es un principio de la información económica.
- **Hecho Financiero**: movimiento real de dinero (cobro o pago). No genera resultado por sí solo.
- **Hecho Económico**: genera un resultado (ingreso/egreso) por el devengamiento, aunque no haya movimiento de dinero.
- **Ingreso económico vs. Ingreso financiero**: el cobro de una venta a crédito es un hecho financiero (ya se reconoció el ingreso al vender); el ingreso financiero (interés) se devenga separadamente.
- **Costo no consumido**: activo — relacionado con ingresos futuros (ej.: mercaderías, inmuebles, alquiler pagado por adelantado).
- **Costo consumido**: resultado negativo — ya se usó para generar ingresos (ej.: CMV, alquiler devengado del período).
- **Resultados Positivos**: Ingresos (actividad principal) y Ganancias (secundarias/accesorias).
- **Resultados Negativos**: Gastos (relacionados con ingresos) y Pérdidas (no relacionadas, ej.: siniestros).

### Preguntas orientadoras

1. ¿Qué es el "hecho generador" y por qué es el momento clave para el registro contable?
2. Una empresa recibe una factura de luz de $3.000 pero no la paga hasta el mes siguiente. ¿Cuándo se registra el gasto? ¿Qué asiento corresponde cuando se recibe la factura?
3. ¿Cuál es la diferencia entre un "gasto" y una "pérdida"? ¿Y entre un "ingreso" y una "ganancia"?
4. Una empresa compra mercadería y la tiene en depósito. ¿Es un "costo consumido" o "no consumido"? ¿Cuándo se convierte en el otro?
5. ¿En qué se diferencia un hecho financiero de un hecho económico? Dá un ejemplo de cada uno.
6. La empresa vende $10.000 de mercadería: $6.000 al contado y $4.000 a crédito. El costo de la mercadería vendida es $7.000. ¿Cuántos asientos se necesitan y qué clasifica cada uno (financiero/económico)?

---

## Cuadro comparativo — Tipos de variaciones patrimoniales

| Tipo | Afecta PN | Ejemplo de asiento | Cuentas |
|------|-----------|-------------------|---------|
| **Permutativa A↑ A↓** | No | Depósito de efectivo en banco | +Banco / -Caja |
| **Permutativa A↑ P↑** | No | Compra de mercadería a crédito | +Mercaderías / +Proveedores |
| **Permutativa A↓ P↓** | No | Pago a proveedor con cheque | -Proveedores / -Banco |
| **Permutativa P↑ P↓** | No | Documentar deuda de cuenta corriente | -Proveedores / +Doc. a pagar |
| **Modificativa RN↑ A↓** | Sí (baja) | Pago de servicio en efectivo | +Gastos / -Caja |
| **Modificativa RN↑ P↑** | Sí (baja) | Alquiler devengado, no pagado | +Alquileres neg. / +Alquileres a pagar |
| **Modificativa RP↑ A↑** | Sí (sube) | Venta de mercadería al contado | +Caja / +Ventas |
| **Modificativa RP↑ P↓** | Sí (sube) | Quita otorgada por proveedor | -Proveedores / +Ganancias |

---

## Cuadro comparativo — S.A. vs. S.R.L.

| Característica | S.A. | S.R.L. |
|----------------|------|--------|
| **Tipo de participación** | Acciones (igual VN) | Cuotas sociales ($10 o múltiplos) |
| **Límite de socios** | Sin límite (puede ser unipersonal — SAU) | Máximo 50 socios |
| **Integración efectivo** | 25% al inicio, saldo en 2 años | 25% al inicio, saldo en 2 años |
| **SAU** | Integración total en el acto constitutivo | No aplica |
| **Cuenta de compromiso (Activo)** | Accionistas | Socio XX Cuenta Aporte |
| **Cuenta de capital (PN)** | Acciones a emitir → Acciones en circulación | Capital Social |
| **Tipos de aportes** | Solo de "dar" | Solo de "dar" |

---

## Cuadro comparativo — Métodos de valuación del CMV

| Método | Lógica | Ventaja | Limitación |
|--------|--------|---------|------------|
| **PEPS** | Las primeras unidades en entrar son las primeras en salir | Refleja el valor real del inventario final (más reciente) | En inflación, subestima el CMV |
| **UEPS** | Las últimas unidades en entrar son las primeras en salir | En inflación, el CMV refleja mejor el costo de reposición | No permitido por normas NIIF |
| **PPP** | Promedio ponderado de todas las unidades disponibles | Sencillo, distribuye el costo entre períodos | Pierde información del costo individual |
| **Global / Diferencia** | CMV = EI + Compras – EF | Simple, útil para alta rotación | No detecta faltantes ni sobrantes |
| **Identificación específica** | Cada unidad se identifica a su costo exacto | Preciso para bienes de alto valor | Solo aplicable a bienes únicos |
"""

def upsert_guide():
    # Verificar si ya existe un guide (distinto del summary)
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/content_items",
        headers=HEADERS,
        params={"subject_id": f"eq.{SUBJECT_ID}", "type": "eq.guide", "select": "id,title"},
    )
    existing = r.json() if r.status_code == 200 else []
    if not isinstance(existing, list):
        existing = []

    payload = {
        "subject_id": SUBJECT_ID,
        "title": "Guía de Estudio — Contabilidad",
        "body": GUIDE,
        "type": "guide",
        "order_index": 2,
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
    print(f"  [{verb}] Guía de Estudio — Contabilidad: {'OK' if ok else f'ERR {res.status_code} — {res.text[:200]}'}")

if __name__ == "__main__":
    print("=== Contabilidad — Guia de Estudio ===")
    upsert_guide()
    print("Listo.")
