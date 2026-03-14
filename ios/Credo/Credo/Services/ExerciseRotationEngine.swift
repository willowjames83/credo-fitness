import Foundation

struct ExerciseSlot {
    let originalExerciseId: String
    let selectedExerciseId: String
    let isPinned: Bool
}

struct ExerciseRotationEngine {

    // Main compound lifts that should never rotate
    private static let pinnedExerciseIds: Set<String> = [
        "bench_press", "back_squat", "deadlift", "ohp",
        "front_squat", "trap_bar_deadlift", "incline_bench"
    ]

    /// Determine which exercises to use for a given day, rotating accessories
    /// every 3-4 weeks based on rotation history.
    static func rotateExercises(for day: ProgramDay, week: Int, store: WorkoutStore) -> [ExerciseSlot] {
        return day.exercises.map { programExercise in
            // Pinned exercises never rotate
            if pinnedExerciseIds.contains(programExercise.id) {
                return ExerciseSlot(
                    originalExerciseId: programExercise.id,
                    selectedExerciseId: programExercise.id,
                    isPinned: true
                )
            }

            // Accessories rotate every 3 weeks (on weeks 4, 7, 10, ...)
            let rotationCycle = (week - 1) / 3
            if rotationCycle == 0 {
                // First 3 weeks: use original exercise
                return ExerciseSlot(
                    originalExerciseId: programExercise.id,
                    selectedExerciseId: programExercise.id,
                    isPinned: false
                )
            }

            // Find alternatives matching same movement pattern and overlapping muscle group
            guard let originalDef = ExerciseLibrary.find(programExercise.id) else {
                return ExerciseSlot(
                    originalExerciseId: programExercise.id,
                    selectedExerciseId: programExercise.id,
                    isPinned: false
                )
            }

            let alternatives = findAlternatives(
                for: originalDef,
                excluding: Set(day.exercises.map { $0.id }),
                rotationHistory: store.exerciseRotationHistory
            )

            // Use deterministic selection based on rotation cycle
            if !alternatives.isEmpty {
                let index = rotationCycle % alternatives.count
                let selected = alternatives[index]
                return ExerciseSlot(
                    originalExerciseId: programExercise.id,
                    selectedExerciseId: selected.id,
                    isPinned: false
                )
            }

            return ExerciseSlot(
                originalExerciseId: programExercise.id,
                selectedExerciseId: programExercise.id,
                isPinned: false
            )
        }
    }

    /// Find alternative exercises matching the same movement pattern and at least one
    /// primary muscle group. Sorted by recency (least recently used first).
    private static func findAlternatives(
        for exercise: ExerciseDefinition,
        excluding excludedIds: Set<String>,
        rotationHistory: [String: Date]
    ) -> [ExerciseDefinition] {
        let primaryMuscleSet = Set(exercise.primaryMuscles)

        return ExerciseLibrary.exercises
            .filter { candidate in
                candidate.id != exercise.id &&
                !excludedIds.contains(candidate.id) &&
                candidate.movementPattern == exercise.movementPattern &&
                !Set(candidate.primaryMuscles).isDisjoint(with: primaryMuscleSet) &&
                !pinnedExerciseIds.contains(candidate.id)
            }
            .sorted { a, b in
                // Prefer exercises not used recently
                let dateA = rotationHistory[a.id] ?? Date.distantPast
                let dateB = rotationHistory[b.id] ?? Date.distantPast
                return dateA < dateB
            }
    }
}
