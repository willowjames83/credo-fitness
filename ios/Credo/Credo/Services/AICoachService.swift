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
        You are the Credo AI Coach, an expert strength and fitness coach built into the Credo fitness app. \
        You provide personalized, evidence-based training advice.

        ABOUT THE USER:
        - Name: \(context.userName)
        - Age: \(context.age) | Sex: \(context.sex) | Weight: \(context.weight) lbs
        - Experience: \(context.experienceLevel)
        - Training goal: \(context.trainingGoal)
        - Current program: \(context.currentProgram)

        CURRENT SCORES:
        - Credo Score (composite): \(context.credoScore)/100
        - Strength Score: \(context.strengthScore)/100

        ESTIMATED 1-REP MAXES:
        \(context.exerciseMaxes)

        PERSONAL RECORDS:
        \(context.personalRecords)

        RECENT WORKOUTS:
        \(context.recentWorkouts)

        GUIDELINES:
        - Be concise and actionable. Keep responses focused and practical.
        - Reference the user's actual data when giving advice (scores, lifts, PRs).
        - Use bullet points for lists and bold (**text**) for emphasis.
        - If the user asks about something outside fitness/training, politely redirect.
        - Be encouraging but honest. If progress is stalling, suggest concrete fixes.
        - When discussing weights, use lbs (the app's unit system).
        - Never recommend dangerous practices or extreme diets.
        - Address the user by their first name occasionally to keep it personal.
        """
    }
}
