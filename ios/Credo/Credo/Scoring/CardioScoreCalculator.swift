import Foundation

struct CardioScoreCalculator {

    /// Calculates an overall cardio score (0-100) based on:
    /// - Weekly zone-2+ minutes (target 150 min) — 40% weight
    /// - Session frequency (target 3+/week) — 30% weight
    /// - Consistency over 4 weeks — 30% weight
    static func calculate(store: CardioStore) -> Int {
        let zoneScore = weeklyZoneScore(store: store)
        let frequencyScore = weeklyFrequencyScore(store: store)
        let consistencyScore = fourWeekConsistencyScore(store: store)

        let weighted = Double(zoneScore) * 0.40
            + Double(frequencyScore) * 0.30
            + Double(consistencyScore) * 0.30

        return min(100, max(0, Int(round(weighted))))
    }

    // MARK: - Zone-2+ Minutes Score

    /// Score 0-100 based on weekly zone-2+ minutes.
    /// If no HR zone data, falls back to total session minutes.
    private static func weeklyZoneScore(store: CardioStore) -> Int {
        let zone2Minutes = store.weeklyZone2PlusMinutes()

        // If we have HR zone data, use it
        if zone2Minutes > 0 {
            return scoreFromTarget(current: Double(zone2Minutes), target: 150.0)
        }

        // Fallback: use total weekly minutes as a proxy
        let totalMinutes = store.weeklyCardioMinutes()
        return scoreFromTarget(current: Double(totalMinutes), target: 150.0)
    }

    // MARK: - Frequency Score

    /// Score 0-100 based on sessions this week (target: 3+).
    private static func weeklyFrequencyScore(store: CardioStore) -> Int {
        let sessions = store.sessionsThisWeek().count
        return scoreFromTarget(current: Double(sessions), target: 3.0)
    }

    // MARK: - Consistency Score

    /// Score 0-100 based on how many of the last 4 weeks had at least one session.
    private static func fourWeekConsistencyScore(store: CardioStore) -> Int {
        let weeklyCounts = store.weeklySessionCounts(weeks: 4)
        let weeksWithActivity = weeklyCounts.filter { $0 > 0 }.count
        return scoreFromTarget(current: Double(weeksWithActivity), target: 4.0)
    }

    // MARK: - Helper

    /// Maps current/target ratio to a 0-100 score with diminishing returns above target.
    private static func scoreFromTarget(current: Double, target: Double) -> Int {
        guard target > 0 else { return 0 }
        let ratio = current / target

        if ratio >= 1.0 {
            // Above target: diminishing returns, cap at 100
            let bonus = min((ratio - 1.0) * 10.0, 10.0) // up to +10 for exceeding
            return min(100, Int(round(90.0 + bonus)))
        } else {
            // Below target: linear scale to 90
            return max(0, Int(round(ratio * 90.0)))
        }
    }
}
