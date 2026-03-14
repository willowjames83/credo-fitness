#if DEBUG
import Foundation

enum MockCardio {
    static let sessions: [CardioSession] = [
        CardioSession(
            type: .running,
            distanceMeters: 5120,
            durationSeconds: 1680,
            avgHeartRate: 148,
            maxHeartRate: 172,
            caloriesBurned: 420,
            heartRateZones: [
                HeartRateZone(zone: 1, durationSeconds: 180, percentOfMax: 55),
                HeartRateZone(zone: 2, durationSeconds: 720, percentOfMax: 65),
                HeartRateZone(zone: 3, durationSeconds: 480, percentOfMax: 76),
                HeartRateZone(zone: 4, durationSeconds: 240, percentOfMax: 86),
                HeartRateZone(zone: 5, durationSeconds: 60, percentOfMax: 93),
            ],
            date: Date().addingTimeInterval(-86400),
            notes: "Felt strong on the hills today."
        ),
        CardioSession(
            type: .rowing,
            distanceMeters: 5000,
            durationSeconds: 1200,
            avgHeartRate: 155,
            maxHeartRate: 178,
            caloriesBurned: 310,
            heartRateZones: [
                HeartRateZone(zone: 2, durationSeconds: 300, percentOfMax: 64),
                HeartRateZone(zone: 3, durationSeconds: 540, percentOfMax: 74),
                HeartRateZone(zone: 4, durationSeconds: 300, percentOfMax: 84),
                HeartRateZone(zone: 5, durationSeconds: 60, percentOfMax: 92),
            ],
            date: Date().addingTimeInterval(-172800)
        ),
        CardioSession(
            type: .cycling,
            distanceMeters: 24140,
            durationSeconds: 2700,
            avgHeartRate: 138,
            maxHeartRate: 162,
            caloriesBurned: 520,
            date: Date().addingTimeInterval(-259200),
            notes: "Easy zone 2 ride."
        ),
        CardioSession(
            type: .walking,
            distanceMeters: 4828,
            durationSeconds: 3600,
            caloriesBurned: 220,
            date: Date().addingTimeInterval(-345600)
        ),
        CardioSession(
            type: .swimming,
            distanceMeters: 1500,
            durationSeconds: 1800,
            avgHeartRate: 142,
            maxHeartRate: 165,
            caloriesBurned: 380,
            heartRateZones: [
                HeartRateZone(zone: 1, durationSeconds: 120, percentOfMax: 54),
                HeartRateZone(zone: 2, durationSeconds: 600, percentOfMax: 63),
                HeartRateZone(zone: 3, durationSeconds: 720, percentOfMax: 75),
                HeartRateZone(zone: 4, durationSeconds: 300, percentOfMax: 85),
                HeartRateZone(zone: 5, durationSeconds: 60, percentOfMax: 94),
            ],
            date: Date().addingTimeInterval(-518400)
        ),
        CardioSession(
            type: .running,
            distanceMeters: 8047,
            durationSeconds: 2580,
            avgHeartRate: 152,
            maxHeartRate: 180,
            caloriesBurned: 640,
            date: Date().addingTimeInterval(-604800)
        ),
    ]
}

#endif
