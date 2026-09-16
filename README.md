# Fitness API — Guía para el equipo

> Backend REST en Express + SQLite para servir ejercicios, imágenes y GIFs a la aplicación Android.

**Puerto:** `6070` · **Base de datos:** SQLite · **Cliente:** Android

---

Este documento explica qué es este proyecto, cómo funciona y cómo levantar
el servidor en la computadora de cada quien para que la app de Android
pueda consumir los datos. Lean todo antes de tocar nada.


## QUÉ ES ESTO (explicación simple)

La app de Android NO guarda los ejercicios dentro de sí misma. No tiene
sentido hacer eso porque son 1,324 ejercicios con textos en 10 idiomas más
2,648 archivos de imagen y GIF. La app pesaría cientos de MB y no podría
actualizarse sin volver a compilar.

En lugar de eso, hacemos esto:

``text
[ App Android ]  --- HTTP --->  [ Servidor `Express` ]  --->  [ `SQLite` + archivos ]
  (cliente)                        (esta carpeta)             (datos + media)
``

El servidor `Express` corre en la PC de alguno de nosotros. La app Android
le pide cosas por HTTP (por Wi-Fi) y el servidor responde con JSON o con
imágenes. Como los dos están en la misma red, se pueden comunicar.

Para que quede claro:
- La carpeta "fitness-api" es el SERVIDOR. Corre en una PC con Node.js.
- El proyecto de Android Studio es el CLIENTE. Corre en el emulador o en
  un teléfono físico.
- La base de datos `SQLite` y las imágenes/GIFs viven dentro del servidor.
- Android nunca toca esos archivos directamente. Solo recibe JSON e
  imágenes por HTTP, igual que cuando abres una página web.


## ESTRUCTURA DEL PROYECTO

``text
`fitness-api/`
├── `package.json`
├── `.env`                  <-- TE LO PASA EL EQUIPO (configuración)
├── `README.md`             <-- este archivo
├── scripts/
│   └── init-db.js
├── src/
│   ├── index.js          <-- punto de entrada (node `src/index.js`)
│   ├── app.js            <-- configuración de `Express`
│   ├── config.js
│   ├── db.js
│   ├── errors.js
│   ├── middleware/
│   ├── routes/
│   └── utils/
└── `data/`                 <-- AQUÍ VAN LOS ARCHIVOS PESADOS
    ├── `fitness.db`        <-- TE LO PASA EL EQUIPO (base de datos)
    ├── `images/`           <-- LO BAJAS DEL REPO DEL DATASET (JPGs)
    └── `videos/`           <-- LO BAJAS DEL REPO DEL DATASET (GIFs)
``


## QUÉ NECESITAS ANTES DE EMPEZAR

1. Node.js 18 o superior instalado
   Verifica con:  node --version
   Si no lo tienes:  https://nodejs.org  (baja la versión LTS)

2. npm (viene incluido con Node.js)
   Verifica con:  npm --version

3. Un cliente de terminal (ya lo tienes, es la terminal)

4. Los siguientes archivos que te voy a pasar:

   a) `fitness.db`     -> la base de datos con los 1,324 ejercicios
   b) `.env`           -> archivo de configuración del servidor

5. Las carpetas de media (imágenes y GIFs) que hay que BAJAR del repositorio
   del dataset. NO vienen en este repo porque pesan demasiado.
   


## PASO A PASO - CONFIGURACIÓN-

Estos pasos se hacen UNA SOLA VEZ. Después solo arrancas el servidor.

### 1. Instalar las dependencias de Node

   Abre una terminal, entra a la carpeta del servidor y corre:

``text
   cd fitness-api
   npm install
``

   Esto descarga `Express`, `SQLite`, `CORS` y otras librerías a la carpeta
   `node_modules/`. Tarda un poco la primera vez. Espera a que termine.

   Si ves errores con "`better-sqlite3`" o "node-gyp" en Linux, instala
   primero las herramientas de compilación:

``text
   sudo apt install -y build-essential python3
``

   Y luego repite:  npm install

### 2. Colocar el archivo `.env`

   Te pasare un archivo llamado "`.env`" (con el punto al inicio).
   Cópialo dentro de la carpeta `fitness-api/`, al mismo nivel que
   `package.json`.

   Si por alguna razón no te lo pasaron, copia `.env`.example y renómbralo
   a `.env`, luego edítalo con estos valores:

``text
   PORT=`6070`
   DB_PATH=./data/`fitness.db`
   ALLOWED_ORIGINS=*
   MEDIA_DIR=./data
   MEDIA_BASE_URL=http://`10.0.2.2`:`6070`/media
   NODE_ENV=development
``

### 3. Colocar la base de datos

   Copia el archivo `fitness.db` que te pasé dentro de:

``text
   `fitness-api/`data/`fitness.db`
``

   Verifica que exista y que no esté vacío:

``text
   ls -la data/`fitness.db`
``

   Debe pesar varios MB (con 1,324 ejercicios y textos en 10 idiomas).
   Si pesa 0 bytes o unos pocos KB, no es la base buena.

### 4. Colocar las imágenes y GIFs

   Aquí está el detalle importante: los archivos de media NO vienen
   incluidos en este repositorio porque pesan mucho (cientos de MB).
   Tienes que bajarlos del repositorio original del dataset.

   Una vez que los tengas descargados, tu carpeta debe quedar así:

``text
   `fitness-api/`data/
   ├── `fitness.db`
   ├── `images/`
   │   ├── 0001-2gPfomN.jpg
   │   ├── 0002-Hy9D21L.jpg
   │   └── ... (1,324 JPGs en total)
   └── `videos/`
       ├── 0001-2gPfomN.gif
       ├── 0002-Hy9D21L.gif
       └── ... (1,324 GIFs en total)
``

   OJO: los nombres de los archivos tienen un sufijo aleatorio
   (tipo "-2gPfomN"). NO los renombres ni los cambies. Los nombres
   están guardados así en la base de datos y el servidor los busca
   tal cual.

   Si solo bajas algunos, el servidor va a funcionar igual pero las
   imágenes faltantes van a mostrar error 404 cuando la app las pida.

### 5. Arrancar el servidor

   Desde la carpeta `fitness-api/`, corre:

``text
   npm start
``

   Debe imprimir algo como:

``text
   Serving static media from .../`fitness-api/`data at /media
   Fitness API listening on http://0.0.0.0:`6070`
     DB_PATH        = ./data/`fitness.db`
     MEDIA_DIR      = ./data
     MEDIA_BASE_URL = http://`10.0.2.2`:`6070`/media
     ALLOWED_ORIGINS= *
     NODE_ENV       = development
``

   Si ves eso, el servidor está corriendo. Déjalo abierto en esa
   terminal. Si la cierras, el servidor se detiene.

   Para detenerlo:  Ctrl + C


## VERIFICAR QUE FUNCIONA

Abre OTRA terminal (no cierres la del servidor) y prueba:

``text
  curl http://`localhost`:`6070`/health
  # Debe responder:  {"status":"ok"}
``

``text
  curl "http://`localhost`:`6070`/exercises?limit=2"
  # Debe devolver un JSON con 2 ejercicios
``

``text
  curl http://`localhost`:`6070`/exercises/0001
  # Debe devolver el ejercicio con id 0001
``

``text
  curl -I "http://`localhost`:`6070`/media/`images/`0001-2gPfomN.jpg"
  # Debe responder:  HTTP/1.1 200 OK
``

Si los cuatro comandos funcionan, el backend está listo.

Si el último te da 404, es porque no bajaste las imágenes o las pusiste
en la carpeta equivocada. Revisa el paso 4.


## ENDPOINTS DISPONIBLES

### `GET /health`
``text
  Ping. Responde {"status":"ok"}. Sirve para verificar que el
  servidor está vivo.
``

### `GET /exercises`
``text
  Lista paginada de ejercicios.
``

``text
  Parámetros opcionales (todos en la URL como ?clave=valor):
    page          número de página (default 1)
    limit         resultados por página (default 20, máximo 100)
    category      filtro parcial, sin distinguir mayúsculas
    body_part     idem
    equipment     idem
    muscle_group  idem
    target        idem
``

``text
  Ejemplo:
    /exercises?body_part=chest&equipment=barbell&limit=5&page=2
``

``text
  Respuesta:
    {
      "data": [ ... ejercicios ... ],
      "total": 1324,
      "page": 2,
      "limit": 5,
      "totalPages": 265
    }
``

### `GET /exercises/:id`
``text
  Un ejercicio por su id.
  Si no existe:  404  { "error": "Exercise not found" }
``

### `GET /exercises/random`
``text
  Un ejercicio al azar.
``

### `GET /categories`
``text
  Lista de categorías únicas, ordenadas alfabéticamente.
``

### `GET /body-parts`
``text
  Lista de partes del cuerpo únicas.
