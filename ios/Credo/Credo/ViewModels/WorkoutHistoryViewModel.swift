import SwiftUI

@Observable
class WorkoutHistoryViewModel {
    let store = WorkoutStore.shared

    var groupedWorkouts: [(String, [CompletedWorkout])] {
        store.workoutsGroupedByMonth()
    }

    func totalVolume(for workout: CompletedWorkout) -> Double {
        workout.exercises.reduce(0) { total, exercise in
            total + exercise.sets.reduce(0) { setTotal, set in
                setTotal + set.weight * Double(set.reps)
            }
        }
    }

    func formattedDuration(_ seconds: Int) -> String {
        let m = seconds / 60
        return "\(m) min"
    }

    func formattedVolume(_ volume: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.maximumFractionDigits = 0
        return (formatter.string(from: NSNumber(value: volume)) ?? "\(Int(volume))") + " lbs"
    }

    func exerciseName(for id: String) -> String {
        ExerciseLibrary.find(id)?.name ?? id
    }

    func dayLabel(for workout: CompletedWorkout) -> String {
        guard let template = ProgramTemplate(rawValue: workout.programTemplate) else {
            return "Workout"
        }
        let labels = template.dayLabels
        guard workout.dayIndex < labels.count else { return "Workout" }
        return labels[workout.dayIndex]
    }

    func prsInWorkout(_ workout: CompletedWorkout) -> [PersonalRecord] {
        store.personalRecords.filter { Calendar.current.isDate($0.date, inSameDayAs: workout.date) }
    }
}
