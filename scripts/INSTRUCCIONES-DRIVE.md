# Instrucciones: Migración desde Google Drive

## ¿Qué hace este script?

`migrate-drive.mjs` accede a tu Google Drive privado, descarga los PDFs,
extrae el texto y lo importa directamente a Supabase como contenido de cada materia.

---

## PASO 1 — Crear un proyecto en Google Cloud

1. Abrí [console.cloud.google.com](https://console.cloud.google.com)
2. Hacé clic en el selector de proyectos (arriba a la izquierda) → **Nuevo proyecto**
3. Nombre: `resumenes-unlam` (o el que quieras)
4. Hacé clic en **Crear**
5. Asegurate de que el nuevo proyecto esté seleccionado

---

## PASO 2 — Activar la API de Google Drive

1. En el menú lateral → **APIs y servicios** → **Biblioteca**
2. Buscá `Google Drive API`
3. Hacé clic en el resultado → **Habilitar**

---

## PASO 3 — Crear una cuenta de servicio

1. En el menú lateral → **APIs y servicios** → **Credenciales**
2. Hacé clic en **+ CREAR CREDENCIALES** → **Cuenta de servicio**
3. Completá:
   - **Nombre**: `drive-reader`
   - **ID**: se completa automático
   - Hacé clic en **Crear y continuar**
4. En "Conceder acceso al proyecto" → **Rol**: `Visor` (Viewer)
5. Hacé clic en **Continuar** → **Listo**

---

## PASO 4 — Descargar el JSON de credenciales

1. En la lista de cuentas de servicio, hacé clic en la que creaste (`drive-reader@...`)
2. Andá a la pestaña **Claves**
3. Hacé clic en **Agregar clave** → **Crear clave nueva**
4. Formato: **JSON** → **Crear**
5. Se descarga automáticamente un archivo `.json`
6. **Renombralo a `drive-credentials.json`** y movelo a la carpeta `scripts/` del proyecto

   La estructura del archivo debería verse así:
   ```json
   {
     "type": "service_account",
     "project_id": "resumenes-unlam",
     "private_key_id": "...",
     "private_key": "-----BEGIN RSA PRIVATE KEY-----\n...",
     "client_email": "drive-reader@resumenes-unlam.iam.gserviceaccount.com",
     "client_id": "...",
     ...
   }
   ```

> ⚠️ **IMPORTANTE**: `drive-credentials.json` ya está en `.gitignore`.
> Nunca lo subas a GitHub — es una clave privada.

---

## PASO 5 — Compartir tu carpeta de Drive con la cuenta de servicio

1. Abrí el archivo `scripts/drive-credentials.json` y copiá el valor de `client_email`
   (algo como `drive-reader@resumenes-unlam.iam.gserviceaccount.com`)
2. Andá a Google Drive y abrí la carpeta raíz que contiene los PDFs
3. Hacé clic derecho → **Compartir**
4. En el campo de correo, pegá el `client_email` copiado
5. Permiso: **Lector** (Viewer)
6. Hacé clic en **Compartir** (no necesita que la cuenta tenga Gmail)

---

## PASO 6 — Obtener el ID de la carpeta

El ID de la carpeta está en la URL cuando la abrís en Drive:

```
https://drive.google.com/drive/folders/ESTE-ES-EL-ID
                                        ↑↑↑↑↑↑↑↑↑↑↑↑↑
```

Copiá ese ID, lo necesitás para correr el script.

---

## PASO 7 — Correr el script

### Primero: simulación (sin importar nada)

```bash
node scripts/migrate-drive.mjs TU-FOLDER-ID
```

Esto muestra qué archivos encontró y a qué materia los asignaría, **sin tocar Supabase**.

### Si todo se ve bien: importación real

```bash
node scripts/migrate-drive.mjs TU-FOLDER-ID --import
```

---

## Estructura de carpetas esperada en Drive

El script detecta la materia según el **nombre de la carpeta**. Ejemplos:

| Nombre de carpeta en Drive       | Materia que detecta        |
|----------------------------------|----------------------------|
| `Logica Matematica`              | logica-matematica          |
| `Lógica`                         | logica-matematica          |
| `Seminario`                      | seminario                  |
| `Filosofia` / `Filosofía`        | filosofia                  |
| `Contabilidad`                   | contabilidad               |
| `Historia Argentina` / `Historia`| historia-argentina         |
| `Biologia` / `Biología`          | biologia                   |
| `Biociencias`                    | biociencias                |
| `Fundamentos de Ed Fisica`       | fundamentos-ed-fisica      |

Si tu carpeta tiene otro nombre, editá el mapa `FOLDER_TO_SLUG` en `migrate-drive.mjs`.

---

## Detección automática del tipo de contenido

El script detecta el tipo según el **nombre del archivo PDF**:

| El nombre contiene...                           | Tipo asignado   |
|-------------------------------------------------|-----------------|
| `guia`, `guía`, `ejercicio`, `practica`         | `guide`         |
| `modelo`, `examen`, `parcial`, `final`          | `exam_model`    |
| (cualquier otro)                                | `summary`       |

---

## Verificación después de la migración

Una vez importado, revisá el contenido en:
- **Admin**: `/admin/content`
- **Plataforma**: `/dashboard/[materia]`

---

## Problemas comunes

**"No encontré el archivo de credenciales"**
→ Asegurate de que `drive-credentials.json` está en la carpeta `scripts/`

**"Carpeta X → no encontré materia correspondiente"**
→ Agregá el mapeo en `FOLDER_TO_SLUG` dentro de `migrate-drive.mjs`

**"slug X no existe en Supabase"**
→ Verificá que las materias estén creadas en `/admin/subjects`

**Error 403 de Drive**
→ Verificá que compartiste la carpeta con el email de la cuenta de servicio (no con tu cuenta personal)
