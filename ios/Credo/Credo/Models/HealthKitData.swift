import Foundation

// MARK: - Health Snapshot

struct HealthSnapshot: Codable {
    let latestWeight: Double?       // lbs
    let restingHeartRate: Int?      // bpm
    let todaySteps: Int?
    let lastNightSleepHours: Double?
    let weeklyActiveMinutes: Int?
}

// MARK: - HealthKit Cardio Workout

enum CardioWorkoutType: String, Codable {
    case running
    case cycling
    case rowing
}

struct HealthKitCardioWorkout: Codable, Identifiable {
    var id: String { "\(type.rawValue)-\(date.timeIntervalSince1970)" }

    let type: CardioWorkoutType
    let distanceMeters: Double?
    let durationSeconds: TimeInterval
    let avgHeartRate: Int?
    let caloriesBurned: Double?
    let date: Date

    // MARK: - Formatted Helpers

    var formattedDuration: String {
        let minutes = Int(durationSeconds) / 60
        let seconds = Int(durationSeconds) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }

    var formattedDistance: String? {
        guard let meters = distanceMeters else { return nil }
        let miles = meters / 1609.34
        return String(format: "%.1f mi", miles)
    }
}
