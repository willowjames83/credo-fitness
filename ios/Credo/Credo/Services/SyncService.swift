import Foundation

enum SyncStatus: Equatable {
    case idle
    case syncing
    case success
    case error(String)
}

@Observable
final class SyncService {
    static let shared = SyncService()

    var syncStatus: SyncStatus = .idle
    var lastSyncDate: Date? {
        get {
            UserDefaults.standard.object(forKey: lastSyncKey) as? Date
        }
        set {
            UserDefaults.standard.set(newValue, forKey: lastSyncKey)
        }
    }

    private let lastSyncKey = "credo_lastSyncDate"
    private let api = APIClient.shared
    private let authService = AuthService.shared
    private let iso8601Formatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter
    }()

    // MARK: - Sync Now

    func syncNow() async {
        guard authService.isLoggedIn, let token = authService.authToken else {
            syncStatus = .error("Not logged in")
            return
        }

        syncStatus = .syncing

        do {
            let request = buildSyncRequest()
            let response: SyncResponse = try await api.post("/api/sync", body: request, token: token)
            mergeServerResponse(response.data)
            lastSyncDate = Date()
            syncStatus = .success
        } catch let error as APIError {
            syncStatus = .error(error.localizedDescription)
        } catch {
            syncStatus = .error(error.localizedDescription)
        }
    }

    // MARK: - Auto Sync

    func autoSync() async {
        guard authService.isLoggedIn else { return }

        // Only sync if last sync was more than 5 minutes ago
        if let lastSync = lastSyncDate {
            let elapsed = Date().timeIntervalSince(lastSync)
            guard elapsed > 300 else { return }
        }

        await syncNow()
    }

    // MARK: - Build Request

    private func buildSyncRequest() -> SyncRequest {
        let store = WorkoutStore.shared

        // Convert workouts
        let workouts: [SyncWorkout] = store.workoutHistory.map { workout in
            // Encode exercises to JSON-compatible Any via Codable round-trip
            let exercisesData = (try? JSONEncoder().encode(workout.exercises)) ?? Data()
            let exercisesAny = (try? JSONSerialization.jsonObject(with: exercisesData)) ?? []

            // Determine dayLabel from program template
            let dayLabel: String = {
                if let program = ProgramTemplate(rawValue: workout.programTemplate) {
                    let idx = workout.dayIndex
                    if idx >= 0 && idx < program.dayLabels.count {
                        return program.dayLabels[idx]
                    }
                }
                return "Day \(workout.dayIndex + 1)"
            }()

            return SyncWorkout(
                id: nil,
                date: iso8601Formatter.string(from: workout.date),
                dayLabel: dayLabel,
                programTemplate: workout.programTemplate,
                durationSeconds: workout.durationSeconds,
                exercises: AnyCodable(exercisesAny),
                totalVolume: calculateTotalVolume(for: workout)
            )
        }

        // Convert personal records
        let personalRecords: [SyncPersonalRecord] = store.personalRecords.map { pr in
            SyncPersonalRecord(
                exerciseId: pr.exerciseId,
                previous1RM: pr.previous1RM,
                new1RM: pr.new1RM,
                setWeight: pr.setWeight,
                setReps: pr.setReps,
                date: iso8601Formatter.string(from: pr.date)
            )
        }

        // Convert score snapshots
        let scoreSnapshots: [SyncScoreSnapshot] = store.scoreHistory.map { ss in
            SyncScoreSnapshot(
                weekNumber: ss.weekNumber,
                credoScore: ss.credoScore,
                strengthScore: ss.strengthScore,
                stabilityScore: ss.stabilityScore,
                cardioScore: ss.cardioScore,
                nutritionScore: ss.nutritionScore,
                date: iso8601Formatter.string(from: ss.date)
            )
        }

        // User program
        let userProgram: SyncUserProgram? = {
            guard let program = store.selectedProgram else { return nil }
            return SyncUserProgram(
                programTemplate: program.rawValue,
                daysPerWeek: program.daysPerWeek,
                currentWeek: store.currentWeek,
                currentDayIndex: store.currentDayIndex
            )
        }()

        return SyncRequest(
            workouts: workouts.isEmpty ? nil : workouts,
            exercise1RMs: store.exercise1RMs.isEmpty ? nil : store.exercise1RMs,
            personalRecords: personalRecords.isEmpty ? nil : personalRecords,
            scoreSnapshots: scoreSnapshots.isEmpty ? nil : scoreSnapshots,
            userProgram: userProgram
        )
    }

    private func calculateTotalVolume(for workout: CompletedWorkout) -> Double {
        var total: Double = 0
        for exercise in workout.exercises {
            for set in exercise.sets {
                total += set.weight * Double(set.reps)
            }
        }
        return total
    }

    // MARK: - Merge Response

    private func mergeServerResponse(_ data: SyncResponseData) {
        let store = WorkoutStore.shared

        // Merge exercise 1RMs (server is source of truth after sync)
        for (exerciseId, weight) in data.exercise1RMs {
            let current = store.exercise1RMs[exerciseId] ?? 0
            if weight > current {
                store.exercise1RMs[exerciseId] = weight
            }
        }

        // Merge user program state from server
        if let serverProgram = data.userProgram {
            if let template = ProgramTemplate(rawValue: serverProgram.programTemplate) {
                store.selectedProgram = template
                store.currentWeek = serverProgram.currentWeek
                store.currentDayIndex = serverProgram.currentDayIndex
            }
        }

        store.save()
    }
}
