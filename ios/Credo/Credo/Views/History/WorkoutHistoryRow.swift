import SwiftUI

struct WorkoutHistoryRow: View {
    let workout: CompletedWorkout
    let dayLabel: String
    let exerciseCount: Int
    let duration: String
    let volume: String
    let hasPR: Bool

    private var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE, MMM d"
        return formatter.string(from: workout.date)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(dayLabel)
                        .font(.credoBody(size: 15, weight: .semibold))
                        .foregroundStyle(CredoColors.textPrimary)

                    Text(formattedDate)
                        .font(.credoBody(size: 13, weight: .regular))
                        .foregroundStyle(CredoColors.textSecondary)
                }

                Spacer()

                if hasPR {
                    PRBadge()
                }

                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(CredoColors.textTertiary)
            }

            HStack(spacing: 16) {
                Label("\(exerciseCount) exercises", systemImage: "figure.strengthtraining.traditional")
                    .font(.credoBody(size: 12, weight: .regular))
                    .foregroundStyle(CredoColors.textSecondary)

                Label(duration, systemImage: "clock")
                    .font(.credoBody(size: 12, weight: .regular))
                    .foregroundStyle(CredoColors.textSecondary)

                Label(volume, systemImage: "scalemass")
                    .font(.credoBody(size: 12, weight: .regular))
                    .foregroundStyle(CredoColors.textSecondary)
            }
            .labelStyle(CompactLabelStyle())
        }
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }
}

private struct CompactLabelStyle: LabelStyle {
    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: 4) {
            configuration.icon
                .font(.system(size: 10))
            configuration.title
        }
    }
}