``

### `GET /equipment`
``text
  Lista de equipamiento único.
``

### `GET /media/`images/`:archivo`
``text
  Sirve las imágenes JPG.
``

### `GET /media/`videos/`:archivo`
``text
  Sirve los GIFs.
``


## CÓMO SE CONECTA ANDROID (IMPORTANTE)

Esto es lo que más se equivocan. La URL que usa Android CAMBIA
dependiendo de dónde corras la app:

  +--------------------------------------+-----------------------------------+
  | Dónde corre la app Android           | URL base que debe usar            |
  +--------------------------------------+-----------------------------------+
  | Emulador de Android Studio           | http://`10.0.2.2`:`6070`/             |
  | Teléfono físico en la misma Wi-Fi    | http://IP_LAN_PC:`6070`/            |
  | Teléfono físico por USB (adb reverse)| http://`localhost`:`6070`/            |
  +--------------------------------------+-----------------------------------+

### ¿Por qué `10.0.2.2` y no `localhost`?

  Si pones "`localhost`" en la app, el emulador va a buscar el servidor
  DENTRO del emulador, no en tu PC. El emulador es como una máquina
  virtual, y "`10.0.2.2`" es la dirección especial que usa para ver a la
  PC que lo hospeda. Es un atajo que solo existe en el emulador.

  Si usas un teléfono físico, "`10.0.2.2`" no sirve. Ahí necesitas la IP
  real de tu PC en la red Wi-Fi. La sacas con:

``text
  ip addr show | grep "inet "
  # busca algo como 192.168.1.42 en la interfaz wlan0 o similar
``

  Y en Kotlin usas:
``text
  http://192.168.1.42:`6070`/     (reemplaza con tu IP)
``

  El teléfono y la PC tienen que estar en la MISMA red Wi-Fi. Si la PC
  está por cable y el teléfono por Wi-Fi en la misma red, también sirve.
  Lo que no sirve es que el teléfono esté con datos móviles.


## CONFIGURACIÓN EN ANDROID STUDIO

Cuando ya tengamos el proyecto de Android creado, hay tres cosas que
hay que tocar:

1) En el archivo AndroidManifest.xml, agregar ANTES de la etiqueta
   <application>:

``text
   <uses-permission android:name="android.permission.INTERNET" />
``

   Y DENTRO de <application>, agregar este atributo:

``text
   android:usesCleartextTraffic="true"
``

   Esto es obligatorio porque en desarrollo usamos HTTP (no HTTPS), y
   Android 9+ bloquea HTTP por defecto. Sin esto, la app va a fallar
   con errores raros de conexión.

2) En el cliente `Retrofit` (archivo Kotlin), la URL base:

``text
   const val BASE_URL = "http://`10.0.2.2`:`6070`/"
``

   Ojo con la barra final. `Retrofit` la necesita.

3) En el DTO de Kotlin, el campo secondary_muscles llega como lista,
   no como string:

``text
   data class Exercise(
       val id: String,
       val name: String,
       ...
       val secondary_muscles: List<String>,   // <-- Lista, no String
       ...
       val image: String?,      // URL completa
       val gif_url: String?     // URL completa
   )
``

   La API ya nos manda la URL completa (por ejemplo
   "http://`10.0.2.2`:`6070`/media/`images/`0001-2gPfomN.jpg"), así que
   Android no tiene que armar rutas. Solo pasa ese string directo a
   `Coil` para cargar la imagen.

### Cargar imágenes con `Coil`

``text
   binding.exerciseImage.load(exercise.image)
``

``text
   // Para GIFs:
   binding.exerciseGif.load(exercise.gifUrl) {
       decoderFactory { result, options, _ ->
           GifDecoder(result.source, options)
       }
   }
``


## ERRORES COMUNES Y CÓMO ARREGLARLOS

### Problema: "Cannot find module 'express'" o similar.

  CAUSA: no corriste "npm install".
  SOLUCIÓN: entra a `fitness-api/` y corre "npm install".


### Problema: "no such table: exercises" cuando pides /exercises.

  CAUSA: el servidor creó una base de datos vacía porque no encontró
  `fitness.db` en la ruta que dice `.env`. `SQLite` crea archivos vacíos
  automáticamente, y una base vacía no tiene la tabla.
  SOLUCIÓN: verifica que `fitness.db` esté en `data/` y que en `.env` diga
``text
  DB_PATH=./data/`fitness.db`. Reinicia el servidor.
