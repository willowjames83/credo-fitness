import SwiftUI
import Combine

@Observable
class WorkoutViewModel {
    // State
    var session: ActiveWorkoutSession?
    var isWorkoutActive: Bool { session != nil }

    // Timers
    var elapsedSeconds: Int = 0
    var restTimerSeconds: Int = 0
    var restTimerTotal: Int = 0
    var isRestTimerRunning: Bool = false
    var selectedRestDuration: Int = 90

    // Superset prompt
    var supersetNextExerciseName: String?

    // Exercise swap
    var showExerciseSwapSheet: Bool = false

    // RIR sheet
    var showRIRSheet: Bool = false
    var rirExerciseId: String?
    var completedExerciseRIRs: [String: Int] = [:]

    // Workout complete
    var showWorkoutSummary: Bool = false
    var workoutPRs: [PersonalRecord] = []
    var lastCompletedWorkout: CompletedWorkout?

    // Timer publishers
    private var elapsedTimer: AnyCancellable?
    private var restTimer: AnyCancellable?

    let store = WorkoutStore.shared

    // MARK: - Start Workout

    func startWorkout(from day: ProgramDay, template: ProgramTemplate, week: Int) {
        // Identify supersets for this day
        let supersetGroups = ProgramGenerator.identifySupersets(for: day)

        // Build a lookup of exercise index -> superset group ID
        var supersetGroupIdByIndex: [Int: UUID] = [:]
        for group in supersetGroups {
            for index in group.exerciseIndices {
                supersetGroupIdByIndex[index] = group.id
            }
        }

        let activeExercises: [ActiveExercise] = day.exercises.enumerated().map { exerciseIndex, programExercise in
            let definition = ExerciseLibrary.find(programExercise.id)

            let exerciseName = definition?.name ?? programExercise.id
            let muscleGroup = definition?.primaryMuscles.map { $0.rawValue.capitalized }.joined(separator: ", ") ?? ""
            let formCues = definition?.formCues ?? []
            let isBodyweight = definition?.isBodyweight ?? false
            let isPerSide = definition?.isPerSide ?? false
            let weightIncrement = definition?.weightIncrement ?? 5.0

            let recommendedWeight: Double
            if let def = definition {
                let userWeight = store.userProfile?.weight ?? mockUser.weight
                recommendedWeight = ProgressionEngine.recommendedWeight(
                    for: def.id,
                    userWeight: userWeight,
                    store: store
                )
            } else {
                recommendedWeight = programExercise.recommendedWeight
            }

            // Format previous session
            var previousSession: String? = nil
            if let lastWorkout = store.getLastWorkout(for: programExercise.id) {
                let setDescriptions = lastWorkout.sets.map { "\($0.reps)" }
                let weight = lastWorkout.sets.first?.weight ?? 0
                previousSession = "\(Int(weight)) \u{00D7} \(setDescriptions.joined(separator: ", "))"
            }

            // Create empty sets
            let sets: [WorkoutSet] = (1...programExercise.targetSets).map { setNumber in
                WorkoutSet(
                    id: setNumber,
                    weight: recommendedWeight,
                    reps: nil,
                    completed: false
                )
            }

            return ActiveExercise(
                id: programExercise.id,
                name: exerciseName,
                muscleGroup: muscleGroup,
                targetSets: programExercise.targetSets,
                targetRepMin: programExercise.targetRepMin,
                targetRepMax: programExercise.targetRepMax,
                recommendedWeight: recommendedWeight,
                restSeconds: programExercise.restSeconds,
                previousSession: previousSession,
                formCues: formCues,
                isBodyweight: isBodyweight,
                isPerSide: isPerSide,
                weightIncrement: weightIncrement,
                sets: sets,
                supersetGroupId: supersetGroupIdByIndex[exerciseIndex]
            )
        }

        // Prepend warmup sets to the first 2 compound exercises
        let compoundPatterns: Set<MovementPattern> = [.push, .pull, .hinge, .squat]
        var compoundCount = 0
        var exercisesWithWarmups = activeExercises

        for i in 0..<exercisesWithWarmups.count {
            guard compoundCount < 2 else { break }
            let exerciseId = exercisesWithWarmups[i].id
            guard let definition = ExerciseLibrary.find(exerciseId),
                  compoundPatterns.contains(definition.movementPattern) else { continue }

            compoundCount += 1
            let workingWeight = exercisesWithWarmups[i].recommendedWeight
            let increment = exercisesWithWarmups[i].weightIncrement
            let warmup1Weight = ProgressionEngine.roundToNearest(workingWeight * 0.5, increment: increment)
            let warmup2Weight = ProgressionEngine.roundToNearest(workingWeight * 0.7, increment: increment)

            let warmupSets = [
                WorkoutSet(id: -2, weight: warmup1Weight, reps: 5, completed: false, isWarmup: true),
                WorkoutSet(id: -1, weight: warmup2Weight, reps: 3, completed: false, isWarmup: true),
            ]
            exercisesWithWarmups[i].sets = warmupSets + exercisesWithWarmups[i].sets
        }

        session = ActiveWorkoutSession(
            programTemplate: template.rawValue,
            dayIndex: day.id,
            dayLabel: day.label,
            week: week,
            exercises: exercisesWithWarmups,
            currentExerciseIndex: 0,
            startTime: Date(),
            supersetGroups: supersetGroups
        )

        elapsedSeconds = 0
        completedExerciseRIRs = [:]
        showWorkoutSummary = false
        supersetNextExerciseName = nil
        startElapsedTimer()
    }

