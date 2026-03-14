import Foundation

struct ProteinDay: Identifiable {
    let id = UUID()
    let day: String
    let amount: Int
    let target: Int
    var hit: Bool
    var isToday: Bool = false
}

struct SavedMeal: Identifiable {
    let id = UUID()
    let name: String
    let grams: Int
}
