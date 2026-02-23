import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fallbackImages = [
  "https://images.unsplash.com/photo-1518199227311-5fe79c6e2710?q=80&w=3401&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=3387&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=3542&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=3388&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505245844840-75618fce1446?q=80&w=3540&auto=format&fit=crop"
];

export const getRandomFallback = () => fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

export const getValidImageUrl = (url: string | null) => {
  if (!url || url === "valentine-thumb") return getRandomFallback();
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return getRandomFallback();
};
