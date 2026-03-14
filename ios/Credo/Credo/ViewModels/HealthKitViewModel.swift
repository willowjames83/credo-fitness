import Foundation
import Observation

enum HealthKitAuthorizationStatus: String {
    case notDetermined
    case authorized
    case denied
}

@Observable
class HealthKitViewModel {
    var authorizationStatus: HealthKitAuthorizationStatus = .notDetermined
    var healthSnapshot: HealthSnapshot?
    var recentCardioWorkouts: [HealthKitCardioWorkout] = []
    var isLoading: Bool = false
    var errorMessage: String?

    // Weight entry
    var weightEntryText: String = ""
    var isSavingWeight: Bool = false
    var autoSyncWeight: Bool = false {
        didSet {
            UserDefaults.standard.set(autoSyncWeight, forKey: autoSyncWeightKey)
        }
    }

    private let store = HealthKitStore.shared
    private let autoSyncWeightKey = "credo_healthkit_autoSyncWeight"

    init() {
        autoSyncWeight = UserDefaults.standard.bool(forKey: autoSyncWeightKey)
        if store.isAuthorized {
            authorizationStatus = .authorized
        }
    }

    // MARK: - Authorization

    func requestAccess() async {
        do {
            try await store.requestAuthorization()
            await MainActor.run {
                self.authorizationStatus = .authorized
            }
            await refresh()
        } catch {
            await MainActor.run {
                self.authorizationStatus = .denied
                self.errorMessage = "Health data access was denied. You can enable it in Settings > Privacy > Health."
            }
        }
    }

    // MARK: - Refresh

    func refresh() async {
        await MainActor.run {
            self.isLoading = true
        }

        await store.refreshAll()
        let workouts = await store.fetchRecentCardioWorkouts()

        await MainActor.run {
            self.healthSnapshot = store.currentSnapshot
            self.recentCardioWorkouts = workouts
            self.isLoading = false
        }
    }

    // MARK: - Save Weight

    func saveWeight() async {
        guard let pounds = Double(weightEntryText), pounds > 0 else {
            await MainActor.run {
                self.errorMessage = "Please enter a valid weight."
            }
            return
        }

        await MainActor.run {
            self.isSavingWeight = true
            self.errorMessage = nil
        }

        do {
            try await store.saveWeight(pounds)
            await MainActor.run {
                self.healthSnapshot = store.currentSnapshot
                self.weightEntryText = ""
                self.isSavingWeight = false
            }
        } catch {
            await MainActor.run {
                self.errorMessage = "Failed to save weight: \(error.localizedDescription)"
                self.isSavingWeight = false
            }
        }
    }

    // MARK: - Formatters

    func formatSteps() -> String {
        guard let steps = healthSnapshot?.todaySteps else { return "--" }
        if steps >= 1000 {
            let thousands = Double(steps) / 1000.0
            return String(format: "%.1fk", thousands)
        }
        return "\(steps)"
    }

    func formatSleep() -> String {
        guard let hours = healthSnapshot?.lastNightSleepHours else { return "--" }
        let wholeHours = Int(hours)
        let minutes = Int((hours - Double(wholeHours)) * 60)
        if minutes == 0 {
            return "\(wholeHours)h"
        }
        return "\(wholeHours)h \(minutes)m"
    }

    func formatWeight() -> String {
        guard let weight = healthSnapshot?.latestWeight else { return "--" }
        return String(format: "%.1f", weight)
    }

    func formatHeartRate() -> String {
        guard let hr = healthSnapshot?.restingHeartRate else { return "--" }
        return "\(hr)"
    }

    func formatActiveMinutes() -> String {
        guard let minutes = healthSnapshot?.weeklyActiveMinutes else { return "--" }
        return "\(minutes)"
    }
}
