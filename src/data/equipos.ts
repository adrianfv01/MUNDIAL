import type { Equipo } from '@/lib/types'

// Selecciones del Mundial 2026 (USA / Canada / Mexico).
// Las que aun no estan oficialmente clasificadas se marcan como pendientes.
// Los grupos se asignan provisionalmente (A-L) y podras editarlos cuando FIFA confirme el sorteo.
export const equipos: Equipo[] = [
  // Anfitriones
  { codigo: 'CAN', nombre: 'Canada', grupo: 'A', confederacion: 'CONCACAF', colorPrimario: '#FF0000', colorSecundario: '#FFFFFF', bandera: 'CA', estado: 'clasificado' },
  { codigo: 'MEX', nombre: 'Mexico', grupo: 'A', confederacion: 'CONCACAF', colorPrimario: '#006847', colorSecundario: '#CE1126', bandera: 'MX', estado: 'clasificado' },
  { codigo: 'USA', nombre: 'Estados Unidos', grupo: 'A', confederacion: 'CONCACAF', colorPrimario: '#0A3161', colorSecundario: '#B31942', bandera: 'US', estado: 'clasificado' },

  // CONCACAF
  { codigo: 'CRC', nombre: 'Costa Rica', grupo: 'B', confederacion: 'CONCACAF', colorPrimario: '#002B7F', colorSecundario: '#CE1126', bandera: 'CR', estado: 'pendiente' },
  { codigo: 'PAN', nombre: 'Panama', grupo: 'B', confederacion: 'CONCACAF', colorPrimario: '#DA121A', colorSecundario: '#005AA7', bandera: 'PA', estado: 'pendiente' },
  { codigo: 'JAM', nombre: 'Jamaica', grupo: 'B', confederacion: 'CONCACAF', colorPrimario: '#009B3A', colorSecundario: '#FED100', bandera: 'JM', estado: 'pendiente' },

  // CONMEBOL
  { codigo: 'ARG', nombre: 'Argentina', grupo: 'C', confederacion: 'CONMEBOL', colorPrimario: '#75AADB', colorSecundario: '#FFFFFF', bandera: 'AR', estado: 'clasificado' },
  { codigo: 'BRA', nombre: 'Brasil', grupo: 'C', confederacion: 'CONMEBOL', colorPrimario: '#FFDF00', colorSecundario: '#009C3B', bandera: 'BR', estado: 'clasificado' },
  { codigo: 'URU', nombre: 'Uruguay', grupo: 'C', confederacion: 'CONMEBOL', colorPrimario: '#0038A8', colorSecundario: '#FFFFFF', bandera: 'UY', estado: 'clasificado' },
  { codigo: 'COL', nombre: 'Colombia', grupo: 'D', confederacion: 'CONMEBOL', colorPrimario: '#FCD116', colorSecundario: '#003893', bandera: 'CO', estado: 'clasificado' },
  { codigo: 'ECU', nombre: 'Ecuador', grupo: 'D', confederacion: 'CONMEBOL', colorPrimario: '#FFD100', colorSecundario: '#034EA2', bandera: 'EC', estado: 'clasificado' },
  { codigo: 'PAR', nombre: 'Paraguay', grupo: 'D', confederacion: 'CONMEBOL', colorPrimario: '#D52B1E', colorSecundario: '#0038A8', bandera: 'PY', estado: 'clasificado' },
  { codigo: 'CHI', nombre: 'Chile', grupo: 'E', confederacion: 'CONMEBOL', colorPrimario: '#D52B1E', colorSecundario: '#0039A6', bandera: 'CL', estado: 'pendiente' },
  { codigo: 'PER', nombre: 'Peru', grupo: 'E', confederacion: 'CONMEBOL', colorPrimario: '#D91023', colorSecundario: '#FFFFFF', bandera: 'PE', estado: 'pendiente' },
  { codigo: 'BOL', nombre: 'Bolivia', grupo: 'E', confederacion: 'CONMEBOL', colorPrimario: '#007A33', colorSecundario: '#FFD100', bandera: 'BO', estado: 'pendiente' },

  // UEFA
  { codigo: 'ESP', nombre: 'Espana', grupo: 'F', confederacion: 'UEFA', colorPrimario: '#AA151B', colorSecundario: '#F1BF00', bandera: 'ES', estado: 'clasificado' },
  { codigo: 'FRA', nombre: 'Francia', grupo: 'F', confederacion: 'UEFA', colorPrimario: '#0055A4', colorSecundario: '#EF4135', bandera: 'FR', estado: 'clasificado' },
  { codigo: 'POR', nombre: 'Portugal', grupo: 'F', confederacion: 'UEFA', colorPrimario: '#006600', colorSecundario: '#FF0000', bandera: 'PT', estado: 'clasificado' },
  { codigo: 'ENG', nombre: 'Inglaterra', grupo: 'G', confederacion: 'UEFA', colorPrimario: '#FFFFFF', colorSecundario: '#CE1124', bandera: 'GB', estado: 'clasificado' },
  { codigo: 'GER', nombre: 'Alemania', grupo: 'G', confederacion: 'UEFA', colorPrimario: '#000000', colorSecundario: '#DD0000', bandera: 'DE', estado: 'clasificado' },
  { codigo: 'NED', nombre: 'Paises Bajos', grupo: 'G', confederacion: 'UEFA', colorPrimario: '#FF6900', colorSecundario: '#21468B', bandera: 'NL', estado: 'clasificado' },
  { codigo: 'ITA', nombre: 'Italia', grupo: 'H', confederacion: 'UEFA', colorPrimario: '#0066CC', colorSecundario: '#FFFFFF', bandera: 'IT', estado: 'pendiente' },
  { codigo: 'BEL', nombre: 'Belgica', grupo: 'H', confederacion: 'UEFA', colorPrimario: '#ED2939', colorSecundario: '#FAE042', bandera: 'BE', estado: 'clasificado' },
  { codigo: 'CRO', nombre: 'Croacia', grupo: 'H', confederacion: 'UEFA', colorPrimario: '#FF0000', colorSecundario: '#FFFFFF', bandera: 'HR', estado: 'clasificado' },
  { codigo: 'SUI', nombre: 'Suiza', grupo: 'I', confederacion: 'UEFA', colorPrimario: '#D52B1E', colorSecundario: '#FFFFFF', bandera: 'CH', estado: 'clasificado' },
  { codigo: 'AUT', nombre: 'Austria', grupo: 'I', confederacion: 'UEFA', colorPrimario: '#ED2939', colorSecundario: '#FFFFFF', bandera: 'AT', estado: 'clasificado' },
  { codigo: 'POL', nombre: 'Polonia', grupo: 'I', confederacion: 'UEFA', colorPrimario: '#DC143C', colorSecundario: '#FFFFFF', bandera: 'PL', estado: 'pendiente' },
  { codigo: 'DEN', nombre: 'Dinamarca', grupo: 'J', confederacion: 'UEFA', colorPrimario: '#C8102E', colorSecundario: '#FFFFFF', bandera: 'DK', estado: 'pendiente' },
  { codigo: 'NOR', nombre: 'Noruega', grupo: 'J', confederacion: 'UEFA', colorPrimario: '#BA0C2F', colorSecundario: '#00205B', bandera: 'NO', estado: 'pendiente' },
  { codigo: 'SCO', nombre: 'Escocia', grupo: 'J', confederacion: 'UEFA', colorPrimario: '#0065BD', colorSecundario: '#FFFFFF', bandera: 'GB-SCT', estado: 'clasificado' },
  { codigo: 'TUR', nombre: 'Turquia', grupo: 'K', confederacion: 'UEFA', colorPrimario: '#E30A17', colorSecundario: '#FFFFFF', bandera: 'TR', estado: 'pendiente' },
  { codigo: 'CZE', nombre: 'Republica Checa', grupo: 'K', confederacion: 'UEFA', colorPrimario: '#11457E', colorSecundario: '#D7141A', bandera: 'CZ', estado: 'pendiente' },
  { codigo: 'SRB', nombre: 'Serbia', grupo: 'K', confederacion: 'UEFA', colorPrimario: '#C6363C', colorSecundario: '#0C4076', bandera: 'RS', estado: 'pendiente' },

  // CAF
  { codigo: 'MAR', nombre: 'Marruecos', grupo: 'L', confederacion: 'CAF', colorPrimario: '#C1272D', colorSecundario: '#006233', bandera: 'MA', estado: 'clasificado' },
  { codigo: 'TUN', nombre: 'Tunez', grupo: 'L', confederacion: 'CAF', colorPrimario: '#E70013', colorSecundario: '#FFFFFF', bandera: 'TN', estado: 'clasificado' },
  { codigo: 'EGY', nombre: 'Egipto', grupo: 'L', confederacion: 'CAF', colorPrimario: '#CE1126', colorSecundario: '#000000', bandera: 'EG', estado: 'clasificado' },
  { codigo: 'GHA', nombre: 'Ghana', grupo: 'A', confederacion: 'CAF', colorPrimario: '#CE1126', colorSecundario: '#FCD116', bandera: 'GH', estado: 'pendiente' },
  { codigo: 'SEN', nombre: 'Senegal', grupo: 'B', confederacion: 'CAF', colorPrimario: '#00853F', colorSecundario: '#FDEF42', bandera: 'SN', estado: 'pendiente' },
  { codigo: 'CIV', nombre: 'Costa de Marfil', grupo: 'C', confederacion: 'CAF', colorPrimario: '#F77F00', colorSecundario: '#009E60', bandera: 'CI', estado: 'pendiente' },
  { codigo: 'NGA', nombre: 'Nigeria', grupo: 'D', confederacion: 'CAF', colorPrimario: '#008751', colorSecundario: '#FFFFFF', bandera: 'NG', estado: 'pendiente' },
  { codigo: 'CMR', nombre: 'Camerun', grupo: 'E', confederacion: 'CAF', colorPrimario: '#007A5E', colorSecundario: '#CE1126', bandera: 'CM', estado: 'pendiente' },

  // AFC
  { codigo: 'JPN', nombre: 'Japon', grupo: 'F', confederacion: 'AFC', colorPrimario: '#0F2C66', colorSecundario: '#BC002D', bandera: 'JP', estado: 'clasificado' },
  { codigo: 'KOR', nombre: 'Corea del Sur', grupo: 'G', confederacion: 'AFC', colorPrimario: '#CD2E3A', colorSecundario: '#0047A0', bandera: 'KR', estado: 'clasificado' },
  { codigo: 'AUS', nombre: 'Australia', grupo: 'H', confederacion: 'AFC', colorPrimario: '#FFCD00', colorSecundario: '#00843D', bandera: 'AU', estado: 'clasificado' },
  { codigo: 'IRN', nombre: 'Iran', grupo: 'I', confederacion: 'AFC', colorPrimario: '#239F40', colorSecundario: '#DA0000', bandera: 'IR', estado: 'clasificado' },
  { codigo: 'KSA', nombre: 'Arabia Saudita', grupo: 'J', confederacion: 'AFC', colorPrimario: '#006C35', colorSecundario: '#FFFFFF', bandera: 'SA', estado: 'pendiente' },
  { codigo: 'QAT', nombre: 'Qatar', grupo: 'K', confederacion: 'AFC', colorPrimario: '#8A1538', colorSecundario: '#FFFFFF', bandera: 'QA', estado: 'pendiente' },
  { codigo: 'UZB', nombre: 'Uzbekistan', grupo: 'L', confederacion: 'AFC', colorPrimario: '#1EB53A', colorSecundario: '#0099B5', bandera: 'UZ', estado: 'clasificado' },

  // OFC
  { codigo: 'NZL', nombre: 'Nueva Zelanda', grupo: 'A', confederacion: 'OFC', colorPrimario: '#000000', colorSecundario: '#FFFFFF', bandera: 'NZ', estado: 'clasificado' },
]
