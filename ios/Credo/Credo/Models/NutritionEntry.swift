import Foundation

enum MealType: String, Codable, CaseIterable, Identifiable {
    case breakfast
    case lunch
    case dinner
    case snack

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .breakfast: return "Breakfast"
        case .lunch: return "Lunch"
        case .dinner: return "Dinner"
        case .snack: return "Snack"
        }
    }

    var icon: String {
        switch self {
        case .breakfast: return "sunrise.fill"
        case .lunch: return "sun.max.fill"
        case .dinner: return "moon.fill"
        case .snack: return "leaf.fill"
        }
    }

    var sortOrder: Int {
        switch self {
        case .breakfast: return 0
        case .lunch: return 1
        case .dinner: return 2
        case .snack: return 3
        }
    }
}

struct NutritionEntry: Codable, Identifiable {
    let id: UUID
    var name: String
    var calories: Int
    var proteinG: Double
    var carbsG: Double
    var fatG: Double
    var mealType: MealType
    var date: Date
    var servingSize: String?
    var servingCount: Double

    init(
        id: UUID = UUID(),
        name: String,
        calories: Int,
        proteinG: Double,
        carbsG: Double,
        fatG: Double,
        mealType: MealType,
        date: Date = Date(),
        servingSize: String? = nil,
        servingCount: Double = 1.0
    ) {
        self.id = id
        self.name = name
        self.calories = calories
        self.proteinG = proteinG
        self.carbsG = carbsG
        self.fatG = fatG
        self.mealType = mealType
        self.date = date
        self.servingSize = servingSize
        self.servingCount = servingCount
    }

    /// Total macros scaled by serving count
    var totalCalories: Int { Int(Double(calories) * servingCount) }
    var totalProtein: Double { proteinG * servingCount }
    var totalCarbs: Double { carbsG * servingCount }
    var totalFat: Double { fatG * servingCount }
}
