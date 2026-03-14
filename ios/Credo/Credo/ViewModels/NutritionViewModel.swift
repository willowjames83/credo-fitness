import Foundation

@Observable
class NutritionViewModel {

    var selectedDate: Date = Date()
    var showingAddFood = false
    var showingWeeklyView = false

    private let store = NutritionStore.shared
    private let workoutStore = WorkoutStore.shared

    // MARK: - Target

    var dailyTarget: DailyNutritionTarget {
        DailyNutritionTarget.forProfile(workoutStore.userProfile)
    }

    // MARK: - Today's Entries

    var todaysEntries: [NutritionEntry] {
        store.entriesForDate(selectedDate)
    }

    var entriesByMealType: [(MealType, [NutritionEntry])] {
        let grouped = Dictionary(grouping: todaysEntries) { $0.mealType }
        return MealType.allCases
            .filter { grouped[$0] != nil && !(grouped[$0]?.isEmpty ?? true) }
            .map { ($0, grouped[$0] ?? []) }
            .sorted { $0.0.sortOrder < $1.0.sortOrder }
    }

    // MARK: - Macro Totals

    var macroTotals: (cal: Int, p: Double, c: Double, f: Double) {
        store.macrosForDate(selectedDate)
    }

    var caloriesConsumed: Int { macroTotals.cal }
    var proteinConsumed: Double { macroTotals.p }
    var carbsConsumed: Double { macroTotals.c }
    var fatConsumed: Double { macroTotals.f }

    var caloriesRemaining: Int {
        max(dailyTarget.calorieTarget - caloriesConsumed, 0)
    }

    // MARK: - Progress (0.0 - 1.0)

    var calorieProgress: Double {
        guard dailyTarget.calorieTarget > 0 else { return 0 }
        return min(Double(caloriesConsumed) / Double(dailyTarget.calorieTarget), 1.0)
    }

    var proteinProgress: Double {
        guard dailyTarget.proteinTargetG > 0 else { return 0 }
        return min(proteinConsumed / dailyTarget.proteinTargetG, 1.0)
    }

    var carbProgress: Double {
        guard dailyTarget.carbTargetG > 0 else { return 0 }
        return min(carbsConsumed / dailyTarget.carbTargetG, 1.0)
    }

    var fatProgress: Double {
        guard dailyTarget.fatTargetG > 0 else { return 0 }
        return min(fatConsumed / dailyTarget.fatTargetG, 1.0)
    }

    // MARK: - Actions

    func addEntry(_ entry: NutritionEntry) {
        store.addEntry(entry)
    }

    func deleteEntry(_ entry: NutritionEntry) {
        store.deleteEntry(entry)
    }

    func deleteEntries(at offsets: IndexSet, from mealEntries: [NutritionEntry]) {
        store.deleteEntry(at: offsets, from: mealEntries)
    }

    func saveMealAsTemplate(name: String, mealType: MealType) {
        let mealEntries = todaysEntries.filter { $0.mealType == mealType }
        guard !mealEntries.isEmpty else { return }
        store.saveMealTemplate(name: name, entries: mealEntries)
    }

    // MARK: - Date Navigation

    var isToday: Bool {
        Calendar.current.isDateInToday(selectedDate)
    }

    func goToPreviousDay() {
        if let prev = Calendar.current.date(byAdding: .day, value: -1, to: selectedDate) {
            selectedDate = prev
        }
    }

    func goToNextDay() {
        if let next = Calendar.current.date(byAdding: .day, value: 1, to: selectedDate) {
            if next <= Date() {
                selectedDate = next
            }
        }
    }

    func goToToday() {
        selectedDate = Date()
    }

    var formattedDate: String {
        if isToday { return "Today" }
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE, MMM d"
        return formatter.string(from: selectedDate)
    }

    // MARK: - Weekly

    var last7DaysMacros: [(date: Date, cal: Int, p: Double, c: Double, f: Double)] {
        store.last7DaysMacros()
    }
}
