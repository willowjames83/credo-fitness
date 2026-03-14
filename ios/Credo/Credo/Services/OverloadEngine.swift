import Foundation

struct OverloadEngine {

    // MARK: - Public API

    /// Analyze all tracked exercises and generate actionable insights.
    static func generateInsights(store: WorkoutStore) -> [ProgressionInsight] {
        // Pre-compute session map ONCE (avoids re-sorting per exercise)
        let sessionMap = buildSessionMap(store: store)
        var insights: [ProgressionInsight] = []

        for (exerciseId, sessions) in sessionMap {
            guard let definition = ExerciseLibrary.find(exerciseId) else { continue }
            guard !sessions.isEmpty else { continue }

            // Check for new PR (most recent session set a new 1RM)
            if let latestSession = sessions.last {
                let current1RM = store.exercise1RMs[exerciseId] ?? 0
                if latestSession.estimated1RM >= current1RM && current1RM > 0 {
                    let daysSinceLast = Calendar.current.dateComponents(
                        [.day], from: latestSession.date, to: Date()
                    ).day ?? 0
                    if daysSinceLast <= 7 {
                        insights.append(ProgressionInsight(
                            exerciseId: exerciseId,
                            exerciseName: definition.name,
                            type: .newPR,
                            currentWeight: current1RM,
                            message: "New estimated 1RM: \(formatWeight(current1RM)) lbs",
                            detail: "Set during your last session with \(formatWeight(latestSession.bestSet.weight)) lbs x \(latestSession.bestSet.reps)"
                        ))
                    }
                }
            }

            // Check deload
            if detectDeload(sessions: sessions, exerciseId: exerciseId, store: store) {
                let lastWeight = sessions.last?.bestSet.weight ?? 0
                let deloadWeight = ProgressionEngine.roundToNearest(
                    lastWeight * 0.9, increment: definition.weightIncrement
                )
                insights.append(ProgressionInsight(
                    exerciseId: exerciseId,
                    exerciseName: definition.name,
                    type: .deload,
                    suggestedWeight: deloadWeight,
                    currentWeight: lastWeight,
                    message: "Consider a deload to \(formatWeight(deloadWeight)) lbs",
                    detail: "No 1RM improvement in 3+ sessions with low RIR. A short deload can help you push past this."
                ))
                continue // Don't also suggest increase if deload is needed
            }

            // Check plateau
            if detectPlateau(sessions: sessions, definition: definition) {
                let current1RM = store.exercise1RMs[exerciseId] ?? 0
                insights.append(ProgressionInsight(
                    exerciseId: exerciseId,
                    exerciseName: definition.name,
                    type: .plateau,
                    currentWeight: current1RM,
                    message: "1RM has been flat for 4+ weeks",
                    detail: "Try varying rep ranges, adding paused reps, or changing exercise selection to break through."
                ))
                continue
            }

            // Check for weight increase readiness
            if let suggestion = suggestNextWeight(sessions: sessions, exerciseId: exerciseId, definition: definition, store: store) {
                insights.append(ProgressionInsight(
                    exerciseId: exerciseId,
                    exerciseName: definition.name,
                    type: .increase,
                    suggestedWeight: suggestion.suggestedWeight,
                    currentWeight: suggestion.currentWeight,
                    message: "Ready for \(formatWeight(suggestion.suggestedWeight)) lbs",
                    detail: suggestion.reason
                ))
            }

            // Milestone: 10+ sessions tracked
            let sessionCount = sessions.count
            let milestones = [10, 25, 50, 100]
            for milestone in milestones {
                if sessionCount == milestone {
                    insights.append(ProgressionInsight(
                        exerciseId: exerciseId,
                        exerciseName: definition.name,
                        type: .milestone,
                        message: "\(milestone) sessions tracked",
                        detail: "Consistency is the foundation of progress. Keep it up!"
                    ))
                }
            }
        }

        return insights.sorted { $0.type.priority < $1.type.priority }
    }

