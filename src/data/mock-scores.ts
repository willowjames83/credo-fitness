export const mockScores = {
  credo: { score: 72, delta: 3 },
  strength: { score: 68, metrics: ["2 of 3 sessions done", "42,500 lbs total volume"] },
  stability: { score: 41, metrics: ["2 of 3 warmups complete", "Hip mobility focus next"], isWeakest: true },
  cardio: { score: 76, metrics: ["Zone 2: 120 / 180 min", "VO₂ max: 42 ml/kg/min"] },
  nutrition: { score: 85, metrics: ["168g / 180g protein today", "5 of 7 days on target"] },
};

export const mockScoreHistory = [
  { week: 5, credo: 54, strength: 48, stability: 32, cardio: 62, nutrition: 70 },
  { week: 6, credo: 57, strength: 52, stability: 34, cardio: 64, nutrition: 73 },
  { week: 7, credo: 60, strength: 55, stability: 35, cardio: 68, nutrition: 78 },
  { week: 8, credo: 62, strength: 58, stability: 36, cardio: 70, nutrition: 80 },
  { week: 9, credo: 65, strength: 60, stability: 37, cardio: 72, nutrition: 82 },
  { week: 10, credo: 67, strength: 63, stability: 38, cardio: 74, nutrition: 83 },
  { week: 11, credo: 69, strength: 65, stability: 39, cardio: 75, nutrition: 84 },
  { week: 12, credo: 72, strength: 68, stability: 41, cardio: 76, nutrition: 85 },
];
