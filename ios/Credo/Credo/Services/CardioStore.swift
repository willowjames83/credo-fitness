import Foundation

@Observable
class CardioStore {
    static let shared = CardioStore()

    var cardioSessions: [CardioSession] = []

    private let sessionsKey = "credo_cardio_sessions"

    init() {
        load()
    }

    // MARK: - Persistence

    func save() {
        let defaults = UserDefaults.standard
        if let data = try? JSONEncoder().encode(cardioSessions) {
            defaults.set(data, forKey: sessionsKey)
        }
    }

    private func load() {
        let defaults = UserDefaults.standard
        if let data = defaults.data(forKey: sessionsKey),
           let decoded = try? JSONDecoder().decode([CardioSession].self, from: data) {
            cardioSessions = decoded
        }
    }

    // MARK: - CRUD

    func addSession(_ session: CardioSession) {
        cardioSessions.append(session)
        save()
    }

    func deleteSession(_ session: CardioSession) {
        cardioSessions.removeAll { $0.id == session.id }
        save()
    }

    func deleteSession(at offsets: IndexSet, from sessions: [CardioSession]) {
        for index in offsets {
            let session = sessions[index]
            cardioSessions.removeAll { $0.id == session.id }
        }
        save()
    }

    // MARK: - Queries

    func sessionsThisWeek() -> [CardioSession] {
        let calendar = Calendar.current
        let startOfWeek = calendar.dateInterval(of: .weekOfYear, for: Date())?.start ?? Date()
        return cardioSessions.filter { $0.date >= startOfWeek }
    }

    func weeklyCardioMinutes() -> Int {
        sessionsThisWeek().reduce(0) { $0 + $1.durationMinutes }
    }

    func averageSessionDuration() -> Int {
        let weekly = sessionsThisWeek()
        guard !weekly.isEmpty else { return 0 }
        let totalSeconds = weekly.reduce(0) { $0 + $1.durationSeconds }
        return (totalSeconds / weekly.count) / 60
    }

    func sessionsForWeek(containing date: Date) -> [CardioSession] {
        let calendar = Calendar.current
        guard let weekInterval = calendar.dateInterval(of: .weekOfYear, for: date) else { return [] }
        return cardioSessions.filter { $0.date >= weekInterval.start && $0.date < weekInterval.end }
    }

    func weeklyZone2PlusMinutes() -> Int {
        sessionsThisWeek().reduce(0) { $0 + $1.zone2PlusSeconds } / 60
    }

    func sessionsGroupedByWeek() -> [(String, [CardioSession])] {
        let calendar = Calendar.current
        let formatter = DateFormatter()
        formatter.dateFormat = "'Week of' MMM d"

        let sorted = cardioSessions.sorted { $0.date > $1.date }
        let grouped = Dictionary(grouping: sorted) { session -> Date in
            calendar.dateInterval(of: .weekOfYear, for: session.date)?.start ?? session.date
        }

        return grouped.sorted { $0.key > $1.key }.map { (weekStart, sessions) in
            (formatter.string(from: weekStart), sessions.sorted { $0.date > $1.date })
        }
    }

    /// Returns session count per week for the last `weeks` weeks.
    func weeklySessionCounts(weeks: Int = 4) -> [Int] {
        let calendar = Calendar.current
        var counts: [Int] = []
        for weeksAgo in (0..<weeks).reversed() {
            guard let weekStart = calendar.date(byAdding: .weekOfYear, value: -weeksAgo, to: Date()),
                  let interval = calendar.dateInterval(of: .weekOfYear, for: weekStart) else {
                counts.append(0)
                continue
            }
            let count = cardioSessions.filter { $0.date >= interval.start && $0.date < interval.end }.count
            counts.append(count)
        }
        return counts
    }
}
