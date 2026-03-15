import Foundation

struct ProgramPreferences {
    let daysPerWeek: Int
    let sessionDuration: Int
    let focus: String
    let equipmentAvailable: [String]
    let additionalNotes: String
}

enum ProgramGeneratorError: Error, LocalizedError {
    case noAPIKey
    case apiError(String)
    case invalidJSON(String)
    case invalidExercises([String])

    var errorDescription: String? {
        switch self {
        case .noAPIKey:
            return "No API key configured. Go to Profile > Settings to add your Claude API key."
        case .apiError(let msg):
            return msg
        case .invalidJSON(let detail):
            return "Failed to parse program: \(detail)"
        case .invalidExercises(let ids):
            return "Unknown exercise IDs: \(ids.joined(separator: ", "))"
        }
    }
}

class ProgramGeneratorService {
    static let shared = ProgramGeneratorService()

    private let apiURL = "https://api.anthropic.com/v1/messages"
    private let model = "claude-sonnet-4-20250514"

    private var apiKey: String {
        UserDefaults.standard.string(forKey: "claude_api_key") ?? ""
    }

    func generateProgram(
        preferences: ProgramPreferences,
        userContext: ProgramGenerationContext
    ) async throws -> WorkoutProgram {
        guard !apiKey.isEmpty else {
            throw ProgramGeneratorError.noAPIKey
        }

        let systemPrompt = buildSystemPrompt(preferences: preferences, context: userContext)
        let userMessage = buildUserMessage(preferences: preferences)

        let body: [String: Any] = [
            "model": model,
            "max_tokens": 4096,
            "system": systemPrompt,
            "messages": [
                ["role": "user", "content": userMessage]
            ]
        ]

        var request = URLRequest(url: URL(string: apiURL)!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "content-type")
        request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")
        request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        request.timeoutInterval = 60

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw ProgramGeneratorError.apiError("Invalid response from server.")
        }

        guard httpResponse.statusCode == 200 else {
            if httpResponse.statusCode == 401 {
                throw ProgramGeneratorError.apiError("Invalid API key. Check your Claude API key in Settings.")
            }
            let errorBody = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw ProgramGeneratorError.apiError("API error (\(httpResponse.statusCode)): \(errorBody)")
        }

        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        let content = (json?["content"] as? [[String: Any]])?.first
        guard let responseText = content?["text"] as? String else {
            throw ProgramGeneratorError.invalidJSON("No text in response")
        }

