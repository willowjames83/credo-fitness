import Foundation

struct ProgramGenerator {

    static func generateDays(for template: ProgramTemplate, userWeight: Int) -> [ProgramDay] {
        let layout = exerciseLayout(for: template)
        let labels = template.dayLabels
        let profile = WorkoutStore.shared.userProfile
        let store = WorkoutStore.shared
        let week = store.currentWeek

        return layout.enumerated().map { dayIndex, exerciseIds in
            let exercises = exerciseIds.enumerated().compactMap { order, exerciseId -> ProgramExercise? in
                guard let def = ExerciseLibrary.find(exerciseId) else { return nil }
                let weight: Double
                if let profile = profile {
                    weight = ExerciseLibrary.startingWeight(for: def, profile: profile)
                } else {
                    weight = ExerciseLibrary.startingWeight(for: def, userWeight: userWeight)
                }
                return ProgramExercise(
                    id: def.id,
                    order: order,
                    targetSets: def.defaultSets,
                    targetRepMin: def.defaultRepRange[0],
                    targetRepMax: def.defaultRepRange[1],
                    recommendedWeight: weight,
                    restSeconds: def.defaultRestSeconds
                )
            }
            var day = ProgramDay(id: dayIndex, label: labels[dayIndex], exercises: exercises)

            // Apply exercise rotation for accessories
            let slots = ExerciseRotationEngine.rotateExercises(for: day, week: week, store: store)
            let rotatedExercises = slots.enumerated().compactMap { order, slot -> ProgramExercise? in
                guard let def = ExerciseLibrary.find(slot.selectedExerciseId) else {
                    // Fall back to original if rotated exercise not found
                    return day.exercises.indices.contains(order) ? day.exercises[order] : nil
                }
                let weight: Double
                if let profile = profile {
                    weight = ExerciseLibrary.startingWeight(for: def, profile: profile)
                } else {
                    weight = ExerciseLibrary.startingWeight(for: def, userWeight: userWeight)
                }
                return ProgramExercise(
                    id: def.id,
                    order: order,
                    targetSets: def.defaultSets,
                    targetRepMin: def.defaultRepRange[0],
                    targetRepMax: def.defaultRepRange[1],
                    recommendedWeight: weight,
                    restSeconds: def.defaultRestSeconds
                )
            }

            day = ProgramDay(id: dayIndex, label: labels[dayIndex], exercises: rotatedExercises)
            return day
        }
    }

    /// Identify antagonist superset pairs for a given day's exercises.
    /// Returns SupersetGroups with indices into the exercise array.
    static func identifySupersets(for day: ProgramDay) -> [SupersetGroup] {
        let exercises = day.exercises
        var groups: [SupersetGroup] = []
        var pairedIndices = Set<Int>()

        // Antagonist pairs defined by exercise IDs
        let antagonistPairs: [(Set<String>, Set<String>)] = [
            (["bench_press", "incline_bench", "incline_db_press"], ["barbell_row", "cable_row"]),
            (["ohp", "db_ohp"], ["weighted_pullup", "pullup"]),
            (["barbell_curl", "hammer_curl"], ["tricep_pushdown", "overhead_tricep_ext"]),
        ]

        // Main compounds that should NOT be superset (squat, deadlift variants)
        let noSupersetIds: Set<String> = [
            "back_squat", "deadlift", "front_squat", "trap_bar_deadlift"
        ]

        for (groupA, groupB) in antagonistPairs {
            // Find indices of exercises from each antagonist group
            var indexA: Int?
            var indexB: Int?

            for (i, exercise) in exercises.enumerated() {
                guard !pairedIndices.contains(i) && !noSupersetIds.contains(exercise.id) else { continue }
                if groupA.contains(exercise.id) && indexA == nil {
                    indexA = i
                } else if groupB.contains(exercise.id) && indexB == nil {
                    indexB = i
                }
            }

            if let a = indexA, let b = indexB {
                // Only pair if set counts are similar (within 1)
                let setsA = exercises[a].targetSets
                let setsB = exercises[b].targetSets
                if abs(setsA - setsB) <= 1 {
                    let group = SupersetGroup(
                        exerciseIndices: [a, b],
                        type: .antagonist
                    )
                    groups.append(group)
                    pairedIndices.insert(a)
                    pairedIndices.insert(b)
                }
            }
        }

        return groups
    }

    // MARK: - Exercise layouts per template

    private static func exerciseLayout(for template: ProgramTemplate) -> [[String]] {
        switch template {
        case .pushPullLegs3:
            return [
                ["bench_press", "ohp", "incline_db_press", "lateral_raise", "tricep_pushdown", "overhead_tricep_ext"],
                ["barbell_row", "pullup", "cable_row", "face_pull", "barbell_curl", "hammer_curl"],
                ["back_squat", "rdl", "leg_press", "leg_curl", "calf_raise", "hanging_knee_raise"]
            ]

        case .upperLowerFull3:
            return [
                ["bench_press", "barbell_row", "ohp", "pullup", "barbell_curl", "tricep_pushdown"],
                ["back_squat", "rdl", "bulgarian_split_squat", "leg_curl", "farmer_carry", "hanging_knee_raise"],
                ["deadlift", "incline_db_press", "cable_row", "lateral_raise", "calf_raise", "pallof_press"]
            ]

        case .pushPullLegsFull4:
            return [
                ["bench_press", "ohp", "incline_db_press", "lateral_raise", "tricep_pushdown", "overhead_tricep_ext"],
                ["barbell_row", "weighted_pullup", "cable_row", "face_pull", "barbell_curl", "hammer_curl"],
                ["back_squat", "rdl", "bulgarian_split_squat", "leg_curl", "calf_raise", "hanging_knee_raise"],
                ["trap_bar_deadlift", "ohp", "barbell_row", "walking_lunge", "lateral_raise", "pallof_press"]
            ]

        case .pushPullLegsUpperLower5:
            return [
                ["bench_press", "ohp", "incline_db_press", "lateral_raise", "tricep_pushdown", "overhead_tricep_ext"],
                ["barbell_row", "pullup", "cable_row", "face_pull", "barbell_curl", "hammer_curl"],
                ["back_squat", "rdl", "leg_press", "leg_curl", "calf_raise", "hanging_knee_raise"],
                ["incline_bench", "weighted_pullup", "db_ohp", "cable_row", "hammer_curl", "tricep_pushdown"],
                ["front_squat", "trap_bar_deadlift", "bulgarian_split_squat", "single_leg_rdl", "farmer_carry", "pallof_press"]
            ]

        case .fullBody2:
            return [
                ["back_squat", "bench_press", "barbell_row", "ohp", "barbell_curl", "hanging_knee_raise"],
                ["deadlift", "incline_db_press", "pullup", "lateral_raise", "tricep_pushdown", "calf_raise"]
            ]
        }
    }
}
