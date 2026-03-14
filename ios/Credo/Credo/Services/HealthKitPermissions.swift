import HealthKit

enum HealthKitPermissions {

    // MARK: - Read Types

    static var readTypes: Set<HKObjectType> {
        let types: [HKObjectType?] = [
            HKQuantityType.quantityType(forIdentifier: .bodyMass),
            HKQuantityType.quantityType(forIdentifier: .heartRate),
            HKQuantityType.quantityType(forIdentifier: .stepCount),
            HKCategoryType.categoryType(forIdentifier: .sleepAnalysis),
            HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned),
            HKQuantityType.quantityType(forIdentifier: .appleExerciseTime),
            HKObjectType.workoutType()
        ]
        return Set(types.compactMap { $0 })
    }

    // MARK: - Write Types

    static var writeTypes: Set<HKSampleType> {
        let types: [HKSampleType?] = [
            HKQuantityType.quantityType(forIdentifier: .bodyMass)
        ]
        return Set(types.compactMap { $0 })
    }

    // MARK: - Permission Descriptions (for onboarding UI)

    struct PermissionItem: Identifiable {
        let id = UUID()
        let type: String
        let reason: String
        let iconName: String
    }

    static let permissionDescriptions: [PermissionItem] = [
        PermissionItem(
            type: "Weight",
            reason: "Track body composition changes and auto-update your profile",
            iconName: "scalemass.fill"
        ),
        PermissionItem(
            type: "Heart Rate",
            reason: "Monitor resting heart rate to gauge recovery and cardiovascular fitness",
            iconName: "heart.fill"
        ),
        PermissionItem(
            type: "Steps",
            reason: "Count daily steps toward your overall activity goals",
            iconName: "figure.walk"
        ),
        PermissionItem(
            type: "Sleep",
            reason: "Analyze sleep duration to optimize recovery recommendations",
            iconName: "bed.double.fill"
        ),
        PermissionItem(
            type: "Active Energy",
            reason: "Measure calories burned to inform training intensity",
            iconName: "flame.fill"
        ),
        PermissionItem(
            type: "Exercise Minutes",
            reason: "Track weekly active minutes for your cardio score",
            iconName: "figure.run"
        ),
        PermissionItem(
            type: "Workouts",
            reason: "Import cardio sessions like running, cycling, and rowing",
            iconName: "sportscourt.fill"
        )
    ]
}
