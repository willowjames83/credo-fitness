import Foundation

struct HeartRateZone: Codable, Identifiable {
    var id: Int { zone }
    let zone: Int          // 1-5
    let durationSeconds: Int
    let percentOfMax: Double

    var zoneName: String {
        switch zone {
        case 1: return "Recovery"
        case 2: return "Aerobic"
        case 3: return "Tempo"
        case 4: return "Threshold"
        case 5: return "VO2 Max"
        default: return "Zone \(zone)"
        }
    }
}

struct CardioSession: Codable, Identifiable {
    let id: UUID
    let type: CardioType
    let distanceMeters: Double?
    let durationSeconds: Int
    let avgHeartRate: Int?
    let maxHeartRate: Int?
    let caloriesBurned: Int?
    let heartRateZones: [HeartRateZone]?
    let date: Date
    let notes: String?

    init(
        id: UUID = UUID(),
        type: CardioType,
        distanceMeters: Double? = nil,
        durationSeconds: Int,
        avgHeartRate: Int? = nil,
        maxHeartRate: Int? = nil,
        caloriesBurned: Int? = nil,
        heartRateZones: [HeartRateZone]? = nil,
        date: Date = Date(),
        notes: String? = nil
    ) {
        self.id = id
        self.type = type
        self.distanceMeters = distanceMeters
        self.durationSeconds = durationSeconds
        self.avgHeartRate = avgHeartRate
        self.maxHeartRate = maxHeartRate
        self.caloriesBurned = caloriesBurned
        self.heartRateZones = heartRateZones
        self.date = date
        self.notes = notes
    }

    // MARK: - Computed Properties

    var durationMinutes: Int {
        durationSeconds / 60
    }

    var formattedDuration: String {
        let minutes = durationSeconds / 60
        let seconds = durationSeconds % 60
        return String(format: "%d:%02d", minutes, seconds)
    }

    var distanceKilometers: Double? {
        guard let meters = distanceMeters else { return nil }
        return meters / 1000.0
    }

    var distanceMiles: Double? {
        guard let meters = distanceMeters else { return nil }
        return meters / 1609.34
    }

    var pacePerMile: String? {
        guard let miles = distanceMiles, miles > 0 else { return nil }
        let secondsPerMile = Double(durationSeconds) / miles
        let mins = Int(secondsPerMile) / 60
        let secs = Int(secondsPerMile) % 60
        return String(format: "%d:%02d /mi", mins, secs)
    }

    var zone2PlusSeconds: Int {
        guard let zones = heartRateZones else { return 0 }
        return zones.filter { $0.zone >= 2 }.reduce(0) { $0 + $1.durationSeconds }
    }
}
