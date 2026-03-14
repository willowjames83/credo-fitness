import SwiftUI

struct LogBenchmarkSheet: View {
    @Environment(\.dismiss) private var dismiss

    let store = WorkoutStore.shared

    // Benchmark exercises available for logging
    private let benchmarkExercises: [(id: String, name: String)] = [
        ("bench_press", "Bench Press"),
        ("ohp", "Overhead Press"),
        ("back_squat", "Back Squat"),
        ("front_squat", "Front Squat"),
        ("deadlift", "Deadlift"),
        ("rdl", "Romanian Deadlift"),
        ("trap_bar_deadlift", "Trap Bar Deadlift"),
        ("barbell_row", "Barbell Row"),
        ("weighted_pullup", "Weighted Pull-up"),
        ("farmer_carry", "Farmer Carry"),
    ]

    @State private var selectedExerciseIndex: Int = 0
    @State private var weightText: String = ""
    @State private var repsText: String = ""

    private var weight: Double {
        Double(weightText) ?? 0
    }

    private var reps: Int {
        Int(repsText) ?? 0
    }

    private var calculated1RM: Double {
        guard weight > 0, reps > 0 else { return 0 }
        return ProgressionEngine.estimated1RM(weight: weight, reps: reps)
    }

    private var canSave: Bool {
        weight > 0 && reps > 0
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                // Exercise picker
                VStack(alignment: .leading, spacing: 8) {
                    Text("Exercise")
                        .font(.credoBody(size: 13, weight: .semibold))
                        .foregroundStyle(CredoColors.textSecondary)

                    Picker("Exercise", selection: $selectedExerciseIndex) {
                        ForEach(0..<benchmarkExercises.count, id: \.self) { index in
                            Text(benchmarkExercises[index].name).tag(index)
                        }
                    }
                    .pickerStyle(.wheel)
                    .frame(height: 120)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .background(CredoColors.surface)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(CredoColors.border, lineWidth: 1)
                    )
                }

                // Weight + Reps inputs
                HStack(spacing: 12) {
                    // Weight
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Weight")
                            .font(.credoBody(size: 13, weight: .semibold))
                            .foregroundStyle(CredoColors.textSecondary)

                        HStack(spacing: 4) {
                            TextField("0", text: $weightText)
                                .font(.credoMono(size: 20, weight: .bold))
                                .keyboardType(.decimalPad)
                                .multilineTextAlignment(.center)
                                .frame(maxWidth: .infinity)

                            Text("lbs")
                                .font(.credoBody(size: 14, weight: .regular))
                                .foregroundStyle(CredoColors.textTertiary)
                        }
                        .padding(12)
                        .background(CredoColors.surface)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(CredoColors.border, lineWidth: 1)
                        )
                    }

                    // Reps
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Reps")
                            .font(.credoBody(size: 13, weight: .semibold))
                            .foregroundStyle(CredoColors.textSecondary)

                        HStack(spacing: 4) {
                            TextField("0", text: $repsText)
                                .font(.credoMono(size: 20, weight: .bold))
                                .keyboardType(.numberPad)
                                .multilineTextAlignment(.center)
                                .frame(maxWidth: .infinity)

                            Text("reps")
                                .font(.credoBody(size: 14, weight: .regular))
                                .foregroundStyle(CredoColors.textTertiary)
                        }
                        .padding(12)
                        .background(CredoColors.surface)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(CredoColors.border, lineWidth: 1)
                        )
                    }
                }

                // Calculated 1RM display
                VStack(spacing: 4) {
                    Text("Estimated 1RM")
                        .font(.credoBody(size: 12, weight: .regular))
                        .foregroundStyle(CredoColors.textTertiary)

                    if calculated1RM > 0 {
                        Text("\(Int(round(calculated1RM))) lbs")
                            .font(.credoMono(size: 28, weight: .bold))
                            .foregroundStyle(CredoColors.accent)
                    } else {
                        Text("--")
                            .font(.credoMono(size: 28, weight: .bold))
                            .foregroundStyle(CredoColors.textTertiary)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(16)
                .background(CredoColors.surface)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(CredoColors.border, lineWidth: 1)
                )

                Spacer()

                // Save button
                Button {
                    let exerciseId = benchmarkExercises[selectedExerciseIndex].id
                    store.logBenchmark(exerciseId: exerciseId, weight: weight, reps: reps)
                    dismiss()
                } label: {
                    Text("Save Benchmark")
                        .font(.credoBody(size: 16, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(canSave ? CredoColors.teal : CredoColors.textTertiary)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .disabled(!canSave)
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, 16)
            .navigationTitle("Log Benchmark")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundStyle(CredoColors.textSecondary)
                }
            }
        }
    }
}

#Preview {
    LogBenchmarkSheet()
}