    // MARK: - Superset Support

    /// Returns the SupersetGroup that the current exercise belongs to, if any.
    var currentSupersetGroup: SupersetGroup? {
        guard let currentSession = session else { return nil }
        let currentIndex = currentSession.currentExerciseIndex
        guard currentIndex < currentSession.exercises.count else { return nil }
        guard let groupId = currentSession.exercises[currentIndex].supersetGroupId else { return nil }
        return currentSession.supersetGroups.first { $0.id == groupId }
    }

    /// Returns the superset label letter prefix for a group (A, B, C, etc.)
    func supersetLetterPrefix(for group: SupersetGroup) -> String {
        guard let currentSession = session else { return "A" }
        let sortedGroups = currentSession.supersetGroups.sorted { a, b in
            (a.exerciseIndices.first ?? 0) < (b.exerciseIndices.first ?? 0)
        }
        let letters = ["A", "B", "C", "D", "E"]
        if let idx = sortedGroups.firstIndex(where: { $0.id == group.id }) {
            return letters[idx % letters.count]
        }
        return "A"
    }

    /// Returns labels like ["A1", "A2"] for exercises in a superset group.
    func supersetLabels(for group: SupersetGroup) -> [String] {
        let prefix = supersetLetterPrefix(for: group)
        return group.exerciseIndices.enumerated().map { index, _ in
            "\(prefix)\(index + 1)"
        }
    }

    /// Whether the given exercise index is part of a superset group.
    func isInSuperset(exerciseIndex: Int) -> Bool {
        guard let currentSession = session,
              exerciseIndex < currentSession.exercises.count else { return false }
        return currentSession.exercises[exerciseIndex].supersetGroupId != nil
    }

    /// The superset group for a given exercise index.
    func supersetGroup(for exerciseIndex: Int) -> SupersetGroup? {
        guard let currentSession = session,
              exerciseIndex < currentSession.exercises.count else { return nil }
        guard let groupId = currentSession.exercises[exerciseIndex].supersetGroupId else { return nil }
        return currentSession.supersetGroups.first { $0.id == groupId }
    }

    // MARK: - Set Management

    func updateWeight(setIndex: Int, weight: Double) {
        guard var currentSession = session,
              currentSession.currentExerciseIndex < currentSession.exercises.count else { return }
        let exerciseIndex = currentSession.currentExerciseIndex
        guard setIndex < currentSession.exercises[exerciseIndex].sets.count else { return }
        currentSession.exercises[exerciseIndex].sets[setIndex].weight = weight
        session = currentSession
    }

    func updateReps(setIndex: Int, reps: Int) {
        guard var currentSession = session,
              currentSession.currentExerciseIndex < currentSession.exercises.count else { return }
        let exerciseIndex = currentSession.currentExerciseIndex
        guard setIndex < currentSession.exercises[exerciseIndex].sets.count else { return }
        currentSession.exercises[exerciseIndex].sets[setIndex].reps = reps
        session = currentSession
    }

