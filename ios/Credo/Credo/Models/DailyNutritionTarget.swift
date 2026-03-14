import Foundation

struct DailyNutritionTarget: Codable {
    var calorieTarget: Int
    var proteinTargetG: Double
    var carbTargetG: Double
    var fatTargetG: Double

    /// Calculates targets based on user profile.
    /// Protein: 1g per lb bodyweight.
    /// Calories: estimated TDEE (weight * 15 baseline), adjusted for goal.
    /// Remaining calories split 50/50 between carbs and fat.
    static func forProfile(_ profile: UserProfile?) -> DailyNutritionTarget {
        guard let profile = profile else {
            return DailyNutritionTarget(
                calorieTarget: 2200,
                proteinTargetG: 150,
                carbTargetG: 220,
                fatTargetG: 73
            )
        }

        let bodyweight = Double(profile.weight)

        // Protein: 1g per lb bodyweight
        let proteinG = bodyweight

        // Base TDEE: bodyweight * 15 (moderate activity)
        var tdee = bodyweight * 15.0

        // Adjust for training goal
        switch profile.trainingGoal {
        case "build_muscle":
            tdee *= 1.10 // 10% surplus
        case "increase_strength":
            tdee *= 1.05 // 5% surplus
        case "longevity":
            tdee *= 0.95 // slight deficit
        default: // general_fitness
            break // maintenance
        }

        let calorieTarget = Int(round(tdee))

        // Calories from protein (4 cal/g)
        let proteinCalories = proteinG * 4.0

        // Remaining calories split 50/50 between carbs and fat
        let remainingCalories = max(tdee - proteinCalories, 0)
        let carbCalories = remainingCalories * 0.5
        let fatCalories = remainingCalories * 0.5

        let carbsG = carbCalories / 4.0 // 4 cal/g
        let fatG = fatCalories / 9.0     // 9 cal/g

        return DailyNutritionTarget(
            calorieTarget: calorieTarget,
            proteinTargetG: round(proteinG),
            carbTargetG: round(carbsG),
            fatTargetG: round(fatG)
        )
    }
}
