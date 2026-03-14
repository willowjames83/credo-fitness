import SwiftUI

struct ExerciseSwapSheet: View {
    let currentExercise: ActiveExercise
    let alternatives: [ExerciseDefinition]
    let onSwap: (String) -> Void
    @Environment(\.dismiss) var dismiss

    private var currentDefinition: ExerciseDefinition? {
        ExerciseLibrary.find(currentExercise.id)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    // Current exercise header
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Current Exercise")
                            .font(.credoBody(size: 12, weight: .semibold))
                            .foregroundStyle(CredoColors.textTertiary)
                            .textCase(.uppercase)

                        HStack {
                            Text(currentExercise.name)
                                .font(.credoBody(size: 16, weight: .semibold))
                                .foregroundStyle(CredoColors.textPrimary)

                            Spacer()

                            if let def = currentDefinition {
                                Text(def.movementPattern.rawValue.capitalized)
                                    .font(.credoBody(size: 12, weight: .medium))
                                    .foregroundStyle(CredoColors.teal)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 3)
                                    .background(CredoColors.teal.opacity(0.12))
                                    .clipShape(Capsule())
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

                    // Alternatives header
                    Text("Swap With")
                        .font(.credoBody(size: 12, weight: .semibold))
                        .foregroundStyle(CredoColors.textTertiary)
                        .textCase(.uppercase)
                        .padding(.top, 4)

                    if alternatives.isEmpty {
                        Text("No alternative exercises available for this movement pattern.")
                            .font(.credoBody(size: 14, weight: .regular))
                            .foregroundStyle(CredoColors.textSecondary)
                            .padding(.vertical, 20)
                            .frame(maxWidth: .infinity)
                    } else {
                        // Alternatives list
                        VStack(spacing: 8) {
                            ForEach(alternatives) { def in
                                Button {
                                    onSwap(def.id)
                                    dismiss()
                                } label: {
                                    alternativeRow(def)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 8)
                .padding(.bottom, 24)
            }
            .background(CredoColors.bg)
            .navigationTitle("Swap Exercise")
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

    private func alternativeRow(_ def: ExerciseDefinition) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(def.name)
                    .font(.credoBody(size: 15, weight: .semibold))
                    .foregroundStyle(CredoColors.textPrimary)

                Spacer()

                // Difficulty badge
                Text(def.difficulty.capitalized)
                    .font(.credoBody(size: 11, weight: .medium))
                    .foregroundStyle(difficultyColor(def.difficulty))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(difficultyColor(def.difficulty).opacity(0.12))
                    .clipShape(Capsule())
            }

            // Primary muscles
            Text(def.primaryMuscles.map { $0.rawValue.capitalized }.joined(separator: ", "))
                .font(.credoBody(size: 13, weight: .regular))
                .foregroundStyle(CredoColors.textSecondary)

            // Equipment pills
            HStack(spacing: 6) {
                ForEach(def.equipment, id: \.self) { equip in
                    Text(equipmentLabel(equip))
                        .font(.credoBody(size: 11, weight: .medium))
                        .foregroundStyle(CredoColors.textTertiary)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(CredoColors.surface)
                        .clipShape(Capsule())
                        .overlay(
                            Capsule()
                                .stroke(CredoColors.border, lineWidth: 1)
                        )
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

    private func difficultyColor(_ difficulty: String) -> Color {
        switch difficulty {
        case "beginner": return CredoColors.success
        case "intermediate": return CredoColors.accent
        case "advanced": return Color.red
        default: return CredoColors.textSecondary
        }
    }

    private func equipmentLabel(_ equipment: Equipment) -> String {
        switch equipment {
        case .pullUpBar: return "Pull-up Bar"
        default: return equipment.rawValue.capitalized
        }
    }
}
