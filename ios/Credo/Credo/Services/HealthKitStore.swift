import Foundation
import HealthKit
import Observation

@Observable
class HealthKitStore {
    static let shared = HealthKitStore()

    // MARK: - Published Properties

    var isAuthorized: Bool = false
    var latestWeight: Double?          // lbs
    var restingHeartRate: Int?         // bpm
    var todaySteps: Int?
    var lastNightSleepHours: Double?
    var weeklyActiveMinutes: Int?

    // MARK: - Private

    private let healthStore: HKHealthStore?
    private let isAvailable: Bool

    // MARK: - Init

    private init() {
        if HKHealthStore.isHealthDataAvailable() {
            self.healthStore = HKHealthStore()
            self.isAvailable = true
        } else {
            self.healthStore = nil
            self.isAvailable = false
        }
    }

    // MARK: - Authorization

    func requestAuthorization() async throws {
        guard isAvailable, let store = healthStore else {
            throw HealthKitError.notAvailable
        }

        try await store.requestAuthorization(
            toShare: HealthKitPermissions.writeTypes,
            read: HealthKitPermissions.readTypes
        )

        await MainActor.run {
            self.isAuthorized = true
        }
    }

    enum HealthKitError: LocalizedError {
        case notAvailable

        var errorDescription: String? {
            switch self {
            case .notAvailable:
                return "Apple Health is not available on this device."
            }
        }
    }

    // MARK: - Fetch Latest Weight

    func fetchLatestWeight() async {
        guard isAvailable, let store = healthStore,
              let weightType = HKQuantityType.quantityType(forIdentifier: .bodyMass) else { return }

        let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)

        let sample: HKQuantitySample? = await withCheckedContinuation { continuation in
            let query = HKSampleQuery(
                sampleType: weightType,
                predicate: nil,
                limit: 1,
                sortDescriptors: [sortDescriptor]
            ) { _, results, _ in
                continuation.resume(returning: results?.first as? HKQuantitySample)
            }
            store.execute(query)
        }

