import SwiftUI

struct GeneratedProgramCard: View {
    let program: WorkoutProgram
    let isActive: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // AI badge + title
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 5) {
                        Image(systemName: "sparkles")
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundStyle(CredoColors.accent)

                        Text("AI-Generated")
                            .font(.credoBody(size: 10, weight: .semibold))
                            .foregroundStyle(CredoColors.accent)
                    }

                    Text(program.name)
                        .font(.credoDisplay(size: 18))
                        .foregroundStyle(CredoColors.textPrimary)
                }

                Spacer()

                if isActive {
                    Text("Active")
                        .font(.credoBody(size: 11, weight: .semibold))
                        .foregroundStyle(CredoColors.success)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(CredoColors.successLight)
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                }
            }

            // Badges
            HStack(spacing: 8) {
                badgeView(text: "\(program.daysPerWeek) days/wk", color: CredoColors.accent, background: CredoColors.accentLight)
                badgeView(text: program.difficulty, color: CredoColors.teal, background: CredoColors.tealLight)
                badgeView(text: program.focus, color: CredoColors.teal, background: CredoColors.tealLight)
            }

            // Short description
            Text(program.shortDescription)
                .font(.credoBody(size: 13, weight: .regular))
                .foregroundStyle(CredoColors.textSecondary)
                .lineLimit(2)

            // Chevron
            HStack {
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(CredoColors.textTertiary)
            }
        }
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(isActive ? CredoColors.success.opacity(0.4) : CredoColors.accent.opacity(0.2), lineWidth: 1)
        )
    }

    private func badgeView(text: String, color: Color, background: Color) -> some View {
        Text(text)
            .font(.credoBody(size: 11, weight: .semibold))
            .foregroundStyle(color)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(background)
            .clipShape(RoundedRectangle(cornerRadius: 6))
    }
}