        return try parseProgram(from: responseText)
    }

    // MARK: - Parse & Validate

    private func parseProgram(from text: String) throws -> WorkoutProgram {
        // Extract JSON from response (handle markdown code blocks)
        let jsonString: String
        if let start = text.range(of: "{"), let end = text.range(of: "}", options: .backwards) {
            jsonString = String(text[start.lowerBound...end.upperBound])
        } else {
            throw ProgramGeneratorError.invalidJSON("No JSON object found in response")
        }

        guard let jsonData = jsonString.data(using: .utf8) else {
            throw ProgramGeneratorError.invalidJSON("Invalid UTF-8 in response")
        }

        let decoder = JSONDecoder()
        let program: WorkoutProgram
        do {
            program = try decoder.decode(WorkoutProgram.self, from: jsonData)
        } catch {
            throw ProgramGeneratorError.invalidJSON(error.localizedDescription)
        }

        // Validate exercise IDs
        let invalidIds = program.days.flatMap { day in
            day.exercises.compactMap { exercise in
                ExerciseLibrary.find(exercise.id) == nil ? exercise.id : nil
            }
        }

        if !invalidIds.isEmpty {
            // Filter out invalid exercises rather than failing
            let cleanedDays = program.days.map { day in
                WorkoutProgramDay(
                    id: day.id,
                    label: day.label,
                    muscleGroups: day.muscleGroups,
                    exercises: day.exercises.filter { ExerciseLibrary.find($0.id) != nil }
                )
            }
            return WorkoutProgram(
                id: program.id,
                name: program.name,
                shortDescription: program.shortDescription,
                description: program.description,
                daysPerWeek: program.daysPerWeek,
                difficulty: program.difficulty,
                focus: program.focus,
                days: cleanedDays,
                progressionScheme: program.progressionScheme
            )
        }

        return program
    }

    // MARK: - Prompts

    private func buildSystemPrompt(preferences: ProgramPreferences, context: ProgramGenerationContext) -> String {
        let exerciseList = ExerciseLibrary.exercises.map { ex in
            let muscles = ex.primaryMuscles.map(\.rawValue).joined(separator: "/")
            let equipment = ex.equipment.map(\.rawValue).joined(separator: ", ")
            let pattern = ex.movementPattern.rawValue
            let perSide = ex.isPerSide ? " [per-side]" : ""
            let bw = ex.isBodyweight ? " [bodyweight]" : ""
            return "  \(ex.id): \(ex.name) — \(muscles) — \(equipment) — \(pattern)\(perSide)\(bw)"
        }.joined(separator: "\n")

        return """
        You are a longevity-focused strength programming AI built into the Credo fitness app. Your \
        philosophy synthesizes Peter Attia (Centenarian Decathlon, 4-pillar framework), Mark Rippetoe \
        (progressive overload), Andy Galpin/Andrew Huberman (periodization, exercise science), Dan John \
        (5 movement patterns: push, pull, hinge, squat, carry), Pavel Tsatsouline (kettlebell training), \
        and Stuart McGill (spinal health, Big 3 core exercises).

        YOUR TASK: Generate a personalized workout program as a JSON object.

        PROGRAMMING PRINCIPLES:
        - Every session should include stability warmup (McGill Big 3: bird_dog, mcgill_curlup, side_plank)
        - Include loaded carries (farmer_carry) in most sessions
        - Cover all 5 movement patterns across the week: push, pull, hinge, squat, carry
        - Power preservation: include explosive work (kettlebell_swing, med_ball_slam) at least 1x/week
        - Unilateral work for balance/fall prevention (bulgarian_split_squat, single_leg_rdl, walking_lunge)

        REST PERIODS (strict rules):
        - Big compound movements (back_squat, deadlift, bench_press, ohp, barbell_row, trap_bar_deadlift, front_squat, hip_thrust): 120 seconds
        - Smaller/higher-rep/isolation movements: 90 seconds
        - Supersets: 60 seconds between superset partners

        ADVANCED TECHNIQUES:
        - Use supersets: pair antagonist movements (e.g., bench_press + barbell_row, barbell_curl + tricep_pushdown) via matching supersetGroupId strings
        - Include drop sets on hypertrophy exercises for intermediate/advanced users: add notes like "Final set: drop set, reduce weight 20%, rep to failure"

        PROGRESSIVE OVERLOAD (baked into each week):
        - Design a 6-8 week training block
        - Week-by-week progression in the notes field:
          Weeks 1-2: baseline working loads
          Weeks 3-4: +1-2 reps or +5 lbs on compounds
          Weeks 5-6: peak volume/intensity
          Weeks 7-8 (if 8 weeks): intensification
          After the block: deload week (reduce volume 40%, maintain intensity)
        - Include specific progression cues in exercise notes, referencing the user's actual 1RMs when available

        USER PROFILE:
        - Name: \(context.userName) | Age: \(context.age) | Sex: \(context.sex) | Weight: \(context.weight) lbs
        - Experience: \(context.experienceLevel)
        - Training goal: \(context.trainingGoal)
        - Current scores — Strength: \(context.strengthScore)/100, Stability: \(context.stabilityScore)/100, Cardio: \(context.cardioScore)/100

        USER'S ESTIMATED 1-REP MAXES:
        \(context.exerciseMaxes.isEmpty ? "No data yet (new user)" : context.exerciseMaxes)

        RECENT WORKOUT HISTORY:
        \(context.recentWorkouts.isEmpty ? "No workouts yet" : context.recentWorkouts)

        AVAILABLE EXERCISE IDs (ONLY use these exact IDs):
        \(exerciseList)

        JSON SCHEMA — return EXACTLY this structure:
        {
          "id": "ai_generated_<uuid>",
          "name": "Program Name",
          "shortDescription": "One-line summary",
          "description": "2-3 sentence description explaining the philosophy and progression",
          "daysPerWeek": <int>,
          "difficulty": "Beginner" | "Intermediate" | "Advanced",
          "focus": "Longevity" | "Strength" | "Hypertrophy" | "General Fitness",
          "progressionScheme": "linearProgression" | "doubleProgression" | "undulating",
          "days": [
            {
              "id": "unique_day_id",
              "label": "Day Name",
              "muscleGroups": ["Group1", "Group2"],
              "exercises": [
                {
                  "id": "<exercise_id from list above>",
                  "sets": <int>,
                  "repMin": <int>,
                  "repMax": <int>,
                  "restSeconds": <int>,
                  "isOptional": <bool>,
                  "supersetGroupId": <string or null>,
                  "notes": <string or null with week-by-week progression>
                }
              ]
            }
          ]
        }

        CRITICAL: Return ONLY the JSON object. No markdown, no explanation, no code fences. Start with { and end with }.
        """
    }

    private func buildUserMessage(preferences: ProgramPreferences) -> String {
        let equipment = preferences.equipmentAvailable.joined(separator: ", ")
        var message = """
        Generate a \(preferences.daysPerWeek)-day per week program.
        Session duration: \(preferences.sessionDuration) minutes.
        Focus: \(preferences.focus).
        Available equipment: \(equipment).
        """

        if !preferences.additionalNotes.isEmpty {
            message += "\nAdditional notes: \(preferences.additionalNotes)"
        }

        return message
    }
}

