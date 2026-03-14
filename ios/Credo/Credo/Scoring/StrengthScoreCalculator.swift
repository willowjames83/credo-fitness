import Foundation

struct StrengthSubscores {
    let upperPush: Int      // Best of bench_press, ohp
    let upperPull: Int      // Best of weighted_pullup, barbell_row, pullup
    let lowerPush: Int      // Best of back_squat, front_squat
    let lowerPull: Int      // Best of deadlift, rdl, trap_bar_deadlift
    let core: Int           // hanging_knee_raise from history
    let grip: Int           // farmer_carry weight
    let carry: Int          // farmer_carry weight
    let muscularEndurance: Int  // pullup/pushup reps from history

    var weightedScore: Int {
        Int(round(
            Double(upperPush) * 0.15 +
            Double(upperPull) * 0.15 +
            Double(lowerPush) * 0.15 +
            Double(lowerPull) * 0.15 +
            Double(core) * 0.10 +
            Double(grip) * 0.10 +
            Double(carry) * 0.10 +
            Double(muscularEndurance) * 0.10
        ))
    }

    /// True if all subscores are zero (no workout data).
    var hasNoData: Bool {
        upperPush == 0 && upperPull == 0 && lowerPush == 0 && lowerPull == 0
        && core == 0 && grip == 0 && carry == 0 && muscularEndurance == 0
    }
}

struct StrengthScoreCalculator {

    static func calculate(store: WorkoutStore) -> StrengthSubscores {
        let sex = store.userProfile?.sex ?? "Male"
        let age = store.userProfile?.age ?? 30
        let bodyweight = Double(store.userProfile?.weight ?? 185)

        // Helper: best percentile from a set of exercise IDs using stored 1RMs
        func bestPercentile(exerciseIds: [String]) -> Int {
            var best = 0
            for id in exerciseIds {
                guard let oneRM = store.best1RMInLast90Days(for: id) ?? store.exercise1RMs[id] else {
                    continue
                }
                let relative = oneRM / bodyweight
                guard let standard = StrengthStandards.findStandard(exerciseId: id, sex: sex, age: age) else {
                    continue
                }
                let pct = StrengthStandards.percentile(relativeStrength: relative, standard: standard)
                best = max(best, pct)
            }
            return best
        }

        let upperPush = bestPercentile(exerciseIds: ["bench_press", "ohp"])
        let upperPull = bestPercentile(exerciseIds: ["weighted_pullup", "barbell_row"])
        let lowerPush = bestPercentile(exerciseIds: ["back_squat", "front_squat"])
        let lowerPull = bestPercentile(exerciseIds: ["deadlift", "rdl", "trap_bar_deadlift"])

        // Core: estimate from hanging_knee_raise sets in history
        let coreScore = corePercentile(store: store)

        // Grip & Carry: both sourced from farmer_carry
        let gripCarryScore = bestPercentile(exerciseIds: ["farmer_carry"])

        // Muscular endurance: estimate from pullup reps in history
        let enduranceScore = endurancePercentile(store: store)

        return StrengthSubscores(
            upperPush: upperPush,
            upperPull: upperPull,
            lowerPush: lowerPush,
            lowerPull: lowerPull,
            core: coreScore,
            grip: gripCarryScore,
            carry: gripCarryScore,
            muscularEndurance: enduranceScore
        )
    }

    // MARK: - Subscore Details (for Breakdown View)

