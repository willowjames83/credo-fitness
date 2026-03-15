import SwiftUI

struct ProgramSelectionView: View {
    @State private var viewModel = ProgramViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                VStack(spacing: 8) {
                    Text("Training Programs")
                        .font(.credoDisplay(size: 26))
                        .foregroundStyle(CredoColors.textPrimary)

                    Text("Choose a structured program that fits your schedule and goals")
                        .font(.credoBody(size: 14, weight: .regular))
                        .foregroundStyle(CredoColors.textSecondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 8)

                // Program cards
                VStack(spacing: 14) {
                    ForEach(viewModel.allPrograms) { program in
                        NavigationLink(destination: ProgramDetailView(program: program)) {
                            programCard(program)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 32)
        }
        .background(CredoColors.bg)
    }

    private func programCard(_ program: WorkoutProgram) -> some View {
        let isCurrentProgram = viewModel.isProgramSelected(program.id)

        return VStack(alignment: .leading, spacing: 12) {
            // Title row
            HStack(alignment: .top) {
                Text(program.name)
                    .font(.credoDisplay(size: 20))
                    .foregroundStyle(CredoColors.textPrimary)

                Spacer()

                if isCurrentProgram {
                    Text("Active")
                        .font(.credoBody(size: 11, weight: .semibold))
                        .foregroundStyle(CredoColors.success)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(CredoColors.successLight)
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                }
            }

            // Badges row
            HStack(spacing: 8) {
                badgeView(text: "\(program.daysPerWeek) days/wk", color: CredoColors.accent, background: CredoColors.accentLight)
                badgeView(text: program.difficulty, color: difficultyColor(program.difficulty), background: difficultyBackground(program.difficulty))
                badgeView(text: program.focus, color: CredoColors.teal, background: CredoColors.tealLight)
            }

            // Description
            Text(program.shortDescription)
                .font(.credoBody(size: 14, weight: .regular))
                .foregroundStyle(CredoColors.textSecondary)
                .lineLimit(2)

            // Day labels preview
            HStack(spacing: 6) {
                ForEach(program.days.prefix(6)) { day in
                    Text(day.label)
                        .font(.credoBody(size: 11, weight: .medium))
                        .foregroundStyle(CredoColors.textTertiary)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(CredoColors.surface)
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                        .overlay(
                            RoundedRectangle(cornerRadius: 6)
                                .stroke(CredoColors.border, lineWidth: 1)
                        )
                }

                if program.days.count > 6 {
                    Text("+\(program.days.count - 6)")
                        .font(.credoBody(size: 11, weight: .medium))
                        .foregroundStyle(CredoColors.textTertiary)
                }
            }

            // Arrow hint
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
                .stroke(isCurrentProgram ? CredoColors.success.opacity(0.4) : CredoColors.border, lineWidth: 1)
        )
    }

    // MARK: - Badge Helpers

    private func badgeView(text: String, color: Color, background: Color) -> some View {
        Text(text)
            .font(.credoBody(size: 11, weight: .semibold))
            .foregroundStyle(color)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(background)
            .clipShape(RoundedRectangle(cornerRadius: 6))
    }

    private func difficultyColor(_ difficulty: String) -> Color {
        switch difficulty {
        case "Beginner": return CredoColors.teal
        case "Intermediate": return CredoColors.accent
        case "Advanced": return CredoColors.danger
        default: return CredoColors.accent
        }
    }

    private func difficultyBackground(_ difficulty: String) -> Color {
        switch difficulty {
        case "Beginner": return CredoColors.tealLight
        case "Intermediate": return CredoColors.accentLight
        case "Advanced": return Color(hex: "FFE8E8")
        default: return CredoColors.accentLight
        }
    }
}
