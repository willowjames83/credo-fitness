import Foundation

@Observable
class ProgramViewModel {
    let programStore = ProgramStore.shared
    let workoutStore = WorkoutStore.shared

    // MARK: - Program Selection

    var allPrograms: [WorkoutProgram] {
        ProgramLibrary.allPrograms
    }

    var selectedProgram: WorkoutProgram? {
        programStore.currentProgram
    }

    var isSelected: Bool {
        programStore.selectedProgramId != nil
    }

    func isProgramSelected(_ programId: String) -> Bool {
        programStore.selectedProgramId == programId
    }

    func selectProgram(_ id: String) {
        programStore.selectProgram(id)
    }

    // MARK: - Current Day Info

    var currentDay: WorkoutProgramDay? {
        programStore.currentDay
    }

    var nextDay: WorkoutProgramDay? {
        programStore.nextDay
    }

    var currentWeek: Int {
        programStore.currentWeek
    }

    var currentDayLabel: String {
        programStore.currentDay?.label ?? "Rest Day"
    }

    // MARK: - Display Helpers

    func difficultyColor(_ difficulty: String) -> String {
        switch difficulty {
        case "Beginner": return "teal"
        case "Intermediate": return "accent"
        case "Advanced": return "danger"
        default: return "accent"
        }
    }

    func repRangeString(for exercise: WorkoutProgramExercise) -> String {
        if exercise.repMin == exercise.repMax {
            return "\(exercise.sets) \u{00D7} \(exercise.repMin)"
        }
        return "\(exercise.sets) \u{00D7} \(exercise.repMin)-\(exercise.repMax)"
    }

    func exerciseName(for id: String) -> String {
        ExerciseLibrary.find(id)?.name ?? id
    }

    // MARK: - Build Workout Session

    /// Builds an ActiveWorkoutSession from a WorkoutProgramDay for use with WorkoutViewModel.
    func buildSession(from day: WorkoutProgramDay) -> (exercises: [ProgramExercise], dayId: Int, label: String) {
        let exercises: [ProgramExercise] = day.exercises.enumerated().map { index, exercise in
            let def = ExerciseLibrary.find(exercise.id)
            let userWeight = workoutStore.userProfile?.weight ?? 185
            let weight: Double
            if let def = def, let profile = workoutStore.userProfile {
                weight = ExerciseLibrary.startingWeight(for: def, profile: profile)
            } else if let def = def {
                weight = ExerciseLibrary.startingWeight(for: def, userWeight: userWeight)
            } else {
                weight = 0
            }

            return ProgramExercise(
                id: exercise.id,
                order: index,
                targetSets: exercise.sets,
                targetRepMin: exercise.repMin,
                targetRepMax: exercise.repMax,
                recommendedWeight: weight,
                restSeconds: exercise.restSeconds
            )
        }

        // Use a hash of the day ID string as the Int identifier
        let dayIdInt = abs(day.id.hashValue) % 10000

        return (exercises: exercises, dayId: dayIdInt, label: day.label)
    }

    /// Creates a ProgramDay (the existing type) from a WorkoutProgramDay for compatibility
    /// with WorkoutViewModel.startWorkout.
    func toProgramDay(from day: WorkoutProgramDay) -> ProgramDay {
        let exercises: [ProgramExercise] = day.exercises.enumerated().map { index, exercise in
            let def = ExerciseLibrary.find(exercise.id)
            let userWeight = workoutStore.userProfile?.weight ?? 185
            let weight: Double
            if let def = def, let profile = workoutStore.userProfile {
                weight = ExerciseLibrary.startingWeight(for: def, profile: profile)
            } else if let def = def {
                weight = ExerciseLibrary.startingWeight(for: def, userWeight: userWeight)
            } else {
                weight = 0
            }

            return ProgramExercise(
                id: exercise.id,
                order: index,
                targetSets: exercise.sets,
                targetRepMin: exercise.repMin,
                targetRepMax: exercise.repMax,
                recommendedWeight: weight,
                restSeconds: exercise.restSeconds
            )
        }

        let dayIndex = programStore.currentDayIndex
        return ProgramDay(id: dayIndex, label: day.label, exercises: exercises)
    }
}
