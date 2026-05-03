// Quita acentos, espacios redundantes y pasa a minusculas para hacer
// busquedas tolerantes (Mexico vs Mexico, Espana vs Espana, etc).
export function normalizarTexto(valor: string | undefined | null): string {
  if (!valor) return ''
  return valor
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}
