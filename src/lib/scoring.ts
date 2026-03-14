import { SCORE_TIERS, type ScoreDomain } from "./constants";

export function getTierLabel(score: number, domain: ScoreDomain): string {
  const tiers = SCORE_TIERS[domain];
  for (const tier of tiers) {
    if (score >= tier.min) return tier.label;
  }
  return tiers[tiers.length - 1].label;
}
