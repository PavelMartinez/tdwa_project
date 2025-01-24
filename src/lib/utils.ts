import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function secondsToTime(seconds: number) {
  return new Date(seconds * 1000).toISOString().substring(14, 19)
}