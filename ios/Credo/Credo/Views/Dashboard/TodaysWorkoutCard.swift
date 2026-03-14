import SwiftUI

struct TodaysWorkoutCard: View {
    let name: String
    let detail: String
    let subtitle: String
    let weekProgress: [Bool]
    let onStartWorkout: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Today's Workout")
                .font(.credoBody(size: 13, weight: .semibold))
                .foregroundStyle(CredoColors.textSecondary)

            Text(name)
                .font(.credoBody(size: 14, weight: .medium))
                .foregroundStyle(CredoColors.textPrimary)

            Text(detail)
                .font(.credoBody(size: 13, weight: .regular))
                .foregroundStyle(CredoColors.textSecondary)

            if !subtitle.isEmpty {
                HStack(spacing: 6) {
                    Text(subtitle)
                        .font(.credoBody(size: 12, weight: .regular))
                        .foregroundStyle(CredoColors.teal)

                    if !weekProgress.isEmpty {
                        weekProgressDots
                    }
                }
            }

            Button {
                onStartWorkout()
            } label: {
                Text("Start Workout")
                    .font(.credoBody(size: 14, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(CredoColors.accent)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }
            .padding(.top, 4)
        }
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }

    private var weekProgressDots: some View {
        HStack(spacing: 4) {
            ForEach(Array(weekProgress.enumerated()), id: \.offset) { _, completed in
                Circle()
                    .fill(completed ? CredoColors.success : CredoColors.border)
                    .frame(width: 7, height: 7)
            }
        }
    }
}
