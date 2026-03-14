import Foundation

enum SupersetType: String, Codable {
    case antagonist
    case compound
    case triset
}

struct SupersetGroup: Identifiable, Codable {
    let id: UUID
    let exerciseIndices: [Int]
    let type: SupersetType

    init(id: UUID = UUID(), exerciseIndices: [Int], type: SupersetType) {
        self.id = id
        self.exerciseIndices = exerciseIndices
        self.type = type
    }
}
