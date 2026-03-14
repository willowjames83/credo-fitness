import Foundation

// MARK: - Sync Request (matches backend syncSchema exactly)

struct SyncRequest: Encodable {
    let workouts: [SyncWorkout]?
    let exercise1RMs: [String: Double]?
    let personalRecords: [SyncPersonalRecord]?
    let scoreSnapshots: [SyncScoreSnapshot]?
    let userProgram: SyncUserProgram?
}

struct SyncWorkout: Encodable {
    let id: String?
    let date: String
    let dayLabel: String
    let programTemplate: String?
    let durationSeconds: Int?
    let exercises: AnyCodable
    let totalVolume: Double?
}

struct SyncPersonalRecord: Encodable {
    let exerciseId: String
    let previous1RM: Double?
    let new1RM: Double
    let setWeight: Double
    let setReps: Int
    let date: String?
}

struct SyncScoreSnapshot: Encodable {
    let weekNumber: Int
    let credoScore: Int
    let strengthScore: Int
    let stabilityScore: Int
    let cardioScore: Int
    let nutritionScore: Int
    let date: String?
}

struct SyncUserProgram: Encodable {
    let programTemplate: String
    let daysPerWeek: Int
    let currentWeek: Int?
    let currentDayIndex: Int?
}

// MARK: - Sync Response

struct SyncResponse: Decodable {
    let data: SyncResponseData
}

struct SyncResponseData: Decodable {
    let workouts: [ServerWorkout]
    let exercise1RMs: [String: Double]
    let personalRecords: [ServerPersonalRecord]
    let scoreSnapshots: [ServerScoreSnapshot]
    let userProgram: ServerUserProgram?
}

struct ServerWorkout: Decodable {
    let id: String
    let userId: String
    let date: String
    let dayLabel: String
    let programTemplate: String?
    let durationSeconds: Int?
    let exercises: AnyCodable
    let totalVolume: Double?
    let createdAt: String
}

struct ServerPersonalRecord: Decodable {
    let id: String
    let userId: String
    let exerciseId: String
    let previous1RM: Double?
    let new1RM: Double
    let setWeight: Double
    let setReps: Int
    let date: String
}

struct ServerScoreSnapshot: Decodable {
    let id: String
    let userId: String
    let weekNumber: Int
    let credoScore: Int
    let strengthScore: Int
    let stabilityScore: Int
    let cardioScore: Int
    let nutritionScore: Int
    let date: String
}

struct ServerUserProgram: Decodable {
    let id: String
    let userId: String
    let programTemplate: String
    let daysPerWeek: Int
    let currentWeek: Int
    let currentDayIndex: Int
}

// MARK: - AnyCodable (for exercises JSON)

struct AnyCodable: Codable {
    let value: Any

    init(_ value: Any) {
        self.value = value
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        if let array = try? container.decode([AnyCodable].self) {
            value = array.map { $0.value }
        } else if let dict = try? container.decode([String: AnyCodable].self) {
            value = dict.mapValues { $0.value }
        } else if let string = try? container.decode(String.self) {
            value = string
        } else if let int = try? container.decode(Int.self) {
            value = int
        } else if let double = try? container.decode(Double.self) {
            value = double
        } else if let bool = try? container.decode(Bool.self) {
            value = bool
        } else if container.decodeNil() {
            value = NSNull()
        } else {
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Unsupported type")
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()

        if let array = value as? [Any] {
            try container.encode(array.map { AnyCodable($0) })
        } else if let dict = value as? [String: Any] {
            try container.encode(dict.mapValues { AnyCodable($0) })
        } else if let string = value as? String {
            try container.encode(string)
        } else if let int = value as? Int {
            try container.encode(int)
        } else if let double = value as? Double {
            try container.encode(double)
        } else if let bool = value as? Bool {
            try container.encode(bool)
        } else if value is NSNull {
            try container.encodeNil()
        } else {
            // Fallback: encode as empty object
            try container.encode([String: String]())
        }
    }
}
