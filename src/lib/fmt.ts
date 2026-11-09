/** Formatadores pt-BR. Mesma semântica do antigo core.js. */
const cache = new Map<number, Intl.NumberFormat>();

function nf(digits: number): Intl.NumberFormat {
  let f = cache.get(digits);
  if (!f) {
    f = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
    cache.set(digits, f);
  }
  return f;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Inteiro: 1234 -> "1.234". */
export const int = (n: number | string): string => nf(0).format(Number(n) || 0);
/** Decimal: 1234.5 -> "1.234,5". */
export const dec = (n: number | string, casas = 1): string => nf(casas).format(Number(n) || 0);
/** Percentual (n já em pontos percentuais): 98.4 -> "98,4%". */
export const pct = (n: number | string, casas = 1): string => nf(casas).format(Number(n) || 0) + "%";
/** Date -> "HH:MM"; número = minutos desde 00:00 (módulo 24 h). */
export function hora(v: Date | number): string {
  if (v instanceof Date) return pad2(v.getHours()) + ":" + pad2(v.getMinutes());
  const total = ((Math.round(Number(v) || 0) % 1440) + 1440) % 1440;
  return pad2(Math.floor(total / 60)) + ":" + pad2(total % 60);
}

export const fmt = { int, dec, pct, hora };
