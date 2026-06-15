# Flujo Técnico — Resúmenes UNLaM

Documentación lógica y técnica del sistema completo: desde que un alumno contacta por Instagram hasta que accede a la plataforma.

---

## Diagrama general

```
[Instagram DM]
      │
      ▼
[n8n — Vendedora Bot]
  ├─ Detecta intención de compra
  ├─ Captura: email, nombre, materia, instagram_user, contact_id
  └─ Envía link personalizado de checkout
      │
      ▼
[/checkout?email=...&name=...&subject=...&instagram=...&contact_id=...]
  ├─ Muestra precio, descripción, email del alumno
  └─ Click "Pagar con MercadoPago"
      │
      ▼
[POST /api/checkout/create]
  ├─ Valida materia en Supabase (available=true, price≠null)
  ├─ Codifica metadata en external_reference (base64 JSON)
  └─ Crea preferencia en MercadoPago API
      │
      ▼
[MercadoPago — plataforma de pago]
  └─ Alumno paga (tarjeta / transferencia / etc.)
      │
      ├─── auto_return → /checkout/success (frontend)
      │
      └─── notification_url → POST /api/webhooks/mercadopago
                │
                ├─ Verifica pago con MP API (status === 'approved')
                ├─ Decodifica external_reference
                ├─ Busca o crea usuario en Supabase Auth
                ├─ Upsert en profiles
                ├─ Upsert en user_subjects (expires_at = +1 año)
                ├─ Genera reset_link (solo usuarios nuevos, TTL 24h)
                ├─ Envía email via Resend (canal secundario)
                └─ POST n8n /webhook/bienvenida-mp
                        │
                        ▼
                [n8n — Workflow "Bienvenida MP"]
                  └─ SendPulse → Instagram DM con reset_link
```

---

## Fase 1 — Captación (Instagram → n8n)

### 1.1 Contacto inicial
El alumno escribe por Instagram a `@resumenes.unlam`. El bot Vendedora en n8n detecta la intención de compra.

### 1.2 Datos capturados por n8n
| Campo | Descripción |
|---|---|
| `email` | Email del alumno (ingresado en el chat) |
| `name` | Nombre completo |
| `subject` | Slug de la materia (ej. `logica-matematica`) |
| `instagram` | Handle de Instagram (ej. `@juanperez`) |
| `contact_id` | ID del contacto en SendPulse (para poder enviarle DMs después) |

### 1.3 Link de checkout generado
```
https://resumenesunlam.site/checkout?email=alumno@mail.com&name=Juan+Perez&subject=logica-matematica&instagram=@juanperez&contact_id=ABC123
```

El `contact_id` de SendPulse es crítico: sin él, no se puede enviar el DM de bienvenida post-pago.

---

## Fase 2 — Checkout (`/checkout`)

### 2.1 Página del cliente (`src/app/checkout/page.tsx`)
- Lee parámetros de la URL via `useSearchParams()`
- Llama a `GET /api/subjects` para obtener nombre, precio, descripción de la materia
- Si `available === false`, muestra pantalla de "no disponible"
- Muestra al alumno: nombre de materia, precio en ARS, su email de acceso
- Botón "Pagar con MercadoPago" dispara `handlePagar()`

### 2.2 Creación de preferencia (`POST /api/checkout/create`)

**Archivo:** `src/app/api/checkout/create/route.ts`

**Validaciones (Zod):**
```typescript
z.object({
  email:                z.string().email(),
  full_name:            z.string().min(1),
  subject_slug:         z.string().min(1),
  instagram_username:   z.string().optional(),
  sendpulse_contact_id: z.string().optional(),
})
```

**Lógica:**
1. Consulta Supabase: `subjects` donde `slug = subject_slug`
2. Verifica `available === true` y `price !== null`
3. Codifica metadata en `external_reference` (base64 de JSON):
   ```json
   {
     "email": "...",
     "full_name": "...",
     "subject_slug": "...",
     "instagram_username": "...",
     "sendpulse_contact_id": "..."
   }
   ```
4. Llama a `POST https://api.mercadopago.com/checkout/preferences` con:
   - `items[0].unit_price` = precio de la materia
   - `payer.email` = email del alumno
   - `external_reference` = base64 con toda la metadata
   - `back_urls.success` = `https://resumenesunlam.site/checkout/success`
   - `notification_url` = `https://resumenesunlam.site/api/webhooks/mercadopago`
   - `auto_return: 'approved'`
5. Devuelve `{ init_point, preference_id }` al frontend
6. Frontend redirige a `init_point` (URL de MercadoPago)

---

## Fase 3 — Pago en MercadoPago

El alumno completa el pago en la plataforma de MercadoPago.

### Canales de retorno
| Canal | Destino | Descripción |
|---|---|---|
| `auto_return` | `/checkout/success` | Redirección automática al pagar (frontend) |
| `notification_url` | `/api/webhooks/mercadopago` | Webhook server-side (la fuente de verdad) |

La página `/checkout/success` solo muestra un mensaje de confirmación y lee el email del `external_reference` en la URL. **No provisiona acceso** — eso lo hace el webhook.

