import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface FormTheme {
  primaryColor?: string;
  cardBg?: string;
  textColor?: string;
  inputBg?: string;
  inputBorder?: string;
  inputFocusRing?: string;
  errorColor?: string;
  borderRadius?: string;
}

export const defaultTheme: FormTheme = {
  primaryColor: '#2563eb',
  cardBg: 'bg-white dark:bg-slate-900',
  textColor: 'text-slate-900 dark:text-slate-100',
  inputBg: 'bg-white dark:bg-slate-800',
  inputBorder: 'border-slate-300 dark:border-slate-700',
  inputFocusRing: 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  errorColor: 'text-rose-600 dark:text-rose-400',
  borderRadius: 'rounded-xl',
};