    static func subscoreDetails(store: WorkoutStore) -> [SubscoreDetail] {
        let sex = store.userProfile?.sex ?? "Male"
        let age = store.userProfile?.age ?? 30
        let bodyweight = Double(store.userProfile?.weight ?? 185)
        let subscores = calculate(store: store)

        // Helper to build ExerciseDetail for a given exerciseId
        func exerciseDetail(exerciseId: String) -> ExerciseDetail {
            let name = ExerciseLibrary.find(exerciseId)?.name ?? exerciseId
            guard let oneRM = store.best1RMInLast90Days(for: exerciseId) ?? store.exercise1RMs[exerciseId],
                  oneRM > 0 else {
                return ExerciseDetail(name: name, exerciseId: exerciseId, oneRM: nil, percentile: nil)
            }
            let relative = oneRM / bodyweight
            let pct: Int
            if let standard = StrengthStandards.findStandard(exerciseId: exerciseId, sex: sex, age: age) {
                pct = StrengthStandards.percentile(relativeStrength: relative, standard: standard)
            } else {
                pct = 0
            }
            return ExerciseDetail(name: name, exerciseId: exerciseId, oneRM: oneRM, percentile: pct)
        }

        return [
            SubscoreDetail(
                category: "Upper Push",
                weightPercent: 15,
                score: subscores.upperPush,
                exercises: [
                    exerciseDetail(exerciseId: "bench_press"),
                    exerciseDetail(exerciseId: "ohp"),
                ]
            ),
            SubscoreDetail(
                category: "Upper Pull",
                weightPercent: 15,
                score: subscores.upperPull,
                exercises: [
                    exerciseDetail(exerciseId: "weighted_pullup"),
                    exerciseDetail(exerciseId: "barbell_row"),
                ]
            ),
            SubscoreDetail(
                category: "Lower Push",
                weightPercent: 15,
                score: subscores.lowerPush,
                exercises: [
                    exerciseDetail(exerciseId: "back_squat"),
                    exerciseDetail(exerciseId: "front_squat"),
                ]
            ),
            SubscoreDetail(
                category: "Lower Pull",
                weightPercent: 15,
                score: subscores.lowerPull,
                exercises: [
                    exerciseDetail(exerciseId: "deadlift"),
                    exerciseDetail(exerciseId: "rdl"),
                    exerciseDetail(exerciseId: "trap_bar_deadlift"),
                ]
            ),
            SubscoreDetail(
                category: "Core",
                weightPercent: 10,
                score: subscores.core,
                exercises: [
                    ExerciseDetail(
                        name: "Hanging Knee Raise",
                        exerciseId: "hanging_knee_raise",
                        oneRM: subscores.core > 0 ? Double(subscores.core) : nil,
                        percentile: subscores.core > 0 ? subscores.core : nil
                    ),
                ]
            ),
            SubscoreDetail(
                category: "Grip",
                weightPercent: 10,
                score: subscores.grip,
                exercises: [
                    exerciseDetail(exerciseId: "farmer_carry"),
                ]
            ),
            SubscoreDetail(
                category: "Carry",
                weightPercent: 10,
                score: subscores.carry,
                exercises: [
                    exerciseDetail(exerciseId: "farmer_carry"),
                ]
            ),
            SubscoreDetail(
                category: "Endurance",
                weightPercent: 10,
                score: subscores.muscularEndurance,
                exercises: [
                    ExerciseDetail(
                        name: "Pull-up (reps)",
                        exerciseId: "pullup",
                        oneRM: subscores.muscularEndurance > 0 ? Double(subscores.muscularEndurance) : nil,
                        percentile: subscores.muscularEndurance > 0 ? subscores.muscularEndurance : nil
                    ),
                ]
            ),
        ]
    }

    // MARK: - Core Percentile

    /// Estimates core percentile from hanging_knee_raise history.
    /// Uses best total reps in a single workout as a proxy.
    private static func corePercentile(store: WorkoutStore) -> Int {
        var bestTotalReps = 0
        for workout in store.workoutHistory {
            for exercise in workout.exercises where exercise.exerciseId == "hanging_knee_raise" {
                let totalReps = exercise.sets.reduce(0) { $0 + $1.reps }
                bestTotalReps = max(bestTotalReps, totalReps)
            }
        }
        guard bestTotalReps > 0 else { return 0 }

        // Rough percentile mapping: 10 reps ~20th, 20 reps ~40th, 30 reps ~60th, 45+ ~80th
        let breakpoints: [(reps: Double, pct: Double)] = [
            (0, 0), (10, 20), (20, 40), (30, 60), (40, 75), (50, 85), (60, 95)
        ]
        return interpolate(value: Double(bestTotalReps), breakpoints: breakpoints)
    }

    // MARK: - Endurance Percentile

    /// Estimates muscular endurance from max pullup reps in a single set.
    private static func endurancePercentile(store: WorkoutStore) -> Int {
        var bestReps = 0
        for workout in store.workoutHistory {
            for exercise in workout.exercises where exercise.exerciseId == "pullup" {
                for set in exercise.sets {
                    bestReps = max(bestReps, set.reps)
                }
            }
        }
        guard bestReps > 0 else { return 0 }

        // Male/Female rough mapping for pullup reps
        let sex = store.userProfile?.sex ?? "Male"
        let breakpoints: [(reps: Double, pct: Double)]
        if sex == "Female" {
            breakpoints = [(0, 0), (1, 30), (3, 45), (6, 60), (10, 75), (15, 88), (20, 95)]
        } else {
            breakpoints = [(0, 0), (3, 20), (6, 35), (10, 50), (15, 65), (20, 78), (25, 88), (30, 95)]
        }
        return interpolate(value: Double(bestReps), breakpoints: breakpoints)
    }

    // MARK: - Interpolation Helper

    private static func interpolate(value: Double, breakpoints: [(reps: Double, pct: Double)]) -> Int {
        if value <= 0 { return 0 }
        if value >= breakpoints.last!.reps { return Int(breakpoints.last!.pct) }

        for i in 0..<(breakpoints.count - 1) {
            let lower = breakpoints[i]
            let upper = breakpoints[i + 1]
            if value >= lower.reps && value <= upper.reps {
                let fraction = (value - lower.reps) / (upper.reps - lower.reps)
                return Int(round(lower.pct + fraction * (upper.pct - lower.pct)))
            }
        }
        return 0
    }
}
