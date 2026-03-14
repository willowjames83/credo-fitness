import Foundation

struct UserProfile: Codable {
    var name: String
    var age: Int
    var sex: String // "Male" or "Female"
    var weight: Int // lbs
    var heightFeet: Int?
    var heightInches: Int?
    var experienceLevel: String // "beginner", "intermediate", "advanced"
    var trainingGoal: String // "build_muscle", "increase_strength", "general_fitness", "longevity"
    var benchPress1RM: Double? // optional benchmarks
    var squat1RM: Double?
    var deadlift1RM: Double?
    var ohp1RM: Double?

    var experienceMultiplier: Double {
        switch experienceLevel {
        case "beginner": return 0.65
        case "advanced": return 1.25
        default: return 1.0
        }
    }

    var firstName: String {
        name.components(separatedBy: " ").first ?? name
    }

    /// Derive a working weight for a given exercise from a benchmark 1RM.
    /// Uses 65-75% of 1RM depending on the exercise's default rep range.
    /// Higher rep ranges use a lower percentage.
    func workingWeightFromBenchmark(exerciseId: String, increment: Double) -> Double? {
        let benchmark: Double?
        let relatedExercises: [String: Double?]

        switch exerciseId {
        // Bench press family
        case "bench_press":
            benchmark = benchPress1RM
        case "incline_bench":
            benchmark = benchPress1RM.map { $0 * 0.85 }
        case "incline_db_press":
            // Each DB is roughly 40% of barbell bench 1RM for working sets, per side
            benchmark = benchPress1RM.map { $0 * 0.35 }

        // Squat family
        case "back_squat":
            benchmark = squat1RM
        case "front_squat":
            benchmark = squat1RM.map { $0 * 0.80 }
        case "leg_press":
            benchmark = squat1RM.map { $0 * 1.5 }
        case "bulgarian_split_squat":
            benchmark = squat1RM.map { $0 * 0.30 }
        case "walking_lunge":
            benchmark = squat1RM.map { $0 * 0.25 }

        // Deadlift family
        case "deadlift":
            benchmark = deadlift1RM
        case "trap_bar_deadlift":
            benchmark = deadlift1RM.map { $0 * 1.05 }
        case "rdl":
            benchmark = deadlift1RM.map { $0 * 0.70 }
        case "single_leg_rdl":
            benchmark = deadlift1RM.map { $0 * 0.20 }

        // OHP family
        case "ohp":
            benchmark = ohp1RM
        case "db_ohp":
            benchmark = ohp1RM.map { $0 * 0.40 }

        default:
            benchmark = nil
        }

        guard let oneRM = benchmark else { return nil }

        // Use ~70% of the derived 1RM as a working weight
        let workingWeight = oneRM * 0.70
        return ProgressionEngine.roundToNearest(workingWeight, increment: increment)
    }
}