        let value = sample?.quantity.doubleValue(for: .pound())
        await MainActor.run {
            self.latestWeight = value
        }
    }

    // MARK: - Fetch Resting Heart Rate

    func fetchRestingHeartRate() async {
        guard isAvailable, let store = healthStore,
              let hrType = HKQuantityType.quantityType(forIdentifier: .heartRate) else { return }

        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: Date())
        let predicate = HKQuery.predicateForSamples(withStart: calendar.date(byAdding: .day, value: -7, to: startOfDay), end: Date())

        let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)

        let samples: [HKQuantitySample] = await withCheckedContinuation { continuation in
            let query = HKSampleQuery(
                sampleType: hrType,
                predicate: predicate,
                limit: 100,
                sortDescriptors: [sortDescriptor]
            ) { _, results, _ in
                continuation.resume(returning: (results as? [HKQuantitySample]) ?? [])
            }
            store.execute(query)
        }

        // Approximate resting HR: take the lowest 10% of readings
        guard !samples.isEmpty else {
            await MainActor.run { self.restingHeartRate = nil }
            return
        }

        let bpmValues = samples.map { $0.quantity.doubleValue(for: HKUnit.count().unitDivided(by: .minute())) }
        let sorted = bpmValues.sorted()
        let lowCount = max(1, sorted.count / 10)
        let restingAvg = sorted.prefix(lowCount).reduce(0, +) / Double(lowCount)

        await MainActor.run {
            self.restingHeartRate = Int(restingAvg.rounded())
        }
    }

    // MARK: - Fetch Today Steps

    func fetchTodaySteps() async {
        guard isAvailable, let store = healthStore,
              let stepType = HKQuantityType.quantityType(forIdentifier: .stepCount) else { return }

        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: Date())
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: Date())

        let result: Double? = await withCheckedContinuation { continuation in
            let query = HKStatisticsQuery(
                quantityType: stepType,
                quantitySamplePredicate: predicate,
                options: .cumulativeSum
            ) { _, statistics, _ in
                let sum = statistics?.sumQuantity()?.doubleValue(for: .count())
                continuation.resume(returning: sum)
            }
            store.execute(query)
        }

        await MainActor.run {
            self.todaySteps = result.map { Int($0) }
        }
    }

    // MARK: - Fetch Last Night Sleep

    func fetchLastNightSleep() async {
        guard isAvailable, let store = healthStore,
              let sleepType = HKCategoryType.categoryType(forIdentifier: .sleepAnalysis) else { return }

        let calendar = Calendar.current
        let now = Date()
        // Look at the window from yesterday 6 PM to today noon for "last night" sleep
        guard let yesterdayEvening = calendar.date(byAdding: .hour, value: -30, to: now) else { return }

        let predicate = HKQuery.predicateForSamples(withStart: yesterdayEvening, end: now)
        let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)

        let samples: [HKCategorySample] = await withCheckedContinuation { continuation in
            let query = HKSampleQuery(
                sampleType: sleepType,
                predicate: predicate,
                limit: HKObjectQueryNoLimit,
                sortDescriptors: [sortDescriptor]
            ) { _, results, _ in
                continuation.resume(returning: (results as? [HKCategorySample]) ?? [])
            }
            store.execute(query)
        }

        // Filter for asleep categories (inBed is not counted as sleep)
        let asleepValues: Set<Int> = [
            HKCategoryValueSleepAnalysis.asleepUnspecified.rawValue,
            HKCategoryValueSleepAnalysis.asleepCore.rawValue,
            HKCategoryValueSleepAnalysis.asleepDeep.rawValue,
            HKCategoryValueSleepAnalysis.asleepREM.rawValue
        ]

        let asleepSamples = samples.filter { asleepValues.contains($0.value) }

        let totalSeconds = asleepSamples.reduce(0.0) { total, sample in
            total + sample.endDate.timeIntervalSince(sample.startDate)
        }

        let hours = totalSeconds / 3600.0

        await MainActor.run {
            self.lastNightSleepHours = hours > 0 ? hours : nil
        }
    }

    // MARK: - Fetch Weekly Active Minutes

    func fetchWeeklyActiveMinutes() async {
        guard isAvailable, let store = healthStore,
              let exerciseType = HKQuantityType.quantityType(forIdentifier: .appleExerciseTime) else { return }

        let calendar = Calendar.current
        guard let startOfWeek = calendar.dateInterval(of: .weekOfYear, for: Date())?.start else { return }
        let predicate = HKQuery.predicateForSamples(withStart: startOfWeek, end: Date())

        let result: Double? = await withCheckedContinuation { continuation in
            let query = HKStatisticsQuery(
                quantityType: exerciseType,
                quantitySamplePredicate: predicate,
                options: .cumulativeSum
            ) { _, statistics, _ in
                let sum = statistics?.sumQuantity()?.doubleValue(for: .minute())
                continuation.resume(returning: sum)
            }
            store.execute(query)
        }

        await MainActor.run {
            self.weeklyActiveMinutes = result.map { Int($0) }
        }
    }

    // MARK: - Fetch Recent Cardio Workouts

    func fetchRecentCardioWorkouts() async -> [HealthKitCardioWorkout] {
        guard isAvailable, let store = healthStore else { return [] }

        let calendar = Calendar.current
        guard let thirtyDaysAgo = calendar.date(byAdding: .day, value: -30, to: Date()) else { return [] }

        let runningPredicate = HKQuery.predicateForWorkouts(with: .running)
        let cyclingPredicate = HKQuery.predicateForWorkouts(with: .cycling)
        let rowingPredicate = HKQuery.predicateForWorkouts(with: .rowing)

        let typePredicate = NSCompoundPredicate(orPredicateWithSubpredicates: [
            runningPredicate, cyclingPredicate, rowingPredicate
        ])

        let datePredicate = HKQuery.predicateForSamples(withStart: thirtyDaysAgo, end: Date())
        let combinedPredicate = NSCompoundPredicate(andPredicateWithSubpredicates: [typePredicate, datePredicate])

        let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)

        let workouts: [HKWorkout] = await withCheckedContinuation { continuation in
            let query = HKSampleQuery(
                sampleType: HKObjectType.workoutType(),
                predicate: combinedPredicate,
                limit: 50,
                sortDescriptors: [sortDescriptor]
            ) { _, results, _ in
                continuation.resume(returning: (results as? [HKWorkout]) ?? [])
            }
            store.execute(query)
        }

        return workouts.compactMap { workout -> HealthKitCardioWorkout? in
            let type: CardioWorkoutType
            switch workout.workoutActivityType {
            case .running: type = .running
            case .cycling: type = .cycling
            case .rowing: type = .rowing
            default: return nil
            }

            let distance = workout.totalDistance?.doubleValue(for: .meter())
            let calories = workout.totalEnergyBurned?.doubleValue(for: .kilocalorie())

            return HealthKitCardioWorkout(
                type: type,
                distanceMeters: distance,
                durationSeconds: workout.duration,
                avgHeartRate: nil, // Would need a separate statistics query per workout
                caloriesBurned: calories,
                date: workout.startDate
            )
        }
    }

    // MARK: - Refresh All

    func refreshAll() async {
        await withTaskGroup(of: Void.self) { group in
            group.addTask { await self.fetchLatestWeight() }
            group.addTask { await self.fetchRestingHeartRate() }
            group.addTask { await self.fetchTodaySteps() }
            group.addTask { await self.fetchLastNightSleep() }
            group.addTask { await self.fetchWeeklyActiveMinutes() }
        }
    }

    // MARK: - Save Weight

    func saveWeight(_ pounds: Double) async throws {
        guard isAvailable, let store = healthStore,
              let weightType = HKQuantityType.quantityType(forIdentifier: .bodyMass) else { return }

        let quantity = HKQuantity(unit: .pound(), doubleValue: pounds)
        let sample = HKQuantitySample(
            type: weightType,
            quantity: quantity,
            start: Date(),
            end: Date()
        )

        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
            store.save(sample) { success, error in
                if let error = error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            }
        }

        await MainActor.run {
            self.latestWeight = pounds
        }
    }

    // MARK: - Snapshot

    var currentSnapshot: HealthSnapshot {
        HealthSnapshot(
            latestWeight: latestWeight,
            restingHeartRate: restingHeartRate,
            todaySteps: todaySteps,
            lastNightSleepHours: lastNightSleepHours,
            weeklyActiveMinutes: weeklyActiveMinutes
        )
    }
}
