import SwiftUI

struct ProgressionInsightCard: View {
    let insight: ProgressionInsight

    var body: some View {
        HStack(spacing: 14) {
            // Colored icon circle
            ZStack {
                Circle()
                    .fill(insight.type.color.opacity(0.15))
                    .frame(width: 44, height: 44)
                Image(systemName: insight.type.icon)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(insight.type.color)
            }

            // Center: exercise name + messages
            VStack(alignment: .leading, spacing: 4) {
                Text(insight.exerciseName)
                    .credoBody(size: 15, weight: .semibold)
                    .foregroundStyle(CredoColors.textPrimary)
                Text(insight.message)
                    .credoBody(size: 13)
                    .foregroundStyle(CredoColors.textSecondary)
                    .lineLimit(1)
                Text(insight.detail)
                    .credoBody(size: 12)
                    .foregroundStyle(CredoColors.textTertiary)
                    .lineLimit(2)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            // Right: suggested weight
            if let suggested = insight.suggestedWeight {
                VStack(spacing: 2) {
                    Text(formatWeight(suggested))
                        .credoMono(size: 18, weight: .bold)
                        .foregroundStyle(insight.type.color)
                    Text("lbs")
                        .credoMono(size: 10)
                        .foregroundStyle(CredoColors.textTertiary)
                }
            } else {
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(CredoColors.textTertiary)
            }
        }
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }

    private func formatWeight(_ weight: Double) -> String {
        weight.formattedWeight
    }
}

#Preview {
    VStack(spacing: 12) {
        ForEach(MockProgression.insights) { insight in
            ProgressionInsightCard(insight: insight)
        }
    }
    .padding()
}
