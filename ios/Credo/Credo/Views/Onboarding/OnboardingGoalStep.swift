import SwiftUI

struct OnboardingGoalStep: View {
    @Binding var trainingGoal: String

    private let goals: [(id: String, title: String, icon: String, description: String)] = [
        ("build_muscle", "Build Muscle", "figure.strengthtraining.traditional", "Hypertrophy-focused training for size"),
        ("increase_strength", "Increase Strength", "dumbbell.fill", "Heavier loads, lower reps, compound lifts"),
        ("general_fitness", "General Fitness", "figure.run", "Balanced approach to health and performance"),
        ("longevity", "Longevity", "heart.fill", "Train for long-term health and vitality"),
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 32) {
            // Header
            VStack(alignment: .leading, spacing: 8) {
                Text("Training goal")
                    .font(.credoDisplay(size: 26))
                    .foregroundStyle(CredoColors.textPrimary)

                Text("What matters most to you right now?")
                    .font(.credoBody(size: 15, weight: .regular))
                    .foregroundStyle(CredoColors.textSecondary)
            }

            VStack(spacing: 12) {
                ForEach(goals, id: \.id) { goal in
                    goalCard(goal: goal)
                }
            }

            Spacer()
        }
    }

    private func goalCard(goal: (id: String, title: String, icon: String, description: String)) -> some View {
        let isSelected = trainingGoal == goal.id

        return Button {
            trainingGoal = goal.id
        } label: {
            HStack(spacing: 14) {
                Image(systemName: goal.icon)
                    .font(.system(size: 22))
                    .foregroundStyle(isSelected ? .white : CredoColors.accent)
                    .frame(width: 40)

                VStack(alignment: .leading, spacing: 2) {
                    Text(goal.title)
                        .font(.credoBody(size: 16, weight: .semibold))
                        .foregroundStyle(isSelected ? .white : CredoColors.textPrimary)

                    Text(goal.description)
                        .font(.credoBody(size: 13, weight: .regular))
                        .foregroundStyle(isSelected ? .white.opacity(0.8) : CredoColors.textSecondary)
                }

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 20))
                        .foregroundStyle(.white)
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(isSelected ? CredoColors.accent : CredoColors.surface)
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(isSelected ? Color.clear : CredoColors.border, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}
