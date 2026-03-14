import SwiftUI

struct SupersetGroupView: View {
    let supersetGroup: SupersetGroup
    let exercises: [ActiveExercise]
    let supersetLabels: [String] // e.g. ["A1", "A2"]
    let currentExerciseIndex: Int
    let onToggleSet: (Int, Int) -> Void // (exerciseIndex, setIndex)
    let onUpdateWeight: (Int, Int, Double) -> Void // (exerciseIndex, setIndex, weight)
    let onUpdateReps: (Int, Int, Int) -> Void // (exerciseIndex, setIndex, reps)
    let onCompleteSupersetExercise: (Int) -> Void // exerciseIndex
    let onSwapExercise: (Int) -> Void // exerciseIndex
    let onAddSet: (Int) -> Void // exerciseIndex
    let onRemoveSet: (Int, Int) -> Void // (exerciseIndex, setIndex)

    var body: some View {
        HStack(alignment: .top, spacing: 0) {
            // Accent bracket on the left
            VStack(spacing: 0) {
                Rectangle()
                    .fill(CredoColors.accent)
                    .frame(width: 3)
            }
            .padding(.vertical, 8)

            VStack(alignment: .leading, spacing: 0) {
                // Superset header
                HStack(spacing: 8) {
                    Text("SUPERSET")
                        .font(.credoBody(size: 10, weight: .bold))
                        .tracking(1.2)
                        .foregroundStyle(CredoColors.accent)

                    HStack(spacing: 4) {
                        ForEach(Array(supersetLabels.enumerated()), id: \.offset) { _, label in
                            Text(label)
                                .font(.credoMono(size: 10, weight: .bold))
                                .foregroundStyle(.white)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(CredoColors.accent)
                                .clipShape(Capsule())
                        }
                    }

                    Spacer()

                    Text("60s rest between")
                        .font(.credoBody(size: 10, weight: .medium))
                        .foregroundStyle(CredoColors.textTertiary)
                }
                .padding(.horizontal, 12)
                .padding(.top, 10)
                .padding(.bottom, 8)

                // Exercise cards
                ForEach(Array(exercises.enumerated()), id: \.element.id) { index, exercise in
                    let globalIndex = supersetGroup.exerciseIndices[index]
                    let label = index < supersetLabels.count ? supersetLabels[index] : nil
                    let isActive = globalIndex == currentExerciseIndex

                    SupersetExerciseCard(
                        exercise: exercise,
                        supersetLabel: label,
                        isActive: isActive,
                        onToggleSet: { setIndex in
                            onToggleSet(globalIndex, setIndex)
                        },
                        onUpdateWeight: { setIndex, weight in
                            onUpdateWeight(globalIndex, setIndex, weight)
                        },
                        onUpdateReps: { setIndex, reps in
                            onUpdateReps(globalIndex, setIndex, reps)
                        },
                        onCompleteExercise: {
                            onCompleteSupersetExercise(globalIndex)
                        },
                        onSwapExercise: {
                            onSwapExercise(globalIndex)
                        },
                        onAddSet: {
                            onAddSet(globalIndex)
                        },
                        onRemoveSet: { setIndex in
                            onRemoveSet(globalIndex, setIndex)
                        }
                    )

                    if index < exercises.count - 1 {
                        Divider()
                            .padding(.horizontal, 12)
                    }
                }
            }
        }
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(CredoColors.accent.opacity(0.3), lineWidth: 1)
        )
    }
}

// MARK: - Individual exercise within a superset

private struct SupersetExerciseCard: View {
    let exercise: ActiveExercise
    let supersetLabel: String?
    let isActive: Bool
    let onToggleSet: (Int) -> Void
    let onUpdateWeight: (Int, Double) -> Void
    let onUpdateReps: (Int, Int) -> Void
    let onCompleteExercise: () -> Void
    let onSwapExercise: () -> Void
    let onAddSet: () -> Void
    let onRemoveSet: (Int) -> Void

