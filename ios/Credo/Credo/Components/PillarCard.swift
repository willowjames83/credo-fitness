import SwiftUI

struct PillarCard: View {
    let pillar: Pillar
    let score: Int
    let metrics: [String]
    var isWeakest: Bool = false

    var body: some View {
        HStack(spacing: 0) {
            // Left color border
            RoundedRectangle(cornerRadius: 1.5)
                .fill(pillar.color)
                .frame(width: 3)
                .padding(.vertical, 8)

            VStack(alignment: .leading, spacing: 8) {
                // Row 1: Icon + label / score + tier
                HStack {
                    HStack(spacing: 6) {
                        Image(systemName: pillar.iconName)
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(pillar.color)

                        Text(pillar.label.uppercased())
                            .font(.credoBody(size: 11, weight: .semibold))
                            .foregroundStyle(CredoColors.textSecondary)
                            .tracking(1)
                    }

                    Spacer()

                    HStack(spacing: 6) {
                        Text("\(score)")
                            .font(.credoMono(size: 20, weight: .bold))
                            .foregroundStyle(CredoColors.textPrimary)

                        Text(ScoringEngine.getTierLabel(score: score, domain: pillar.scoreDomain))
                            .font(.credoBody(size: 12, weight: .medium))
                            .foregroundStyle(CredoColors.textSecondary)
                    }
                }

                // Metric rows
                ForEach(metrics, id: \.self) { metric in
                    Text(metric)
                        .font(.credoBody(size: 13, weight: .regular))
                        .foregroundStyle(CredoColors.textSecondary)
                }

                // Weakest pillar badge
                if isWeakest {
                    Text("Weakest pillar")
                        .font(.credoBody(size: 11, weight: .semibold))
                        .foregroundStyle(CredoColors.warning)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(CredoColors.warningLight)
                        .clipShape(Capsule())
                }
            }
            .padding(.leading, 12)
            .padding(.vertical, 12)
            .padding(.trailing, 16)
        }
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.white)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(CredoColors.border, lineWidth: 1)
                )
        )
    }
}

#Preview {
    VStack(spacing: 12) {
        PillarCard(
            pillar: .strength,
            score: 74,
            metrics: ["Bench 1RM: 205 lbs", "Squat 1RM: 285 lbs"]
        )
        PillarCard(
            pillar: .stability,
            score: 58,
            metrics: ["Single-leg balance: 32s", "Grip: 95 lbs"],
            isWeakest: true
        )
    }
    .padding()
    .background(CredoColors.surface)
}
