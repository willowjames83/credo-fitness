import SwiftUI

@Observable
class DashboardViewModel {
    let user = mockUser
    let store = WorkoutStore.shared

    // MARK: - Cached Pillar Scores (computed once, used by credoScore + pillarScores)

    private var _cachedStrength: Int {
        StrengthScoreCalculator.calculate(store: store).weightedScore
    }

    private var _cachedCardio: Int {
        CardioScoreCalculator.calculate(store: CardioStore.shared)
    }

    private var _cachedNutrition: Int {
        NutritionScoreCalculator.calculate(store: NutritionStore.shared)
    }

    private var _cachedStability: Int {
        StabilityScoreCalculator.calculate(store: store)
    }

    var strengthSubscores: StrengthSubscores {
        StrengthScoreCalculator.calculate(store: store)
    }

    var credoScore: CredoScore {
        let composite = ScoringEngine.compositeScore(
            strength: _cachedStrength,
            cardio: _cachedCardio,
            stability: _cachedStability,
            nutrition: _cachedNutrition
        )
        let delta: Int
        if let previous = store.scoreHistory.dropLast().last {
            delta = composite - previous.credoScore
        } else {
            delta = 0
        }
        return CredoScore(score: composite, delta: delta)
    }

    var pillarScores: [Pillar: PillarScore] {
        let strengthScore = _cachedStrength
        let cardioScore = _cachedCardio
        let nutritionScore = _cachedNutrition
        let stabilityScore = _cachedStability

        let workoutsThisWeek = store.completedWorkoutsThisWeek()
        let sessionsThisWeek = workoutsThisWeek.count
        let totalDays = store.selectedProgram?.daysPerWeek ?? 3
        let totalVolume = workoutsThisWeek.reduce(0.0) { total, workout in
            total + workout.exercises.reduce(0.0) { exTotal, exercise in
                exTotal + exercise.sets.reduce(0.0) { $0 + $1.weight * Double($1.reps) }
            }
        }
        let volumeStr = totalVolume > 0
            ? "\(Int(totalVolume).formatted()) lbs total volume"
            : "No volume logged"

        let weakest: Pillar = {
            let scores: [(Pillar, Int)] = [
                (.strength, strengthScore),
                (.stability, stabilityScore),
                (.cardio, cardioScore),
                (.nutrition, nutritionScore)
            ]
            return scores.min(by: { $0.1 < $1.1 })?.0 ?? .stability
        }()

        let cardioMinutes = weeklyCardioMinutes
        let cardioSessions = weeklyCardioSessions

        return [
            .strength: PillarScore(
                score: strengthScore,
                metrics: [
                    "\(sessionsThisWeek) of \(totalDays) sessions done",
                    volumeStr
                ],
                isWeakest: weakest == .strength
            ),
            .stability: PillarScore(
                score: stabilityScore,
                metrics: [
                    "\(StabilityStore.shared.warmupsCompleted(inLastDays: 14)) warmups completed",
                    "\(weeklyCoreSets) core sets this week"
                ],
                isWeakest: weakest == .stability
            ),
            .cardio: PillarScore(
                score: cardioScore,
                metrics: [
                    "\(cardioMinutes) min this week",
                    "\(cardioSessions) sessions"
                ],
                isWeakest: weakest == .cardio
            ),
            .nutrition: PillarScore(
                score: nutritionScore,
                metrics: [
                    "\(Int(NutritionStore.shared.todaysMacros().p))g protein today",
                    "\(NutritionStore.shared.daysLoggedThisWeek()) of 7 days logged"
                ],
                isWeakest: weakest == .nutrition
            ),
        ]
    }

    var scoreHistory: [ScoreHistoryEntry] {
        // Convert real snapshots to ScoreHistoryEntry
        var entries: [ScoreHistoryEntry] = store.scoreHistory.map { snapshot in
            ScoreHistoryEntry(
                week: snapshot.weekNumber,
                credo: snapshot.credoScore,
                strength: snapshot.strengthScore,
                stability: snapshot.stabilityScore,
                cardio: snapshot.cardioScore,
                nutrition: snapshot.nutritionScore
            )
        }

        // If we have fewer than 4 entries, pad with mock data for chart display
        if entries.count < 4 {
            entries = mockScoreHistory
        }

        return entries
    }

    /// Whether we have real workout data to display scores.
    var hasWorkoutData: Bool {
        !store.workoutHistory.isEmpty
    }

    /// Current muscle recovery status computed on-demand from workout history.
    var muscleRecoveryStatuses: [MuscleRecoveryStatus] {
        RecoveryEngine.calculateRecovery(store: store)
    }

    // MARK: - Workout Info

    var todayWorkoutName: String {
        guard let program = store.selectedProgram else { return "No program selected" }
        let userWeight = store.userProfile?.weight ?? user.weight
        let days = ProgramGenerator.generateDays(for: program, userWeight: userWeight)
        let dayIndex = store.currentDayIndex % days.count
        return days[dayIndex].label
    }

    var todayWorkoutDetail: String {
        guard let program = store.selectedProgram else { return "Choose a training program" }
        let userWeight = store.userProfile?.weight ?? user.weight
        let days = ProgramGenerator.generateDays(for: program, userWeight: userWeight)
        let dayIndex = store.currentDayIndex % days.count
        return "\(days[dayIndex].exercises.count) exercises \u{00B7} ~\(days[dayIndex].exercises.count * 8) min"
    }

    var todayWorkoutSubtitle: String {
        guard let program = store.selectedProgram else { return "" }
        return "Week \(store.currentWeek) \u{00B7} Day \(store.currentDayIndex + 1) of \(program.daysPerWeek)"
    }

    var weekProgress: [Bool] {
        store.weekProgressBooleans()
    }

    var hasProgramSelected: Bool { store.selectedProgram != nil }

    // MARK: - Stability Metrics

    private var weeklyCoreSets: Int {
        let weekStart = Calendar.current.dateInterval(of: .weekOfYear, for: Date())?.start ?? Date()
        return store.workoutHistory.filter { $0.date >= weekStart }.reduce(0) { total, workout in
            total + workout.exercises.reduce(0) { exTotal, exercise in
                guard let def = ExerciseLibrary.find(exercise.exerciseId),
                      def.movementPattern == .core else { return exTotal }
                return exTotal + exercise.sets.count
            }
        }
    }

    // MARK: - Progression Insights (cached to avoid re-sorting all workout history)

    private var _cachedInsights: [ProgressionInsight]?
    private var _insightsCacheCount: Int = -1

    var topProgressionInsights: [ProgressionInsight] {
        // Invalidate cache when workout count changes
        let currentCount = store.workoutHistory.count
        if _insightsCacheCount != currentCount {
            _insightsCacheCount = currentCount
            _cachedInsights = OverloadEngine.generateInsights(store: store)
        }
        return Array((_cachedInsights ?? []).prefix(3))
    }

    // MARK: - Cardio Summary

    var weeklyCardioMinutes: Int {
        CardioStore.shared.weeklyCardioMinutes()
    }

    var weeklyCardioSessions: Int {
        CardioStore.shared.sessionsThisWeek().count
    }
}
