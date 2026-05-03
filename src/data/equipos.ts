import type { Equipo } from '@/lib/types'

// Las 48 selecciones del Mundial 2026 (USA / Canadá / México) tal como aparecen
// en el álbum oficial Panini FIFA World Cup 2026 (lanzado el 29 de abril de 2026).
// El orden y los grupos (A-L, 4 equipos por grupo) reflejan la disposición del álbum.
export const equipos: Equipo[] = [
  // Grupo A
  { codigo: 'MEX', nombre: 'México', grupo: 'A', confederacion: 'CONCACAF', colorPrimario: '#006847', colorSecundario: '#CE1126', bandera: 'MX', estado: 'clasificado' },
  { codigo: 'RSA', nombre: 'Sudáfrica', grupo: 'A', confederacion: 'CAF', colorPrimario: '#007749', colorSecundario: '#FFB915', bandera: 'ZA', estado: 'clasificado' },
  { codigo: 'KOR', nombre: 'Corea del Sur', grupo: 'A', confederacion: 'AFC', colorPrimario: '#CD2E3A', colorSecundario: '#0047A0', bandera: 'KR', estado: 'clasificado' },
  { codigo: 'CZE', nombre: 'República Checa', grupo: 'A', confederacion: 'UEFA', colorPrimario: '#11457E', colorSecundario: '#D7141A', bandera: 'CZ', estado: 'clasificado' },

  // Grupo B
  { codigo: 'CAN', nombre: 'Canadá', grupo: 'B', confederacion: 'CONCACAF', colorPrimario: '#FF0000', colorSecundario: '#FFFFFF', bandera: 'CA', estado: 'clasificado' },
  { codigo: 'BIH', nombre: 'Bosnia y Herzegovina', grupo: 'B', confederacion: 'UEFA', colorPrimario: '#002F6C', colorSecundario: '#FECB00', bandera: 'BA', estado: 'clasificado' },
  { codigo: 'QAT', nombre: 'Qatar', grupo: 'B', confederacion: 'AFC', colorPrimario: '#8A1538', colorSecundario: '#FFFFFF', bandera: 'QA', estado: 'clasificado' },
  { codigo: 'SUI', nombre: 'Suiza', grupo: 'B', confederacion: 'UEFA', colorPrimario: '#D52B1E', colorSecundario: '#FFFFFF', bandera: 'CH', estado: 'clasificado' },

  // Grupo C
  { codigo: 'BRA', nombre: 'Brasil', grupo: 'C', confederacion: 'CONMEBOL', colorPrimario: '#FFDF00', colorSecundario: '#009C3B', bandera: 'BR', estado: 'clasificado' },
  { codigo: 'MAR', nombre: 'Marruecos', grupo: 'C', confederacion: 'CAF', colorPrimario: '#C1272D', colorSecundario: '#006233', bandera: 'MA', estado: 'clasificado' },
  { codigo: 'HAI', nombre: 'Haití', grupo: 'C', confederacion: 'CONCACAF', colorPrimario: '#00209F', colorSecundario: '#D21034', bandera: 'HT', estado: 'clasificado' },
  { codigo: 'SCO', nombre: 'Escocia', grupo: 'C', confederacion: 'UEFA', colorPrimario: '#0065BD', colorSecundario: '#FFFFFF', bandera: 'GB-SCT', estado: 'clasificado' },

  // Grupo D
  { codigo: 'USA', nombre: 'Estados Unidos', grupo: 'D', confederacion: 'CONCACAF', colorPrimario: '#0A3161', colorSecundario: '#B31942', bandera: 'US', estado: 'clasificado' },
  { codigo: 'PAR', nombre: 'Paraguay', grupo: 'D', confederacion: 'CONMEBOL', colorPrimario: '#D52B1E', colorSecundario: '#0038A8', bandera: 'PY', estado: 'clasificado' },
  { codigo: 'AUS', nombre: 'Australia', grupo: 'D', confederacion: 'AFC', colorPrimario: '#FFCD00', colorSecundario: '#00843D', bandera: 'AU', estado: 'clasificado' },
  { codigo: 'TUR', nombre: 'Turquía', grupo: 'D', confederacion: 'UEFA', colorPrimario: '#E30A17', colorSecundario: '#FFFFFF', bandera: 'TR', estado: 'clasificado' },

  // Grupo E
  { codigo: 'GER', nombre: 'Alemania', grupo: 'E', confederacion: 'UEFA', colorPrimario: '#000000', colorSecundario: '#DD0000', bandera: 'DE', estado: 'clasificado' },
  { codigo: 'CUW', nombre: 'Curazao', grupo: 'E', confederacion: 'CONCACAF', colorPrimario: '#002B7F', colorSecundario: '#FFD100', bandera: 'CW', estado: 'clasificado' },
  { codigo: 'CIV', nombre: 'Costa de Marfil', grupo: 'E', confederacion: 'CAF', colorPrimario: '#F77F00', colorSecundario: '#009E60', bandera: 'CI', estado: 'clasificado' },
  { codigo: 'ECU', nombre: 'Ecuador', grupo: 'E', confederacion: 'CONMEBOL', colorPrimario: '#FFD100', colorSecundario: '#034EA2', bandera: 'EC', estado: 'clasificado' },

  // Grupo F
  { codigo: 'NED', nombre: 'Países Bajos', grupo: 'F', confederacion: 'UEFA', colorPrimario: '#FF6900', colorSecundario: '#21468B', bandera: 'NL', estado: 'clasificado' },
  { codigo: 'JPN', nombre: 'Japón', grupo: 'F', confederacion: 'AFC', colorPrimario: '#0F2C66', colorSecundario: '#BC002D', bandera: 'JP', estado: 'clasificado' },
  { codigo: 'SWE', nombre: 'Suecia', grupo: 'F', confederacion: 'UEFA', colorPrimario: '#006AA7', colorSecundario: '#FECC02', bandera: 'SE', estado: 'clasificado' },
  { codigo: 'TUN', nombre: 'Túnez', grupo: 'F', confederacion: 'CAF', colorPrimario: '#E70013', colorSecundario: '#FFFFFF', bandera: 'TN', estado: 'clasificado' },

  // Grupo G
  { codigo: 'BEL', nombre: 'Bélgica', grupo: 'G', confederacion: 'UEFA', colorPrimario: '#ED2939', colorSecundario: '#FAE042', bandera: 'BE', estado: 'clasificado' },
  { codigo: 'EGY', nombre: 'Egipto', grupo: 'G', confederacion: 'CAF', colorPrimario: '#CE1126', colorSecundario: '#000000', bandera: 'EG', estado: 'clasificado' },
  { codigo: 'IRN', nombre: 'Irán', grupo: 'G', confederacion: 'AFC', colorPrimario: '#239F40', colorSecundario: '#DA0000', bandera: 'IR', estado: 'clasificado' },
  { codigo: 'NZL', nombre: 'Nueva Zelanda', grupo: 'G', confederacion: 'OFC', colorPrimario: '#000000', colorSecundario: '#FFFFFF', bandera: 'NZ', estado: 'clasificado' },

  // Grupo H
  { codigo: 'ESP', nombre: 'España', grupo: 'H', confederacion: 'UEFA', colorPrimario: '#AA151B', colorSecundario: '#F1BF00', bandera: 'ES', estado: 'clasificado' },
  { codigo: 'CPV', nombre: 'Cabo Verde', grupo: 'H', confederacion: 'CAF', colorPrimario: '#003893', colorSecundario: '#CF2027', bandera: 'CV', estado: 'clasificado' },
  { codigo: 'KSA', nombre: 'Arabia Saudita', grupo: 'H', confederacion: 'AFC', colorPrimario: '#006C35', colorSecundario: '#FFFFFF', bandera: 'SA', estado: 'clasificado' },
  { codigo: 'URU', nombre: 'Uruguay', grupo: 'H', confederacion: 'CONMEBOL', colorPrimario: '#0038A8', colorSecundario: '#FFFFFF', bandera: 'UY', estado: 'clasificado' },

  // Grupo I
  { codigo: 'FRA', nombre: 'Francia', grupo: 'I', confederacion: 'UEFA', colorPrimario: '#0055A4', colorSecundario: '#EF4135', bandera: 'FR', estado: 'clasificado' },
  { codigo: 'SEN', nombre: 'Senegal', grupo: 'I', confederacion: 'CAF', colorPrimario: '#00853F', colorSecundario: '#FDEF42', bandera: 'SN', estado: 'clasificado' },
  { codigo: 'IRQ', nombre: 'Iraq', grupo: 'I', confederacion: 'AFC', colorPrimario: '#CE1126', colorSecundario: '#007A3D', bandera: 'IQ', estado: 'clasificado' },
  { codigo: 'NOR', nombre: 'Noruega', grupo: 'I', confederacion: 'UEFA', colorPrimario: '#BA0C2F', colorSecundario: '#00205B', bandera: 'NO', estado: 'clasificado' },

  // Grupo J
  { codigo: 'ARG', nombre: 'Argentina', grupo: 'J', confederacion: 'CONMEBOL', colorPrimario: '#75AADB', colorSecundario: '#FFFFFF', bandera: 'AR', estado: 'clasificado' },
  { codigo: 'ALG', nombre: 'Argelia', grupo: 'J', confederacion: 'CAF', colorPrimario: '#006233', colorSecundario: '#D21034', bandera: 'DZ', estado: 'clasificado' },
  { codigo: 'AUT', nombre: 'Austria', grupo: 'J', confederacion: 'UEFA', colorPrimario: '#ED2939', colorSecundario: '#FFFFFF', bandera: 'AT', estado: 'clasificado' },
  { codigo: 'JOR', nombre: 'Jordania', grupo: 'J', confederacion: 'AFC', colorPrimario: '#000000', colorSecundario: '#CE1126', bandera: 'JO', estado: 'clasificado' },

  // Grupo K
  { codigo: 'POR', nombre: 'Portugal', grupo: 'K', confederacion: 'UEFA', colorPrimario: '#006600', colorSecundario: '#FF0000', bandera: 'PT', estado: 'clasificado' },
  { codigo: 'COD', nombre: 'RD del Congo', grupo: 'K', confederacion: 'CAF', colorPrimario: '#007FFF', colorSecundario: '#F7D618', bandera: 'CD', estado: 'clasificado' },
  { codigo: 'UZB', nombre: 'Uzbekistán', grupo: 'K', confederacion: 'AFC', colorPrimario: '#1EB53A', colorSecundario: '#0099B5', bandera: 'UZ', estado: 'clasificado' },
  { codigo: 'COL', nombre: 'Colombia', grupo: 'K', confederacion: 'CONMEBOL', colorPrimario: '#FCD116', colorSecundario: '#003893', bandera: 'CO', estado: 'clasificado' },

  // Grupo L
  { codigo: 'ENG', nombre: 'Inglaterra', grupo: 'L', confederacion: 'UEFA', colorPrimario: '#FFFFFF', colorSecundario: '#CE1124', bandera: 'GB-ENG', estado: 'clasificado' },
  { codigo: 'CRO', nombre: 'Croacia', grupo: 'L', confederacion: 'UEFA', colorPrimario: '#FF0000', colorSecundario: '#FFFFFF', bandera: 'HR', estado: 'clasificado' },
  { codigo: 'GHA', nombre: 'Ghana', grupo: 'L', confederacion: 'CAF', colorPrimario: '#CE1126', colorSecundario: '#FCD116', bandera: 'GH', estado: 'clasificado' },
  { codigo: 'PAN', nombre: 'Panamá', grupo: 'L', confederacion: 'CONCACAF', colorPrimario: '#DA121A', colorSecundario: '#005AA7', bandera: 'PA', estado: 'clasificado' },
]
