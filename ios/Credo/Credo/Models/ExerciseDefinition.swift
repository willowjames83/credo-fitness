import Foundation

enum MuscleGroup: String, Codable, CaseIterable {
    case chest, back, shoulders, biceps, triceps, quads, hamstrings, glutes, calves, core, forearms, traps
}

enum Equipment: String, Codable, CaseIterable {
    case barbell, dumbbell, kettlebell, cable, machine, bodyweight, bands, pullUpBar = "pull_up_bar", bench, rack
}

enum MovementPattern: String, Codable {
    case push, pull, hinge, squat, carry, core, isolation
}

struct ExerciseDefinition: Identifiable, Codable {
    let id: String
    let name: String
    let primaryMuscles: [MuscleGroup]
    let secondaryMuscles: [MuscleGroup]
    let equipment: [Equipment]
    let movementPattern: MovementPattern
    let difficulty: String
    let formCues: [String]
    let bodyweightMultiplier: Double
    let weightIncrement: Double
    let isBodyweight: Bool
    let isPerSide: Bool
    let defaultRepRange: [Int]
    let defaultSets: Int
    let defaultRestSeconds: Int
    let shortVideoURL: String?
    let detailedVideoURL: String?

    init(
        id: String,
        name: String,
        primaryMuscles: [MuscleGroup],
        secondaryMuscles: [MuscleGroup],
        equipment: [Equipment],
        movementPattern: MovementPattern,
        difficulty: String,
        formCues: [String],
        bodyweightMultiplier: Double,
        weightIncrement: Double,
        isBodyweight: Bool,
        isPerSide: Bool,
        defaultRepRange: [Int],
        defaultSets: Int,
        defaultRestSeconds: Int,
        shortVideoURL: String? = nil,
        detailedVideoURL: String? = nil
    ) {
        self.id = id
        self.name = name
        self.primaryMuscles = primaryMuscles
        self.secondaryMuscles = secondaryMuscles
        self.equipment = equipment
        self.movementPattern = movementPattern
        self.difficulty = difficulty
        self.formCues = formCues
        self.bodyweightMultiplier = bodyweightMultiplier
        self.weightIncrement = weightIncrement
        self.isBodyweight = isBodyweight
        self.isPerSide = isPerSide
        self.defaultRepRange = defaultRepRange
        self.defaultSets = defaultSets
        self.defaultRestSeconds = defaultRestSeconds
        self.shortVideoURL = shortVideoURL
        self.detailedVideoURL = detailedVideoURL
    }
}
