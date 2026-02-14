import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

let counter = 0;
export function generateId(): string {
  counter++;
  return `${Date.now().toString(36)}-${counter.toString(36)}`;
}
