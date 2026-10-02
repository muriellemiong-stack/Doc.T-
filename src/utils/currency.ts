import { Currency } from '../types';

export const EUR_TO_CFA_RATE = 655.957;

export function formatPrice(eurAmount: number, currency: Currency): string {
  if (currency === 'CFA') {
    const cfa = Math.round(eurAmount * EUR_TO_CFA_RATE);
    // Format with thousands separator
    return `${cfa.toLocaleString('fr-FR')} FCFA`;
  }
  return `${eurAmount} €`;
}

export function convertEurToCfa(eurAmount: number): number {
  return Math.round(eurAmount * EUR_TO_CFA_RATE);
}
