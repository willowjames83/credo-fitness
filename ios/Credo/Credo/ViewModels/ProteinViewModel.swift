import SwiftUI

@Observable
class ProteinViewModel {
    var current: Int = mockProteinToday.amount
    let target: Int = mockProteinToday.target
    var weekData = mockProteinWeek
    let savedMeals = mockSavedMeals

    func addGrams(_ grams: Int) {
        current += grams
        if let todayIndex = weekData.firstIndex(where: { $0.isToday }) {
            var updated = weekData[todayIndex]
            updated = ProteinDay(
                day: updated.day,
                amount: updated.amount + grams,
                target: updated.target,
                hit: (updated.amount + grams) >= updated.target,
                isToday: true
            )
            weekData[todayIndex] = updated
        }
    }

    func addMeal(_ meal: SavedMeal) {
        addGrams(meal.grams)
    }

    var progress: Double {
        guard target > 0 else { return 0 }
        return Double(current) / Double(target)
    }
}
