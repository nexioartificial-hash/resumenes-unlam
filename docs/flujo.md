# Flujo completo — Resúmenes UNLaM

> ⚠️ **DESACTUALIZADO (2026-06-22).** Describe el modelo viejo (venta por DM + alta automática por Instagram).
> El funcionamiento vigente está en [funcionamiento-actual.md](./funcionamiento-actual.md).

## Visión general

```
Alumno interesado
  → contacto por Instagram
    → link de pago personalizado
      → pago con MercadoPago
        → acceso automático a la plataforma
          → DM de bienvenida con link para configurar contraseña
```

---

## 1. Venta (antes del pago)

### 1.1 Contacto por Instagram
El alumno escribe por Instagram a `@resumenes.unlam` consultando por una materia.

### 1.2 Generación del link de pago
Desde n8n, se envía un DM con un link personalizado que incluye los datos del alumno:

```
https://resumenesunlam.site/checkout?email=alumno@mail.com&name=Juan+Perez&subject=logica-matematica&instagram=@juanperez
```

**Datos que viajan en el link:**
- `email` — email del alumno
- `name` — nombre completo
- `subject` — slug de la materia (ej. `logica-matematica`)
- `instagram` — usuario de Instagram (para el DM de bienvenida)

---

## 2. Checkout

### 2.1 Página de pago
El alumno abre el link y ve:
- Nombre de la materia
- Descripción y beneficios
- Precio en ARS
- Su email de acceso

### 2.2 Creación de preferencia en MercadoPago
Al hacer click en **"Pagar con MercadoPago"**, el sistema:
1. Verifica que la materia existe y está disponible
2. Empaqueta los datos del alumno en `external_reference` (base64)
3. Crea una preferencia en la API de MercadoPago con:
   - Precio y descripción de la materia
   - URLs de retorno (success / failure)
   - `notification_url: https://resumenesunlam.site/api/webhooks/mercadopago`

### 2.3 Redirección a MercadoPago
El alumno completa el pago en la plataforma de MercadoPago (tarjeta, transferencia, etc.).

---

## 3. Post-pago (automático)

### 3.1 Notificación de MercadoPago
Una vez aprobado el pago, MercadoPago envía una notificación POST a:
```
https://resumenesunlam.site/api/webhooks/mercadopago
```

### 3.2 Procesamiento del webhook
El sistema realiza los siguientes pasos de forma automática:

1. **Verifica el pago** consultando la API de MercadoPago con el `payment_id`
2. **Decodifica los datos** del alumno desde `external_reference`
3. **Crea o actualiza el usuario** en Supabase Auth:
   - Si es nuevo: genera contraseña random y confirma el email automáticamente
   - Si ya existe: actualiza su perfil
4. **Desbloquea la materia** por 365 días (`user_subjects`)
5. **Genera link de configuración de contraseña** (válido 24 horas, solo para usuarios nuevos)
6. **Envía email de bienvenida** via Resend desde `noreply@resumenesunlam.site` (canal secundario)
7. **Llama a n8n** en `https://n8n.nexioagency.online/webhook/bienvenida-mp` con:
   ```json
   {
     "contact_id": "...",
     "email": "alumno@mail.com",
     "reset_link": "https://resumenesunlam.site/change-password?token=..."
   }
   ```

### 3.3 DM de bienvenida (n8n → SendPulse → Instagram)
n8n recibe los datos y envía un DM de Instagram al alumno:

> *"Bienvenido/a a Resúmenes UNLaM!*
>
> *Configurate tu contraseña y accedé a la plataforma acá:*
> *[link de configuración]*
>
> *Tu email de acceso: alumno@mail.com"*

---

## 4. Primer acceso del alumno

### 4.1 Configuración de contraseña
El alumno hace click en el link del DM, que lo lleva a:
```
https://resumenesunlam.site/change-password
```
Ingresa y confirma su nueva contraseña.

### 4.2 Login
Accede a la plataforma en:
```
https://resumenesunlam.site/login
```
Con su email y la contraseña que acaba de configurar.

---

## 5. Dentro de la plataforma

### 5.1 Dashboard
El alumno ve todas las materias disponibles:
- **Desbloqueadas** — las que pagó, con acceso completo
- **Bloqueadas** — las que no pagó, mostrando precio y descripción

### 5.2 Dentro de una materia
Al ingresar a una materia desbloqueada, el alumno puede:

| Sección | Qué hace |
|---|---|
| **Módulos** | Lee el contenido con resúmenes estructurados |
| **Audio** | Escucha el resumen en formato podcast |
| **Quiz** | Responde preguntas de práctica por módulo o materia completa |
| **AI Chat** | Hace preguntas sobre el contenido al asistente de IA |
| **Examen IA** | Genera un examen simulado y lo evalúa con IA |
| **Progreso** | Ve su avance general y por módulo |

---

## 6. Materias disponibles

| Slug | Materia |
|---|---|
| `logica-matematica` | Lógica y Matemática |
| `seminario` | Seminario |
| `fundamentos-ed-fisica` | Fundamentos de Educación Física |
| `filosofia` | Filosofía |
| `contabilidad` | Contabilidad |
| `historia-argentina` | Historia Argentina |
| `biologia` | Biología |
| `biociencias` | Biociencias |

---

## 7. Panel de administración

Accesible solo para usuarios con `is_admin = true` en `profiles`.

| Sección | Función |
|---|---|
| `/admin/users` | Ver y gestionar usuarios, sus accesos y vencimientos |
| `/admin/subjects` | Crear, editar y activar/desactivar materias |
| `/admin/content` | Gestionar módulos y contenido por materia |
| `/admin/quiz` | Crear y editar preguntas de quiz |
| `/admin/import` | Importar contenido desde Google Drive / PDF |

---

## 8. Infraestructura

| Servicio | Rol |
|---|---|
| **Vercel** | Hosting de la plataforma Next.js |
| **Supabase** | Base de datos (PostgreSQL) + autenticación |
| **MercadoPago** | Procesador de pagos |
| **n8n** | Automatización (envío de links, DM de bienvenida) |
| **SendPulse** | Envío de DMs de Instagram |
| **Resend** | Emails transaccionales (bienvenida, acceso) |
| **Groq** | Modelos de IA para chat y exámenes |
