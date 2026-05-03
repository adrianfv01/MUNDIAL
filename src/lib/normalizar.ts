// Quita acentos, espacios redundantes y pasa a minúsculas para hacer
// búsquedas tolerantes (México vs Mexico, España vs Espana, etc).
export function normalizarTexto(valor: string | undefined | null): string {
  if (!valor) return ''
  return valor
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}
