import Foundation

enum CardioType: Codable, Hashable {
    case running
    case rowing
    case cycling
    case walking
    case swimming
    case other(String)

    var displayName: String {
        switch self {
        case .running: return "Running"
        case .rowing: return "Rowing"
        case .cycling: return "Cycling"
        case .walking: return "Walking"
        case .swimming: return "Swimming"
        case .other(let name): return name.isEmpty ? "Other" : name
        }
    }

    var icon: String {
        switch self {
        case .running: return "figure.run"
        case .rowing: return "figure.rower"
        case .cycling: return "figure.outdoor.cycle"
        case .walking: return "figure.walk"
        case .swimming: return "figure.pool.swim"
        case .other: return "heart.circle"
        }
    }

    var defaultMetrics: [CardioMetric] {
        switch self {
        case .running:
            return [.distance, .duration, .heartRate, .pace, .calories]
        case .rowing:
            return [.distance, .duration, .heartRate, .calories]
        case .cycling:
            return [.distance, .duration, .heartRate, .calories]
        case .walking:
            return [.distance, .duration, .heartRate, .calories]
        case .swimming:
            return [.distance, .duration, .heartRate, .calories]
        case .other:
            return [.duration, .heartRate, .calories]
        }
    }

    static var standardCases: [CardioType] {
        [.running, .rowing, .cycling, .walking, .swimming, .other("")]
    }

    // MARK: - Codable

    enum CodingKeys: String, CodingKey {
        case type
        case customName
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .running:
            try container.encode("running", forKey: .type)
        case .rowing:
            try container.encode("rowing", forKey: .type)
        case .cycling:
            try container.encode("cycling", forKey: .type)
        case .walking:
            try container.encode("walking", forKey: .type)
        case .swimming:
            try container.encode("swimming", forKey: .type)
        case .other(let name):
            try container.encode("other", forKey: .type)
            try container.encode(name, forKey: .customName)
        }
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let type = try container.decode(String.self, forKey: .type)
        switch type {
        case "running": self = .running
        case "rowing": self = .rowing
        case "cycling": self = .cycling
        case "walking": self = .walking
        case "swimming": self = .swimming
        case "other":
            let name = try container.decodeIfPresent(String.self, forKey: .customName) ?? ""
            self = .other(name)
        default:
            self = .other(type)
        }
    }
}

enum CardioMetric {
    case distance
    case duration
    case heartRate
    case pace
    case calories
}
