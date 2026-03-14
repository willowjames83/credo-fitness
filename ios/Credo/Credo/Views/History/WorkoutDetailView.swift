import SwiftUI

struct WorkoutDetailView: View {
    let workout: CompletedWorkout
    private let store = WorkoutStore.shared

    private var dayLabel: String {
        guard let template = ProgramTemplate(rawValue: workout.programTemplate) else {
            return "Workout"
        }
        let labels = template.dayLabels
        guard workout.dayIndex < labels.count else { return "Workout" }
        return labels[workout.dayIndex]
    }

    private var programName: String {
        ProgramTemplate(rawValue: workout.programTemplate)?.displayName ?? workout.programTemplate
    }

    private var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .long
        return formatter.string(from: workout.date)
    }

    private var formattedDuration: String {
        let m = workout.durationSeconds / 60
        return "\(m) min"
    }

    private var totalVolume: Double {
        workout.exercises.reduce(0) { total, exercise in
            total + exercise.sets.reduce(0) { setTotal, set in
                setTotal + set.weight * Double(set.reps)
            }
        }
    }

    private var totalSets: Int {
        workout.exercises.reduce(0) { $0 + $1.sets.count }
    }

    private var averageRIR: Double {
        guard !workout.exercises.isEmpty else { return 0 }
        let sum = workout.exercises.reduce(0) { $0 + $1.rir }
        return Double(sum) / Double(workout.exercises.count)
    }

    private var workoutPRs: [PersonalRecord] {
        store.personalRecords.filter { Calendar.current.isDate($0.date, inSameDayAs: workout.date) }
    }

    private func exerciseVolume(_ exercise: CompletedExercise) -> Double {
        exercise.sets.reduce(0) { $0 + $1.weight * Double($1.reps) }
    }

    private func hasPR(for exerciseId: String) -> Bool {
        workoutPRs.contains { $0.exerciseId == exerciseId }
    }

    private func formattedVolume(_ volume: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.maximumFractionDigits = 0
        return (formatter.string(from: NSNumber(value: volume)) ?? "\(Int(volume))") + " lbs"
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Header
                headerSection

                // Exercises
                ForEach(Array(workout.exercises.enumerated()), id: \.offset) { _, exercise in
                    exerciseCard(exercise)
                }

                // Summary
                summarySection
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, 24)
        }
        .navigationTitle(dayLabel)
        .navigationBarTitleDisplayMode(.inline)
    }

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(formattedDate)
                .font(.credoBody(size: 15, weight: .medium))
                .foregroundStyle(CredoColors.textPrimary)

            Text("\(programName) \u{00B7} \(dayLabel)")
                .font(.credoBody(size: 13, weight: .regular))
                .foregroundStyle(CredoColors.textSecondary)

            Text(formattedDuration)
                .font(.credoMono(size: 13, weight: .semibold))
                .foregroundStyle(CredoColors.accent)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }

    private func exerciseCard(_ exercise: CompletedExercise) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(ExerciseLibrary.find(exercise.exerciseId)?.name ?? exercise.exerciseId)
                    .font(.credoBody(size: 15, weight: .semibold))
                    .foregroundStyle(CredoColors.textPrimary)

                Spacer()

                if hasPR(for: exercise.exerciseId) {
                    PRBadge()
                }
            }

            // Sets
            ForEach(Array(exercise.sets.enumerated()), id: \.offset) { index, set in
                HStack {
                    Text("Set \(index + 1)")
                        .font(.credoBody(size: 13, weight: .regular))
                        .foregroundStyle(CredoColors.textSecondary)

                    Spacer()

                    Text("\(Int(set.weight)) \u{00D7} \(set.reps)")
                        .font(.credoMono(size: 13, weight: .semibold))
                        .foregroundStyle(CredoColors.textPrimary)
                }
            }

            Divider()

            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Est. 1RM")
                        .font(.credoBody(size: 11, weight: .regular))
                        .foregroundStyle(CredoColors.textTertiary)
                    Text("\(Int(exercise.estimated1RM)) lbs")
                        .font(.credoMono(size: 13, weight: .semibold))
                        .foregroundStyle(CredoColors.textPrimary)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 2) {
                    Text("Volume")
                        .font(.credoBody(size: 11, weight: .regular))
                        .foregroundStyle(CredoColors.textTertiary)
                    Text(formattedVolume(exerciseVolume(exercise)))
                        .font(.credoMono(size: 13, weight: .semibold))
                        .foregroundStyle(CredoColors.textPrimary)
                }
            }
        }
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }

    private var summarySection: some View {
        VStack(spacing: 12) {
            Text("SUMMARY")
                .font(.credoBody(size: 11, weight: .semibold))
                .foregroundStyle(CredoColors.textTertiary)
                .tracking(1.5)
                .frame(maxWidth: .infinity, alignment: .leading)

            VStack(spacing: 10) {
                summaryRow(label: "Total Volume", value: formattedVolume(totalVolume))
                summaryRow(label: "Total Sets", value: "\(totalSets)")
                summaryRow(label: "Exercises", value: "\(workout.exercises.count)")
                summaryRow(label: "Avg RIR", value: String(format: "%.1f", averageRIR))
            }
            .padding(16)
            .background(CredoColors.surface)
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(CredoColors.border, lineWidth: 1)
            )
        }
    }

    private func summaryRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.credoBody(size: 14, weight: .regular))
                .foregroundStyle(CredoColors.textSecondary)
            Spacer()
            Text(value)
                .font(.credoMono(size: 14, weight: .semibold))
                .foregroundStyle(CredoColors.textPrimary)
        }
    }
}
