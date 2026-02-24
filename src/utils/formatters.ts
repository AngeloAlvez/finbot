import { CATEGORIAS } from '../constants/categories';

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatarCategoria(categoria: string): string {
  const emojiCategoria = CATEGORIAS[categoria]?.emoji || '';
  return `${emojiCategoria} ${categoria}`.trim();
}

export function formatCurrency(value: number): string {
  return `R$${value.toFixed(2)}`;
}
