import SwiftUI

struct ProgramDayCard: View {
    let day: WorkoutProgramDay
    let isExpanded: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Header
            HStack(alignment: .center) {
                Text(day.label)
                    .font(.credoBody(size: 15, weight: .semibold))
                    .foregroundStyle(CredoColors.textPrimary)

                Spacer()

                Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(CredoColors.textTertiary)
            }

            // Muscle group badges
            HStack(spacing: 6) {
                ForEach(day.muscleGroups, id: \.self) { group in
                    Text(group)
                        .font(.credoBody(size: 11, weight: .medium))
                        .foregroundStyle(CredoColors.teal)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(CredoColors.tealLight)
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                }
            }

            // Exercise list
            if isExpanded {
                VStack(spacing: 0) {
                    ForEach(Array(day.exercises.enumerated()), id: \.element.id) { index, exercise in
                        exerciseRow(exercise, index: index)

                        if index < day.exercises.count - 1 {
                            Rectangle()
                                .fill(CredoColors.border)
                                .frame(height: 1)
                                .padding(.leading, 28)
                        }
                    }
                }
                .padding(.top, 4)
            } else {
                // Compact summary
                Text("\(day.exercises.count) exercises")
                    .font(.credoBody(size: 13, weight: .regular))
                    .foregroundStyle(CredoColors.textSecondary)
            }
        }
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }

    private func exerciseRow(_ exercise: WorkoutProgramExercise, index: Int) -> some View {
        let name = ExerciseLibrary.find(exercise.id)?.name ?? exercise.id
        let repRange: String = {
            if exercise.repMin == exercise.repMax {
                return "\(exercise.sets) \u{00D7} \(exercise.repMin)"
            }
            return "\(exercise.sets) \u{00D7} \(exercise.repMin)-\(exercise.repMax)"
        }()

        return HStack(alignment: .center, spacing: 8) {
            Text("\(index + 1)")
                .font(.credoMono(size: 12, weight: .medium))
                .foregroundStyle(CredoColors.textTertiary)
                .frame(width: 20, alignment: .center)

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(name)
                        .font(.credoBody(size: 14, weight: .medium))
                        .foregroundStyle(CredoColors.textPrimary)

                    if exercise.isOptional {
                        Text("Optional")
                            .font(.credoBody(size: 10, weight: .medium))
                            .foregroundStyle(CredoColors.textTertiary)
                            .padding(.horizontal, 5)
                            .padding(.vertical, 1)
                            .background(CredoColors.surfaceElevated)
                            .clipShape(RoundedRectangle(cornerRadius: 4))
                    }
                }

                if let notes = exercise.notes {
                    Text(notes)
                        .font(.credoBody(size: 12, weight: .regular))
                        .foregroundStyle(CredoColors.textTertiary)
                }
            }

            Spacer()

            Text(repRange)
                .font(.credoMono(size: 13, weight: .medium))
                .foregroundStyle(CredoColors.textSecondary)
        }
        .padding(.vertical, 8)
    }
}
