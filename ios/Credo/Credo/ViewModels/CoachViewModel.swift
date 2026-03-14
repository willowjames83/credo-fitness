import Foundation

@Observable
class CoachViewModel {
    let store = WorkoutStore.shared
    let coachService = AICoachService.shared

    var messages: [CoachMessage] = []
    var inputText: String = ""
    var isLoading: Bool = false
    var errorMessage: String? = nil

    let suggestedPrompts = [
        "How's my progress?",
        "What should I focus on?",
        "Explain my Credo Score",
        "Help me break a plateau",
        "Suggest a deload week"
    ]

    private let messagesKey = "credo_coachMessages"

    init() {
        loadMessages()
    }

    func sendMessage() async {
        let text = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }

        let userMessage = CoachMessage(role: .user, content: text)
        messages.append(userMessage)
        inputText = ""
        isLoading = true
        errorMessage = nil

        do {
            let response = try await coachService.sendMessage(
                userMessage: text,
                conversationHistory: Array(messages.dropLast()),
                context: currentContext
            )
            let assistantMessage = CoachMessage(role: .assistant, content: response)
            messages.append(assistantMessage)
            saveMessages()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func sendSuggestedPrompt(_ prompt: String) async {
        inputText = prompt
        await sendMessage()
    }

    func retry() async {
        guard let lastUserMessage = messages.last(where: { $0.role == .user }) else { return }

        // Remove the last user message so sendMessage re-adds it
        if let lastIndex = messages.lastIndex(where: { $0.role == .user }) {
            // Also remove any assistant message after it
            messages = Array(messages.prefix(upTo: lastIndex))
        }

        inputText = lastUserMessage.content
        await sendMessage()
    }

    func clearConversation() {
        messages = []
        errorMessage = nil
        saveMessages()
    }

    // MARK: - Context Building

    var currentContext: CoachContext {
        let profile = store.userProfile

        let strengthSubscores = StrengthScoreCalculator.calculate(store: store)
        let strengthScore = strengthSubscores.weightedScore

        let stabilityScore = 41
        let cardioScore = 76
        let nutritionScore = 85
        let credoScore = ScoringEngine.compositeScore(
            strength: strengthScore,
            cardio: cardioScore,
            stability: stabilityScore,
            nutrition: nutritionScore
        )

        return CoachContext(
            userName: profile?.firstName ?? "Athlete",
            age: profile?.age ?? 30,
            sex: profile?.sex ?? "Male",
            weight: profile?.weight ?? 185,
            experienceLevel: profile?.experienceLevel ?? "intermediate",
            trainingGoal: profile?.trainingGoal ?? "general_fitness",
            currentProgram: store.selectedProgram?.rawValue ?? "None selected",
            credoScore: credoScore,
            strengthScore: strengthScore,
            recentWorkouts: formatRecentWorkouts(),
            personalRecords: formatPersonalRecords(),
            exerciseMaxes: formatExerciseMaxes()
        )
    }

    private func formatRecentWorkouts() -> String {
        let recent = store.workoutHistory.suffix(5)
        guard !recent.isEmpty else { return "No workouts recorded yet." }

        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"

        return recent.reversed().map { workout in
            let date = formatter.string(from: workout.date)
            let duration = workout.durationSeconds / 60
            let exerciseNames = workout.exercises.compactMap { exercise in
                ExerciseLibrary.find(exercise.exerciseId)?.name
            }.joined(separator: ", ")
            let totalVolume = workout.exercises.reduce(0.0) { total, exercise in
                total + exercise.sets.reduce(0.0) { $0 + $1.weight * Double($1.reps) }
            }
            return "- \(date): \(exerciseNames) (\(duration) min, \(Int(totalVolume)) lbs volume)"
        }.joined(separator: "\n")
    }

    private func formatPersonalRecords() -> String {
        let recentPRs = store.personalRecords.suffix(10)
        guard !recentPRs.isEmpty else { return "No personal records yet." }

        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"

        return recentPRs.reversed().map { pr in
            let name = ExerciseLibrary.find(pr.exerciseId)?.name ?? pr.exerciseId
            let date = formatter.string(from: pr.date)
            return "- \(name): \(Int(pr.new1RM)) lbs (up from \(Int(pr.previous1RM)) lbs) on \(date)"
        }.joined(separator: "\n")
    }

    private func formatExerciseMaxes() -> String {
        guard !store.exercise1RMs.isEmpty else { return "No estimated maxes yet." }

        return store.exercise1RMs.sorted(by: { $0.key < $1.key }).map { (id, oneRM) in
            let name = ExerciseLibrary.find(id)?.name ?? id
            return "- \(name): \(Int(oneRM)) lbs"
        }.joined(separator: "\n")
    }

    // MARK: - Persistence

    private func saveMessages() {
        if let data = try? JSONEncoder().encode(messages) {
            UserDefaults.standard.set(data, forKey: messagesKey)
        }
    }

    private func loadMessages() {
        if let data = UserDefaults.standard.data(forKey: messagesKey),
           let decoded = try? JSONDecoder().decode([CoachMessage].self, from: data) {
            messages = decoded
        }
    }
}
