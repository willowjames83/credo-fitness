export interface Benchmark {
  name: string;
  value: number;
  unit: string;
  percentile: number;
  delta: string;
  pillar: "strength" | "stability" | "cardio";
  lastTested: string;
  isInversed?: boolean;
}

export const mockBenchmarks: Benchmark[] = [
  { name: "Hex Bar Deadlift", value: 315, unit: "lbs", percentile: 68, delta: "+20 lbs", pillar: "strength", lastTested: "Feb 14" },
  { name: "Back Squat", value: 255, unit: "lbs", percentile: 62, delta: "+15 lbs", pillar: "strength", lastTested: "Feb 14" },
  { name: "Bench Press", value: 205, unit: "lbs", percentile: 58, delta: "+10 lbs", pillar: "strength", lastTested: "Feb 14" },
  { name: "Pull-Ups", value: 12, unit: "reps", percentile: 65, delta: "+2", pillar: "strength", lastTested: "Feb 21" },
  { name: "Push-Ups", value: 38, unit: "reps", percentile: 55, delta: "+5", pillar: "strength", lastTested: "Feb 21" },
  { name: "Dead Hang", value: 95, unit: "sec", percentile: 72, delta: "+12 sec", pillar: "stability", lastTested: "Feb 21" },
  { name: "Farmer Carry", value: 185, unit: "lbs × 40m", percentile: 60, delta: "+10 lbs", pillar: "stability", lastTested: "Mar 1" },
  { name: "Plank Hold", value: 120, unit: "sec", percentile: 58, delta: "+15 sec", pillar: "stability", lastTested: "Mar 1" },
  { name: "1000m Row", value: 198, unit: "sec", percentile: 52, delta: "-4 sec", pillar: "cardio", lastTested: "Mar 7", isInversed: true },
  { name: "Norwegian 4×4", value: 340, unit: "watts avg", percentile: 40, delta: "+15w", pillar: "cardio", lastTested: "Mar 7" },
];

export const mockCompositePercentile = {
  value: 63,
  context: "M, 40-44, 185 lb",
};