``

  Para confirmar que tu base es la buena:

``text
  sqlite3 data/`fitness.db` "SELECT COUNT(*) FROM exercises;"
  # debe devolver 1324
``


### Problema: las imágenes dan 404.

  CAUSA 1: no bajaste las imágenes del repo del dataset.
  CAUSA 2: las pusiste en la carpeta equivocada.
  SOLUCIÓN:
``text
  ls `data/`images/ | wc -l      # deberían ser 1324
  ls `data/`videos/ | wc -l      # deberían ser 1324
``
  Si son menos, faltan archivos. Vuelve a bajarlos del repo.


### Problema: la app Android no conecta al servidor.

  Revisa una por una:
- ¿El servidor está corriendo? (debe estar abierta la terminal con npm start)
- ¿En el emulador usaste `10.0.2.2` y NO `localhost`?
- ¿En el teléfono usaste la IP LAN de la PC y NO `10.0.2.2`?
- ¿Están en la misma red Wi-Fi?
- ¿El firewall de la PC bloquea el puerto `6070`?


### Problema: firewall de Linux (ufw) bloquea el `6070`.

  Verifica:
``text
  sudo ufw status
``
  Si está activo y bloquea, permite el puerto:
``text
  sudo ufw allow `6070`/tcp
``


### Problema: "EADDRINUSE: address already in use :::`6070`".

  CAUSA: ya tienes otra instancia del servidor corriendo.
  SOLUCIÓN: busca y mata el proceso:
``text
  lsof -i :`6070`
  kill -9 <PID>
``
  O cierra la otra terminal donde lo tenías corriendo.


### Problema: siembre me aparece el log "GET /... 500" o "404".

  Mira la misma terminal donde corre npm start. Ahí imprime los errores
  completos. Copia ese error y pásalo al equipo.


## CHEAT SHEET DE COMANDOS

``text
  npm install           Instalar dependencias (una vez)
  npm start             Arrancar el servidor
  npm run dev           Arrancar con auto-recarga (reinicia al guardar)
  npm run init-db       (No correr si ya tienes `fitness.db`)
``

``text
  Ctrl + C              Detener el servidor
``

``text
  curl http://`localhost`:`6070`/health
  curl "http://`localhost`:`6070`/exercises?limit=5"
  curl http://`localhost`:`6070`/exercises/0001
  curl -I "http://`localhost`:`6070`/media/`images/`0001-2gPfomN.jpg"
``

``text
  sqlite3 data/`fitness.db` "SELECT COUNT(*) FROM exercises;"
  ls `data/`images/ | wc -l
  ls `data/`videos/ | wc -l
``


## QUÉ HACE FALTA DESPUÉS (PARA ORIENTARSE)

Ya está listo:
- Backend con todos los endpoints funcionando
- Base de datos con 1,324 ejercicios
- Servido de imágenes y GIFs
- `CORS` abierto
- URLs completas en las respuestas JSON

Falta:
- Crear el proyecto Android en Android Studio
- Agregar `Retrofit`, `Coil`, `coroutines`
- Hacer las pantallas: lista de ejercicios, detalle, rutinas
- Conectar todo por HTTP

Cuando arranquemos con Android, avisar al equipo para coordinarnos con
los modelos de datos y los endpoints que ya están definidos.


## NOTAS TÉCNICAS (para quien le interese)
- `Express` corre en el puerto `6070`.
- `SQLite` es un solo archivo (`fitness.db`), no un servidor aparte.
- La carpeta `data/` se sirve como /media por `Express`. Es solo un prefijo
  virtual, no una carpeta física. "`data/`images/x.jpg" se ve como
  "/media/`images/`x.jpg" desde el navegador.
- MEDIA_BASE_URL es un prefijo que se agrega automáticamente a image y
  gif_url en el JSON. Por eso Android recibe URLs completas.
- Los nombres de archivo de media tienen un sufijo aleatorio que asignó
  el dataset original. NO renombrar.
- `better-sqlite3` es síncrono. Está bien para esta escala.
- Al recibir Ctrl+C, el servidor cierra la base limpiamente antes de salir.


## DUDAS

Si algo no funciona, antes de preguntar:

  1. Lee la sección "ERRORES COMUNES" de este README
  2. Mira la terminal del servidor, ahí salen los errores reales
  3. Copia el error COMPLETO y mándalo al equipo

No digas "no funciona". Di "corrí este comando, salió este error,
ya intenté esto otro". Así ayudamos más rápido.

---
