import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFieldErrorId(fieldName: string, uniqueId: string) {
  return `${fieldName}-${uniqueId}-error`;
}
