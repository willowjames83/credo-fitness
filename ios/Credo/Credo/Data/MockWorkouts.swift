import Foundation

// Mock data updated to use new workout types
// This is used for SwiftUI previews only

let mockActiveExercise = ActiveExercise(
    id: "back_squat",
    name: "Back Squat",
    muscleGroup: "Quads, Glutes",
    targetSets: 4,
    targetRepMin: 6,
    targetRepMax: 8,
    recommendedWeight: 185,
    restSeconds: 120,
    previousSession: "175 × 8, 8, 7, 6",
    formCues: ["Brace core before descent", "Break at hips and knees simultaneously", "Drive through mid-foot"],
    isBodyweight: false,
    isPerSide: false,
    weightIncrement: 5.0,
    sets: [
        WorkoutSet(id: 1, weight: 185, reps: 8, completed: true),
        WorkoutSet(id: 2, weight: 185, reps: 8, completed: true),
        WorkoutSet(id: 3, weight: 185, reps: nil, completed: false),
        WorkoutSet(id: 4, weight: 185, reps: nil, completed: false),
    ]
)

let mockUpcomingExercises = [
    ActiveExercise(
        id: "romanian_deadlift", name: "Romanian Deadlift", muscleGroup: "Hamstrings",
        targetSets: 3, targetRepMin: 8, targetRepMax: 10, recommendedWeight: 135,
        restSeconds: 90, previousSession: nil, formCues: [], isBodyweight: false,
        isPerSide: false, weightIncrement: 5.0,
        sets: (1...3).map { WorkoutSet(id: $0, weight: 135, reps: nil, completed: false) }
    ),
    ActiveExercise(
        id: "bulgarian_split_squat", name: "Bulgarian Split Squat", muscleGroup: "Quads, Glutes",
        targetSets: 3, targetRepMin: 10, targetRepMax: 10, recommendedWeight: 40,
        restSeconds: 90, previousSession: nil, formCues: [], isBodyweight: false,
        isPerSide: true, weightIncrement: 5.0,
        sets: (1...3).map { WorkoutSet(id: $0, weight: 40, reps: nil, completed: false) }
    ),
]

let mockWorkoutSession = ActiveWorkoutSession(
    programTemplate: "upper_lower",
    dayIndex: 1,
    dayLabel: "Lower Body Strength",
    week: 12,
    exercises: [mockActiveExercise] + mockUpcomingExercises,
    currentExerciseIndex: 0,
    startTime: Date().addingTimeInterval(-1935)
)
