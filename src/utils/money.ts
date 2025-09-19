import * as Localization from "expo-localization";

export type Money = {
  value: number;
  currency: string;
  locale?: string;
};

type FormatOptions = {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

function getDeviceLocale(): string {
  try {
    const locales = Localization.getLocales?.();
    const tag = locales && locales[0]?.languageTag;
    return tag || "en-US";
  } catch {
    return "en-US";
  }
}

export function formatMoney(input: Money, options: FormatOptions = {}): string {
  const { value, currency, locale } = input;

  const effectiveLocale = locale || getDeviceLocale();

  const minFD = options.minimumFractionDigits ?? defaultFractionDigits(currency);
  const maxFD = options.maximumFractionDigits ?? defaultFractionDigits(currency);

  try {
    return new Intl.NumberFormat(effectiveLocale, {
      style: "currency",
      currency,
      minimumFractionDigits: minFD,
      maximumFractionDigits: maxFD,
    }).format(value);
  } catch {
    const sign = value < 0 ? "-" : "";
    const abs = Math.abs(value).toFixed(maxFD);
    return `${sign}${currency} ${abs}`;
  }
}

function defaultFractionDigits(currency: string): number {
  const zeroDecimals = new Set(["JPY", "KRW", "CLP", "VND"]);
  return zeroDecimals.has(currency.toUpperCase()) ? 0 : 2;
}
