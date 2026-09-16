

```markdown
# Fitness API — Guía completa del proyecto

Escrito por mí (Hernán) para que cualquiera del equipo —o una IA que no
sepa nada del proyecto— pueda entenderlo, levantarlo y extenderlo sin
preguntarme todo.

---

## 1. Qué es esto y por qué existe

Es el **servidor backend** de nuestra app de rutinas de fitness para
Android. No es la app. La app es el cliente; esto es lo que la app
consulta por HTTP.

La razón de tener un backend separado es simple: el dataset tiene
1,324 ejercicios con textos en 10 idiomas + 2,648 archivos de imagen y
GIF. Meter todo eso en el APK de Android sería una locura (cientos de
MB, cada cambio requiere recompilar, etc.). Entonces:

- **Backend (esto)**: guarda los datos, sirve JSON, sirve imágenes/GIFs,
  maneja usuarios y rutinas.
- **Android (lo que viene después)**: pide datos por HTTP y los muestra.
- **Comunicación**: HTTP plano en la red local (Wi-Fi) durante desarrollo.

Diagrama mental:

    [ App Android ]  --HTTP-->  [ Este servidor Express ]  -->  [ SQLite + archivos media ]
      (cliente)                     (tu PC / mi PC)             (datos + imágenes + GIFs)

Reglas importantes:

- La app **nunca** toca la base de datos ni los archivos directo.
- La app **solo** habla HTTP con este servidor.
- Este servidor corre en la PC de cada quien, en el puerto **6070**.
- Para que el emulador de Android lo vea, usa `http://10.0.2.2:6070/`.

---

## 2. Stack técnico

- **Node.js 18+** — runtime.
- **Express 4** — framework HTTP.
- **better-sqlite3** — driver de SQLite (síncrono, rápido, sin servidor).
- **SQLite** — base de datos en un solo archivo (`data/fitness.db`).
- **bcryptjs** — hashing de contraseñas (JS puro, sin compilación nativa).
- **jsonwebtoken** — tokens JWT para autenticación.
- **cors** — permite peticiones desde cualquier origen (dev).
- **dotenv** — lee configuración de `.env`.

Todo se instala con `npm install`. No hay nada más que instalar a nivel
sistema (excepto `build-essential` y `python3` en Linux si
`better-sqlite3` no compila solo).

---

## 3. Estructura de carpetas

    fitness-api/
    ├── package.json
    ├── .env                    <-- yo se los paso, no está en git
    ├── .env.example
    ├── .gitignore
    ├── README.md               <-- este archivo
    ├── scripts/
    │   └── init-db.js          <-- crea las tablas si no existen
    ├── src/
    │   ├── index.js            <-- punto de entrada, arranca el server
    │   ├── app.js              <-- configuración de Express
    │   ├── config.js           <-- lee variables de .env
    │   ├── db.js               <-- conexión única a SQLite
    │   ├── errors.js           <-- clases de error (400, 401, 403, 404, 409, 500)
    │   ├── auth.js             <-- hashing de passwords + firmar/verificar JWT
    │   ├── middleware/
    │   │   ├── requestLogger.js     <-- log de cada petición
    │   │   ├── errorHandler.js      <-- 404 y 500 centralizados
    │   │   └── authenticate.js      <-- valida el header Authorization
    │   ├── routes/
    │   │   ├── exercises.js         <-- /exercises
    │   │   ├── metadata.js          <-- /categories, /body-parts, /equipment
    │   │   ├── auth.js              <-- /auth/register, /auth/login, /auth/me
    │   │   └── routines.js          <-- /routines (requiere login)
    │   └── utils/
    │       ├── pagination.js        <-- parsea page/limit
    │       ├── likePattern.js       <-- escapa % y _ en filtros
    │       └── serialize.js         <-- convierte fila de DB a JSON
    └── data/                   <-- NO está en git, pesa mucho
        ├── fitness.db          <-- yo se los paso
        ├── images/             <-- 1,324 JPGs
        └── videos/             <-- 1,324 GIFs

---

## 4. Qué les voy a pasar

Estos tres los comparto yo (o el equipo), NO están en el repo:

1. **`.env`** — archivo de configuración con el puerto, el `JWT_SECRET`,
   las rutas de DB y media, etc.
2. **`data/fitness.db`** — la base SQLite ya con los 1,324 ejercicios
   cargados. Pesa varios MB.
3. **Las carpetas `images/` y `videos/`** — los 2,648 archivos de media.
   Estos los bajamos del repo original del dataset.

