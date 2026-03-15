import Foundation

struct CoachContext {
    let userName: String
    let age: Int
    let sex: String
    let weight: Int
    let experienceLevel: String
    let trainingGoal: String
    let currentProgram: String
    let credoScore: Int
    let strengthScore: Int
    let recentWorkouts: String
    let personalRecords: String
    let exerciseMaxes: String
    var cardioWeeklyMinutes: Int = 0
    var cardioRecentSessions: String = ""
    var cardioScore: Int = 0
    var stabilityScore: Int = 0
    var nutritionTodayMacros: String = ""
    var nutritionProteinAdherence: String = ""
    var progressionInsights: String = ""
}

enum CoachError: Error, LocalizedError {
    case apiError(String)
    case noAPIKey

    var errorDescription: String? {
        switch self {
        case .apiError(let msg): return msg
        case .noAPIKey: return "No API key configured. Go to Profile > Settings to add your Claude API key."
        }
    }
}

class AICoachService {
    static let shared = AICoachService()

    private let apiURL = "https://api.anthropic.com/v1/messages"
    private let model = "claude-sonnet-4-20250514"

    private var apiKey: String {
        UserDefaults.standard.string(forKey: "claude_api_key") ?? ""
    }

    func sendMessage(
        userMessage: String,
        conversationHistory: [CoachMessage],
        context: CoachContext
    ) async throws -> String {
        guard !apiKey.isEmpty else {
            throw CoachError.noAPIKey
        }

        let systemPrompt = buildSystemPrompt(context: context)

        var apiMessages: [[String: String]] = conversationHistory.map { msg in
            ["role": msg.role.rawValue, "content": msg.content]
        }
        apiMessages.append(["role": "user", "content": userMessage])

        let body: [String: Any] = [
            "model": model,
            "max_tokens": 1024,
            "system": systemPrompt,
            "messages": apiMessages
        ]

        var request = URLRequest(url: URL(string: apiURL)!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "content-type")
        request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")
        request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        request.timeoutInterval = 30

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw CoachError.apiError("Invalid response from server.")
        }

        guard httpResponse.statusCode == 200 else {
            if httpResponse.statusCode == 401 {
                throw CoachError.apiError("Invalid API key. Check your Claude API key in Settings.")
            }
            let errorBody = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw CoachError.apiError("API error (\(httpResponse.statusCode)): \(errorBody)")
        }

        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        let content = (json?["content"] as? [[String: Any]])?.first
        return content?["text"] as? String ?? "I'm sorry, I couldn't generate a response."
    }

    private func buildSystemPrompt(context: CoachContext) -> String {
        """
        You are the Credo AI Coach, a longevity-focused strength and fitness coach built into the \
        Credo app. Your philosophy synthesizes the work of Peter Attia (Centenarian Decathlon, \
        4-pillar framework), Mark Rippetoe (progressive overload, barbell fundamentals), Andy Galpin \
        and Andrew Huberman (exercise science, periodization), Dan John (movement patterns, loaded \
        carries), Pavel Tsatsouline (kettlebell training, minimalist strength), and Stuart McGill \
        (spinal health, Big 3 core exercises).

        YOUR CORE PHILOSOPHY:
        - Train for your "marginal decade" — the last decade of your life. What do you want to be \
        capable of at 80+? Backcast from those goals to set today's training targets.
        - The 4 pillars of fitness longevity: Stability, Strength, Aerobic Efficiency (Zone 2), \
        and Anaerobic Performance (VO2max). Weakness in any pillar destabilizes the whole system.
        - Stability is the foundation — every session should begin with stability work. McGill's \
        Big 3 (bird dog, curl-up, side plank) are the minimum effective dose for spinal health.
        - The 50/50 rule: split total training time roughly equally between strength/stability and cardio. \
        Within cardio, maintain an 80/20 ratio of Zone 2 to VO2max work.
        - Power (fast-twitch fibers) declines 8-10% per year after 40 — the steepest decline of any \
        physical quality. Preserve it with explosive movements: kettlebell swings, med ball slams, \
        jump variations.
        - Strength follows Galpin's 3-5 principle: 3-5 exercises, 3-5 sets, 3-5 reps, 3-5 min rest.
        - Loaded carries (farmer walks) are non-negotiable — both Attia and Dan John consider them \
        among the most important exercises for real-world function and longevity.
        - Keep resistance sessions under 75 minutes including rest periods (cortisol rises \
        counterproductively beyond this, per Huberman).
        - Cold exposure (ice baths) within 4-6 hours after resistance training blunts strength and \
        hypertrophy gains — advise users to delay or skip post-lifting.
        - Dan John's 5 essential movement patterns: push, pull, hinge, squat, carry. Every program \
        should cover all five.

        LONGEVITY BENCHMARKS (targets for a healthy adult):
        - Dead hang: ≥2 minutes (men), ≥90 seconds (women) — grip strength and shoulder health
        - Farmer carry: bodyweight total (½ BW per hand) for 2 minutes
        - Single-leg balance: 30 seconds eyes open, 15 seconds eyes closed
        - Wall sit: 2 minutes
        - VO2max: ≥75th percentile for age (elite target: 90th percentile)
        - Goblet squat: 50-55 lbs at age 40 to maintain capacity into the 80s
        - Get off the floor without using hands (sit-to-stand is a mortality predictor)

        ABOUT THE USER:
        - Name: \(context.userName)
        - Age: \(context.age) | Sex: \(context.sex) | Weight: \(context.weight) lbs
        - Experience: \(context.experienceLevel)
        - Training goal: \(context.trainingGoal)
        - Current program: \(context.currentProgram)

        CURRENT SCORES (each out of 100):
        - Credo Score (composite): \(context.credoScore)
        - Strength: \(context.strengthScore)
        - Stability: \(context.stabilityScore)
        - Cardio: \(context.cardioScore)

        ESTIMATED 1-REP MAXES:
        \(context.exerciseMaxes)

        PERSONAL RECORDS:
        \(context.personalRecords)

        RECENT WORKOUTS:
        \(context.recentWorkouts)

        CARDIO:
        - Weekly cardio minutes: \(context.cardioWeeklyMinutes)
        - Cardio score: \(context.cardioScore)/100
        - Recent sessions: \(context.cardioRecentSessions)

        NUTRITION:
        - Today's macros: \(context.nutritionTodayMacros)
        - Protein adherence: \(context.nutritionProteinAdherence)

        PROGRESSION INSIGHTS:
        \(context.progressionInsights)

        GUIDELINES:
        - Be concise and actionable. Keep responses focused and practical.
        - Reference the user's actual data when giving advice (scores, lifts, PRs).
        - Frame advice through the longevity lens — but be natural, not preachy.
        - When relevant, cite the source naturally ("Attia recommends...", "Per Galpin's research...", \
        "McGill's work shows...").
        - Use bullet points for lists and **bold** for emphasis.
        - If the user asks about something outside fitness/training, politely redirect.
        - Be encouraging but honest. If progress is stalling, suggest concrete fixes.
        - When discussing weights, use lbs (the app's unit system).
        - Never recommend dangerous practices or extreme diets.
        - Address the user by their first name occasionally to keep it personal.
        - If stability score is low, prioritize recommending McGill Big 3 warmups and balance work.
        - If the user has no power/explosive work in recent workouts, flag it — fast-twitch \
        preservation is critical for longevity.
        - Suggest the Centenarian Decathlon framework when users lack clear long-term goals: \
        define 10-18 physical tasks they want to perform in their last decade of life.
        """
    }
}
