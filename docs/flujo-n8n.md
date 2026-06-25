# Flujo de alta automática de usuarios — n8n + Webhook

> ⚠️ **DESACTUALIZADO (2026-06-22).** Describe el modelo viejo (alta automática por Instagram tras pago de MP).
> El funcionamiento vigente está en [funcionamiento-actual.md](./funcionamiento-actual.md).

## El flujo completo

1. Alumno manda DM por Instagram
2. n8n responde automáticamente y manda el link de MercadoPago de la materia que quiere
3. Alumno paga
4. MercadoPago notifica a n8n que el pago fue aprobado
5. n8n llama al webhook con los datos del alumno y la materia comprada
6. El webhook:
   - Crea el usuario en Supabase con una contraseña generada automáticamente
   - Le da acceso **solo a la materia que compró** por 365 días
   - Devuelve la contraseña en la respuesta para que n8n se la mande por DM
7. n8n recibe la respuesta del webhook y le manda la contraseña al alumno por Instagram DM
8. El alumno entra a la plataforma con su email y esa contraseña

---

## Configuración del nodo HTTP Request en n8n

| Campo | Valor |
|---|---|
| Method | `POST` |
| URL | `https://resumenesunlam.vercel.app/api/webhooks/n8n` |
| Header | `x-webhook-secret: c2031ecc-aaad-4cdc-82b1-96bd9227352b` |
| Body type | JSON |

**Body:**
```json
{
  "email": "{{ $json.email }}",
  "full_name": "{{ $json.nombre }}",
  "subject_slugs": ["seminario"],
  "instagram_username": "{{ $json.instagram }}"
}
```

En `subject_slugs` va la materia que compró. Un solo pago = un solo slug.

---

## Slugs disponibles por materia

| Materia | Slug |
|---|---|
| Seminario | `seminario` |
| Lógica Matemática | `logica-matematica` |
| Fundamentos de Ed. Física | `fundamentos-ed-fisica` |
| Filosofía | `filosofia` |
| Contabilidad | `contabilidad` |
| Historia Argentina | `historia-argentina` |
| Biología | `biologia` |
| Biociencias | `biociencias` |

---

## Respuesta del webhook (lo que n8n recibe)

```json
{
  "success": true,
  "user_id": "uuid-del-usuario",
  "is_new_user": true,
  "subjects_granted": ["Seminario"],
  "password": "abc12345def67890"
}
```

Con `password` n8n puede mandarle la contraseña al alumno por DM.

---

## Cambios pendientes en el código

- [ ] Sacar `must_change_pass: true` del webhook (el alumno no tiene que cambiar la contraseña)
- [ ] Devolver la contraseña generada en la respuesta del webhook para que n8n la use
- [ ] (Opcional) Configurar Resend cuando haya dominio para mandar email de bienvenida

---

## Notas importantes

- Si el alumno ya existe (compró otra materia antes), el webhook **no** crea un usuario nuevo, solo le agrega la nueva materia
- El acceso dura 365 días desde la fecha de compra
- El `WEBHOOK_SECRET` es `c2031ecc-aaad-4cdc-82b1-96bd9227352b` — no compartirlo, es lo que protege el endpoint