// MARK: - Context for Generation

struct ProgramGenerationContext {
    let userName: String
    let age: Int
    let sex: String
    let weight: Int
    let experienceLevel: String
    let trainingGoal: String
    let strengthScore: Int
    let stabilityScore: Int
    let cardioScore: Int
    let exerciseMaxes: String
    let recentWorkouts: String

    static func build(from store: WorkoutStore) -> ProgramGenerationContext {
        let profile = store.userProfile

        let strengthSubscores = StrengthScoreCalculator.calculate(store: store)
        let stabilityScore = StabilityScoreCalculator.calculate(store: store)
        let cardioScore = CardioScoreCalculator.calculate(store: CardioStore.shared)

        let maxes = store.exercise1RMs.sorted(by: { $0.key < $1.key }).map { (id, oneRM) in
            let name = ExerciseLibrary.find(id)?.name ?? id
            return "- \(name): \(Int(oneRM)) lbs"
        }.joined(separator: "\n")

        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"

        let workouts = store.workoutHistory.suffix(5).reversed().map { workout in
            let date = formatter.string(from: workout.date)
            let names = workout.exercises.compactMap { ExerciseLibrary.find($0.exerciseId)?.name }.joined(separator: ", ")
            let volume = workout.exercises.reduce(0.0) { total, ex in
                total + ex.sets.reduce(0.0) { $0 + $1.weight * Double($1.reps) }
            }
            return "- \(date): \(names) (\(Int(volume)) lbs volume)"
        }.joined(separator: "\n")

        return ProgramGenerationContext(
            userName: profile?.firstName ?? "Athlete",
            age: profile?.age ?? 30,
            sex: profile?.sex ?? "Male",
            weight: profile?.weight ?? 185,
            experienceLevel: profile?.experienceLevel ?? "intermediate",
            trainingGoal: profile?.trainingGoal ?? "general_fitness",
            strengthScore: strengthSubscores.weightedScore,
            stabilityScore: stabilityScore,
            cardioScore: cardioScore,
            exerciseMaxes: maxes,
            recentWorkouts: workouts
        )
    }
}
