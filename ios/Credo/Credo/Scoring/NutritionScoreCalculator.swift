import Foundation

struct NutritionScoreCalculator {

    /// Calculates a nutrition score from 0-100.
    /// - Protein adherence (40%): How close daily protein is to target over 7 days.
    /// - Calorie consistency (30%): How close daily calories are to target over 7 days.
    /// - Logging consistency (30%): Number of days logged out of last 7.
    static func calculate(store: NutritionStore, profile: UserProfile? = nil) -> Int {
        let target = DailyNutritionTarget.forProfile(profile)
        let calendar = Calendar.current

        var proteinScores: [Double] = []
        var calorieScores: [Double] = []
        var daysLogged = 0

        for dayOffset in 0..<7 {
            guard let date = calendar.date(byAdding: .day, value: -dayOffset, to: Date()) else { continue }
            let dayEntries = store.entriesForDate(date)

            if !dayEntries.isEmpty {
                daysLogged += 1
                let macros = store.macrosForDate(date)

                // Protein adherence: 100% when at or above target, scales linearly below
                let proteinRatio = target.proteinTargetG > 0
                    ? min(macros.p / target.proteinTargetG, 1.3)
                    : 1.0
                // Penalize going over 130% slightly, but reward hitting target
                let proteinScore: Double
                if proteinRatio >= 0.9 && proteinRatio <= 1.1 {
                    proteinScore = 100.0
                } else if proteinRatio > 1.1 {
                    proteinScore = max(100.0 - (proteinRatio - 1.1) * 200.0, 60.0)
                } else {
                    proteinScore = (proteinRatio / 0.9) * 100.0
                }
                proteinScores.append(proteinScore)

                // Calorie consistency: 100% when within 10% of target, degrades outside
                let calorieRatio = target.calorieTarget > 0
                    ? Double(macros.cal) / Double(target.calorieTarget)
                    : 1.0
                let calorieDeviation = abs(calorieRatio - 1.0)
                let calorieScore: Double
                if calorieDeviation <= 0.10 {
                    calorieScore = 100.0
                } else if calorieDeviation <= 0.25 {
                    calorieScore = 100.0 - ((calorieDeviation - 0.10) / 0.15) * 40.0
                } else {
                    calorieScore = max(60.0 - ((calorieDeviation - 0.25) / 0.25) * 40.0, 20.0)
                }
                calorieScores.append(calorieScore)
            }
        }

        // Protein adherence subscore (40%)
        let avgProtein = proteinScores.isEmpty ? 0.0 : proteinScores.reduce(0, +) / Double(proteinScores.count)

        // Calorie consistency subscore (30%)
        let avgCalorie = calorieScores.isEmpty ? 0.0 : calorieScores.reduce(0, +) / Double(calorieScores.count)

        // Logging consistency subscore (30%): reward logging every day
        let loggingScore: Double
        switch daysLogged {
        case 7: loggingScore = 100.0
        case 6: loggingScore = 90.0
        case 5: loggingScore = 80.0
        case 4: loggingScore = 65.0
        case 3: loggingScore = 50.0
        case 2: loggingScore = 35.0
        case 1: loggingScore = 20.0
        default: loggingScore = 0.0
        }

        let score = avgProtein * 0.40 + avgCalorie * 0.30 + loggingScore * 0.30
        return min(max(Int(round(score)), 0), 100)
    }
}
