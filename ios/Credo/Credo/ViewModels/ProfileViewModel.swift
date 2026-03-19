import SwiftUI

struct SettingsSection: Identifiable {
    let id = UUID()
    let title: String
    let rows: [SettingsRow]
}

struct SettingsRow: Identifiable {
    let id = UUID()
    let label: String
    var detail: String? = nil
    var detailColor: Color? = nil
    var action: (() -> Void)? = nil
}

@Observable
class ProfileViewModel {
    let store = WorkoutStore.shared

    var showEditWeight = false
    var showEditExperience = false
    var showLoginSheet = false
    var showHealthKitOnboarding = false

    private let authService = AuthService.shared

    var userName: String {
        store.userProfile?.name ?? "User"
    }

    var userInitials: String {
        let parts = userName.components(separatedBy: " ")
        let first = parts.first?.prefix(1) ?? ""
        let last = parts.count > 1 ? parts.last?.prefix(1) ?? "" : ""
        return "\(first)\(last)".uppercased()
    }

    var userAge: Int { store.userProfile?.age ?? 0 }
    var userSex: String { store.userProfile?.sex ?? "" }
    var userWeight: Int { store.userProfile?.weight ?? 0 }
    var experienceLevel: String { store.userProfile?.experienceLevel ?? "" }
    var trainingGoal: String { store.userProfile?.trainingGoal ?? "" }

    var profileSummary: String {
        let age = userAge > 0 ? "\(userAge)" : "--"
        let sex = userSex.isEmpty ? "--" : userSex.capitalized
        let weight = userWeight > 0 ? "\(userWeight) lbs" : "-- lbs"
        let level = experienceLevel.isEmpty ? "--" : experienceLevel.capitalized
        return "\(age) \u{00B7} \(sex) \u{00B7} \(weight) \u{00B7} \(level)"
    }

    var totalWorkouts: Int { store.totalWorkoutsCompleted }

    var currentStreak: Int {
        let calendar = Calendar.current
        let history = store.workoutHistory.sorted { $0.date > $1.date }
        guard !history.isEmpty else { return 0 }

        var streak = 0
        var checkDate = Date()

        while true {
            guard let weekInterval = calendar.dateInterval(of: .weekOfYear, for: checkDate) else { break }
            let hasWorkoutThisWeek = history.contains { workout in
                workout.date >= weekInterval.start && workout.date < weekInterval.end
            }

            if hasWorkoutThisWeek {
                streak += 1
                guard let previousWeek = calendar.date(byAdding: .weekOfYear, value: -1, to: weekInterval.start) else { break }
                checkDate = previousWeek
            } else {
                break
            }
        }

        return streak
    }

    var favoriteExercise: String? {
        let history = store.workoutHistory
        guard !history.isEmpty else { return nil }

        var counts: [String: Int] = [:]
        for workout in history {
            for exercise in workout.exercises {
                counts[exercise.exerciseId, default: 0] += 1
            }
        }

        guard let topId = counts.max(by: { $0.value < $1.value })?.key else { return nil }
        return ExerciseLibrary.find(topId)?.name ?? topId
    }

    var totalVolume: Double {
        var volume: Double = 0
        for workout in store.workoutHistory {
            for exercise in workout.exercises {
                for set in exercise.sets {
                    volume += set.weight * Double(set.reps)
                }
            }
        }
        return volume
    }

    var isLoggedIn: Bool { authService.isLoggedIn }
    var accountEmail: String { authService.currentUserEmail ?? "" }

    var healthKitStatus: String {
        HealthKitStore.shared.isAuthorized ? "Connected" : "Not Connected"
    }

    var healthKitStatusColor: Color {
        HealthKitStore.shared.isAuthorized ? CredoColors.success : CredoColors.textSecondary
    }

    func logout() {
        authService.logout()
    }

    private var accountSection: SettingsSection {
        if isLoggedIn {
            return SettingsSection(title: "Account", rows: [
                SettingsRow(label: "Email", detail: accountEmail),
                SettingsRow(label: "Cloud Sync", detail: "Enabled", detailColor: CredoColors.success),
                SettingsRow(label: "Sign Out", detailColor: CredoColors.danger, action: {
                    self.logout()
                }),
            ])
        } else {
            return SettingsSection(title: "Account", rows: [
                SettingsRow(label: "Sign In", detail: "Sync your data", action: {
                    self.showLoginSheet = true
                }),
            ])
        }
    }

    var sections: [SettingsSection] {
        [
            accountSection,
            SettingsSection(title: "Program", rows: [
                SettingsRow(label: "Current Program", detail: store.selectedProgram?.displayName ?? "None"),
                SettingsRow(label: "Training Schedule", detail: "\(store.selectedProgram?.daysPerWeek ?? 0) days/week"),
                SettingsRow(label: "Experience Level", detail: experienceLevel.capitalized, action: {
                    self.showEditExperience = true
                }),
            ]),
            SettingsSection(title: "Body", rows: [
                SettingsRow(label: "Weight", detail: "\(userWeight) lbs", action: {
                    self.showEditWeight = true
                }),
                SettingsRow(label: "Body Composition"),
                SettingsRow(label: "Biomarkers"),
            ]),
            SettingsSection(title: "Integrations", rows: [
                SettingsRow(label: "Apple Health", detail: healthKitStatus, detailColor: healthKitStatusColor, action: {
                    self.showHealthKitOnboarding = true
                }),
                SettingsRow(label: "Peloton"),
                SettingsRow(label: "Strava"),
                SettingsRow(label: "MyFitnessPal"),
            ]),
            SettingsSection(title: "Data", rows: [
                SettingsRow(label: "Export Data"),
                SettingsRow(label: "Privacy"),
                SettingsRow(label: "Terms"),
            ]),
        ]
    }
}
