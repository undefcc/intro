import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Build a microlink screenshot URL for a given page.
 * Microlink docs: https://microlink.io
 * This keeps meta disabled & only returns screenshot URL.
 */
export function getScreenshot(url: string) {
  return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`
}
