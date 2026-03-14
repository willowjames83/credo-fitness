import Foundation

@Observable
class NutritionStore {
    static let shared = NutritionStore()

    var entries: [NutritionEntry] = []
    var customFoods: [FoodItem] = []
    var savedMeals: [[NutritionEntry]] = []

    private let entriesKey = "credo_nutrition_entries"
    private let customFoodsKey = "credo_nutrition_customFoods"
    private let savedMealsKey = "credo_nutrition_savedMeals"

    init() {
        load()
    }

    // MARK: - Persistence

    func save() {
        let defaults = UserDefaults.standard
        let encoder = JSONEncoder()

        if let data = try? encoder.encode(entries) {
            defaults.set(data, forKey: entriesKey)
        }
        if let data = try? encoder.encode(customFoods) {
            defaults.set(data, forKey: customFoodsKey)
        }
        if let data = try? encoder.encode(savedMeals) {
            defaults.set(data, forKey: savedMealsKey)
        }
    }

    private func load() {
        let defaults = UserDefaults.standard
        let decoder = JSONDecoder()

        if let data = defaults.data(forKey: entriesKey),
           let decoded = try? decoder.decode([NutritionEntry].self, from: data) {
            entries = decoded
        }
        if let data = defaults.data(forKey: customFoodsKey),
           let decoded = try? decoder.decode([FoodItem].self, from: data) {
            customFoods = decoded
        }
        if let data = defaults.data(forKey: savedMealsKey),
           let decoded = try? decoder.decode([[NutritionEntry]].self, from: data) {
            savedMeals = decoded
        }
    }

    // MARK: - Entry Management

    func addEntry(_ entry: NutritionEntry) {
        entries.append(entry)
        save()
    }

    func deleteEntry(_ entry: NutritionEntry) {
        entries.removeAll { $0.id == entry.id }
        save()
    }

    func deleteEntry(at offsets: IndexSet, from mealEntries: [NutritionEntry]) {
        for index in offsets {
            let entry = mealEntries[index]
            entries.removeAll { $0.id == entry.id }
        }
        save()
    }

    // MARK: - Queries

    func todaysEntries() -> [NutritionEntry] {
        entriesForDate(Date())
    }

    func entriesForDate(_ date: Date) -> [NutritionEntry] {
        let calendar = Calendar.current
        return entries.filter { calendar.isDate($0.date, inSameDayAs: date) }
    }

    func todaysMacros() -> (cal: Int, p: Double, c: Double, f: Double) {
        macrosForEntries(todaysEntries())
    }

    func macrosForDate(_ date: Date) -> (cal: Int, p: Double, c: Double, f: Double) {
        macrosForEntries(entriesForDate(date))
    }

    private func macrosForEntries(_ entries: [NutritionEntry]) -> (cal: Int, p: Double, c: Double, f: Double) {
        var cal = 0
        var p = 0.0
        var c = 0.0
        var f = 0.0
        for entry in entries {
            cal += entry.totalCalories
            p += entry.totalProtein
            c += entry.totalCarbs
            f += entry.totalFat
        }
        return (cal, p, c, f)
    }

    func weeklyAverageMacros() -> (cal: Int, p: Double, c: Double, f: Double) {
        let calendar = Calendar.current
        guard let weekStart = calendar.dateInterval(of: .weekOfYear, for: Date())?.start else {
            return (0, 0, 0, 0)
        }

        var totalCal = 0
        var totalP = 0.0
        var totalC = 0.0
        var totalF = 0.0
        var daysWithEntries = 0

        for dayOffset in 0..<7 {
            guard let date = calendar.date(byAdding: .day, value: dayOffset, to: weekStart) else { continue }
            if date > Date() { break }
            let dayEntries = entriesForDate(date)
            if !dayEntries.isEmpty {
                let macros = macrosForEntries(dayEntries)
                totalCal += macros.cal
                totalP += macros.p
                totalC += macros.c
                totalF += macros.f
                daysWithEntries += 1
            }
        }

        guard daysWithEntries > 0 else { return (0, 0, 0, 0) }
        return (
            totalCal / daysWithEntries,
            totalP / Double(daysWithEntries),
            totalC / Double(daysWithEntries),
            totalF / Double(daysWithEntries)
        )
    }

    /// Returns daily macro totals for the last 7 days (oldest first)
    func last7DaysMacros() -> [(date: Date, cal: Int, p: Double, c: Double, f: Double)] {
        let calendar = Calendar.current
        var results: [(date: Date, cal: Int, p: Double, c: Double, f: Double)] = []
        for dayOffset in stride(from: 6, through: 0, by: -1) {
            guard let date = calendar.date(byAdding: .day, value: -dayOffset, to: Date()) else { continue }
            let macros = macrosForDate(date)
            results.append((date, macros.cal, macros.p, macros.c, macros.f))
        }
        return results
    }

    // MARK: - Meal Templates

    func saveMealTemplate(name: String, entries: [NutritionEntry]) {
        // Re-ID the entries so templates are independent copies
        let templateEntries = entries.map { entry in
            NutritionEntry(
                name: entry.name,
                calories: entry.calories,
                proteinG: entry.proteinG,
                carbsG: entry.carbsG,
                fatG: entry.fatG,
                mealType: entry.mealType,
                date: Date(),
                servingSize: entry.servingSize,
                servingCount: entry.servingCount
            )
        }
        savedMeals.append(templateEntries)
        save()
    }

    func deleteMealTemplate(at index: Int) {
        guard index >= 0 && index < savedMeals.count else { return }
        savedMeals.remove(at: index)
        save()
    }

    // MARK: - Custom Foods

    func addCustomFood(_ food: FoodItem) {
        customFoods.append(food)
        save()
    }

    // MARK: - Recent Foods

    func recentFoods(limit: Int = 20) -> [FoodItem] {
        // Build unique food items from recent entries
        var seen = Set<String>()
        var recent: [FoodItem] = []
        for entry in entries.sorted(by: { $0.date > $1.date }) {
            let key = entry.name.lowercased()
            guard !seen.contains(key) else { continue }
            seen.insert(key)
            recent.append(FoodItem(
                id: key,
                name: entry.name,
                caloriesPerServing: entry.calories,
                proteinPerServing: entry.proteinG,
                carbsPerServing: entry.carbsG,
                fatPerServing: entry.fatG,
                servingSize: entry.servingSize ?? "1 serving",
                servingSizeG: 0
            ))
            if recent.count >= limit { break }
        }
        return recent
    }

    // MARK: - Days Logged This Week

    func daysLoggedThisWeek() -> Int {
        let calendar = Calendar.current
        guard let weekStart = calendar.dateInterval(of: .weekOfYear, for: Date())?.start else { return 0 }
        var count = 0
        for dayOffset in 0..<7 {
            guard let date = calendar.date(byAdding: .day, value: dayOffset, to: weekStart) else { continue }
            if date > Date() { break }
            if !entriesForDate(date).isEmpty { count += 1 }
        }
        return count
    }
}
