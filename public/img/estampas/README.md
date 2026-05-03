# Imagenes de las estampas

Coloca aqui las fotos reales de las estampas Panini. La forma recomendada es:

1. Nombre del archivo igual al `id` de la estampa, en formato `.webp` (mejor compresion) o `.png`/`.jpg`.
   - Estampas de equipos: `<codigoEquipo><numero>.webp` (ejemplos: `ARG15.webp`, `BRA12.webp`, `MEX1.webp`).
   - Estampas especiales: el id directo (`00.webp`, `FWC3.webp`, `FWC15.webp`).

2. Registra la ruta en `src/data/imagenesEstampas.ts`. Ejemplo:

   ```ts
   export const imagenesEstampas: Record<string, string> = {
     ARG15: '/img/estampas/ARG15.webp',
     BRA12: '/img/estampas/BRA12.webp',
     FWC3: '/img/estampas/FWC3.webp',
   }
   ```

   La ruta debe empezar con `/img/estampas/...` porque Vite sirve la carpeta
   `public/` desde la raiz del sitio.

## Recomendaciones tecnicas

- Tamano sugerido: 600x800 px (relacion 3:4, igual al recorte de la tarjeta).
- Formato: `webp` con calidad 80-85 da buena nitidez con archivos pequenos.
- Si la imagen no carga (404, ruta mal escrita, etc.) la tarjeta muestra
  automaticamente el placeholder con bandera o estrella, asi que no se rompe
  nada si todavia no tienes todas las fotos.

## Privacidad

Estas imagenes son de uso personal y cerrado para tu album entre amigos.
Esta carpeta esta versionada con `.gitkeep`; si decides subir las fotos al
repositorio considera agregar `public/img/estampas/*` a `.gitignore` para no
publicar material con derechos.