Los nombres de los archivos de media tienen un sufijo aleatorio
(ejemplo: `0001-2gPfomN.jpg`). **NO los renombren**. La base de datos los
tiene guardados con ese nombre exacto y el servidor los busca tal cual.

---

## 5. Cómo levantar el proyecto (paso a paso)

Requiere Node.js 18+. Verifiquen con `node --version`.

### Paso 1 — Clonar / copiar el repo y entrar

```bash
cd fitness-api
```

### Paso 2 — Instalar dependencias

```bash
npm install
```

Esto instala Express, SQLite, etc. Tarda un poco la primera vez. Si
falla `better-sqlite3`:

```bash
sudo apt install -y build-essential python3
npm install
```

### Paso 3 — Colocar el `.env` que les paso

Cópienlo dentro de `fitness-api/`, al mismo nivel que `package.json`.
Si no lo tienen, pueden copiar `.env.example` a `.env` y ajustar. Debe
tener al menos:

```
PORT=6070
DB_PATH=./data/fitness.db
ALLOWED_ORIGINS=*
MEDIA_DIR=./data
MEDIA_BASE_URL=http://10.0.2.2:6070/media
JWT_SECRET=<algo-largo-y-aleatorio>
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

El `JWT_SECRET` debe ser el mismo para todos si quieren que los tokens
sean válidos entre máquinas. Generarlo con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
IMPORTANTE: ESTE PASO YA ESTA HECHO, NO LO CAMBIEN DEL ENV QUE LES PASE
### Paso 4 — Colocar la base de datos

Copien `fitness.db` a `data/fitness.db`. Verifiquen que no esté vacía:

```bash
ls -la data/fitness.db
```

Debe pesar varios MB. Si pesa KB, no es la buena.

### Paso 5 — Colocar las imágenes y GIFs

Bajen del repo del dataset las carpetas `images/` y `videos/` y déjenlas
así:

```
data/
├── fitness.db
├── images/    (1,324 JPG)
└── videos/    (1,324 GIF)
```

Para verificar cuántos tienen:

```bash
ls data/images/ | wc -l    # debe dar 1324
ls data/videos/ | wc -l    # debe dar 1324
```

### Paso 6 — Crear las tablas (solo si no las tienen)

Si es la primera vez con esta base, o si la base no tiene las tablas
`users`/`routines` todavía:

```bash
npm run init-db
```

Es idempotente: usa `CREATE TABLE IF NOT EXISTS`, así que correrlo dos
veces no rompe nada. NO borra datos.

### Paso 7 — Arrancar

```bash
npm start
```

Debe imprimir:

```
Serving static media from .../fitness-api/data at /media
Fitness API listening on http://0.0.0.0:6070
  DB_PATH        = ./data/fitness.db
  MEDIA_DIR      = ./data
  MEDIA_BASE_URL = http://10.0.2.2:6070/media
  ALLOWED_ORIGINS= *
  NODE_ENV       = development
```

Déjenlo corriendo en esa terminal. Para detenerlo: `Ctrl + C`.

Si tienen `npm run dev`, se reinicia solo al guardar cambios. Útil para
desarrollo.

---

## 6. Verificar que funciona

En **otra** terminal (no cierren la del servidor):

```bash
curl http://localhost:6070/health
# {"status":"ok"}

curl "http://localhost:6070/exercises?limit=2"
# JSON con 2 ejercicios

curl http://localhost:6070/exercises/0001
# Ejercicio 0001

curl -I "http://localhost:6070/media/images/0001-2gPfomN.jpg"
# HTTP/1.1 200 OK
```

Si esos cuatro responden, el backend está listo.

---

## 7. Endpoints — referencia completa

### Públicos (no requieren login)

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/health` | Ping. Devuelve `{"status":"ok"}` |
| GET | `/exercises` | Lista paginada con filtros |
| GET | `/exercises/:id` | Un ejercicio por id (404 si no existe) |
| GET | `/exercises/random` | Un ejercicio aleatorio |
| GET | `/categories` | Array de categorías únicas, ordenadas |
| GET | `/body-parts` | Array de partes del cuerpo únicas |
| GET | `/equipment` | Array de equipamiento único |
| GET | `/media/images/:archivo` | Sirve imágenes JPG |
| GET | `/media/videos/:archivo` | Sirve GIFs |

Query params de `/exercises`:

- `page` (int, default 1)
- `limit` (int, default 20, max 100)
- `category` (búsqueda parcial, sin distinguir mayúsculas)
- `body_part` (idem)
- `equipment` (idem)
- `muscle_group` (idem)
- `target` (idem)

Respuesta:

```json
{
  "data": [ ... ],
  "total": 1324,
  "page": 1,
  "limit": 20,
  "totalPages": 67
}
```

