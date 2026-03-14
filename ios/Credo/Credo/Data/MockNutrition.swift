#if DEBUG
import Foundation

struct MockNutrition {

    static let today = Date()

    static let entries: [NutritionEntry] = [
        NutritionEntry(
            name: "Protein Oatmeal",
            calories: 340,
            proteinG: 30,
            carbsG: 38,
            fatG: 7,
            mealType: .breakfast,
            date: today,
            servingSize: "1 bowl",
            servingCount: 1.0
        ),
        NutritionEntry(
            name: "Black Coffee",
            calories: 2,
            proteinG: 0.3,
            carbsG: 0,
            fatG: 0,
            mealType: .breakfast,
            date: today,
            servingSize: "8 oz",
            servingCount: 2.0
        ),
        NutritionEntry(
            name: "Chicken & Rice Bowl",
            calories: 450,
            proteinG: 40,
            carbsG: 50,
            fatG: 8,
            mealType: .lunch,
            date: today,
            servingSize: "1 bowl",
            servingCount: 1.0
        ),
        NutritionEntry(
            name: "Greek Yogurt (nonfat)",
            calories: 100,
            proteinG: 17,
            carbsG: 6,
            fatG: 0.7,
            mealType: .snack,
            date: today,
            servingSize: "3/4 cup",
            servingCount: 1.0
        ),
        NutritionEntry(
            name: "Almonds",
            calories: 164,
            proteinG: 6,
            carbsG: 6,
            fatG: 14,
            mealType: .snack,
            date: today,
            servingSize: "1 oz",
            servingCount: 1.0
        ),
        NutritionEntry(
            name: "Salmon & Roasted Veggies",
            calories: 380,
            proteinG: 30,
            carbsG: 18,
            fatG: 20,
            mealType: .dinner,
            date: today,
            servingSize: "1 plate",
            servingCount: 1.0
        ),
        NutritionEntry(
            name: "Brown Rice",
            calories: 216,
            proteinG: 5,
            carbsG: 45,
            fatG: 1.8,
            mealType: .dinner,
            date: today,
            servingSize: "1 cup",
            servingCount: 1.0
        ),
    ]

    // A week of entries for chart previews
    static var weekEntries: [NutritionEntry] {
        let calendar = Calendar.current
        var allEntries: [NutritionEntry] = []

        let dailyMeals: [(String, Int, Double, Double, Double, MealType)] = [
            ("Oats & Whey", 340, 30, 38, 7, .breakfast),
            ("Chicken & Rice", 450, 40, 50, 8, .lunch),
            ("Almonds", 164, 6, 6, 14, .snack),
            ("Steak & Potato", 520, 38, 42, 18, .dinner),
        ]

        for dayOffset in 0..<7 {
            guard let date = calendar.date(byAdding: .day, value: -dayOffset, to: today) else { continue }
            for meal in dailyMeals {
                let variance = Double.random(in: 0.85...1.15)
                allEntries.append(NutritionEntry(
                    name: meal.0,
                    calories: Int(Double(meal.1) * variance),
                    proteinG: meal.2 * variance,
                    carbsG: meal.3 * variance,
                    fatG: meal.4 * variance,
                    mealType: meal.5,
                    date: date,
                    servingSize: "1 serving",
                    servingCount: 1.0
                ))
            }
        }

        return allEntries
    }
}

#endif
