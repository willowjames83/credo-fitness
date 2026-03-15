import Foundation

@Observable
class ProgramGeneratorViewModel {
    // Preferences
    var daysPerWeek: Int = 4
    var sessionDuration: Int = 45
    var focus: String = "Longevity"
    var equipmentAvailable: Set<String> = ["barbell", "dumbbell", "bodyweight", "pull_up_bar", "bench", "rack"]
    var additionalNotes: String = ""

    // State
    var generatedProgram: WorkoutProgram?
    var isGenerating: Bool = false
    var error: String?
    var step: GenerationStep = .preferences

    enum GenerationStep {
        case preferences
        case generating
        case preview
    }

    let focusOptions = ["Longevity", "Strength", "Hypertrophy", "General Fitness"]
    let daysOptions = [2, 3, 4, 5, 6]
    let durationOptions = [20, 30, 45, 60, 75]
    let equipmentOptions: [(id: String, label: String, icon: String)] = [
        ("barbell", "Barbell", "figure.strengthtraining.traditional"),
        ("dumbbell", "Dumbbells", "dumbbell.fill"),
        ("kettlebell", "Kettlebell", "figure.strengthtraining.functional"),
        ("cable", "Cables", "cable.connector"),
        ("bodyweight", "Bodyweight", "figure.walk"),
        ("pull_up_bar", "Pull-Up Bar", "figure.climbing"),
        ("bench", "Bench", "rectangle.split.1x2"),
        ("rack", "Squat Rack", "square.stack.3d.up"),
        ("machine", "Machines", "gearshape"),
        ("bands", "Bands", "circle.and.line.horizontal")
    ]

    private let service = ProgramGeneratorService.shared
    private let store = ProgramStore.shared

    func generateProgram() async {
        step = .generating
        isGenerating = true
        error = nil

        let preferences = ProgramPreferences(
            daysPerWeek: daysPerWeek,
            sessionDuration: sessionDuration,
            focus: focus,
            equipmentAvailable: Array(equipmentAvailable),
            additionalNotes: additionalNotes
        )

        let context = ProgramGenerationContext.build(from: WorkoutStore.shared)

        do {
            let program = try await service.generateProgram(
                preferences: preferences,
                userContext: context
            )
            generatedProgram = program
            step = .preview
        } catch {
            self.error = error.localizedDescription
            step = .preferences
        }

        isGenerating = false
    }

    func saveAndSelect() {
        guard let program = generatedProgram else { return }
        store.saveProgram(program)
        store.selectProgram(program.id)
    }

    func regenerate() async {
        generatedProgram = nil
        await generateProgram()
    }

    func tweakProgram() {
        step = .preferences
    }

    func toggleEquipment(_ id: String) {
        if equipmentAvailable.contains(id) {
            equipmentAvailable.remove(id)
        } else {
            equipmentAvailable.insert(id)
        }
    }
}
