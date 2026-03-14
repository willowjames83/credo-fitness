import Foundation

struct StrengthStandard {
    let exerciseId: String
    let sex: String           // "Male", "Female"
    let ageMin: Int
    let ageMax: Int
    // Relative strength ratios (1RM / bodyweight) at each percentile
    let p10: Double
    let p25: Double
    let p50: Double
    let p75: Double
    let p90: Double
    let p95: Double
}

struct StrengthStandards {

    // MARK: - Lookup

    static func findStandard(exerciseId: String, sex: String, age: Int) -> StrengthStandard? {
        allStandards.first { standard in
            standard.exerciseId == exerciseId
            && standard.sex == sex
            && age >= standard.ageMin
            && age <= standard.ageMax
        }
    }

    /// Linear interpolation between breakpoints, returning 0-100 percentile.
    static func percentile(relativeStrength: Double, standard: StrengthStandard) -> Int {
        let breakpoints: [(percentile: Double, ratio: Double)] = [
            (0, 0),
            (10, standard.p10),
            (25, standard.p25),
            (50, standard.p50),
            (75, standard.p75),
            (90, standard.p90),
            (95, standard.p95),
            (100, standard.p95 * 1.15) // extrapolate slightly beyond 95th
        ]

        if relativeStrength <= 0 { return 0 }
        if relativeStrength >= breakpoints.last!.ratio { return 100 }

        for i in 0..<(breakpoints.count - 1) {
            let lower = breakpoints[i]
            let upper = breakpoints[i + 1]
            if relativeStrength >= lower.ratio && relativeStrength <= upper.ratio {
                let fraction = (relativeStrength - lower.ratio) / (upper.ratio - lower.ratio)
                let result = lower.percentile + fraction * (upper.percentile - lower.percentile)
                return Int(round(result))
            }
        }

        return 0
    }

    // MARK: - Standards Data

