/**
 * Tipos da Sequência Viral dentro do KAI.
 * Canvas Instagram 4:5 (1080 × 1350 px).
 * Apenas template "Twitter" no MVP.
 */

export const CANVAS_W = 1080;
export const CANVAS_H = 1350;

export type ViralTemplateId = "twitter"; // MVP: só twitter

export type ImageSource =
  | { kind: "none" }
  | { kind: "ai"; prompt: string; url: string }
  | { kind: "search"; query: string; url: string; attribution?: string }
  | { kind: "upload"; url: string; filename?: string };

export interface ViralSlide {
  id: string;
  order: number;
  heading: string;
  body: string;
  image: ImageSource;
}

export interface ViralProfile {
  name: string;
  handle: string; // inclui @
  avatarUrl?: string;
}

export type ViralCarouselStatus = "draft" | "ready" | "published";

export interface ViralCarousel {
  id: string;
  clientId: string;
  title: string;
  template: ViralTemplateId;
  slides: ViralSlide[];
  profile: ViralProfile;
  briefing?: string; // prompt original que originou a geração
  status: ViralCarouselStatus;
  createdAt: string;
  updatedAt: string;
}

export function emptySlide(order: number): ViralSlide {
  return {
    id: `slide_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`,
    order,
    heading: "",
    body: "",
    image: { kind: "none" },
  };
}

export function emptyCarousel(clientId: string, profile: ViralProfile): ViralCarousel {
  return {
    id: `car_${crypto.randomUUID()}`,
    clientId,
    title: "Novo carrossel",
    template: "twitter",
    slides: Array.from({ length: 8 }).map((_, i) => emptySlide(i + 1)),
    profile,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
