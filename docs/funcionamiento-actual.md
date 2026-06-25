# Funcionamiento actual — ResumenesUNLaM

> Estado verificado el **2026-06-22** tras la consolidación del flujo.
> Reemplaza a los docs antiguos (`flujo.md`, `flujo-tecnico.md`, `flujo-n8n.md`), que describen el modelo viejo (venta por DM + alta automática por Instagram).

---

## 1. Modelo general

**Instagram = tope del embudo. La compra es 100% en la plataforma.**

```
Instagram (@resumenes.unlam)
  → Bot "Vendedora": marketing, responde consultas, da precios
    → cuando quieren comprar → deriva a resumenesunlam.site/register
        → el alumno se registra, inicia sesión, entra al dashboard
          → elige la materia y la desbloquea pagando en la plataforma (MercadoPago)
            → acceso activo por 365 días
```

Instagram **no** maneja pagos, **no** crea cuentas y **no** pide email. Todo el cobro y el alta de usuario ocurren dentro de la plataforma.

---

## 2. El Bot "Vendedora" (Instagram)

- **Workflow n8n:** `ResumenesUnlam` — ID `o44ut3z52fHOXncz` (38 nodos)
- **Estado:** 🔴 **OFF** (pendiente de activación — switch final de go-live)
- **Entrada:** webhook n8n path `/chatbotig` (mensajes de Instagram vía SendPulse)
- **Instancia:** `n8n.nexioagency.online`

### 2.1 Qué hace cada grupo de nodos

**Entrada y validación**
- `Recibo un mensaje (sendpulse)` `[webhook /chatbotig]` — recibe el DM
- `Respond to Webhook` — responde a SendPulse al instante
- `Limpiar y extraer datos` `[set]` + `Validar Entrada` `[code]` — normaliza y valida

**Multimodal (texto / audio / imagen)**
- `Que es?` `[switch]` — detecta el tipo de mensaje
- `Texto` `[set]` — rama texto
- `Descarga la foto` + `analiza imagen` `[OpenAI Vision]` — rama imagen
- `descargar audio` + `Transcribe el audio` `[OpenAI Whisper]` — rama audio (notas de voz)
- `Merge2` + `mensaje_usuario` `[set]` — unifica las ramas

**Cerebro del agente**
- `Vendedora` `[LangChain Agent]` — el agente vendedor
- `OpenAI Chat Model` / `OpenAI Chat Model1` — LLM que lo alimenta
- `base de datos resumenesunlam` `[Redis Chat Memory]` — memoria de conversación
- `Cerebro ResumenesUnlam` `[Vector Store Tool]` + `Supabase Vector Store` + `OpenAI Embeddings` — RAG (ver §2.3)
- `Obtener Precios` `[httpRequest]` — precios en vivo desde `resumenesunlam.site/api/subjects`
- `Preparar Contexto` `[code]` — arma el contexto del agente

**Memoria / antiflood**
- `Cargar Historial` / `Guardar Historial` / `Redis Guardar` / `Redis`, `Redis1`, `Redis2` — historial en Redis
- `Wait`, `Wait1`, `Loop Over Items` `[splitInBatches]` — agrupan mensajes seguidos (debounce)
- `If`, `Edit Fields`/`1`/`2`, `No Operation` — control de flujo

**Salida**
- `HTTP Request` / `HTTP Request1` — responden al alumno por DM (incluye el link a `/register`)

### 2.2 Fuentes de conocimiento del bot

| Tema | Fuente | Cómo |
|---|---|---|
| Carreras, materias del ingreso, fechas, instancias, puntajes | **Prompt fijo** (bloque `CONOCIMIENTO UNLAM`) | Respuesta directa, sin herramientas |
| Precios de las materias | Herramienta `preciosunlam` → bloque `[DATOS_MATERIAS]` (API en vivo) | Nunca inventa precios |
| Plataforma, funcionalidades, proceso de venta, FAQ, info institucional | Herramienta `cerebro_resumenesunlam` (RAG) | Ver §2.3 |
| Términos y condiciones (vigencia, reembolsos, cuenta personal) | **Prompt fijo** (bloque legales) | Respuesta directa |

### 2.3 RAG del bot — `cerebro_resumenesunlam`

- **Tabla:** `cerebro_resumenesunlam` en Supabase de plataforma (`dtbouycelkjgyddpftir`)
- **Embeddings:** `text-embedding-3-small` · **topK:** 3
- **Contenido:** 89 chunks de 7 documentos (estado 2026-06-22):

| Documento | Chunks | Cubre |
|---|---|---|
| `unlam-curso-ingreso` | 24 | Instancias, ingreso de 4 materias, puntajes, documentación |
| `info-institucional.md` | 16 | Horarios, contacto UNLaM, documentación, graduados |
| `faq.md` | 14 | Cómo se aprueba, verano, materias por carrera, cómo accedo |
| `constitucion.md` | 13 | Reglas del bot, tono, registro y acceso |
| `ejemplos.md` | 11 | Conversaciones modelo |
| `identidad.md` | 6 | Cómo habla, personalidad |
| `diccionario-carreras.md` | 5 | Abreviaturas, materias ambiguas, materias que NO tenemos |

