import Foundation

let mockBenchmarks: [Benchmark] = [
    Benchmark(name: "Hex Bar Deadlift", value: 315, unit: "lbs", percentile: 68, delta: "+20 lbs", pillar: .strength, lastTested: "Week 11"),
    Benchmark(name: "Back Squat", value: 255, unit: "lbs", percentile: 62, delta: "+15 lbs", pillar: .strength, lastTested: "Week 11"),
    Benchmark(name: "Bench Press", value: 205, unit: "lbs", percentile: 58, delta: "+10 lbs", pillar: .strength, lastTested: "Week 10"),
    Benchmark(name: "Pull-Ups", value: 12, unit: "reps", percentile: 65, delta: "+2", pillar: .strength, lastTested: "Week 11"),
    Benchmark(name: "Push-Ups", value: 38, unit: "reps", percentile: 55, delta: "+5", pillar: .strength, lastTested: "Week 10"),
    Benchmark(name: "Dead Hang", value: 95, unit: "sec", percentile: 72, delta: "+12 sec", pillar: .stability, lastTested: "Week 11"),
    Benchmark(name: "Farmer Carry", value: 185, unit: "lbs \u{00D7} 40m", percentile: 60, delta: "+10 lbs", pillar: .stability, lastTested: "Week 10"),
    Benchmark(name: "Plank Hold", value: 120, unit: "sec", percentile: 58, delta: "+15 sec", pillar: .stability, lastTested: "Week 11"),
    Benchmark(name: "1000m Row", value: 198, unit: "sec", percentile: 52, delta: "-4 sec", pillar: .cardio, lastTested: "Week 10", isInversed: true),
    Benchmark(name: "Norwegian 4\u{00D7}4", value: 340, unit: "watts avg", percentile: 40, delta: "+15w", pillar: .cardio, lastTested: "Week 11"),
]

let mockCompositePercentile = CompositePercentile(value: 63, context: "M, 40-44, 185 lb")
