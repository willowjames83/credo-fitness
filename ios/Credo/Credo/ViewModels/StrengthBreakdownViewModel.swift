import Foundation

struct SubscoreDetail: Identifiable {
    let id = UUID()
    let category: String
    let weightPercent: Int
    let score: Int
    let exercises: [ExerciseDetail]
}

struct ExerciseDetail: Identifiable {
    let id = UUID()
    let name: String
    let exerciseId: String
    let oneRM: Double?
    let percentile: Int?
}

@Observable
class StrengthBreakdownViewModel {
    let store = WorkoutStore.shared

    var subscoreDetails: [SubscoreDetail] {
        StrengthScoreCalculator.subscoreDetails(store: store)
    }

    var demographicLabel: String {
        let sex = store.userProfile?.sex ?? "Male"
        let age = store.userProfile?.age ?? 30
        let ageRange: String
        switch age {
        case ..<25: ageRange = "18-24"
        case 25..<30: ageRange = "25-29"
        case 30..<35: ageRange = "30-34"
        case 35..<40: ageRange = "35-39"
        case 40..<45: ageRange = "40-44"
        case 45..<50: ageRange = "45-49"
        case 50..<55: ageRange = "50-54"
        case 55..<60: ageRange = "55-59"
        default: ageRange = "60+"
        }
        let label = sex == "Female" ? "Females" : "Males"
        return "vs. \(label) \(ageRange)"
    }
}
