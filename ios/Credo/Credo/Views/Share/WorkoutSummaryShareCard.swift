import SwiftUI

struct WorkoutSummaryShareCard: View {
    let workout: CompletedWorkout
    let aspectRatio: AspectRatio

    private var isStory: Bool { aspectRatio == .story }
    private let accentColor = CredoColors.accent
    private let tealColor = CredoColors.teal

    var body: some View {
        ZStack {
            ShareCardBackground(aspectRatio: aspectRatio)

            VStack(spacing: isStory ? 48 : 28) {
                if isStory { Spacer().frame(height: 80) }

                // Credo wordmark
                Text("CREDO")
                    .font(.credoDisplay(size: 28))
                    .foregroundStyle(.white.opacity(0.6))
                    .tracking(8)

                Spacer().frame(height: isStory ? 20 : 8)

                // Title badge
                Text("WORKOUT COMPLETE")
                    .font(.credoMono(size: 18, weight: .bold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 10)
                    .background(
                        Capsule()
                            .fill(tealColor)
                    )

                // Stats row
                statsRow

                // Divider
                Rectangle()
                    .fill(.white.opacity(0.1))
                    .frame(height: 1)
                    .padding(.horizontal, 60)

                // Exercises list
                exercisesList

                Spacer()

                // Date
                Text(formattedDate)
                    .font(.credoMono(size: 16, weight: .medium))
                    .foregroundStyle(.white.opacity(0.4))
                    .tracking(2)

                if isStory { Spacer().frame(height: 100) }
            }
            .padding(isStory ? 48 : 40)
        }
        .frame(width: aspectRatio.size.width, height: aspectRatio.size.height)
    }

    // MARK: - Stats Row

    private var statsRow: some View {
        HStack(spacing: 0) {
            statItem(value: formattedDuration, label: "DURATION")
            statDivider
            statItem(value: formattedVolume, label: "VOLUME")
            statDivider
            statItem(value: "\(workout.exercises.count)", label: "EXERCISES")
        }
        .padding(.horizontal, 20)
    }

    private func statItem(value: String, label: String) -> some View {
        VStack(spacing: 8) {
            Text(value)
                .font(.credoMono(size: isStory ? 40 : 32, weight: .bold))
                .foregroundStyle(.white)
            Text(label)
                .font(.credoMono(size: 11, weight: .medium))
                .foregroundStyle(.white.opacity(0.5))
                .tracking(2)
        }
        .frame(maxWidth: .infinity)
    }

    private var statDivider: some View {
        Rectangle()
            .fill(.white.opacity(0.15))
            .frame(width: 1, height: 60)
    }

    // MARK: - Exercises List

    private var exercisesList: some View {
        VStack(spacing: isStory ? 20 : 14) {
            let displayExercises = Array(workout.exercises.prefix(isStory ? 8 : 5))
            ForEach(Array(displayExercises.enumerated()), id: \.offset) { _, exercise in
                exerciseRow(exercise)
            }
            if workout.exercises.count > displayExercises.count {
                Text("+\(workout.exercises.count - displayExercises.count) more")
                    .font(.credoMono(size: 14, weight: .medium))
                    .foregroundStyle(.white.opacity(0.4))
            }
        }
    }

    private func exerciseRow(_ exercise: CompletedExercise) -> some View {
        HStack {
            // Exercise name
            Text(exerciseName(for: exercise.exerciseId))
                .font(.credoBody(size: isStory ? 22 : 18, weight: .semibold))
                .foregroundStyle(.white)
                .lineLimit(1)

            Spacer()

            // Best set
            if let bestSet = exercise.sets.max(by: { $0.weight * Double($0.reps) < $1.weight * Double($1.reps) }) {
                Text("\(formatWeight(bestSet.weight)) \u{00D7} \(bestSet.reps)")
                    .font(.credoMono(size: isStory ? 20 : 16, weight: .semibold))
                    .foregroundStyle(.white.opacity(0.7))
            }

            // PR indicator
            if exercise.estimated1RM > 0 {
                // We show a PR badge if this exercise had notable performance
                let hasPR = isPR(exercise)
                if hasPR {
                    Text("PR")
                        .font(.credoMono(size: 12, weight: .bold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(
                            Capsule()
                                .fill(accentColor)
                        )
                }
            }
        }
        .padding(.horizontal, 20)
    }

    // MARK: - Helpers

    private func exerciseName(for id: String) -> String {
        ExerciseLibrary.find(id)?.name ?? id.replacingOccurrences(of: "_", with: " ").capitalized
    }

    private func isPR(_ exercise: CompletedExercise) -> Bool {
        let store = WorkoutStore.shared
        let prs = store.getPersonalRecords(for: exercise.exerciseId)
        return prs.contains { Calendar.current.isDate($0.date, inSameDayAs: workout.date) }
    }

    private var formattedDuration: String {
        let minutes = workout.durationSeconds / 60
        if minutes >= 60 {
            let hours = minutes / 60
            let mins = minutes % 60
            return "\(hours)h\(mins)m"
        }
        return "\(minutes)m"
    }

    private var formattedVolume: String {
        let totalVolume = workout.exercises.reduce(0.0) { total, exercise in
            total + exercise.sets.reduce(0.0) { $0 + $1.weight * Double($1.reps) }
        }
        if totalVolume >= 10000 {
            return String(format: "%.1fk", totalVolume / 1000)
        }
        return String(format: "%.0f", totalVolume)
    }

    private var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d, yyyy"
        return formatter.string(from: workout.date).uppercased()
    }

    private func formatWeight(_ value: Double) -> String {
        value.formattedWeight
    }
}