---

## Fase 4 — Webhook MercadoPago (provisionamiento automático)

**Archivo:** `src/app/api/webhooks/mercadopago/route.ts`

Este endpoint es el núcleo del sistema. Ejecuta el flujo completo de manera idempotente.

### 4.1 Recepción del evento

MercadoPago puede enviar la notificación de dos formas:
- Query params: `?topic=payment&id=<payment_id>`
- Body JSON: `{ "action": "payment.updated", "data": { "id": "<payment_id>" } }`

El handler soporta ambas.

### 4.2 Verificación del pago

```
GET https://api.mercadopago.com/v1/payments/{payment_id}
Authorization: Bearer {MP_ACCESS_TOKEN}
```

Si `payment.status !== 'approved'`, el handler responde `200 OK` sin hacer nada (pagos pendientes/rechazados se ignoran silenciosamente).

### 4.3 Decodificación de metadata

```typescript
const meta: CheckoutMeta = JSON.parse(
  Buffer.from(payment.external_reference, 'base64').toString('utf8')
)
```

Extrae: `email`, `full_name`, `subject_slug`, `instagram_username`, `sendpulse_contact_id`.

### 4.4 Buscar o crear usuario (idempotente)

```
supabase.auth.admin.listUsers() → buscar por email
```

| Caso | Acción |
|---|---|
| **Usuario nuevo** | `createUser(email, randomPassword, email_confirm: true)` + upsert en `profiles` |
| **Usuario existente** | Update de `full_name`, `instagram_username`, `sendpulse_contact_id` en `profiles` |

La contraseña generada para usuarios nuevos es `crypto.randomUUID().slice(0, 16)` y es descartada — el alumno nunca la usa directamente, configura una nueva via `reset_link`.

### 4.5 Otorgar acceso a la materia

```sql
INSERT INTO user_subjects (user_id, subject_id, expires_at)
VALUES (:userId, :subjectId, NOW() + INTERVAL '1 year')
ON CONFLICT (user_id, subject_id) DO UPDATE SET expires_at = EXCLUDED.expires_at
```

`expires_at` = fecha actual + 365 días.

### 4.6 Generación del reset_link (solo usuarios nuevos)

```typescript
supabase.auth.admin.generateLink({
  type: 'recovery',
  email,
  options: { redirectTo: 'https://resumenesunlam.site/change-password' }
})
```

El link tiene TTL de 24 horas y es de un solo uso. Redirige a `/change-password` donde el alumno configura su contraseña definitiva.

### 4.7 Email via Resend (canal secundario)

| Caso | Función | Asunto |
|---|---|---|
| Usuario nuevo | `sendWelcomeEmail()` | "¡Tu acceso a Resúmenes UNLaM está listo! 🎓" |
| Usuario existente | `sendAccessGrantedEmail()` | "✅ Nuevo acceso habilitado — Resúmenes UNLaM" |

- Sender: `noreply@resumenesunlam.site`
- El email falla silenciosamente (no bloquea el flujo)
- Este canal es **respaldo** — el canal principal es el DM de Instagram

### 4.8 DM de Instagram via n8n (canal principal)

**Condición para disparar:** `sendpulse_contact_id && isNewUser && resetLink`

```typescript
fetch('https://n8n.nexioagency.online/webhook/bienvenida-mp', {
  method: 'POST',
  body: JSON.stringify({
    contact_id: sendpulse_contact_id,
    email,
    reset_link: resetLink,
  })
})
```

También falla silenciosamente (no bloquea el flujo principal).

**Nota:** Si el alumno ya tiene cuenta (`isNewUser === false`) o no hay `contact_id`, el DM NO se envía.

---

## Fase 5 — n8n: Workflow "Bienvenida MP"

**URL:** `https://n8n.nexioagency.online/webhook/bienvenida-mp`

### Flujo interno del workflow

```
[Webhook trigger]
  ├─ Recibe: contact_id, email, reset_link
  │
  └─ SendPulse → Enviar DM de Instagram al contact_id
       Mensaje:
       "Bienvenido/a a Resúmenes UNLaM!
        Configurate tu contraseña y accedé:
        [reset_link]
        Tu email de acceso: [email]"
```

El `contact_id` de SendPulse identifica unívocamente al contacto de Instagram para poder enviarle DMs directos.

---

## Fase 6 — Primer acceso del alumno

### 6.1 Configurar contraseña (`/change-password`)
- El alumno hace click en el link del DM
- Supabase valida el token de recuperación
- El alumno ingresa y confirma su nueva contraseña

### 6.2 Login (`/login`)
- Email + contraseña configurada
- Supabase Auth devuelve sesión JWT
- Redirección al dashboard

---

## Flujo alternativo — Webhook n8n manual

**Endpoint:** `POST /api/webhooks/n8n`
**Archivo:** `src/app/api/webhooks/n8n/route.ts`

Para casos donde la venta no pasa por MercadoPago (ej. transferencia bancaria, pago en efectivo). Permite a n8n provisionar acceso manualmente.