    /// Update weight for a specific exercise by index (used by superset views)
    func updateWeight(exerciseIndex: Int, setIndex: Int, weight: Double) {
        guard var currentSession = session,
              exerciseIndex < currentSession.exercises.count,
              setIndex < currentSession.exercises[exerciseIndex].sets.count else { return }
        currentSession.exercises[exerciseIndex].sets[setIndex].weight = weight
        session = currentSession
    }

    /// Update reps for a specific exercise by index (used by superset views)
    func updateReps(exerciseIndex: Int, setIndex: Int, reps: Int) {
        guard var currentSession = session,
              exerciseIndex < currentSession.exercises.count,
              setIndex < currentSession.exercises[exerciseIndex].sets.count else { return }
        currentSession.exercises[exerciseIndex].sets[setIndex].reps = reps
        session = currentSession
    }

    func toggleSetComplete(setIndex: Int) {
        guard var currentSession = session,
              currentSession.currentExerciseIndex < currentSession.exercises.count else { return }
        let exerciseIndex = currentSession.currentExerciseIndex
        guard setIndex < currentSession.exercises[exerciseIndex].sets.count else { return }

        let wasCompleted = currentSession.exercises[exerciseIndex].sets[setIndex].completed
        currentSession.exercises[exerciseIndex].sets[setIndex].completed = !wasCompleted
        session = currentSession

        // Auto-start rest timer when completing a set
        if !wasCompleted {
            // Use shorter rest (60s) between superset partners
            if let group = currentSupersetGroup {
                // Check if there's a paired exercise with incomplete sets
                let pairedIndex = group.exerciseIndices.first { $0 != exerciseIndex }
                if let paired = pairedIndex,
                   paired < currentSession.exercises.count {
                    let pairedExercise = currentSession.exercises[paired]
                    let hasIncompleteSets = pairedExercise.sets.contains { !$0.completed && !$0.isWarmup }
                    if hasIncompleteSets {
                        supersetNextExerciseName = pairedExercise.name
                        selectedRestDuration = 60
                        startRestTimer()
                        return
                    }
                }
            }

            supersetNextExerciseName = nil
            let restDuration = currentSession.exercises[exerciseIndex].restSeconds
            selectedRestDuration = restDuration > 0 ? restDuration : 90
            startRestTimer()
        }
    }

    /// Toggle set complete for a specific exercise by index (used by superset views)
    func toggleSetComplete(exerciseIndex: Int, setIndex: Int) {
        guard var currentSession = session,
              exerciseIndex < currentSession.exercises.count,
              setIndex < currentSession.exercises[exerciseIndex].sets.count else { return }

        let wasCompleted = currentSession.exercises[exerciseIndex].sets[setIndex].completed
        currentSession.exercises[exerciseIndex].sets[setIndex].completed = !wasCompleted
        session = currentSession

        if !wasCompleted {
            // Check for superset partner
            if let group = supersetGroup(for: exerciseIndex) {
                let pairedIndex = group.exerciseIndices.first { $0 != exerciseIndex }
                if let paired = pairedIndex,
                   paired < currentSession.exercises.count {
                    let pairedExercise = currentSession.exercises[paired]
                    let hasIncompleteSets = pairedExercise.sets.contains { !$0.completed && !$0.isWarmup }
                    if hasIncompleteSets {
                        supersetNextExerciseName = pairedExercise.name
                        selectedRestDuration = 60
                        startRestTimer()
                        return
                    }
                }
            }

            supersetNextExerciseName = nil
            let restDuration = currentSession.exercises[exerciseIndex].restSeconds
            selectedRestDuration = restDuration > 0 ? restDuration : 90
            startRestTimer()
        }
    }

    // MARK: - Exercise Progression

    func completeCurrentExercise() {
        showRIRSheet = true
        rirExerciseId = session?.currentExercise?.id
    }

    func submitRIR(_ rir: Int) {
        showRIRSheet = false
        if let exerciseId = rirExerciseId {
            completedExerciseRIRs[exerciseId] = rir
        }
        advanceToNextExercise()
    }

    /// Complete exercise for a specific index (used by superset views).
    /// Records RIR and advances, skipping over superset partners that have already been completed.
    func completeSupersetExercise(at exerciseIndex: Int) {
        rirExerciseId = session?.exercises[exerciseIndex].id
        showRIRSheet = true
    }

