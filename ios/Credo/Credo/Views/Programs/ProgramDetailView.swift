import SwiftUI

struct ProgramDetailView: View {
    let program: WorkoutProgram
    @State private var viewModel = ProgramViewModel()
    @State private var expandedDayId: String?
    @Environment(\.dismiss) private var dismiss

    private var isCurrentProgram: Bool {
        viewModel.isProgramSelected(program.id)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                headerSection
                badgesSection
                descriptionSection
                progressionSection
                daysSection
                actionSection
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
        .background(CredoColors.bg)
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(program.name)
                    .font(.credoDisplay(size: 28))
                    .foregroundStyle(CredoColors.textPrimary)

                Spacer()

                if isCurrentProgram {
                    Text("Current Program")
                        .font(.credoBody(size: 12, weight: .semibold))
                        .foregroundStyle(CredoColors.success)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 5)
                        .background(CredoColors.successLight)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                }
            }
        }
        .padding(.top, 8)
    }

    // MARK: - Badges

    private var badgesSection: some View {
        HStack(spacing: 10) {
            infoBadge(
                icon: "calendar",
                label: "\(program.daysPerWeek) days/week"
            )
            infoBadge(
                icon: "flame",
                label: program.difficulty
            )
            infoBadge(
                icon: "target",
                label: program.focus
            )

            Spacer()
        }
    }

    private func infoBadge(icon: String, label: String) -> some View {
        HStack(spacing: 5) {
            Image(systemName: icon)
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(CredoColors.accent)

            Text(label)
                .font(.credoBody(size: 12, weight: .medium))
                .foregroundStyle(CredoColors.textPrimary)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }

    // MARK: - Description

    private var descriptionSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("About this program")
                .font(.credoBody(size: 13, weight: .semibold))
                .foregroundStyle(CredoColors.textSecondary)

            Text(program.description)
                .font(.credoBody(size: 14, weight: .regular))
                .foregroundStyle(CredoColors.textPrimary)
                .lineSpacing(3)
        }
    }

    // MARK: - Progression

    private var progressionSection: some View {
        HStack(spacing: 12) {
            Image(systemName: "chart.line.uptrend.xyaxis")
                .font(.system(size: 16, weight: .medium))
                .foregroundStyle(CredoColors.teal)
                .frame(width: 32, height: 32)
                .background(CredoColors.tealLight)
                .clipShape(RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 2) {
                Text("Progression")
                    .font(.credoBody(size: 13, weight: .semibold))
                    .foregroundStyle(CredoColors.textPrimary)

                Text(progressionDescription)
                    .font(.credoBody(size: 13, weight: .regular))
                    .foregroundStyle(CredoColors.textSecondary)
            }

            Spacer()
        }
        .padding(14)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }

    private var progressionDescription: String {
        switch program.progressionScheme {
        case .linearProgression:
            return "Add weight each session when you hit all target reps."
        case .doubleProgression:
            return "Increase reps first, then add weight when you hit the top of the rep range."
        case .undulating:
            return "Intensity varies across sessions to manage fatigue and drive adaptation."
        }
    }

    // MARK: - Days

    private var daysSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Training Days")
                .font(.credoBody(size: 13, weight: .semibold))
                .foregroundStyle(CredoColors.textSecondary)

            ForEach(program.days) { day in
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        if expandedDayId == day.id {
                            expandedDayId = nil
                        } else {
                            expandedDayId = day.id
                        }
                    }
                } label: {
                    ProgramDayCard(
                        day: day,
                        isExpanded: expandedDayId == day.id
                    )
                }
                .buttonStyle(.plain)
            }
        }
    }

    // MARK: - Action

    private var actionSection: some View {
        VStack(spacing: 12) {
            if isCurrentProgram {
                HStack(spacing: 8) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 16))
                        .foregroundStyle(CredoColors.success)

                    Text("This is your current program")
                        .font(.credoBody(size: 15, weight: .medium))
                        .foregroundStyle(CredoColors.success)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(CredoColors.successLight)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            } else {
                Button {
                    viewModel.selectProgram(program.id)
                } label: {
                    Text("Select This Program")
                        .font(.credoBody(size: 16, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(CredoColors.accent)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }
        }
        .padding(.top, 4)
    }
}
