import clsx from 'clsx';

export const cn = (...values: Array<string | undefined | false | null>) => clsx(values);
export const formatPrice = (value: number) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(value);
