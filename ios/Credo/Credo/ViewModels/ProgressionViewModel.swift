import Foundation
import SwiftUI

@Observable
class ProgressionViewModel {

    var insights: [ProgressionInsight] = []
    var selectedExercise: String?
    var chartData: [ExerciseProgressPoint] = []
    var exerciseList: [(id: String, name: String)] = []

    private let store: WorkoutStore

    init(store: WorkoutStore = .shared) {
        self.store = store
        refresh()
    }

    // MARK: - Public Methods

    func refresh() {
        insights = OverloadEngine.generateInsights(store: store)
        exerciseList = buildExerciseList()
        if let first = selectedExercise ?? exerciseList.first?.id {
            selectExercise(first)
        }
    }

    func selectExercise(_ id: String) {
        selectedExercise = id
        chartData = OverloadEngine.progressionData(exerciseId: id, store: store)
    }

    func insightsForType(_ type: InsightType) -> [ProgressionInsight] {
        insights.filter { $0.type == type }
    }

    // MARK: - Computed Properties

    var topInsights: [ProgressionInsight] {
        Array(insights.prefix(3))
    }

    var hasDeloadWarning: Bool {
        insights.contains { $0.type == .deload }
    }

    var exercisesWithPlateaus: [ProgressionInsight] {
        insightsForType(.plateau)
    }

    var progressingCount: Int {
        insightsForType(.increase).count + insightsForType(.newPR).count
    }

    var plateauCount: Int {
        insightsForType(.plateau).count
    }

    var deloadCount: Int {
        insightsForType(.deload).count
    }

    /// The suggestion for the currently selected exercise, if any.
    var currentSuggestion: WeightSuggestion? {
        guard let id = selectedExercise else { return nil }
        return OverloadEngine.suggestNextWeight(exerciseId: id, store: store)
    }

    /// Current 1RM for the selected exercise.
    var current1RM: Double? {
        guard let id = selectedExercise else { return nil }
        return store.exercise1RMs[id]
    }

    /// Best weight x reps for the selected exercise.
    var bestSet: (weight: Double, reps: Int)? {
        guard let id = selectedExercise else { return nil }
        var best: (weight: Double, reps: Int)?
        var bestEstimate: Double = 0
        for workout in store.workoutHistory {
            for exercise in workout.exercises where exercise.exerciseId == id {
                for set in exercise.sets {
                    let estimate = ProgressionEngine.estimated1RM(weight: set.weight, reps: set.reps)
                    if estimate > bestEstimate {
                        bestEstimate = estimate
                        best = (weight: set.weight, reps: set.reps)
                    }
                }
            }
        }
        return best
    }

    /// Number of sessions tracked for the selected exercise.
    var sessionsTracked: Int {
        guard let id = selectedExercise else { return 0 }
        return store.workoutHistory.filter { workout in
            workout.exercises.contains { $0.exerciseId == id }
        }.count
    }

    /// Session history for the selected exercise, most recent first.
    var sessionHistory: [(date: Date, weight: Double, reps: Int, rir: Int, estimated1RM: Double)] {
        guard let id = selectedExercise else { return [] }
        var history: [(date: Date, weight: Double, reps: Int, rir: Int, estimated1RM: Double)] = []
        for workout in store.workoutHistory.sorted(by: { $0.date > $1.date }) {
            for exercise in workout.exercises where exercise.exerciseId == id {
                if let bestSet = exercise.sets.max(by: {
                    ProgressionEngine.estimated1RM(weight: $0.weight, reps: $0.reps) <
                    ProgressionEngine.estimated1RM(weight: $1.weight, reps: $1.reps)
                }) {
                    history.append((
                        date: workout.date,
                        weight: bestSet.weight,
                        reps: bestSet.reps,
                        rir: exercise.rir,
                        estimated1RM: exercise.estimated1RM
                    ))
                }
            }
        }
        return history
    }

    // MARK: - Private

    /// Build list of exercises that have at least 2 sessions of data.
    private func buildExerciseList() -> [(id: String, name: String)] {
        var counts: [String: Int] = [:]
        for workout in store.workoutHistory {
            for exercise in workout.exercises {
                counts[exercise.exerciseId, default: 0] += 1
            }
        }
        return counts
            .filter { $0.value >= 2 }
            .compactMap { (id, _) in
                guard let definition = ExerciseLibrary.find(id) else { return nil }
                return (id: id, name: definition.name)
            }
            .sorted { $0.name < $1.name }
    }
}