    func advanceToNextExercise() {
        guard var currentSession = session else { return }
        currentSession.currentExerciseIndex += 1
        session = currentSession
        skipRestTimer()
        supersetNextExerciseName = nil
        if currentSession.isComplete {
            completeWorkout()
        }
    }

    // MARK: - Complete Workout

    func completeWorkout() {
        guard let currentSession = session else { return }

        let completedExercises: [CompletedExercise] = currentSession.exercises.compactMap { exercise in
            let completedSets = exercise.sets.filter { $0.completed && !$0.isWarmup }.compactMap { set -> CompletedSet? in
                guard let reps = set.reps else { return nil }
                return CompletedSet(weight: set.weight, reps: reps)
            }
            guard !completedSets.isEmpty else { return nil }

            let rir = completedExerciseRIRs[exercise.id] ?? 2

            // Calculate estimated 1RM from best set
            let best1RM = completedSets.map { set in
                ProgressionEngine.estimated1RM(weight: set.weight, reps: set.reps)
            }.max() ?? 0

            return CompletedExercise(
                exerciseId: exercise.id,
                sets: completedSets,
                rir: rir,
                estimated1RM: best1RM
            )
        }

        let duration = Int(Date().timeIntervalSince(currentSession.startTime))

        let completedWorkout = CompletedWorkout(
            date: Date(),
            programTemplate: currentSession.programTemplate,
            dayIndex: currentSession.dayIndex,
            exercises: completedExercises,
            durationSeconds: duration
        )

        // Detect PRs before saving (which updates 1RMs)
        var prs: [PersonalRecord] = []
        for exercise in completedExercises {
            let current = store.exercise1RMs[exercise.exerciseId] ?? 0
            if exercise.estimated1RM > current && current > 0 {
                let bestSet = exercise.sets.max(by: { a, b in
                    ProgressionEngine.estimated1RM(weight: a.weight, reps: a.reps) <
                    ProgressionEngine.estimated1RM(weight: b.weight, reps: b.reps)
                })
                let pr = PersonalRecord(
                    exerciseId: exercise.exerciseId,
                    previous1RM: current,
                    new1RM: exercise.estimated1RM,
                    date: completedWorkout.date,
                    setWeight: bestSet?.weight ?? 0,
                    setReps: bestSet?.reps ?? 0
                )
                prs.append(pr)
            }
        }
        workoutPRs = prs
        lastCompletedWorkout = completedWorkout

        store.saveCompletedWorkout(completedWorkout, detectedPRs: prs)

        // Log warmup completion for stability tracking
        let hadWarmups = currentSession.exercises.contains { exercise in
            exercise.sets.contains { $0.isWarmup && $0.completed }
        }
        if hadWarmups {
            StabilityStore.shared.logWarmupCompletion()
        }

        store.advanceDay()
        stopAllTimers()
        showWorkoutSummary = true

        // Trigger cloud sync if logged in
        Task { await SyncService.shared.autoSync() }
    }

    func dismissSummaryAndReset() {
        showWorkoutSummary = false
        session = nil
        elapsedSeconds = 0
        workoutPRs = []
        lastCompletedWorkout = nil
        supersetNextExerciseName = nil
    }

    // MARK: - Timers

    func startElapsedTimer() {
        elapsedTimer?.cancel()
        elapsedTimer = Timer.publish(every: 1, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                self?.elapsedSeconds += 1
            }
    }

    func startRestTimer() {
        restTimerSeconds = selectedRestDuration
        restTimerTotal = selectedRestDuration
        isRestTimerRunning = true
        restTimer?.cancel()
        restTimer = Timer.publish(every: 1, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                guard let self else { return }
                if self.restTimerSeconds > 0 {
                    self.restTimerSeconds -= 1
                } else {
                    self.isRestTimerRunning = false
                    self.restTimer?.cancel()
                }
            }
    }

    func skipRestTimer() {
        restTimerSeconds = 0
        isRestTimerRunning = false
        restTimer?.cancel()
    }

    func stopAllTimers() {
        elapsedTimer?.cancel()
        restTimer?.cancel()
    }

    // MARK: - Computed

