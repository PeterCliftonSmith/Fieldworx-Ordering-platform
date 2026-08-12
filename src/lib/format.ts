import { DEFAULT_VAT_RATE } from "@/data/types";

export function formatZar(amount: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function priceInclFromEx(
  priceExVat: number,
  vatRate = DEFAULT_VAT_RATE,
): number {
  return roundMoney(priceExVat * (1 + vatRate));
}

export function priceExFromIncl(
  priceInclVat: number,
  vatRate = DEFAULT_VAT_RATE,
): number {
  return roundMoney(priceInclVat / (1 + vatRate));
}

export function vatAmount(
  priceExVat: number,
  priceInclVat: number,
): number {
  return roundMoney(priceInclVat - priceExVat);
}