### Seguridad
```
Header: x-webhook-secret: {WEBHOOK_SECRET}
```
Sin este header con el valor correcto, devuelve `401 Unauthorized`.

### Payload
```json
{
  "email": "alumno@mail.com",
  "full_name": "Juan Pérez",
  "subject_slugs": ["logica-matematica", "filosofia"],
  "instagram_username": "@juanperez",
  "contact_id": "ABC123"
}
```

Diferencia clave con el webhook de MP: acepta **múltiples materias** (`subject_slugs` es array).

### Respuesta
```json
{
  "success": true,
  "user_id": "uuid",
  "is_new_user": true,
  "subjects_granted": ["Lógica y Matemática", "Filosofía"],
  "password": "abc123def456",
  "reset_link": "https://resumenesunlam.site/change-password?token=..."
}
```

---

## Flujo alternativo — DM de credenciales desde la plataforma

**Endpoint:** `POST /api/notify/credentials-dm`
**Archivo:** `src/app/api/notify/credentials-dm/route.ts`

Endpoint autenticado (requiere sesión activa). Permite reenviar credenciales por DM desde la plataforma.

**Lógica:**
- Si recibe `{ password }`: envía email + contraseña directamente
- Si no hay password: genera un nuevo `reset_link` fresh y lo envía

Llama al mismo webhook de n8n: `https://n8n.nexioagency.online/webhook/bienvenida-mp` con `{ contact_id, message }`.

---

## Tablas de Supabase involucradas

| Tabla | Descripción | Campos clave |
|---|---|---|
| `auth.users` | Tabla nativa de Supabase Auth | `id`, `email`, `confirmed_at` |
| `profiles` | Perfil extendido del usuario | `id`, `full_name`, `instagram_username`, `sendpulse_contact_id`, `is_admin`, `must_change_pass` |
| `subjects` | Catálogo de materias | `id`, `slug`, `name`, `price`, `available`, `description`, `benefit`, `department` |
| `user_subjects` | Accesos por usuario/materia | `user_id`, `subject_id`, `expires_at` (unique: user_id+subject_id) |

### Relaciones clave
```
auth.users.id ──1:1── profiles.id
auth.users.id ──1:N── user_subjects.user_id
subjects.id   ──1:N── user_subjects.subject_id
```

---

## Variables de entorno críticas

| Variable | Uso |
|---|---|
| `MP_ACCESS_TOKEN` | Autenticación con la API de MercadoPago (Bearer token) |
| `NEXT_PUBLIC_APP_URL` | URL base de la app (`https://resumenesunlam.site`) |
| `RESEND_API_KEY` | Autenticación con Resend para envío de emails |
| `WEBHOOK_SECRET` | Secreto compartido para el webhook n8n manual |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de Supabase (cliente) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio Supabase (solo server-side, admin) |

---

## Infraestructura

| Servicio | Rol | URL/Referencia |
|---|---|---|
| **Vercel** | Hosting Next.js | `resumenesunlam.site` |
| **Supabase** | PostgreSQL + Auth | proyecto `resumenes.unlam` |
| **MercadoPago** | Procesador de pagos | API REST + webhooks |
| **n8n** | Automatización + bot Vendedora | `n8n.nexioagency.online` |
| **SendPulse** | DMs de Instagram | via n8n |
| **Resend** | Emails transaccionales | sender: `noreply@resumenesunlam.site` |

---

## Resumen de endpoints propios

| Método | Endpoint | Descripción | Auth requerida |
|---|---|---|---|
| `POST` | `/api/checkout/create` | Crea preferencia en MercadoPago | No |
| `POST` | `/api/webhooks/mercadopago` | Webhook de MP, provisiona acceso | IP de MP |
| `POST` | `/api/webhooks/n8n` | Provisionamiento manual desde n8n | `x-webhook-secret` |
| `POST` | `/api/notify/credentials-dm` | Reenvía credenciales por DM | Sesión activa |
| `GET` | `/api/subjects` | Lista materias disponibles | No |

---

## Puntos de fallo y comportamiento defensivo

| Punto | Si falla | Impacto |
|---|---|---|
| MP no envía webhook | Acceso no se provisiona automáticamente | Alto — requiere intervención manual |
| n8n no responde | DM no se envía, pero acceso ya fue creado | Medio — el alumno no recibe el link |
| Resend falla | Email no se envía | Bajo — el DM de Instagram es el canal principal |
| `contact_id` ausente | DM no se puede enviar (no hay a quién) | Medio — ocurre si n8n no capturó el contact_id |
| Usuario ya existe | Se actualiza perfil, no se regenera reset_link | Diseñado — el alumno ya sabe su contraseña |
| Supabase caído | Todo el flujo post-pago falla | Crítico |

---

## Idempotencia

El webhook de MercadoPago es idempotente por diseño:

- `user_subjects.upsert` con `onConflict: 'user_id,subject_id'` — actualiza `expires_at` sin duplicar
- La búsqueda de usuario por email antes de crear evita usuarios duplicados
- MercadoPago puede enviar la misma notificación múltiples veces — el sistema la maneja correctamente