    @State private var repsStrings: [String] = []

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Header with superset label badge
            HStack(alignment: .center) {
                HStack(spacing: 8) {
                    if let label = supersetLabel {
                        Text(label)
                            .font(.credoMono(size: 11, weight: .bold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 7)
                            .padding(.vertical, 3)
                            .background(CredoColors.accent)
                            .clipShape(Capsule())
                    }

                    Button(action: onSwapExercise) {
                        HStack(spacing: 5) {
                            Text(exercise.name)
                                .font(.credoBody(size: 15, weight: .semibold))
                                .foregroundStyle(CredoColors.textPrimary)

                            Image(systemName: "arrow.triangle.2.circlepath")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundStyle(CredoColors.accent)
                        }
                    }
                    .buttonStyle(.plain)
                }

                Spacer()

                Text(exercise.setsTarget)
                    .font(.credoBody(size: 11, weight: .semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(CredoColors.accent)
                    .clipShape(Capsule())
            }

            // Muscle group
            Text(exercise.muscleGroup)
                .font(.credoBody(size: 12, weight: .regular))
                .foregroundStyle(CredoColors.textSecondary)

            if isActive {
                // Column headers
                HStack(spacing: 0) {
                    Text("SET")
                        .frame(width: 40, alignment: .leading)
                    Text("LBS")
                        .frame(width: 60, alignment: .leading)
                    Text("REPS")
                        .frame(width: 50, alignment: .leading)
                    Spacer()
                    Text("\u{2713}")
                        .frame(width: 28)
                }
                .font(.credoBody(size: 10, weight: .semibold))
                .foregroundStyle(CredoColors.textTertiary)

                Divider()
                    .foregroundStyle(CredoColors.border)

                // Set rows
                ForEach(Array(exercise.sets.enumerated()), id: \.element.id) { index, workoutSet in
                    SetRowView(
                        setNumber: workoutSet.id,
                        weight: Binding(
                            get: { exercise.sets[index].weight },
                            set: { newWeight in onUpdateWeight(index, newWeight) }
                        ),
                        reps: Binding(
                            get: {
                                guard index < repsStrings.count else { return "" }
                                return repsStrings[index]
                            },
                            set: { newValue in
                                guard index < repsStrings.count else { return }
                                repsStrings[index] = newValue
                                if let parsed = Int(newValue) {
                                    onUpdateReps(index, parsed)
                                }
                            }
                        ),
                        completed: workoutSet.completed,
                        onToggle: { onToggleSet(index) },
                        isWarmup: workoutSet.isWarmup
                    )

                    if index < exercise.sets.count - 1 {
                        Divider()
                            .foregroundStyle(CredoColors.border.opacity(0.5))
                    }
                }

                // Add Set button
                Button { onAddSet() } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "plus.circle")
                            .font(.system(size: 12))
                        Text("Add Set")
                            .font(.credoBody(size: 12, weight: .medium))
                    }
                    .foregroundStyle(CredoColors.accent)
                }
                .buttonStyle(.plain)
                .padding(.top, 2)

                // Complete button
                Button(action: onCompleteExercise) {
                    Text("Complete Exercise")
                        .font(.credoBody(size: 14, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(
                            hasCompletedSet
                                ? CredoColors.accent
                                : CredoColors.accent.opacity(0.4)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .buttonStyle(.plain)
                .disabled(!hasCompletedSet)
                .padding(.top, 2)
            } else {
                // Collapsed view for non-active exercise in superset
                let completedCount = exercise.sets.filter { $0.completed && !$0.isWarmup }.count
                let totalCount = exercise.sets.filter { !$0.isWarmup }.count
                if completedCount > 0 {
                    Text("\(completedCount)/\(totalCount) sets completed")
                        .font(.credoBody(size: 12, weight: .medium))
                        .foregroundStyle(CredoColors.success)
                } else {
                    Text("\(totalCount) sets pending")
                        .font(.credoBody(size: 12, weight: .medium))
                        .foregroundStyle(CredoColors.textTertiary)
                }
            }
        }
        .padding(12)
        .opacity(isActive ? 1.0 : 0.7)
        .onAppear {
            initRepsStrings()
        }
        .onChange(of: exercise.sets.count) { _, _ in
            initRepsStrings()
        }
    }

    private var hasCompletedSet: Bool {
        exercise.sets.contains(where: { $0.completed && !$0.isWarmup })
    }

    private func initRepsStrings() {
        repsStrings = exercise.sets.map { set in
            if let reps = set.reps {
                return "\(reps)"
            }
            return ""
        }
    }
}
