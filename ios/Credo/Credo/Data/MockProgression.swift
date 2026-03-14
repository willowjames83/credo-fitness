#if DEBUG
import Foundation

enum MockProgression {

    // MARK: - Insights

    static let insights: [ProgressionInsight] = [
        ProgressionInsight(
            exerciseId: "bench_press",
            exerciseName: "Bench Press",
            type: .newPR,
            currentWeight: 242,
            message: "New estimated 1RM: 242 lbs",
            detail: "Set during your last session with 205 lbs x 6"
        ),
        ProgressionInsight(
            exerciseId: "back_squat",
            exerciseName: "Back Squat",
            type: .increase,
            suggestedWeight: 285,
            currentWeight: 275,
            message: "Ready for 285 lbs",
            detail: "Avg RIR of 2.3 across last 3 sessions suggests you have room to grow. Increase by 10 lbs."
        ),
        ProgressionInsight(
            exerciseId: "ohp",
            exerciseName: "Overhead Press",
            type: .plateau,
            currentWeight: 135,
            message: "1RM has been flat for 4+ weeks",
            detail: "Try varying rep ranges, adding paused reps, or changing exercise selection to break through."
        ),
        ProgressionInsight(
            exerciseId: "barbell_row",
            exerciseName: "Barbell Row",
            type: .deload,
            suggestedWeight: 155,
            currentWeight: 175,
            message: "Consider a deload to 155 lbs",
            detail: "No 1RM improvement in 3+ sessions with low RIR. A short deload can help you push past this."
        ),
        ProgressionInsight(
            exerciseId: "deadlift",
            exerciseName: "Deadlift",
            type: .milestone,
            message: "25 sessions tracked",
            detail: "Consistency is the foundation of progress. Keep it up!"
        ),
    ]

    // MARK: - Bench Press Progress (8 weeks)

    static let benchPressProgress: [ExerciseProgressPoint] = {
        let calendar = Calendar.current
        let today = Date()
        let data: [(weeksAgo: Int, weight: Double, e1rm: Double, reps: Int, rir: Int)] = [
            (8, 175, 204, 5, 3),
            (7, 180, 210, 5, 3),
            (6, 185, 216, 5, 2),
            (5, 185, 222, 6, 2),
            (4, 190, 222, 5, 2),
            (3, 195, 228, 5, 2),
            (2, 200, 233, 5, 1),
            (1, 205, 242, 6, 1),
        ]
        return data.map { item in
            let date = calendar.date(byAdding: .weekOfYear, value: -item.weeksAgo, to: today)!
            return ExerciseProgressPoint(
                date: date,
                weight: item.weight,
                estimated1RM: item.e1rm,
                reps: item.reps,
                rir: item.rir
            )
        }
    }()

    // MARK: - Back Squat Progress (8 weeks)

    static let backSquatProgress: [ExerciseProgressPoint] = {
        let calendar = Calendar.current
        let today = Date()
        let data: [(weeksAgo: Int, weight: Double, e1rm: Double, reps: Int, rir: Int)] = [
            (8, 225, 263, 5, 3),
            (7, 235, 274, 5, 2),
            (6, 245, 286, 5, 2),
            (5, 250, 292, 5, 2),
            (4, 255, 298, 5, 2),
            (3, 265, 309, 5, 2),
            (2, 270, 315, 5, 2),
            (1, 275, 321, 5, 2),
        ]
        return data.map { item in
            let date = calendar.date(byAdding: .weekOfYear, value: -item.weeksAgo, to: today)!
            return ExerciseProgressPoint(
                date: date,
                weight: item.weight,
                estimated1RM: item.e1rm,
                reps: item.reps,
                rir: item.rir
            )
        }
    }()

    // MARK: - Overhead Press Progress (8 weeks, plateau)

    static let ohpProgress: [ExerciseProgressPoint] = {
        let calendar = Calendar.current
        let today = Date()
        let data: [(weeksAgo: Int, weight: Double, e1rm: Double, reps: Int, rir: Int)] = [
            (8, 105, 123, 5, 2),
            (7, 110, 128, 5, 2),
            (6, 115, 134, 5, 1),
            (5, 115, 134, 5, 1),
            (4, 115, 135, 5, 1),
            (3, 115, 134, 5, 1),
            (2, 115, 135, 5, 0),
            (1, 115, 134, 5, 1),
        ]
        return data.map { item in
            let date = calendar.date(byAdding: .weekOfYear, value: -item.weeksAgo, to: today)!
            return ExerciseProgressPoint(
                date: date,
                weight: item.weight,
                estimated1RM: item.e1rm,
                reps: item.reps,
                rir: item.rir
            )
        }
    }()

    // MARK: - Barbell Row Progress (8 weeks, needs deload)

    static let barbellRowProgress: [ExerciseProgressPoint] = {
        let calendar = Calendar.current
        let today = Date()
        let data: [(weeksAgo: Int, weight: Double, e1rm: Double, reps: Int, rir: Int)] = [
            (8, 135, 158, 5, 3),
            (7, 145, 169, 5, 2),
            (6, 155, 181, 5, 2),
            (5, 165, 193, 5, 1),
            (4, 170, 198, 5, 1),
            (3, 175, 204, 5, 1),
            (2, 175, 204, 5, 0),
            (1, 175, 204, 5, 0),
        ]
        return data.map { item in
            let date = calendar.date(byAdding: .weekOfYear, value: -item.weeksAgo, to: today)!
            return ExerciseProgressPoint(
                date: date,
                weight: item.weight,
                estimated1RM: item.e1rm,
                reps: item.reps,
                rir: item.rir
            )
        }
    }()

    // MARK: - Deadlift Progress (8 weeks, steady gains)

    static let deadliftProgress: [ExerciseProgressPoint] = {
        let calendar = Calendar.current
        let today = Date()
        let data: [(weeksAgo: Int, weight: Double, e1rm: Double, reps: Int, rir: Int)] = [
            (8, 275, 321, 5, 3),
            (7, 285, 332, 5, 3),
            (6, 295, 344, 5, 2),
            (5, 305, 356, 5, 2),
            (4, 315, 368, 5, 2),
            (3, 325, 379, 5, 2),
            (2, 335, 391, 5, 2),
            (1, 345, 403, 5, 2),
        ]
        return data.map { item in
            let date = calendar.date(byAdding: .weekOfYear, value: -item.weeksAgo, to: today)!
            return ExerciseProgressPoint(
                date: date,
                weight: item.weight,
                estimated1RM: item.e1rm,
                reps: item.reps,
                rir: item.rir
            )
        }
    }()
}

#endif