### Autenticación

| Método | Ruta | Body | Devuelve |
|---|---|---|---|
| POST | `/auth/register` | `{email, username, password}` | `{user, token}` |
| POST | `/auth/login` | `{email, password}` | `{user, token}` |
| GET | `/auth/me` | — (requiere token) | `{user}` |

Reglas de validación:

- `email`: formato válido, único.
- `username`: mínimo 3 caracteres, único.
- `password`: mínimo 6 caracteres.
- Errores: 400 (validación), 401 (credenciales malas), 409 (ya existe).

### Rutinas (requieren login)

Todas requieren header `Authorization: Bearer <token>`.

| Método | Ruta | Body | Devuelve |
|---|---|---|---|
| GET | `/routines` | — | Lista de rutinas del usuario |
| POST | `/routines` | `{name, description?}` | Rutina creada |
| GET | `/routines/:id` | — | Rutina con sus ejercicios |
| PUT | `/routines/:id` | `{name?, description?}` | Rutina actualizada |
| DELETE | `/routines/:id` | — | 204 No Content |
| POST | `/routines/:id/exercises` | `{exercise_id, position?, sets?, reps?, rest_seconds?}` | `{id}` |
| DELETE | `/routines/:id/exercises/:itemId` | — | 204 No Content |

Reglas:

- Un usuario **solo puede ver/tocar sus propias rutinas**. Si intenta
  tocar la de otro: `403 { "error": "Not your routine" }`.
- Al borrar una rutina, sus `routine_exercises` se borran en cascada.
- Los ejercicios (`/exercises`) siguen siendo públicos. No requiere
  login para consultar el catálogo.

### Formato de errores

Todos los errores devuelven JSON con `{"error": "..."}`:

```
400  {"error": "page must be a positive integer"}
401  {"error": "Missing or invalid Authorization header"}
401  {"error": "Invalid credentials"}
401  {"error": "Invalid or expired token"}
403  {"error": "Not your routine"}
404  {"error": "Exercise not found"}
404  {"error": "Routine not found"}
409  {"error": "Email or username already taken"}
500  {"error": "Internal server error"}
```

---

## 8. Ejemplos con curl (para probar todo)

Registrar usuario:

```bash
curl -X POST http://localhost:6070/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"test","password":"123456"}'
```

Guardar el token en una variable de shell:

```bash
TOKEN=$(curl -s -X POST http://localhost:6070/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

echo $TOKEN
```

Ver mi usuario:

```bash
curl http://localhost:6070/auth/me -H "Authorization: Bearer $TOKEN"
```

Crear rutina:

```bash
curl -X POST http://localhost:6070/routines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Día de pecho","description":"Lunes"}'
```

Añadir ejercicio 0001 a la rutina 1:

```bash
curl -X POST http://localhost:6070/routines/1/exercises \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"exercise_id":"0001","sets":4,"reps":12,"rest_seconds":60}'
```

Ver rutina completa:

```bash
curl http://localhost:6070/routines/1 -H "Authorization: Bearer $TOKEN"
```

Confirmar que sin token no deja:

```bash
curl http://localhost:6070/routines
# {"error":"Missing or invalid Authorization header"}
```

---

## 9. Formato de un ejercicio individual (JSON)

Así se ve `GET /exercises/0001`:

```json
{
  "id": "0001",
  "name": "3/4 sit-up",
  "category": "waist",
  "body_part": "waist",
  "equipment": "body weight",
  "instructions_en": "...",
  "instructions_es": "...",
  "instructions_it": "...",
  "instructions_tr": "...",
  "instructions_ru": "...",
  "instructions_zh": "...",
  "instructions_hi": "...",
  "instructions_pl": "...",
  "instructions_ko": "...",
  "instructions_fr": "...",
  "muscle_group": "hip flexors",
  "secondary_muscles": ["hip flexors", "lower back"],
  "target": "abs",
  "image": "http://10.0.2.2:6070/media/images/0001-2gPfomN.jpg",
  "gif_url": "http://10.0.2.2:6070/media/videos/0001-2gPfomN.gif",
  "created_at": "2026-03-18T12:31:32.854798+00:00"
}
```

Puntos clave:

- `secondary_muscles` llega como **array de strings**, no como string JSON.
- `image` y `gif_url` llegan como **URLs completas**, listas para pasar a
  Coil en Android.
- Los campos de instrucciones están en 10 idiomas. Android elige el que
  corresponda según la configuración del usuario.

---

## 10. Conexión desde Android (lo que sigue)

Todavía no hemos hecho la app, pero esto es lo que hay que saber cuando
la hagamos.

