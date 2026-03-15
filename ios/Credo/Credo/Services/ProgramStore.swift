import Foundation

@Observable
class ProgramStore {
    static let shared = ProgramStore()

    var selectedProgramId: String?
    var currentWeek: Int
    var currentDayIndex: Int
    var savedPrograms: [WorkoutProgram] = []

    private let programIdKey = "credo_program_selectedProgramId"
    private let weekKey = "credo_program_currentWeek"
    private let dayIndexKey = "credo_program_currentDayIndex"
    private let savedProgramsKey = "credo_program_saved"

    init() {
        let defaults = UserDefaults.standard
        selectedProgramId = defaults.string(forKey: programIdKey)
        currentWeek = max(defaults.integer(forKey: weekKey), 1)
        currentDayIndex = defaults.integer(forKey: dayIndexKey)
        loadSavedPrograms()
    }

    // MARK: - Computed

    var currentProgram: WorkoutProgram? {
        guard let id = selectedProgramId else { return nil }
        return ProgramLibrary.find(id) ?? savedPrograms.first { $0.id == id }
    }

    var currentDay: WorkoutProgramDay? {
        guard let program = currentProgram else { return nil }
        let index = currentDayIndex % program.days.count
        return program.days[index]
    }

    var nextDay: WorkoutProgramDay? {
        guard let program = currentProgram else { return nil }
        let nextIndex = (currentDayIndex + 1) % program.days.count
        return program.days[nextIndex]
    }

    // MARK: - Actions

    func selectProgram(_ id: String) {
        selectedProgramId = id
        currentDayIndex = 0
        currentWeek = 1
        save()
    }

    func advanceDay() {
        guard let program = currentProgram else { return }
        currentDayIndex += 1
        if currentDayIndex >= program.days.count {
            currentDayIndex = 0
            currentWeek += 1
        }
        save()
    }

    func resetProgram() {
        selectedProgramId = nil
        currentDayIndex = 0
        currentWeek = 1
        save()
    }

    // MARK: - AI Program Management

    func saveProgram(_ program: WorkoutProgram) {
        // Remove existing with same ID if regenerated
        savedPrograms.removeAll { $0.id == program.id }
        savedPrograms.insert(program, at: 0)
        persistSavedPrograms()
    }

    func deleteProgram(id: String) {
        savedPrograms.removeAll { $0.id == id }
        if selectedProgramId == id {
            selectedProgramId = nil
        }
        persistSavedPrograms()
        save()
    }

    // MARK: - Persistence

    private func save() {
        let defaults = UserDefaults.standard
        defaults.set(selectedProgramId, forKey: programIdKey)
        defaults.set(currentWeek, forKey: weekKey)
        defaults.set(currentDayIndex, forKey: dayIndexKey)
    }

    private func persistSavedPrograms() {
        if let data = try? JSONEncoder().encode(savedPrograms) {
            UserDefaults.standard.set(data, forKey: savedProgramsKey)
        }
    }

    private func loadSavedPrograms() {
        if let data = UserDefaults.standard.data(forKey: savedProgramsKey),
           let decoded = try? JSONDecoder().decode([WorkoutProgram].self, from: data) {
            savedPrograms = decoded
        }
    }
}
