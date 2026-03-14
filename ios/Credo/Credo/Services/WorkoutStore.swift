import Foundation

struct CompletedSet: Codable {
    let weight: Double
    let reps: Int
}

struct CompletedExercise: Codable {
    let exerciseId: String
    let sets: [CompletedSet]
    let rir: Int
    let estimated1RM: Double
}

struct CompletedWorkout: Codable {
    let date: Date
    let programTemplate: String
    let dayIndex: Int
    let exercises: [CompletedExercise]
    let durationSeconds: Int
}

@Observable
class WorkoutStore {
    static let shared = WorkoutStore()

    var selectedProgram: ProgramTemplate?
    var currentDayIndex: Int = 0
    var currentWeek: Int = 1
    var workoutHistory: [CompletedWorkout] = []
    var exercise1RMs: [String: Double] = [:]
    var personalRecords: [PersonalRecord] = []
    var userProfile: UserProfile?
    var scoreHistory: [WeeklyScoreSnapshot] = []
    var exerciseRotationHistory: [String: Date] = [:]

    var hasCompletedOnboarding: Bool {
        userProfile != nil
    }

    private let programKey = "credo_selectedProgram"
    private let dayIndexKey = "credo_currentDayIndex"
    private let weekKey = "credo_currentWeek"
    private let historyKey = "credo_workoutHistory"
    private let oneRMKey = "credo_exercise1RMs"
    private let personalRecordsKey = "credo_personalRecords"
    private let profileKey = "credo_userProfile"
    private let scoreHistoryKey = "credo_scoreHistory"
    private let rotationHistoryKey = "credo_exerciseRotationHistory"

    init() {
        load()
    }

    // MARK: - Persistence

    func save() {
        let defaults = UserDefaults.standard
        defaults.set(selectedProgram?.rawValue, forKey: programKey)
        defaults.set(currentDayIndex, forKey: dayIndexKey)
        defaults.set(currentWeek, forKey: weekKey)

        if let historyData = try? JSONEncoder().encode(workoutHistory) {
            defaults.set(historyData, forKey: historyKey)
        }
        if let rmData = try? JSONEncoder().encode(exercise1RMs) {
            defaults.set(rmData, forKey: oneRMKey)
        }
        if let prData = try? JSONEncoder().encode(personalRecords) {
            defaults.set(prData, forKey: personalRecordsKey)
        }
        if let profileData = try? JSONEncoder().encode(userProfile) {
            defaults.set(profileData, forKey: profileKey)
        }
        if let scoreHistoryData = try? JSONEncoder().encode(scoreHistory) {
            defaults.set(scoreHistoryData, forKey: scoreHistoryKey)
        }
        if let rotationData = try? JSONEncoder().encode(exerciseRotationHistory) {
            defaults.set(rotationData, forKey: rotationHistoryKey)
        }
    }

    private func load() {
        let defaults = UserDefaults.standard

        if let rawProgram = defaults.string(forKey: programKey) {
            selectedProgram = ProgramTemplate(rawValue: rawProgram)
        }
        currentDayIndex = defaults.integer(forKey: dayIndexKey)
        currentWeek = max(defaults.integer(forKey: weekKey), 1)

        if let historyData = defaults.data(forKey: historyKey),
           let decoded = try? JSONDecoder().decode([CompletedWorkout].self, from: historyData) {
            workoutHistory = decoded
        }
        if let rmData = defaults.data(forKey: oneRMKey),
           let decoded = try? JSONDecoder().decode([String: Double].self, from: rmData) {
            exercise1RMs = decoded
        }
        if let prData = defaults.data(forKey: personalRecordsKey),
           let decoded = try? JSONDecoder().decode([PersonalRecord].self, from: prData) {
            personalRecords = decoded
        }
        if let profileData = defaults.data(forKey: profileKey),
           let decoded = try? JSONDecoder().decode(UserProfile.self, from: profileData) {
            userProfile = decoded
        }
        if let scoreHistoryData = defaults.data(forKey: scoreHistoryKey),
           let decoded = try? JSONDecoder().decode([WeeklyScoreSnapshot].self, from: scoreHistoryData) {
            scoreHistory = decoded
        }
        if let rotationData = defaults.data(forKey: rotationHistoryKey),
           let decoded = try? JSONDecoder().decode([String: Date].self, from: rotationData) {
            exerciseRotationHistory = decoded
        }
    }

    // MARK: - Workout Completion

    func saveCompletedWorkout(_ workout: CompletedWorkout, detectedPRs: [PersonalRecord] = []) {
        workoutHistory.append(workout)

        // Persist any PRs detected by the caller
        if !detectedPRs.isEmpty {
            personalRecords.append(contentsOf: detectedPRs)
        } else {
            // Detect PRs if none were provided (e.g., called without a ViewModel)
            for exercise in workout.exercises {
                let current = exercise1RMs[exercise.exerciseId] ?? 0
                if exercise.estimated1RM > current && current > 0 {
                    let bestSet = exercise.sets.max(by: { a, b in
                        ProgressionEngine.estimated1RM(weight: a.weight, reps: a.reps) <
                        ProgressionEngine.estimated1RM(weight: b.weight, reps: b.reps)
                    })
                    let pr = PersonalRecord(
                        exerciseId: exercise.exerciseId,
                        previous1RM: current,
                        new1RM: exercise.estimated1RM,
                        date: workout.date,
                        setWeight: bestSet?.weight ?? 0,
                        setReps: bestSet?.reps ?? 0
                    )
                    personalRecords.append(pr)
                }
            }
        }

        // Update 1RMs
        for exercise in workout.exercises {
            let current = exercise1RMs[exercise.exerciseId] ?? 0
            if exercise.estimated1RM > current {
                exercise1RMs[exercise.exerciseId] = exercise.estimated1RM
            }
        }

        // Update exercise rotation history
        for exercise in workout.exercises {
            exerciseRotationHistory[exercise.exerciseId] = workout.date
        }

        save()
        recordScoreSnapshotIfNeeded()
    }

