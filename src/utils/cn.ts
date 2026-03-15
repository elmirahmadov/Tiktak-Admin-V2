import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge tailwind classes safely without style conflicts.
 * Combines clsx for conditional classes and tailwind-merge for overriding.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