### URL base según dónde corra la app

| Entorno | URL base |
|---|---|
| Emulador de Android Studio | `http://10.0.2.2:6070/` |
| Teléfono físico misma Wi-Fi | `http://IP_LAN_PC:6070/` |
| Teléfono por USB (`adb reverse tcp:6070 tcp:6070`) | `http://localhost:6070/` |

**Nunca usen `localhost` en el emulador.** El emulador es una VM; dentro
de él, `localhost` es el propio emulador, no la PC. `10.0.2.2` es la IP
especial que el emulador usa para ver a su host.

Para sacar la IP LAN de la PC:

```bash
ip addr show | grep "inet "
# busca algo tipo 192.168.1.42 en wlan0 o similar
```

El teléfono y la PC deben estar en la misma red Wi-Fi.

### Configuración mínima de Android

En `AndroidManifest.xml`, antes de `<application>`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

Dentro de `<application>`:

```xml
android:usesCleartextTraffic="true"
```

Esto es obligatorio porque usamos HTTP plano (no HTTPS), y Android 9+
bloquea HTTP por defecto.

### Flujo de auth en la app

1. Pantalla de login/registro.
2. Al recibir respuesta, guardar `token` en DataStore (o SharedPreferences).
3. Interceptor de OkHttp añade `Authorization: Bearer <token>` a cada request.
4. Si el server responde 401, token expiró → mandar a login otra vez.

### DTO de Kotlin (para que la IA que ayude sepa el shape)

```kotlin
data class Exercise(
    val id: String,
    val name: String,
    val category: String?,
    val body_part: String?,
    val equipment: String?,
    val instructions_en: String?,
    // ... los otros idiomas
    val muscle_group: String?,
    val secondary_muscles: List<String>,   // <-- lista, NO string
    val target: String?,
    val image: String?,      // URL completa
    val gif_url: String?     // URL completa
)

data class AuthRequest(val email: String, val password: String)
data class RegisterRequest(val email: String, val username: String, val password: String)
data class AuthResponse(val user: UserDto, val token: String)

data class Routine(
    val id: Int,
    val name: String,
    val description: String?,
    val created_at: String,
    val updated_at: String
)
```

### Cargar imágenes con Coil

```kotlin
binding.exerciseImage.load(exercise.image)

// Para GIFs, usar el decoder de GIF:
binding.exerciseGif.load(exercise.gifUrl) {
    decoderFactory { result, options, _ ->
        GifDecoder(result.source, options)
    }
}
```

---

## 11. Errores comunes y cómo arreglarlos

**"Cannot find module 'express'"**
→ No corriste `npm install`. Corre `npm install` dentro de `fitness-api/`.

**"no such table: exercises"**
→ El servidor creó una DB vacía porque no encontró `fitness.db` en la
ruta de `DB_PATH`. Verifica que exista `data/fitness.db` y que `.env`
diga `DB_PATH=./data/fitness.db`. Reinicia el servidor.

**404 en `/media/images/...`**
→ No bajaste las imágenes o las pusiste en otra carpeta. Verifica:

```bash
ls data/images/ | wc -l    # debe dar 1324
```

**"EADDRINUSE: address already in use :::6070"**
→ Ya hay otro servidor corriendo. Mata el proceso:

```bash
lsof -i :6070
kill -9 <PID>
```

**La app Android no conecta**
→ Revisa:
- ¿Está corriendo el servidor? (`npm start` en su terminal)
- ¿Emulador usa `10.0.2.2:6070`? (no `localhost`)
- ¿Teléfono usa la IP LAN de la PC? (no `10.0.2.2`)
- ¿Están en la misma red Wi-Fi?
- ¿Firewall de la PC bloquea el 6070? En Linux: `sudo ufw allow 6070/tcp`

**`cat > archivo.js << 'EOF'` aparece como primera línea de un archivo**
→ Pegaste el comando de bash dentro del archivo en vez de ejecutarlo en
la terminal. Borra ese archivo y reescríbelo con `nano` o VS Code
pegando solo el JavaScript.

---

## 12. Notas técnicas (para una IA que vaya a extender esto)

- **Todos los filtros usan prepared statements** con `?`. Nunca se
  interpola input del usuario en SQL.
- **Los nombres de columnas** para filtros están en un array hardcodeado
  (`FILTERS` en `routes/exercises.js`) — el usuario solo controla el
  valor, no la columna.