    static let allStandards: [StrengthStandard] = {
        var standards: [StrengthStandard] = []

        // Age brackets: (min, max)
        let ageBrackets: [(Int, Int)] = [
            (18, 29), (30, 39), (40, 49), (50, 59), (60, 120)
        ]

        // ── Male Standards ──────────────────────────────────────────────────

        // Bench Press — Male
        let benchMale: [(Double, Double, Double, Double, Double, Double)] = [
            // p10,  p25,  p50,  p75,  p90,  p95
            (0.55, 0.75, 1.00, 1.25, 1.50, 1.65),  // 18-29
            (0.50, 0.72, 0.95, 1.20, 1.40, 1.55),  // 30-39
            (0.50, 0.70, 0.90, 1.10, 1.30, 1.50),  // 40-49
            (0.45, 0.60, 0.80, 1.00, 1.20, 1.35),  // 50-59
            (0.35, 0.50, 0.65, 0.85, 1.05, 1.20),  // 60+
        ]
        for (i, bracket) in ageBrackets.enumerated() {
            let d = benchMale[i]
            standards.append(StrengthStandard(exerciseId: "bench_press", sex: "Male", ageMin: bracket.0, ageMax: bracket.1, p10: d.0, p25: d.1, p50: d.2, p75: d.3, p90: d.4, p95: d.5))
        }

        // OHP — Male
        let ohpMale: [(Double, Double, Double, Double, Double, Double)] = [
            (0.35, 0.45, 0.60, 0.80, 0.95, 1.05),
            (0.32, 0.42, 0.58, 0.75, 0.90, 1.00),
            (0.30, 0.40, 0.55, 0.70, 0.85, 0.95),
            (0.25, 0.35, 0.48, 0.62, 0.75, 0.85),
            (0.20, 0.28, 0.40, 0.52, 0.65, 0.75),
        ]
        for (i, bracket) in ageBrackets.enumerated() {
            let d = ohpMale[i]
            standards.append(StrengthStandard(exerciseId: "ohp", sex: "Male", ageMin: bracket.0, ageMax: bracket.1, p10: d.0, p25: d.1, p50: d.2, p75: d.3, p90: d.4, p95: d.5))
        }

        // Barbell Row — Male
        let rowMale: [(Double, Double, Double, Double, Double, Double)] = [
            (0.45, 0.60, 0.80, 1.00, 1.20, 1.35),
            (0.42, 0.58, 0.75, 0.95, 1.15, 1.28),
            (0.40, 0.55, 0.72, 0.90, 1.10, 1.22),
            (0.35, 0.48, 0.65, 0.82, 0.98, 1.10),
            (0.28, 0.40, 0.55, 0.70, 0.85, 0.95),
        ]
        for (i, bracket) in ageBrackets.enumerated() {
            let d = rowMale[i]
            standards.append(StrengthStandard(exerciseId: "barbell_row", sex: "Male", ageMin: bracket.0, ageMax: bracket.1, p10: d.0, p25: d.1, p50: d.2, p75: d.3, p90: d.4, p95: d.5))
        }

        // Weighted Pull-up — Male (added weight / bodyweight ratio)
        let wpuMale: [(Double, Double, Double, Double, Double, Double)] = [
            (0.00, 0.10, 0.25, 0.45, 0.65, 0.80),
            (0.00, 0.08, 0.22, 0.40, 0.58, 0.72),
            (0.00, 0.05, 0.18, 0.35, 0.50, 0.65),
            (0.00, 0.00, 0.12, 0.28, 0.42, 0.55),
            (0.00, 0.00, 0.08, 0.20, 0.35, 0.45),
        ]
        for (i, bracket) in ageBrackets.enumerated() {
            let d = wpuMale[i]
            standards.append(StrengthStandard(exerciseId: "weighted_pullup", sex: "Male", ageMin: bracket.0, ageMax: bracket.1, p10: d.0, p25: d.1, p50: d.2, p75: d.3, p90: d.4, p95: d.5))
        }

        // Back Squat — Male
        let squatMale: [(Double, Double, Double, Double, Double, Double)] = [
            (0.65, 0.90, 1.20, 1.50, 1.80, 2.00),
            (0.60, 0.85, 1.15, 1.40, 1.70, 1.90),
            (0.55, 0.78, 1.05, 1.30, 1.55, 1.75),
            (0.48, 0.68, 0.90, 1.12, 1.35, 1.52),
            (0.38, 0.55, 0.75, 0.95, 1.15, 1.30),
        ]
        for (i, bracket) in ageBrackets.enumerated() {
            let d = squatMale[i]
            standards.append(StrengthStandard(exerciseId: "back_squat", sex: "Male", ageMin: bracket.0, ageMax: bracket.1, p10: d.0, p25: d.1, p50: d.2, p75: d.3, p90: d.4, p95: d.5))
        }

        // Front Squat — Male
        let fsquatMale: [(Double, Double, Double, Double, Double, Double)] = [
            (0.50, 0.70, 0.95, 1.20, 1.45, 1.60),
            (0.48, 0.68, 0.90, 1.12, 1.38, 1.52),
            (0.45, 0.62, 0.85, 1.05, 1.28, 1.42),
            (0.38, 0.55, 0.72, 0.90, 1.10, 1.25),
            (0.30, 0.45, 0.60, 0.78, 0.95, 1.08),
        ]
        for (i, bracket) in ageBrackets.enumerated() {
            let d = fsquatMale[i]
            standards.append(StrengthStandard(exerciseId: "front_squat", sex: "Male", ageMin: bracket.0, ageMax: bracket.1, p10: d.0, p25: d.1, p50: d.2, p75: d.3, p90: d.4, p95: d.5))
        }

        // Deadlift — Male
        let dlMale: [(Double, Double, Double, Double, Double, Double)] = [
            (0.75, 1.00, 1.35, 1.70, 2.05, 2.30),
            (0.70, 0.95, 1.28, 1.60, 1.95, 2.18),
            (0.65, 0.88, 1.18, 1.48, 1.80, 2.00),
            (0.55, 0.75, 1.00, 1.30, 1.58, 1.75),
            (0.45, 0.62, 0.85, 1.10, 1.35, 1.50),
        ]
        for (i, bracket) in ageBrackets.enumerated() {
            let d = dlMale[i]
            standards.append(StrengthStandard(exerciseId: "deadlift", sex: "Male", ageMin: bracket.0, ageMax: bracket.1, p10: d.0, p25: d.1, p50: d.2, p75: d.3, p90: d.4, p95: d.5))
        }

        // RDL — Male
        let rdlMale: [(Double, Double, Double, Double, Double, Double)] = [
            (0.55, 0.72, 0.95, 1.20, 1.45, 1.60),
            (0.50, 0.68, 0.90, 1.12, 1.38, 1.52),
            (0.48, 0.62, 0.82, 1.05, 1.28, 1.42),
            (0.40, 0.55, 0.72, 0.92, 1.12, 1.25),
            (0.32, 0.45, 0.60, 0.78, 0.95, 1.08),
        ]
        for (i, bracket) in ageBrackets.enumerated() {
            let d = rdlMale[i]
            standards.append(StrengthStandard(exerciseId: "rdl", sex: "Male", ageMin: bracket.0, ageMax: bracket.1, p10: d.0, p25: d.1, p50: d.2, p75: d.3, p90: d.4, p95: d.5))
        }

        // Farmer Carry — Male (per-hand weight / bodyweight)
        let fcMale: [(Double, Double, Double, Double, Double, Double)] = [
            (0.30, 0.45, 0.60, 0.80, 1.00, 1.15),
            (0.28, 0.42, 0.58, 0.75, 0.95, 1.08),
            (0.25, 0.38, 0.52, 0.70, 0.88, 1.00),
            (0.22, 0.32, 0.45, 0.60, 0.75, 0.88),
            (0.18, 0.25, 0.38, 0.50, 0.65, 0.75),
        ]
        for (i, bracket) in ageBrackets.enumerated() {
            let d = fcMale[i]
            standards.append(StrengthStandard(exerciseId: "farmer_carry", sex: "Male", ageMin: bracket.0, ageMax: bracket.1, p10: d.0, p25: d.1, p50: d.2, p75: d.3, p90: d.4, p95: d.5))
        }

        // Trap Bar Deadlift — Male (slightly higher than conventional)
        let tbdMale: [(Double, Double, Double, Double, Double, Double)] = [
            (0.80, 1.05, 1.40, 1.78, 2.15, 2.40),
            (0.75, 1.00, 1.35, 1.68, 2.02, 2.28),
            (0.70, 0.92, 1.25, 1.55, 1.88, 2.10),
            (0.58, 0.80, 1.05, 1.35, 1.65, 1.85),
            (0.48, 0.65, 0.90, 1.15, 1.42, 1.58),
        ]
        for (i, bracket) in ageBrackets.enumerated() {
            let d = tbdMale[i]
            standards.append(StrengthStandard(exerciseId: "trap_bar_deadlift", sex: "Male", ageMin: bracket.0, ageMax: bracket.1, p10: d.0, p25: d.1, p50: d.2, p75: d.3, p90: d.4, p95: d.5))
        }

        // ── Female Standards ────────────────────────────────────────────────

        // Bench Press — Female
        let benchFemale: [(Double, Double, Double, Double, Double, Double)] = [
            (0.25, 0.40, 0.55, 0.75, 0.95, 1.10),
            (0.22, 0.38, 0.52, 0.70, 0.88, 1.02),
            (0.20, 0.35, 0.48, 0.65, 0.82, 0.95),
            (0.18, 0.30, 0.42, 0.58, 0.72, 0.85),
            (0.15, 0.25, 0.35, 0.48, 0.62, 0.72),
        ]
        for (i, bracket) in ageBrackets.enumerated() {
            let d = benchFemale[i]
            standards.append(StrengthStandard(exerciseId: "bench_press", sex: "Female", ageMin: bracket.0, ageMax: bracket.1, p10: d.0, p25: d.1, p50: d.2, p75: d.3, p90: d.4, p95: d.5))
        }

        // OHP — Female
        let ohpFemale: [(Double, Double, Double, Double, Double, Double)] = [
            (0.18, 0.28, 0.40, 0.55, 0.68, 0.78),
            (0.16, 0.25, 0.38, 0.52, 0.65, 0.72),
            (0.15, 0.22, 0.35, 0.48, 0.60, 0.68),
            (0.12, 0.20, 0.30, 0.42, 0.52, 0.60),
            (0.10, 0.15, 0.25, 0.35, 0.45, 0.52),
        ]
        for (i, bracket) in ageBrackets.enumerated() {
            let d = ohpFemale[i]
            standards.append(StrengthStandard(exerciseId: "ohp", sex: "Female", ageMin: bracket.0, ageMax: bracket.1, p10: d.0, p25: d.1, p50: d.2, p75: d.3, p90: d.4, p95: d.5))
        }

        // Barbell Row — Female
        let rowFemale: [(Double, Double, Double, Double, Double, Double)] = [
            (0.28, 0.40, 0.55, 0.72, 0.88, 1.00),
            (0.25, 0.38, 0.52, 0.68, 0.82, 0.95),
            (0.22, 0.35, 0.48, 0.62, 0.78, 0.88),
            (0.20, 0.30, 0.42, 0.55, 0.68, 0.78),
            (0.15, 0.25, 0.35, 0.48, 0.58, 0.68),
        ]
        for (i, bracket) in ageBrackets.enumerated() {
            let d = rowFemale[i]
            standards.append(StrengthStandard(exerciseId: "barbell_row", sex: "Female", ageMin: bracket.0, ageMax: bracket.1, p10: d.0, p25: d.1, p50: d.2, p75: d.3, p90: d.4, p95: d.5))
        }

        // Weighted Pull-up — Female
        let wpuFemale: [(Double, Double, Double, Double, Double, Double)] = [
            (0.00, 0.00, 0.08, 0.20, 0.35, 0.48),
            (0.00, 0.00, 0.05, 0.18, 0.30, 0.42),
            (0.00, 0.00, 0.03, 0.15, 0.25, 0.35),
            (0.00, 0.00, 0.00, 0.10, 0.20, 0.28),
            (0.00, 0.00, 0.00, 0.05, 0.15, 0.22),
        ]
        for (i, bracket) in ageBrackets.enumerated() {
            let d = wpuFemale[i]
            standards.append(StrengthStandard(exerciseId: "weighted_pullup", sex: "Female", ageMin: bracket.0, ageMax: bracket.1, p10: d.0, p25: d.1, p50: d.2, p75: d.3, p90: d.4, p95: d.5))
        }

        // Back Squat — Female
        let squatFemale: [(Double, Double, Double, Double, Double, Double)] = [
            (0.45, 0.65, 0.90, 1.15, 1.40, 1.58),
            (0.42, 0.60, 0.85, 1.08, 1.32, 1.48),
            (0.38, 0.55, 0.78, 1.00, 1.22, 1.38),
            (0.32, 0.48, 0.68, 0.88, 1.08, 1.22),
            (0.25, 0.38, 0.55, 0.72, 0.90, 1.05),
        ]
        for (i, bracket) in ageBrackets.enumerated() {
            let d = squatFemale[i]
            standards.append(StrengthStandard(exerciseId: "back_squat", sex: "Female", ageMin: bracket.0, ageMax: bracket.1, p10: d.0, p25: d.1, p50: d.2, p75: d.3, p90: d.4, p95: d.5))
        }

        // Front Squat — Female
        let fsquatFemale: [(Double, Double, Double, Double, Double, Double)] = [
            (0.35, 0.52, 0.72, 0.95, 1.15, 1.30),
            (0.32, 0.48, 0.68, 0.88, 1.08, 1.22),
            (0.28, 0.45, 0.62, 0.82, 1.00, 1.15),
            (0.25, 0.38, 0.55, 0.72, 0.88, 1.00),
            (0.20, 0.32, 0.45, 0.60, 0.75, 0.88),
        ]
        for (i, bracket) in ageBrackets.enumerated() {
            let d = fsquatFemale[i]
            standards.append(StrengthStandard(exerciseId: "front_squat", sex: "Female", ageMin: bracket.0, ageMax: bracket.1, p10: d.0, p25: d.1, p50: d.2, p75: d.3, p90: d.4, p95: d.5))
        }

        // Deadlift — Female
        let dlFemale: [(Double, Double, Double, Double, Double, Double)] = [
            (0.55, 0.78, 1.05, 1.35, 1.65, 1.85),
            (0.50, 0.72, 1.00, 1.28, 1.55, 1.75),
            (0.45, 0.65, 0.90, 1.18, 1.42, 1.62),
            (0.38, 0.55, 0.78, 1.02, 1.25, 1.42),
            (0.30, 0.45, 0.65, 0.85, 1.05, 1.22),
        ]
        for (i, bracket) in ageBrackets.enumerated() {
            let d = dlFemale[i]
            standards.append(StrengthStandard(exerciseId: "deadlift", sex: "Female", ageMin: bracket.0, ageMax: bracket.1, p10: d.0, p25: d.1, p50: d.2, p75: d.3, p90: d.4, p95: d.5))
        }

        // RDL — Female
        let rdlFemale: [(Double, Double, Double, Double, Double, Double)] = [
            (0.38, 0.55, 0.75, 0.95, 1.18, 1.32),
            (0.35, 0.50, 0.70, 0.90, 1.10, 1.25),
            (0.32, 0.45, 0.65, 0.82, 1.02, 1.15),
            (0.28, 0.40, 0.55, 0.72, 0.88, 1.02),
            (0.22, 0.32, 0.45, 0.60, 0.75, 0.88),
        ]
        for (i, bracket) in ageBrackets.enumerated() {
            let d = rdlFemale[i]
            standards.append(StrengthStandard(exerciseId: "rdl", sex: "Female", ageMin: bracket.0, ageMax: bracket.1, p10: d.0, p25: d.1, p50: d.2, p75: d.3, p90: d.4, p95: d.5))
        }

        // Farmer Carry — Female
        let fcFemale: [(Double, Double, Double, Double, Double, Double)] = [
            (0.20, 0.32, 0.45, 0.60, 0.78, 0.90),
            (0.18, 0.28, 0.42, 0.55, 0.72, 0.85),
            (0.15, 0.25, 0.38, 0.50, 0.65, 0.78),
            (0.12, 0.22, 0.32, 0.45, 0.58, 0.68),
            (0.10, 0.18, 0.28, 0.38, 0.48, 0.58),
        ]
        for (i, bracket) in ageBrackets.enumerated() {
            let d = fcFemale[i]
            standards.append(StrengthStandard(exerciseId: "farmer_carry", sex: "Female", ageMin: bracket.0, ageMax: bracket.1, p10: d.0, p25: d.1, p50: d.2, p75: d.3, p90: d.4, p95: d.5))
        }

        // Trap Bar Deadlift — Female
        let tbdFemale: [(Double, Double, Double, Double, Double, Double)] = [
            (0.58, 0.82, 1.10, 1.42, 1.72, 1.95),
            (0.52, 0.75, 1.05, 1.35, 1.62, 1.82),
            (0.48, 0.68, 0.95, 1.25, 1.50, 1.70),
            (0.40, 0.58, 0.82, 1.08, 1.32, 1.50),
            (0.32, 0.48, 0.68, 0.90, 1.10, 1.28),
        ]
        for (i, bracket) in ageBrackets.enumerated() {
            let d = tbdFemale[i]
            standards.append(StrengthStandard(exerciseId: "trap_bar_deadlift", sex: "Female", ageMin: bracket.0, ageMax: bracket.1, p10: d.0, p25: d.1, p50: d.2, p75: d.3, p90: d.4, p95: d.5))
        }

        return standards
    }()
}