> El RAG **NO** contiene contenido académico de las materias (a propósito): el bot vende e informa, no enseña. El contenido de estudio vive en la plataforma con su propio chat IA.

### 2.4 Qué responde y qué no

**Sí responde:** carreras/materias del ingreso · fechas y procedimientos · precios (en vivo) · qué incluye la plataforma · cómo comprar · términos y condiciones · contacto e info institucional de la UNLaM. Es multimodal (texto, audio, imagen).

**No responde / deriva:**
- Info del ingreso fuera de su base → responde lo que sabe y agrega `unlam.edu.ar/inicio/curso-de-ingreso/`
- Dudas legales profundas → deriva a `@resumenes.unlam`
- Datos de pago manual (CVU/alias) → prohibido
- Pedir email / generar checkout → no lo hace (compra en plataforma)
- Intentos de jailbreak / revelar el prompt → bloqueados (anti-inyección estricto)

### 2.5 Cierre de venta (formato fijo)

```
Perfecto! Creá tu cuenta acá 👇
resumenesunlam.site/register
Una vez que te registrás, entrás al dashboard, elegís la materia que querés
y la desbloqueás pagando directo en la plataforma con tarjeta, débito o transferencia.
```

### 2.6 Escalación a soporte (Telegram)

El bot detecta reclamos/enojo/pedido de humano/problemas de pago y deriva a un humano, avisando al dueño por Telegram.

**Detección (doble):**
- **A — Agente:** si detecta el caso, el agente responde con el marcador `ESCALAR: <motivo>` (instruido en el prompt). Un IF post-agente lo detecta.
- **C — Palabras clave:** un `Code` antes del agente matchea frases explícitas (reembolso, devolución, estafa, "hablar con alguien", "pagué y no", "no me anda", etc.) como red de seguridad.

**Al escalar (cadena inline en el bot):**
1. **Redis SET** `bot_paused:{ID}` = `motivo|timestamp`, TTL 24 h (auto-reactivación).
2. **Alerta a Telegram** al dueño (chat_id `2023342141`) con username, link `instagram.com/<username>`, motivo, el mensaje, y botón **✅ Reactivar bot** (`callback_data = resume:{ID}`).
3. **Aviso de derivación** al usuario por SendPulse ("te paso con una persona…").

**Gate de pausa:** al inicio del flujo, si `bot_paused:{ID}` existe → el bot no responde (silencio). Una sola alerta por escalación.

**Reactivación:** workflow **"Reactivar bot"** (id `U3UvKWWMykAleCFm`, ACTIVO) — Telegram Trigger (nodo `BotonTelegram`) recibe el clic del botón → `Redis DEL bot_paused:{ID}` → confirma al dueño. Respaldo: el TTL de 24 h reactiva solo.

**Infra:** bot de Telegram dedicado (token y chat_id en memoria de credenciales). El bot principal pasó de 38 a 50 nodos.

---

## 3. Flujo de pago en la plataforma

### 3.1 Punto de entrada

`LockedSubjectCard` (dashboard, usuario **logueado**) → enlaza a `/checkout?subject=<slug>` **sin email** (el email sale de la sesión activa). Es decir: **el comprador siempre está registrado y logueado.**

### 3.2 Crear la preferencia — `POST /api/checkout/create`

1. Valida la materia en Supabase (`available = true`, `price ≠ null`).
2. Verifica que el usuario no tenga ya acceso activo (evita doble cobro).
3. Codifica la metadata en `external_reference` (base64 de JSON: email, full_name, subject_slug, …).
4. Crea la preferencia en MercadoPago con:
   - `back_urls.success = /checkout/success`, `failure = /checkout/failure`
   - `notification_url = https://resumenesunlam.site/api/webhooks/mercadopago`
   - `auto_return: 'approved'`
5. Devuelve `init_point` y el frontend redirige a MercadoPago.

### 3.3 Dos canales de retorno tras pagar

| Canal | Destino | Rol |
|---|---|---|
| `auto_return` | `/checkout/success` (frontend) | Confirma y redirige al alumno |
| `notification_url` | `/api/webhooks/mercadopago` (server) | Fuente de verdad server-to-server |

### 3.4 Webhook MercadoPago — `POST /api/webhooks/mercadopago`