    var elapsedTimeFormatted: String {
        let m = elapsedSeconds / 60
        let s = elapsedSeconds % 60
        return String(format: "%d:%02d", m, s)
    }

    var restTimeFormatted: String {
        let m = restTimerSeconds / 60
        let s = restTimerSeconds % 60
        return String(format: "%d:%02d", m, s)
    }

    var restTimerProgress: Double {
        guard restTimerTotal > 0 else { return 0 }
        return Double(restTimerSeconds) / Double(restTimerTotal)
    }

    var summaryExercises: [(name: String, sets: Int, volume: Double, estimated1RM: Double, isPR: Bool)] {
        guard let workout = lastCompletedWorkout else { return [] }
        return workout.exercises.map { exercise in
            let name = ExerciseLibrary.find(exercise.exerciseId)?.name ?? exercise.exerciseId
            let volume = exercise.sets.reduce(0.0) { $0 + $1.weight * Double($1.reps) }
            let isPR = workoutPRs.contains { $0.exerciseId == exercise.exerciseId }
            return (name: name, sets: exercise.sets.count, volume: volume, estimated1RM: exercise.estimated1RM, isPR: isPR)
        }
    }

    var totalVolume: Double {
        guard let workout = lastCompletedWorkout else { return 0 }
        return workout.exercises.reduce(0.0) { total, exercise in
            total + exercise.sets.reduce(0.0) { $0 + $1.weight * Double($1.reps) }
        }
    }

    var totalCompletedSets: Int {
        guard let workout = lastCompletedWorkout else { return 0 }
        return workout.exercises.reduce(0) { $0 + $1.sets.count }
    }

