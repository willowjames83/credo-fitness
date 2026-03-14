import SwiftUI

@Observable
class CredoTenViewModel {
    let store = WorkoutStore.shared

    // The 10 Credo benchmarks with their exercise IDs (nil = no matching exercise in library)
    private let benchmarkDefinitions: [(name: String, exerciseId: String?, unit: String, pillar: Pillar, isInversed: Bool)] = [
        ("Hex Bar Deadlift", "trap_bar_deadlift", "lbs", .strength, false),
        ("Back Squat", "back_squat", "lbs", .strength, false),
        ("Bench Press", "bench_press", "lbs", .strength, false),
        ("Pull-Ups", "pullup", "reps", .strength, false),
        ("Push-Ups", nil, "reps", .strength, false),
        ("Dead Hang", nil, "sec", .stability, false),
        ("Farmer Carry", "farmer_carry", "lbs \u{00D7} 40m", .stability, false),
        ("Plank Hold", nil, "sec", .stability, false),
        ("1000m Row", nil, "sec", .cardio, true),
        ("Norwegian 4\u{00D7}4", nil, "watts avg", .cardio, false),
    ]

    var benchmarks: [Benchmark] {
        let sex = store.userProfile?.sex ?? "Male"
        let age = store.userProfile?.age ?? 30
        let bodyweight = Double(store.userProfile?.weight ?? 185)

        return benchmarkDefinitions.map { def in
            if let exerciseId = def.exerciseId {
                // Check for real data
                if let oneRM = store.exercise1RMs[exerciseId], oneRM > 0 {
                    let value: Double
                    let percentile: Int

                    if exerciseId == "pullup" {
                        // For pullups, show best reps not 1RM
                        let bestReps = bestPullupReps()
                        value = Double(bestReps)
                        // Rough percentile for pullup reps
                        let breakpoints: [(Double, Double)] = sex == "Female"
                            ? [(0, 0), (1, 30), (3, 45), (6, 60), (10, 75), (15, 88), (20, 95)]
                            : [(0, 0), (3, 20), (6, 35), (10, 50), (15, 65), (20, 78), (25, 88), (30, 95)]
                        percentile = interpolatePercentile(value: value, breakpoints: breakpoints)
                    } else if exerciseId == "farmer_carry" {
                        // Show the weight used (per hand)
                        value = bestFarmerCarryWeight()
                        let relative = value / bodyweight
                        if let standard = StrengthStandards.findStandard(exerciseId: exerciseId, sex: sex, age: age) {
                            percentile = StrengthStandards.percentile(relativeStrength: relative, standard: standard)
                        } else {
                            percentile = 0
                        }
                    } else {
                        value = oneRM
                        let relative = oneRM / bodyweight
                        if let standard = StrengthStandards.findStandard(exerciseId: exerciseId, sex: sex, age: age) {
                            percentile = StrengthStandards.percentile(relativeStrength: relative, standard: standard)
                        } else {
                            percentile = 0
                        }
                    }

                    let lastTestedWeek = lastTestedLabel(for: exerciseId)

                    return Benchmark(
                        name: def.name,
                        value: value,
                        unit: def.unit,
                        percentile: percentile,
                        delta: "",
                        pillar: def.pillar,
                        lastTested: lastTestedWeek,
                        isInversed: def.isInversed
                    )
                }
            }

            // No data — return "Not tested" benchmark
            return Benchmark(
                name: def.name,
                value: 0,
                unit: def.unit,
                percentile: 0,
                delta: "",
                pillar: def.pillar,
                lastTested: "Not tested",
                isInversed: def.isInversed
            )
        }
    }

    var composite: CompositePercentile {
        let strengthScore = StrengthScoreCalculator.calculate(store: store).weightedScore
        let sex = store.userProfile?.sex ?? "Male"
        let age = store.userProfile?.age ?? 30
        let weight = store.userProfile?.weight ?? 185
        let ageRange: String
        switch age {
        case ..<25: ageRange = "18-24"
        case 25..<30: ageRange = "25-29"
        case 30..<35: ageRange = "30-34"
        case 35..<40: ageRange = "35-39"
        case 40..<45: ageRange = "40-44"
        case 45..<50: ageRange = "45-49"
        case 50..<55: ageRange = "50-54"
        case 55..<60: ageRange = "55-59"
        default: ageRange = "60+"
        }
        let initial = sex == "Female" ? "F" : "M"
        return CompositePercentile(
            value: strengthScore,
            context: "\(initial), \(ageRange), \(weight) lb"
        )
    }

    var demographicLabel: String {
        let sex = store.userProfile?.sex ?? "Male"
        let age = store.userProfile?.age ?? 30
        let ageRange: String
        switch age {
        case ..<25: ageRange = "18-24"
        case 25..<30: ageRange = "25-29"
        case 30..<35: ageRange = "30-34"
        case 35..<40: ageRange = "35-39"
        case 40..<45: ageRange = "40-44"
        case 45..<50: ageRange = "45-49"
        case 50..<55: ageRange = "50-54"
        case 55..<60: ageRange = "55-59"
        default: ageRange = "60+"
        }
        let label = sex == "Female" ? "Females" : "Males"
        return "vs. \(label) \(ageRange)"
    }

    func formatValue(_ benchmark: Benchmark) -> String {
        // "Not tested" benchmarks
        if benchmark.lastTested == "Not tested" {
            return "\u{2014}"
        }

        if benchmark.isInversed && benchmark.unit == "sec" {
            let totalSeconds = Int(benchmark.value)
            let mins = totalSeconds / 60
            let secs = totalSeconds % 60
            return String(format: "%d:%02d", mins, secs)
        }
        if benchmark.value == benchmark.value.rounded() {
            return String(Int(benchmark.value))
        }
        return String(format: "%.1f", benchmark.value)
    }

    /// Whether a benchmark has real test data.
    func isTested(_ benchmark: Benchmark) -> Bool {
        benchmark.lastTested != "Not tested"
    }

    // MARK: - Helpers

    private func bestPullupReps() -> Int {
        var best = 0
        for workout in store.workoutHistory {
            for exercise in workout.exercises where exercise.exerciseId == "pullup" {
                for set in exercise.sets {
                    best = max(best, set.reps)
                }
            }
        }
        return best
    }

    private func bestFarmerCarryWeight() -> Double {
        var best: Double = 0
        for workout in store.workoutHistory {
            for exercise in workout.exercises where exercise.exerciseId == "farmer_carry" {
                for set in exercise.sets {
                    best = max(best, set.weight)
                }
            }
        }
        return best
    }

    private func lastTestedLabel(for exerciseId: String) -> String {
        guard let lastWorkout = store.workoutHistory.reversed().first(where: { workout in
            workout.exercises.contains { $0.exerciseId == exerciseId }
        }) else {
            return "Not tested"
        }

        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        return formatter.string(from: lastWorkout.date)
    }

    private func interpolatePercentile(value: Double, breakpoints: [(Double, Double)]) -> Int {
        if value <= 0 { return 0 }
        if value >= breakpoints.last!.0 { return Int(breakpoints.last!.1) }

        for i in 0..<(breakpoints.count - 1) {
            let lower = breakpoints[i]
            let upper = breakpoints[i + 1]
            if value >= lower.0 && value <= upper.0 {
                let fraction = (value - lower.0) / (upper.0 - lower.0)
                return Int(round(lower.1 + fraction * (upper.1 - lower.1)))
            }
        }
        return 0
    }
}