    /// Suggest next weight based on recent RIR trends across the last 3 sessions.
    static func suggestNextWeight(exerciseId: String, store: WorkoutStore) -> WeightSuggestion? {
        guard let definition = ExerciseLibrary.find(exerciseId) else { return nil }
        let sessions = sessionsForExercise(exerciseId: exerciseId, store: store)
        return suggestNextWeight(sessions: sessions, exerciseId: exerciseId, definition: definition, store: store)
    }

    /// Detect if a deload is warranted.
    static func detectDeload(exerciseId: String, store: WorkoutStore) -> Bool {
        let sessions = sessionsForExercise(exerciseId: exerciseId, store: store)
        return detectDeload(sessions: sessions, exerciseId: exerciseId, store: store)
    }

    /// Detect plateau: compound lift 1RM flat for 4+ weeks.
    static func detectPlateau(exerciseId: String, store: WorkoutStore) -> Bool {
        guard let definition = ExerciseLibrary.find(exerciseId) else { return false }
        let sessions = sessionsForExercise(exerciseId: exerciseId, store: store)
        return detectPlateau(sessions: sessions, definition: definition)
    }

    /// Returns time series data for charting an exercise's progression.
    static func progressionData(exerciseId: String, store: WorkoutStore) -> [ExerciseProgressPoint] {
        let sessions = sessionsForExercise(exerciseId: exerciseId, store: store)
        return sessions.map { session in
            ExerciseProgressPoint(
                date: session.date,
                weight: session.bestSet.weight,
                estimated1RM: session.estimated1RM,
                reps: session.bestSet.reps,
                rir: session.rir
            )
        }
    }

    // MARK: - Internal (pre-computed session variants)

    private static func suggestNextWeight(
        sessions: [ExerciseSession],
        exerciseId: String,
        definition: ExerciseDefinition,
        store: WorkoutStore
    ) -> WeightSuggestion? {
        guard sessions.count >= 2 else { return nil }

        let recentSessions = Array(sessions.suffix(3))
        let rirs = recentSessions.compactMap(\.rir)
        let avgRIR = rirs.isEmpty ? 0.0 : Double(rirs.reduce(0, +)) / Double(rirs.count)

        // Count sessions where RIR >= 2
        let easySessionCount = recentSessions.filter { ($0.rir ?? 0) >= 2 }.count
        guard easySessionCount >= 2 else { return nil }

        // Already at deload? Don't suggest increase
        if detectDeload(sessions: sessions, exerciseId: exerciseId, store: store) { return nil }

        let lastWeight = recentSessions.last?.bestSet.weight ?? 0
        guard lastWeight > 0 else { return nil }

        let isLowerBody = definition.movementPattern == .squat ||
                          definition.movementPattern == .hinge
        let increment: Double = isLowerBody ? 10 : 5

        let suggestedWeight = ProgressionEngine.roundToNearest(
            lastWeight + increment, increment: definition.weightIncrement
        )

        let confidence: Double
        if recentSessions.count >= 3 && easySessionCount == 3 {
            confidence = 0.9
        } else if easySessionCount >= 2 {
            confidence = 0.7
        } else {
            confidence = 0.5
        }

        let reason = String(
            format: "Avg RIR of %.1f across last %d sessions suggests you have room to grow. Increase by %g lbs.",
            avgRIR, recentSessions.count, increment
        )

        return WeightSuggestion(
            exerciseId: exerciseId,
            currentWeight: lastWeight,
            suggestedWeight: suggestedWeight,
            reason: reason,
            confidence: confidence
        )
    }

    private static func detectDeload(
        sessions: [ExerciseSession],
        exerciseId: String,
        store: WorkoutStore
    ) -> Bool {
        guard sessions.count >= 3 else { return false }

        let recentThree = Array(sessions.suffix(3))

        // Check no 1RM improvement across the 3 sessions
        let oneRMs = recentThree.map { $0.estimated1RM }
        let maxRM = oneRMs.max() ?? 0
        let minRM = oneRMs.min() ?? 0
        let isFlat = maxRM > 0 && (maxRM - minRM) / maxRM < 0.02 // within 2%

        // Check that the best recent 1RM hasn't exceeded the all-time 1RM
        let allTime1RM = store.exercise1RMs[exerciseId] ?? 0
        let noImprovement = maxRM <= allTime1RM || allTime1RM == 0

        // Check average RIR <= 1
        let rirs = recentThree.compactMap(\.rir)
        guard !rirs.isEmpty else { return false }
        let avgRIR = Double(rirs.reduce(0, +)) / Double(rirs.count)

        return (isFlat || noImprovement) && avgRIR <= 1.0
    }

