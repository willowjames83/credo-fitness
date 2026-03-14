import Foundation

struct PillarScore {
    let score: Int
    let metrics: [String]
    var isWeakest: Bool = false
}

struct CredoScore {
    let score: Int
    let delta: Int
}

struct ScoreHistoryEntry {
    let week: Int
    let credo: Int
    let strength: Int
    let stability: Int
    let cardio: Int
    let nutrition: Int
}