    // MARK: - Log Benchmark

    func logBenchmark(exerciseId: String, weight: Double, reps: Int) {
        let oneRM = ProgressionEngine.estimated1RM(weight: weight, reps: reps)
        guard oneRM > 0 else { return }

        // Update 1RM if this is a new best
        let current = exercise1RMs[exerciseId] ?? 0
        if oneRM > current {
            exercise1RMs[exerciseId] = oneRM
        }

        // Also record as a completed workout entry so it appears in history
        let completedSet = CompletedSet(weight: weight, reps: reps)
        let completedExercise = CompletedExercise(
            exerciseId: exerciseId,
            sets: [completedSet],
            rir: 0,
            estimated1RM: oneRM
        )
        let workout = CompletedWorkout(
            date: Date(),
            programTemplate: "benchmark_test",
            dayIndex: 0,
            exercises: [completedExercise],
            durationSeconds: 0
        )
        saveCompletedWorkout(workout)
    }

    func getLastWorkout(for exerciseId: String) -> CompletedExercise? {
        for workout in workoutHistory.reversed() {
            if let exercise = workout.exercises.first(where: { $0.exerciseId == exerciseId }) {
                return exercise
            }
        }
        return nil
    }

    // MARK: - History & PRs

    func workoutsGroupedByMonth() -> [(String, [CompletedWorkout])] {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM yyyy"

        let grouped = Dictionary(grouping: workoutHistory) { workout in
            formatter.string(from: workout.date)
        }

        return grouped.sorted { a, b in
            guard let dateA = workoutHistory.first(where: { formatter.string(from: $0.date) == a.key })?.date,
                  let dateB = workoutHistory.first(where: { formatter.string(from: $0.date) == b.key })?.date else {
                return false
            }
            return dateA > dateB
        }.map { ($0.key, $0.value.sorted { $0.date > $1.date }) }
    }

    func getPersonalRecords(for exerciseId: String) -> [PersonalRecord] {
        personalRecords.filter { $0.exerciseId == exerciseId }
    }

    // MARK: - Day Advancement

    func advanceDay() {
        guard let program = selectedProgram else { return }
        currentDayIndex += 1
        if currentDayIndex >= program.daysPerWeek {
            currentDayIndex = 0
            currentWeek += 1
        }
        save()
    }

    // MARK: - Weekly Tracking

    func completedWorkoutsThisWeek() -> [CompletedWorkout] {
        let calendar = Calendar.current
        let startOfWeek = calendar.dateInterval(of: .weekOfYear, for: Date())?.start ?? Date()
        return workoutHistory.filter { $0.date >= startOfWeek }
    }

    func isDayCompletedThisWeek(dayIndex: Int) -> Bool {
        completedWorkoutsThisWeek().contains { $0.dayIndex == dayIndex }
    }

    func completedWorkoutForDay(_ dayIndex: Int) -> CompletedWorkout? {
        completedWorkoutsThisWeek().first { $0.dayIndex == dayIndex }
    }

    var totalWorkoutsCompleted: Int {
        workoutHistory.count
    }

    func weekProgressBooleans() -> [Bool] {
        guard let program = selectedProgram else { return [] }
        return (0..<program.daysPerWeek).map { isDayCompletedThisWeek(dayIndex: $0) }
    }

    // MARK: - Score Snapshots

    func best1RMInLast90Days(for exerciseId: String) -> Double? {
        let cutoff = Calendar.current.date(byAdding: .day, value: -90, to: Date()) ?? Date()
        var best: Double?
        for workout in workoutHistory where workout.date >= cutoff {
            for exercise in workout.exercises where exercise.exerciseId == exerciseId {
                if best == nil || exercise.estimated1RM > best! {
                    best = exercise.estimated1RM
                }
            }
        }
        return best
    }

    func recordScoreSnapshotIfNeeded() {
        let calendar = Calendar.current
        let currentWeekOfYear = calendar.component(.weekOfYear, from: Date())

        // Don't record if we already have a snapshot for this calendar week
        if let last = scoreHistory.last {
            let lastWeekOfYear = calendar.component(.weekOfYear, from: last.date)
            let lastYear = calendar.component(.yearForWeekOfYear, from: last.date)
            let thisYear = calendar.component(.yearForWeekOfYear, from: Date())
            if lastWeekOfYear == currentWeekOfYear && lastYear == thisYear {
                return
            }
        }

        let subscores = StrengthScoreCalculator.calculate(store: self)
        let strengthScore = subscores.weightedScore

        let stabilityScore = ScoringEngine.placeholderStabilityScore
        let cardioScore = CardioScoreCalculator.calculate(store: CardioStore.shared)
        let nutritionScore = NutritionScoreCalculator.calculate(store: NutritionStore.shared)
        let credoScore = ScoringEngine.compositeScore(
            strength: strengthScore,
            cardio: cardioScore,
            stability: stabilityScore,
            nutrition: nutritionScore
        )

        let snapshot = WeeklyScoreSnapshot(
            weekNumber: currentWeek,
            date: Date(),
            credoScore: credoScore,
            strengthScore: strengthScore,
            stabilityScore: stabilityScore,
            cardioScore: cardioScore,
            nutritionScore: nutritionScore
        )

        scoreHistory.append(snapshot)
        save()
    }

    // MARK: - Reset

    func resetProgram() {
        selectedProgram = nil
        currentDayIndex = 0
        currentWeek = 1
        workoutHistory = []
        exercise1RMs = [:]
        save()
    }
}
