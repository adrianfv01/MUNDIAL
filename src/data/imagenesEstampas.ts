// Mapa de imagenes reales para cada estampa.
//
// La llave es el id de la estampa (ver catalogoSeed.ts):
//   - Estampas de equipos: `${codigoEquipo}${numero}` (ej. "ARG2", "BRA13", "MEX1")
//   - Estampas especiales: el id directo (ej. "00", "FWC1", "FWC15")
//
// El valor es la ruta absoluta a la imagen. Lo recomendado es colocar los
// archivos dentro de `public/img/estampas/` y referenciarlos como
// `/img/estampas/<archivo>` para que Vite los sirva tal cual.
//
// Tambien se aceptan URLs externas (https://...). Si la imagen no carga,
// el componente muestra automaticamente el placeholder con bandera o estrella.
//
// Para agregar una imagen: descomenta o agrega una entrada con el id y la ruta.

export const imagenesEstampas: Record<string, string> = {
  // Ejemplos (descomenta y ajusta cuando agregues los archivos):
  // ARG15: '/img/estampas/ARG15.webp',  // Lionel Messi
  // BRA12: '/img/estampas/BRA12.webp',  // Vinicius Junior
  // FWC3: '/img/estampas/FWC3.webp',   // Mascotas oficiales
}
