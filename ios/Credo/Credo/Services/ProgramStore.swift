import Foundation

@Observable
class ProgramStore {
    static let shared = ProgramStore()

    var selectedProgramId: String?
    var currentWeek: Int
    var currentDayIndex: Int

    private let programIdKey = "credo_program_selectedProgramId"
    private let weekKey = "credo_program_currentWeek"
    private let dayIndexKey = "credo_program_currentDayIndex"

    init() {
        let defaults = UserDefaults.standard
        selectedProgramId = defaults.string(forKey: programIdKey)
        currentWeek = max(defaults.integer(forKey: weekKey), 1)
        currentDayIndex = defaults.integer(forKey: dayIndexKey)
    }

    // MARK: - Computed

    var currentProgram: WorkoutProgram? {
        guard let id = selectedProgramId else { return nil }
        return ProgramLibrary.find(id)
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

    // MARK: - Persistence

    private func save() {
        let defaults = UserDefaults.standard
        defaults.set(selectedProgramId, forKey: programIdKey)
        defaults.set(currentWeek, forKey: weekKey)
        defaults.set(currentDayIndex, forKey: dayIndexKey)
    }
}
