import Foundation

@Observable
class StabilityStore {
    static let shared = StabilityStore()

    private let warmupsKey = "credo_stability_warmups"
    private let mobilityKey = "credo_stability_mobility"

    /// Dates of workouts where warmup sets were completed.
    var warmupCompletionDates: [Date] = []

    /// Logged mobility sessions (stretching, foam rolling, yoga, etc.).
    var mobilitySessions: [MobilitySession] = []

    init() {
        load()
    }

    // MARK: - Warmup Tracking

    /// Record that warmup sets were completed for today's workout.
    func logWarmupCompletion() {
        warmupCompletionDates.append(Date())
        save()
    }

    /// Number of workouts with warmup in last N days.
    func warmupsCompleted(inLastDays days: Int = 14) -> Int {
        let cutoff = Calendar.current.date(byAdding: .day, value: -days, to: Date()) ?? Date()
        return warmupCompletionDates.filter { $0 >= cutoff }.count
    }

    // MARK: - Mobility Tracking

    func addMobilitySession(_ session: MobilitySession) {
        mobilitySessions.append(session)
        save()
    }

    func mobilitySessionsThisWeek() -> [MobilitySession] {
        guard let weekStart = Calendar.current.dateInterval(of: .weekOfYear, for: Date())?.start else {
            return []
        }
        return mobilitySessions.filter { $0.date >= weekStart }
    }

    func weeklyMobilityMinutes() -> Int {
        mobilitySessionsThisWeek().reduce(0) { $0 + $1.durationMinutes }
    }

    // MARK: - Persistence

    private func save() {
        let defaults = UserDefaults.standard
        if let data = try? JSONEncoder().encode(warmupCompletionDates) {
            defaults.set(data, forKey: warmupsKey)
        }
        if let data = try? JSONEncoder().encode(mobilitySessions) {
            defaults.set(data, forKey: mobilityKey)
        }
    }

    private func load() {
        let defaults = UserDefaults.standard
        if let data = defaults.data(forKey: warmupsKey),
           let dates = try? JSONDecoder().decode([Date].self, from: data) {
            warmupCompletionDates = dates
        }
        if let data = defaults.data(forKey: mobilityKey),
           let sessions = try? JSONDecoder().decode([MobilitySession].self, from: data) {
            mobilitySessions = sessions
        }
    }
}
