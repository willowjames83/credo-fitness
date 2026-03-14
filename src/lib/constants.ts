import { Hexagon, Target, Activity, Utensils } from "lucide-react";

export const COLORS = {
  bg: "#FFFFFF",
  surface: "#F7F7F8",
  surfaceElevated: "#EEEFF1",
  border: "#E5E5E8",
  accent: "#E8501A",
  accentLight: "#FFF0E9",
  teal: "#1A7A6D",
  tealLight: "#E8F5F3",
  cardio: "#2563EB",
  cardioLight: "#EFF4FF",
  nutrition: "#7C3AED",
  nutritionLight: "#F3EEFF",
  textPrimary: "#1A1A1E",
  textSecondary: "#6B6B73",
  textTertiary: "#9E9EA3",
  success: "#2D8A4E",
  successLight: "#E8F5ED",
  warning: "#C47A1A",
  warningLight: "#FFF3E0",
  danger: "#C43B3B",
} as const;

export const PILLARS = {
  strength: {
    key: "strength" as const,
    label: "Strength",
    color: COLORS.accent,
    bg: COLORS.accentLight,
    icon: Hexagon,
  },
  stability: {
    key: "stability" as const,
    label: "Stability",
    color: COLORS.teal,
    bg: COLORS.tealLight,
    icon: Target,
  },
  cardio: {
    key: "cardio" as const,
    label: "Cardio",
    color: COLORS.cardio,
    bg: COLORS.cardioLight,
    icon: Activity,
  },
  nutrition: {
    key: "nutrition" as const,
    label: "Nutrition",
    color: COLORS.nutrition,
    bg: COLORS.nutritionLight,
    icon: Utensils,
  },
} as const;

export type PillarKey = keyof typeof PILLARS;

export const CREDO_SCORE_WEIGHTS = {
  strength: 0.3,
  cardio: 0.3,
  stability: 0.2,
  nutrition: 0.2,
} as const;

export const SCORE_TIERS = {
  credo: [
    { min: 81, label: "Credo-proof" },
    { min: 61, label: "Thriving" },
    { min: 41, label: "Progressing" },
    { min: 21, label: "Building" },
    { min: 0, label: "Starting" },
  ],
  strength: [
    { min: 81, label: "Exceptional" },
    { min: 61, label: "Strong" },
    { min: 41, label: "Solid" },
    { min: 21, label: "Building" },
    { min: 0, label: "Foundation" },
  ],
  stability: [
    { min: 81, label: "Resilient" },
    { min: 61, label: "Capable" },
    { min: 41, label: "Developing" },
    { min: 21, label: "Inconsistent" },
    { min: 0, label: "Neglected" },
  ],
  cardio: [
    { min: 81, label: "Elite" },
    { min: 61, label: "Fit" },
    { min: 41, label: "On track" },
    { min: 21, label: "Below target" },
    { min: 0, label: "At risk" },
  ],
  nutrition: [
    { min: 91, label: "Locked in" },
    { min: 71, label: "Consistent" },
    { min: 51, label: "Getting there" },
    { min: 31, label: "Inconsistent" },
    { min: 0, label: "Underfeeding" },
  ],
} as const;

export type ScoreDomain = keyof typeof SCORE_TIERS;

export const APP_LINKS = {
  appStore: "#app-store",
  googlePlay: "#google-play",
} as const;