    private static func detectPlateau(
        sessions: [ExerciseSession],
        definition: ExerciseDefinition
    ) -> Bool {
        // Only compound movements
        let compoundPatterns: [MovementPattern] = [.push, .pull, .hinge, .squat]
        guard compoundPatterns.contains(definition.movementPattern) else { return false }
        guard sessions.count >= 3 else { return false }

        guard let firstDate = sessions.first?.date,
              let lastDate = sessions.last?.date else { return false }

        let weekSpan = Calendar.current.dateComponents([.weekOfYear], from: firstDate, to: lastDate).weekOfYear ?? 0
        guard weekSpan >= 4 else { return false }

        let fourWeeksAgo = Calendar.current.date(byAdding: .weekOfYear, value: -4, to: Date()) ?? Date()
        let recentSessions = sessions.filter { $0.date >= fourWeeksAgo }
        guard recentSessions.count >= 3 else { return false }

        let oneRMs = recentSessions.map { $0.estimated1RM }
        guard let maxRM = oneRMs.max(), let minRM = oneRMs.min(), maxRM > 0 else { return false }
        let variation = (maxRM - minRM) / maxRM

        return variation < 0.02
    }

    // MARK: - Session Map (single pass, single sort)

    /// Build a map of exerciseId -> sorted sessions in ONE pass over workout history.
    private static func buildSessionMap(store: WorkoutStore) -> [String: [ExerciseSession]] {
        var map: [String: [ExerciseSession]] = [:]
        let sortedWorkouts = store.workoutHistory.sorted(by: { $0.date < $1.date })

        for workout in sortedWorkouts {
            for exercise in workout.exercises {
                guard let bestSet = exercise.sets.max(by: {
                    ProgressionEngine.estimated1RM(weight: $0.weight, reps: $0.reps) <
                    ProgressionEngine.estimated1RM(weight: $1.weight, reps: $1.reps)
                }) else { continue }
                let session = ExerciseSession(
                    date: workout.date,
                    bestSet: (weight: bestSet.weight, reps: bestSet.reps),
                    estimated1RM: exercise.estimated1RM,
                    rir: exercise.rir,
                    allSets: exercise.sets
                )
                map[exercise.exerciseId, default: []].append(session)
            }
        }

        return map
    }

    /// Fallback for single-exercise queries from the public API.
    private static func sessionsForExercise(
        exerciseId: String,
        store: WorkoutStore
    ) -> [ExerciseSession] {
        var sessions: [ExerciseSession] = []
        for workout in store.workoutHistory.sorted(by: { $0.date < $1.date }) {
            for exercise in workout.exercises where exercise.exerciseId == exerciseId {
                guard let bestSet = exercise.sets.max(by: {
                    ProgressionEngine.estimated1RM(weight: $0.weight, reps: $0.reps) <
                    ProgressionEngine.estimated1RM(weight: $1.weight, reps: $1.reps)
                }) else { continue }
                sessions.append(ExerciseSession(
                    date: workout.date,
                    bestSet: (weight: bestSet.weight, reps: bestSet.reps),
                    estimated1RM: exercise.estimated1RM,
                    rir: exercise.rir,
                    allSets: exercise.sets
                ))
            }
        }
        return sessions
    }

    private static func formatWeight(_ weight: Double) -> String {
        weight.formattedWeight
    }
}

// MARK: - Internal Types

private struct ExerciseSession {
    let date: Date
    let bestSet: (weight: Double, reps: Int)
    let estimated1RM: Double
    let rir: Int?
    let allSets: [CompletedSet]
}
