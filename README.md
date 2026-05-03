# Mi Album Mundial 2026

PWA hecha con React + Vite + TypeScript + Tailwind y Firebase para llevar el registro de las estampas del album del Mundial 2026 e intercambiar con amigos.

## Caracteristicas

- Registro tap-to-pegar (toca para sumar, manten presionado para restar) con badge de repetidas.
- Catalogo precargado: 48 equipos y ~990 estampas (escudos, planteles, jugadores, especiales FWC).
- Sistema de amigos con solicitudes mutuas y busqueda por @username.
- Matcher de intercambios: cruza tus repetidas con las que les faltan a tus amigos y prioriza los matches dobles.
- Estetica mundialista: paleta verde campo / dorado trofeo / rojo / celeste 2026 con tipografia display.
- PWA instalable en movil con cache offline (catalogo, equipos, fuentes).
- Mobile-first, accesible y con animaciones suaves.

## Stack

- Frontend: React 19 + Vite 8 + TypeScript + Tailwind CSS 3 + React Router 7 + Framer Motion + lucide-react.
- Backend: Firebase Auth (Google + Email) + Cloud Firestore + Firebase Hosting.
- PWA: `vite-plugin-pwa` con Workbox.

## Estructura

```
src/
  components/
    layout/    AppShell, Header, BottomNav, BannerInstalar
    estampas/  StickerCard
    equipos/   EquipoCard
    ui/        Button, Card, Modal, Avatar, Badge, ProgresoBar, Input, Spinner, EstadoVacio
  context/     AuthContext
  data/        equipos.ts, catalogoSeed.ts
  hooks/       useCatalogo, useColeccion, useAmigos
  lib/         firebase.ts, types.ts, utils.ts
  pages/       Login, CrearUsername, MiAlbum, Equipo, Amigos, PerfilAmigo, Intercambios, Perfil
  routes.tsx, App.tsx, main.tsx, index.css
scripts/
  seed.ts      sube equipos y catalogo a Firestore
public/
  icons/       icon-192.png, icon-512.png, icon-maskable-512.png
firebase.json, .firebaserc, firestore.rules, firestore.indexes.json
```

## Configuracion inicial

### 1. Dependencias

```bash
npm install --legacy-peer-deps
```

### 2. Crear proyecto Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com) y crea un proyecto nuevo.
2. Habilita **Authentication** > metodos: Google y Email/Password.
3. Habilita **Cloud Firestore** en modo produccion (region cercana).
4. Habilita **Hosting**.

### 3. Variables de entorno

Copia `.env.example` a `.env.local` y llena con los valores que aparecen en
**Configuracion del proyecto > Tus apps > Web**:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...:web:...
```

Tambien actualiza `.firebaserc` con tu projectId real:

```json
{ "projects": { "default": "tu-proyecto" } }
```

### 4. Reglas e indices

Despliega las reglas y los indices:

```bash
npx firebase login
npx firebase deploy --only firestore:rules
npx firebase deploy --only firestore:indexes
```

### 5. Sembrar el catalogo

Descarga la cuenta de servicio en **Configuracion del proyecto > Cuentas de servicio > Generar nueva clave privada** y guardala como `service-account.json` en la raiz del proyecto (esta en `.gitignore`).

```bash
npm run seed
```

Esto subira los 48 equipos y las ~990 estampas a Firestore.

## Desarrollo

```bash
npm run dev
```

La app corre en `http://localhost:5173`.

## Build y despliegue

```bash
npm run build        # genera dist/ con SW y manifest
npm run deploy       # build + firebase deploy
```

## Modelo de datos (Firestore)

| Coleccion | Doc id | Campos |
|-----------|--------|--------|
| `equipos` | codigo (`MEX`) | nombre, grupo, confederacion, colorPrimario, colorSecundario, bandera, estado |
| `catalogo` | id (`MEX5`) | equipoId, tipo, numero, nombre, posicion, foil, orden |
| `usuarios` | uid | uid, username, displayName, photoURL, email, createdAt |
| `usernames` | username | { uid } (para garantizar unicidad) |
| `usuarios/{uid}/coleccion` | stickerId | cantidad, updatedAt |
| `solicitudesAmistad` | `${de}_${para}` | de, para, deUsername, paraUsername, estado, createdAt |
| `amistades` | `${uidA}_${uidB}` ordenados | usuarios: [uidA, uidB], createdAt |

## Reglas de seguridad

- `equipos` y `catalogo`: lectura publica, escritura unicamente desde la cuenta de servicio (seed).
- `usuarios`: perfil publico (lectura), escritura solo el dueno.
- `usuarios/{uid}/coleccion`: lectura solo si eres el dueno o son amigos.
- `solicitudesAmistad`: solo `de` y `para` pueden ver/modificar.
- `amistades`: solo participantes.

## Notas sobre el catalogo

El album oficial Panini Mundial 2026 se publicara cerca del torneo. El seed actual usa la estructura conocida (48 equipos, escudo + plantel + 18 jugadores con posicion, mas 30 estampas especiales FWC). Cuando salga el listado oficial, edita `src/data/equipos.ts` y `src/data/catalogoSeed.ts` (o las definiciones especiales) y vuelve a correr `npm run seed`.

## Roadmap sugerido

- Subida de fotos reales de jugadores (Storage + admin panel).
- Stats por confederacion / por dia.
- Notificaciones push cuando llega una solicitud o un nuevo match.
- Historial de intercambios realizados y reputacion de coleccionistas.

---

App de fans, no afiliada a FIFA ni a Panini.
