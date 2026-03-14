import Foundation

struct FoodItem: Codable, Identifiable {
    let id: String
    var name: String
    var brand: String?
    var caloriesPerServing: Int
    var proteinPerServing: Double
    var carbsPerServing: Double
    var fatPerServing: Double
    var servingSize: String
    var servingSizeG: Double

    /// Convert to a NutritionEntry for a given meal type and serving count
    func toEntry(mealType: MealType, servingCount: Double = 1.0, date: Date = Date()) -> NutritionEntry {
        NutritionEntry(
            name: name,
            calories: caloriesPerServing,
            proteinG: proteinPerServing,
            carbsG: carbsPerServing,
            fatG: fatPerServing,
            mealType: mealType,
            date: date,
            servingSize: servingSize,
            servingCount: servingCount
        )
    }

    /// Formatted macro summary string
    var macroSummary: String {
        let p = Int(proteinPerServing)
        let c = Int(carbsPerServing)
        let f = Int(fatPerServing)
        return "\(p)P / \(c)C / \(f)F"
    }
}
