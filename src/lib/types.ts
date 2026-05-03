export type Confederacion = 'CONMEBOL' | 'UEFA' | 'CONCACAF' | 'AFC' | 'CAF' | 'OFC'

export type TipoEstampa = 'escudo' | 'jugador' | 'plantel' | 'especial'

export interface Equipo {
  codigo: string
  nombre: string
  grupo: string
  confederacion: Confederacion
  colorPrimario: string
  colorSecundario: string
  bandera: string
  estado: 'clasificado' | 'pendiente'
}

export interface Estampa {
  id: string
  equipoId: string
  tipo: TipoEstampa
  numero: number
  nombre: string
  posicion?: string
  foil?: boolean
  orden: number
  // Ruta absoluta (recomendada: /img/estampas/<id>.webp) o URL externa
  // de la foto real de la estampa. Si no esta definida o falla la carga,
  // se usa el placeholder visual (bandera o estrella).
  imagen?: string
}

export interface PerfilUsuario {
  uid: string
  username: string
  displayName: string
  photoURL?: string
  email?: string
  createdAt: number
}

export interface ItemColeccion {
  cantidad: number
  updatedAt: number
}

export interface Coleccion {
  [estampaId: string]: ItemColeccion
}

export type EstadoSolicitud = 'pendiente' | 'aceptada' | 'rechazada'

export interface SolicitudAmistad {
  id: string
  de: string
  para: string
  deUsername: string
  paraUsername: string
  estado: EstadoSolicitud
  createdAt: number
}

export interface Amistad {
  id: string
  usuarios: [string, string]
  createdAt: number
}

export interface ResumenColeccion {
  total: number
  pegadas: number
  faltantes: number
  repetidas: number
  porcentaje: number
}

export interface MatchIntercambio {
  amigoUid: string
  amigoUsername: string
  amigoDisplayName: string
  amigoPhotoURL?: string
  tuOfreces: Estampa[]
  elOfrece: Estampa[]
  esDoble: boolean
  puntaje: number
}
