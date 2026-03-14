import Foundation

struct PersonalRecord: Codable {
    let exerciseId: String
    let previous1RM: Double
    let new1RM: Double
    let date: Date
    let setWeight: Double
    let setReps: Int
}
