import SwiftUI

struct OnboardingExperienceStep: View {
    @Binding var experienceLevel: String

    var body: some View {
        VStack(alignment: .leading, spacing: 32) {
            // Header
            VStack(alignment: .leading, spacing: 8) {
                Text("Experience level")
                    .font(.credoDisplay(size: 26))
                    .foregroundStyle(CredoColors.textPrimary)

                Text("This helps us set the right starting weights")
                    .font(.credoBody(size: 15, weight: .regular))
                    .foregroundStyle(CredoColors.textSecondary)
            }

            VStack(spacing: 12) {
                experienceCard(
                    level: "beginner",
                    title: "Beginner",
                    description: "Less than 1 year of consistent lifting"
                )

                experienceCard(
                    level: "intermediate",
                    title: "Intermediate",
                    description: "1-3 years, comfortable with compounds"
                )

                experienceCard(
                    level: "advanced",
                    title: "Advanced",
                    description: "3+ years, strong with all major lifts"
                )
            }

            Spacer()
        }
    }

    private func experienceCard(level: String, title: String, description: String) -> some View {
        let isSelected = experienceLevel == level

        return Button {
            experienceLevel = level
        } label: {
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(title)
                        .font(.credoBody(size: 17, weight: .semibold))
                        .foregroundStyle(isSelected ? .white : CredoColors.textPrimary)

                    Spacer()

                    if isSelected {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 20))
                            .foregroundStyle(.white)
                    }
                }

                Text(description)
                    .font(.credoBody(size: 14, weight: .regular))
                    .foregroundStyle(isSelected ? .white.opacity(0.8) : CredoColors.textSecondary)
                    .multilineTextAlignment(.leading)
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
