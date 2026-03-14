import SwiftUI

struct ExerciseCard: View {
    let exercise: ActiveExercise
    var supersetLabel: String? = nil
    let onToggleSet: (Int) -> Void
    let onUpdateWeight: (Int, Double) -> Void
    let onUpdateReps: (Int, Int) -> Void
    let onCompleteExercise: () -> Void
    let onSwapExercise: () -> Void
    let onAddSet: () -> Void
    let onRemoveSet: (Int) -> Void

    @State private var showFormCues: Bool = false
    @State private var repsStrings: [String] = []

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
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
                        HStack(spacing: 6) {
                            Text(exercise.name)
                                .font(.credoBody(size: 16, weight: .semibold))
                                .foregroundStyle(CredoColors.textPrimary)

                            Image(systemName: "arrow.triangle.2.circlepath")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundStyle(CredoColors.accent)
                        }
                    }
                    .buttonStyle(.plain)
                }

                Spacer()

                Text(exercise.setsTarget)
                    .font(.credoBody(size: 12, weight: .semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(CredoColors.accent)
                    .clipShape(Capsule())
            }

            // Muscle group
            Text(exercise.muscleGroup)
                .font(.credoBody(size: 13, weight: .regular))
                .foregroundStyle(CredoColors.textSecondary)

            // Previous session
            if let previous = exercise.previousSession {
                Text("Previous: \(previous)")
                    .font(.credoBody(size: 12, weight: .regular))
                    .foregroundStyle(CredoColors.textTertiary)
            }

            // Per-side indicator
            if exercise.isPerSide {
                HStack(spacing: 4) {
                    Image(systemName: "arrow.left.arrow.right")
                        .font(.system(size: 10))
                    Text("Per side")
                        .font(.credoBody(size: 11, weight: .medium))
                }
                .foregroundStyle(CredoColors.accent)
            }

            // Form cues (collapsible)
            if !exercise.formCues.isEmpty {
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        showFormCues.toggle()
                    }
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: showFormCues ? "chevron.down" : "chevron.right")
                            .font(.system(size: 10, weight: .medium))
                        Text("Form Cues")
                            .font(.credoBody(size: 12, weight: .medium))
                    }
                    .foregroundStyle(CredoColors.textTertiary)
                }
                .buttonStyle(.plain)

                if showFormCues {
                    VStack(alignment: .leading, spacing: 4) {
                        ForEach(exercise.formCues, id: \.self) { cue in
                            HStack(alignment: .top, spacing: 6) {
                                Text("\u{2022}")
                                    .font(.credoBody(size: 11, weight: .regular))
                                Text(cue)
                                    .font(.credoBody(size: 11, weight: .regular))
                            }
                            .foregroundStyle(CredoColors.textTertiary)
                        }
                    }
                    .padding(.leading, 4)
                }
            }

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
            .font(.credoBody(size: 11, weight: .semibold))
            .foregroundStyle(CredoColors.textTertiary)
            .padding(.top, 4)

            Divider()
                .foregroundStyle(CredoColors.border)

            // Set rows
            ForEach(Array(exercise.sets.enumerated()), id: \.element.id) { index, workoutSet in
                // Insert "WORKING SETS" separator between warmup and working sets
                if !workoutSet.isWarmup,
                   index > 0,
                   exercise.sets[index - 1].isWarmup {
                    HStack(spacing: 8) {
                        Rectangle()
                            .fill(CredoColors.border)
                            .frame(height: 0.5)
                        Text("WORKING SETS")
                            .font(.credoBody(size: 10, weight: .semibold))
                            .foregroundStyle(CredoColors.textTertiary)
                        Rectangle()
                            .fill(CredoColors.border)
                            .frame(height: 0.5)
                    }
                    .padding(.vertical, 4)
                }

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
                .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                    if !workoutSet.isWarmup {
                        Button(role: .destructive) {
                            onRemoveSet(index)
                        } label: {
                            Label("Remove", systemImage: "trash")
                        }
                    }
                }

                if index < exercise.sets.count - 1 {
                    Divider()
                        .foregroundStyle(CredoColors.border.opacity(workoutSet.isWarmup ? 0.3 : 0.5))
                }
            }

            // Add Set button
            Button { onAddSet() } label: {
                HStack(spacing: 4) {
                    Image(systemName: "plus.circle")
                        .font(.system(size: 13))
                    Text("Add Set")
                        .font(.credoBody(size: 13, weight: .medium))
                }
                .foregroundStyle(CredoColors.accent)
            }
            .buttonStyle(.plain)
            .padding(.top, 4)

            // Complete Exercise button
            Button(action: onCompleteExercise) {
                Text("Complete Exercise")
                    .font(.credoBody(size: 15, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(
                        hasCompletedSet
                            ? CredoColors.accent
                            : CredoColors.accent.opacity(0.4)
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }
            .buttonStyle(.plain)
            .disabled(!hasCompletedSet)
            .padding(.top, 4)
        }
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(CredoColors.border, lineWidth: 1)
        )
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