    var formattedTotalVolume: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.maximumFractionDigits = 0
        return (formatter.string(from: NSNumber(value: totalVolume)) ?? "\(Int(totalVolume))") + " lbs"
    }

    var completedSetsCount: Int {
        session?.currentExercise?.sets.filter { $0.completed && !$0.isWarmup }.count ?? 0
    }

    var totalSetsCount: Int {
        session?.currentExercise?.sets.filter { !$0.isWarmup }.count ?? 0
    }

    var hasCompletedAtLeastOneSet: Bool {
        completedSetsCount > 0
    }

    // MARK: - Exercise Swap

    var currentExerciseDefinition: ExerciseDefinition? {
        guard let exercise = session?.currentExercise else { return nil }
        return ExerciseLibrary.find(exercise.id)
    }

    var swapAlternatives: [ExerciseDefinition] {
        guard let currentDef = currentExerciseDefinition,
              let currentSession = session else { return [] }
        let sessionExerciseIds = Set(currentSession.exercises.map { $0.id })
        return ExerciseLibrary.exercises.filter { def in
            def.movementPattern == currentDef.movementPattern &&
            !sessionExerciseIds.contains(def.id)
        }
    }

    func swapExercise(with newExerciseId: String) {
        guard var currentSession = session,
              let newDef = ExerciseLibrary.find(newExerciseId) else { return }
        let idx = currentSession.currentExerciseIndex
        let oldExercise = currentSession.exercises[idx]

        let userWeight = store.userProfile?.weight ?? 185
        let recommendedWeight = ProgressionEngine.recommendedWeight(
            for: newDef.id, userWeight: userWeight, store: store
        )

        let sets: [WorkoutSet] = (1...oldExercise.targetSets).map { setNumber in
            WorkoutSet(id: setNumber, weight: recommendedWeight, reps: nil, completed: false)
        }

        let newExercise = ActiveExercise(
            id: newDef.id,
            name: newDef.name,
            muscleGroup: newDef.primaryMuscles.map { $0.rawValue.capitalized }.joined(separator: ", "),
            targetSets: oldExercise.targetSets,
            targetRepMin: newDef.defaultRepRange[0],
            targetRepMax: newDef.defaultRepRange[1],
            recommendedWeight: recommendedWeight,
            restSeconds: newDef.defaultRestSeconds,
            previousSession: nil,
            formCues: newDef.formCues,
            isBodyweight: newDef.isBodyweight,
            isPerSide: newDef.isPerSide,
            weightIncrement: newDef.weightIncrement,
            sets: sets,
            supersetGroupId: oldExercise.supersetGroupId
        )

        currentSession.exercises[idx] = newExercise
        session = currentSession
        showExerciseSwapSheet = false
    }

    /// Swap exercise at a specific index (used by superset views)
    func swapExercise(at exerciseIndex: Int, with newExerciseId: String) {
        guard var currentSession = session,
              exerciseIndex < currentSession.exercises.count,
              let newDef = ExerciseLibrary.find(newExerciseId) else { return }
        let oldExercise = currentSession.exercises[exerciseIndex]

        let userWeight = store.userProfile?.weight ?? 185
        let recommendedWeight = ProgressionEngine.recommendedWeight(
            for: newDef.id, userWeight: userWeight, store: store
        )

        let sets: [WorkoutSet] = (1...oldExercise.targetSets).map { setNumber in
            WorkoutSet(id: setNumber, weight: recommendedWeight, reps: nil, completed: false)
        }

        let newExercise = ActiveExercise(
            id: newDef.id,
            name: newDef.name,
            muscleGroup: newDef.primaryMuscles.map { $0.rawValue.capitalized }.joined(separator: ", "),
            targetSets: oldExercise.targetSets,
            targetRepMin: newDef.defaultRepRange[0],
            targetRepMax: newDef.defaultRepRange[1],
            recommendedWeight: recommendedWeight,
            restSeconds: newDef.defaultRestSeconds,
            previousSession: nil,
            formCues: newDef.formCues,
            isBodyweight: newDef.isBodyweight,
            isPerSide: newDef.isPerSide,
            weightIncrement: newDef.weightIncrement,
            sets: sets,
            supersetGroupId: oldExercise.supersetGroupId
        )

        currentSession.exercises[exerciseIndex] = newExercise
        session = currentSession
        showExerciseSwapSheet = false
    }

    // MARK: - Add / Remove Sets

    func addSet() {
        guard var currentSession = session,
              currentSession.currentExerciseIndex < currentSession.exercises.count else { return }
        let idx = currentSession.currentExerciseIndex
        let currentSets = currentSession.exercises[idx].sets
        let lastWorkingSet = currentSets.last(where: { !$0.isWarmup })
        let newId = (currentSets.map { $0.id }.max() ?? 0) + 1
        let newSet = WorkoutSet(
            id: newId,
            weight: lastWorkingSet?.weight ?? 0,
            reps: nil,
            completed: false
        )
        currentSession.exercises[idx].sets.append(newSet)
        session = currentSession
    }

    /// Add set to a specific exercise by index (used by superset views)
    func addSet(exerciseIndex: Int) {
        guard var currentSession = session,
              exerciseIndex < currentSession.exercises.count else { return }
        let currentSets = currentSession.exercises[exerciseIndex].sets
        let lastWorkingSet = currentSets.last(where: { !$0.isWarmup })
        let newId = (currentSets.map { $0.id }.max() ?? 0) + 1
        let newSet = WorkoutSet(
            id: newId,
            weight: lastWorkingSet?.weight ?? 0,
            reps: nil,
            completed: false
        )
        currentSession.exercises[exerciseIndex].sets.append(newSet)
        session = currentSession
    }

    func removeSet(at setIndex: Int) {
        guard var currentSession = session,
              currentSession.currentExerciseIndex < currentSession.exercises.count else { return }
        let idx = currentSession.currentExerciseIndex
        let set = currentSession.exercises[idx].sets[setIndex]
        guard !set.isWarmup else { return }
        let workingSetCount = currentSession.exercises[idx].sets.filter { !$0.isWarmup }.count
        guard workingSetCount > 1 else { return }
        currentSession.exercises[idx].sets.remove(at: setIndex)
        session = currentSession
    }

    /// Remove set from a specific exercise by index (used by superset views)
    func removeSet(exerciseIndex: Int, at setIndex: Int) {
        guard var currentSession = session,
              exerciseIndex < currentSession.exercises.count else { return }
        let set = currentSession.exercises[exerciseIndex].sets[setIndex]
        guard !set.isWarmup else { return }
        let workingSetCount = currentSession.exercises[exerciseIndex].sets.filter { !$0.isWarmup }.count
        guard workingSetCount > 1 else { return }
        currentSession.exercises[exerciseIndex].sets.remove(at: setIndex)
        session = currentSession
    }

    deinit {
        stopAllTimers()
    }
}
