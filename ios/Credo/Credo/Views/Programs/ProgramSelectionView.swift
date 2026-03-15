import SwiftUI

struct ProgramSelectionView: View {
    @State private var viewModel = ProgramViewModel()
    @State private var programStore = ProgramStore.shared
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                VStack(spacing: 8) {
                    Text("Training Programs")
                        .font(.credoDisplay(size: 26))
                        .foregroundStyle(CredoColors.textPrimary)

                    Text("AI-powered personalized programs or proven templates")
                        .font(.credoBody(size: 14, weight: .regular))
                        .foregroundStyle(CredoColors.textSecondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 8)

                // Generate CTA
                NavigationLink(destination: GenerateProgramView()) {
                    HStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(CredoColors.accent.opacity(0.15))
                                .frame(width: 44, height: 44)

                            Image(systemName: "sparkles")
                                .font(.system(size: 20, weight: .medium))
                                .foregroundStyle(CredoColors.accent)
                        }

                        VStack(alignment: .leading, spacing: 3) {
                            Text("Generate My Program")
                                .font(.credoDisplay(size: 18))
                                .foregroundStyle(CredoColors.textPrimary)

                            Text("AI-powered, based on your history & goals")
                                .font(.credoBody(size: 13, weight: .regular))
                                .foregroundStyle(CredoColors.textSecondary)
                        }

                        Spacer()

                        Image(systemName: "chevron.right")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(CredoColors.accent)
                    }
                    .padding(16)
                    .background(
                        LinearGradient(
                            colors: [CredoColors.accentLight, CredoColors.surface],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(CredoColors.accent.opacity(0.3), lineWidth: 1)
                    )
                }
                .buttonStyle(.plain)

                // Your Programs (AI-generated)
                if !programStore.savedPrograms.isEmpty {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("YOUR PROGRAMS")
                            .font(.credoBody(size: 11, weight: .semibold))
                            .foregroundStyle(CredoColors.textTertiary)
                            .tracking(1)

                        ForEach(programStore.savedPrograms) { program in
                            NavigationLink(destination: ProgramDetailView(program: program)) {
                                GeneratedProgramCard(
                                    program: program,
                                    isActive: viewModel.isProgramSelected(program.id)
                                )
                            }
                            .buttonStyle(.plain)
                            .contextMenu {
                                Button(role: .destructive) {
                                    programStore.deleteProgram(id: program.id)
                                } label: {
                                    Label("Delete Program", systemImage: "trash")
                                }
                            }
                        }
                    }
                }

                // Templates
                VStack(alignment: .leading, spacing: 10) {
                    Text("TEMPLATES")
                        .font(.credoBody(size: 11, weight: .semibold))
                        .foregroundStyle(CredoColors.textTertiary)
                        .tracking(1)

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