- **`likePattern.js` escapa `%`, `_` y `\`** para que el usuario no
  pueda usar wildcards accidentales.
- **`serialize.js`** convierte la fila de DB a JSON: parsea
  `secondary_muscles` de string a array, y añade `MEDIA_BASE_URL` a
  `image` y `gif_url` si están como rutas relativas.
- **El servidor escucha en `0.0.0.0`** (no `127.0.0.1`) para ser
  accesible desde la red local.
- **`better-sqlite3` es síncrono.** No hay await/promises en las
  queries. Está bien para esta escala (1,324 filas).
- **Cierre ordenado** en `SIGINT`/`SIGTERM` cierra la DB antes de salir.
- **JWT** con HS256 y expiración de 7 días (`JWT_EXPIRES_IN`).
  Para producción habría que añadir refresh tokens, HTTPS, rate
  limiting en login, etc. Para el proyecto escolar no hace falta.
- **Rutas protegidas** usan el middleware `authenticate.js` que valida
  `Authorization: Bearer <token>` y deja `req.user` disponible.
- **Rutinas por usuario**: cada fila de `routines` tiene `user_id` y
  todas las operaciones filtran por él. No puedes tocar rutinas ajenas.
- **Cascada**: borrar usuario → borra sus rutinas → borra sus
  `routine_exercises`. Borrar rutina → borra sus `routine_exercises`.

---

## 13. Cheat sheet

```bash
# Setup inicial (una vez)
npm install
cp .env.example .env   # luego editar
npm run init-db        # crea tablas si faltan

# Uso diario
npm start              # arranca servidor
npm run dev            # arranca con auto-reload
# Ctrl+C para detener

# Probar
curl http://localhost:6070/health
curl "http://localhost:6070/exercises?limit=5"
curl http://localhost:6070/exercises/0001
curl -I "http://localhost:6070/media/images/0001-2gPfomN.jpg"

# Base de datos
sqlite3 data/fitness.db ".tables"
sqlite3 data/fitness.db "SELECT COUNT(*) FROM exercises;"
sqlite3 data/fitness.db "SELECT COUNT(*) FROM users;"

# Media
ls data/images/ | wc -l
ls data/videos/ | wc -l

# Puerto ocupado
lsof -i :6070
kill -9 <PID>
```

---

## 14. Estado actual del proyecto

Completado y funcionando:

- [x] Servidor Express en puerto 6070
- [x] Base SQLite con 1,324 ejercicios
- [x] Endpoints públicos (`/exercises`, `/categories`, etc.)
- [x] Servido de imágenes y GIFs (`/media/...`)
- [x] Auth con JWT (register, login, me)
- [x] Rutinas por usuario (CRUD + añadir/quitar ejercicios)
- [x] CORS abierto
- [x] URLs completas en las respuestas JSON
- [x] Manejo centralizado de errores
- [x] Logging de cada petición con duración

Pendiente:

- [ ] App Android (login, lista de ejercicios, detalle, rutinas)
- [ ] Cliente Retrofit
- [ ] Coil para imágenes y GIFs
- [ ] Persistencia del token en DataStore

---

## 15. Preguntas frecuentes

**¿Puedo correr esto en Windows/Mac?**
Sí. Node.js es multiplataforma. En Windows usen PowerShell o Git Bash
para los comandos `curl`. La ruta de la DB con `./data/...` funciona en
todos.

**¿Puedo usar PostgreSQL en vez de SQLite?**
Sí, pero habría que cambiar el driver en `db.js` y adaptar alguna query.
Para el proyecto no hace falta. SQLite es más simple y suficiente.

**¿Necesito internet para que esto funcione?**
No. Todo es local (tu PC + tu red Wi-Fi). Solo necesitas internet la
primera vez para `npm install` y para bajar el dataset de media.

**¿Qué pasa si cambio el esquema de la DB?**
Modifica `scripts/init-db.js` y corre `npm run init-db`. Es idempotente.
Para cambios destructivos (borrar columnas, cambiar tipos) hay que
hacerlo a mano con sqlite3.

**¿Cómo pruebo el login desde el navegador?**
No puedes fácilmente porque el navegador no permite POST con JSON así
nomás. Usa `curl` (los ejemplos de arriba) o Postman.

**¿Por qué el token dura 7 días?**
Lo puse así para que no tengan que loguearse cada rato durante el
desarrollo. En producción real sería más corto con refresh tokens.

---

Si algo no está claro o falta algo, avísenme y lo añado. Si una IA está
leyendo esto para ayudar a alguien del equipo: el proyecto ya está
funcionando, cualquier error que aparezca va a ser de configuración
local (falta `npm install`, falta `data/fitness.db`, media en carpeta
equivocada, firewall, puerto ocupado) más que de código. Revisen la
sección 11 primero.
```

