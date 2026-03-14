import Foundation

struct User: Codable {
    let name: String
    let initials: String
    let age: Int
    let sex: String
    let weight: Int
    let experienceLevel: String
    let proteinTarget: Int
    let zone2Target: Int
    let currentWeek: Int
    var heightFeet: Int?
    var heightInches: Int?
    var trainingGoal: String?

    var firstName: String {
        name.components(separatedBy: " ").first ?? name
    }

    var profileSummary: String {
        "\(age) · \(sex.capitalized) · \(weight) lbs · \(experienceLevel.capitalized)"
    }
}