1. **Valida la firma HMAC** (`x-signature` + `MP_WEBHOOK_SECRET`). Sin secret válido → 401.
2. Verifica el pago contra la API de MP (`GET /v1/payments/{id}`). Si no está `approved`, responde `200` y no hace nada.
3. Decodifica `external_reference`.
4. Busca el usuario por email (`get_user_id_by_email`). **No crea usuarios** — el comprador ya está registrado.
5. Otorga acceso en `user_subjects` (expira +1 año), con guard de **idempotencia** (no re-otorga si ya tiene acceso reciente).
6. Envía email de confirmación (Resend, secundario).
7. **No llama a n8n** (el modelo viejo de DM post-pago fue retirado).

### 3.5 Página de éxito — `/checkout/success` *(Crítico 3 resuelto)*

- Lee `payment_id` de la URL y hace `POST /api/checkout/finalize` para **confirmar y otorgar el acceso de forma activa**, sin depender del timing del webhook.
- Muestra "Confirmando tu pago…" hasta tener respuesta del servidor; recién ahí redirige a la materia.
- Si no hay `payment_id` o falla la red, cae de forma segura (el webhook ya habrá otorgado el acceso).

### 3.6 Finalize — `POST /api/checkout/finalize`

- Verifica el pago contra MP, decodifica la metadata, otorga el acceso.
- Crea el usuario si no existe (red de seguridad para el caso legacy de email por URL).
- Guard de **idempotencia** alineado con el webhook (no duplica grant ni email).

### 3.7 Idempotencia

Webhook y finalize son idempotentes: `user_subjects` se hace `upsert` con `onConflict (user_id, subject_id)` y ambos chequean acceso reciente antes de otorgar/emailar. Pueden correr los dos sin duplicar.

---

## 4. n8n — estado actual

| Workflow | ID | Nodos | Estado |
|---|---|---|---|
| `ResumenesUnlam` (bot Vendedora) | `o44ut3z52fHOXncz` | 38 | 🔴 OFF (pendiente activar) |

**Borrados en la consolidación (2026-06-22):**
- `Resumenesunlam` (49 nodos, `YfxWLdtY3VLt9NCO`) — versión vieja sin integración a la plataforma.
- `Bienvenida MP` (`Qy5odojSdEYk8RHE`) y `Bienvenida MP` (`e8SNAYdhBJShnh4v`) — duplicadas y en conflicto de path; el modelo nuevo no usa DM post-pago.

> Backup de los 4 workflows en `scripts/_n8n_backup/` (re-importables).

---

## 5. Endpoints propios

| Método | Endpoint | Rol | Auth |
|---|---|---|---|
| `POST` | `/api/checkout/create` | Crea preferencia en MercadoPago | No |
| `POST` | `/api/webhooks/mercadopago` | Webhook MP, otorga acceso | Firma HMAC |
| `POST` | `/api/checkout/finalize` | Confirma pago y otorga acceso (lo llama `/checkout/success`) | No (verifica con MP) |
| `POST` | `/api/webhooks/n8n` | Provisionamiento manual (transferencia/efectivo), acepta varias materias | `x-webhook-secret` |
| `GET`  | `/api/subjects` | Lista materias (lo consume el bot para precios) | No |
| `POST` | `/api/notify/credentials-dm` | ⚠️ **Huérfano** — ya nadie lo llama; apuntaba al webhook `bienvenida-mp` borrado | Sesión |

---

## 6. Tablas de Supabase

| Tabla | Rol |
|---|---|
| `auth.users` | Usuarios (Supabase Auth) |
| `profiles` | Perfil extendido (`full_name`, `is_admin`, `must_change_pass`, `sendpulse_contact_id`) |
| `subjects` | Catálogo (`slug`, `name`, `price`, `available`, `description`, …) |
| `user_subjects` | Accesos (`user_id`, `subject_id`, `expires_at`; unique `user_id+subject_id`) |
| `cerebro_resumenesunlam` | Vector store del RAG del bot |

---

## 7. Variables de entorno críticas

| Variable | Uso |
|---|---|
| `MP_ACCESS_TOKEN` | API de MercadoPago (debe ser de **producción**) |
| `MP_WEBHOOK_SECRET` | Validación de firma del webhook (debe coincidir con el panel de MP) |
| `NEXT_PUBLIC_APP_URL` | URL base (`https://resumenesunlam.site`) |
| `RESEND_API_KEY` | Emails transaccionales |
| `WEBHOOK_SECRET` | Webhook manual de n8n |
| `SUPABASE_SERVICE_ROLE_KEY` | Cliente admin server-side |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente Supabase |

---

## 8. Pendientes para producción

- [ ] **Deploy** de los cambios de código a Vercel (success/finalize/change-password).
- [ ] **Activar** el bot `ResumenesUnlam` (38 nodos) — switch de go-live de Instagram.
- [ ] **Config MP:** confirmar `MP_ACCESS_TOKEN` de producción y `MP_WEBHOOK_SECRET` cargado en el panel de MercadoPago; `NEXT_PUBLIC_APP_URL` con https.
- [ ] (Opcional) Eliminar el endpoint huérfano `/api/notify/credentials-dm`.
