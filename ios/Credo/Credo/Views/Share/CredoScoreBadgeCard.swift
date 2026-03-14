import SwiftUI

struct CredoScoreBadgeCard: View {
    let score: Int
    let pillarScores: [(name: String, score: Int)]
    let aspectRatio: AspectRatio

    private var isStory: Bool { aspectRatio == .story }
    private let accentColor = CredoColors.accent

    var body: some View {
        ZStack {
            ShareCardBackground(aspectRatio: aspectRatio)

            VStack(spacing: isStory ? 48 : 28) {
                if isStory { Spacer().frame(height: 80) }

                // Credo wordmark
                Text("CREDO")
                    .font(.credoDisplay(size: 28))
                    .foregroundStyle(.white.opacity(0.6))
                    .tracking(8)

                Spacer().frame(height: isStory ? 40 : 16)

                // Score ring
                scoreRing

                // Tier label
                tierLabel

                // Divider
                Rectangle()
                    .fill(.white.opacity(0.1))
                    .frame(width: 200, height: 1)

                // Pillar breakdown
                pillarBreakdown

                Spacer()

                // Tagline
                Text("TRAIN SMARTER. SCORE HIGHER.")
                    .font(.credoMono(size: 13, weight: .medium))
                    .foregroundStyle(.white.opacity(0.3))
                    .tracking(4)

                if isStory { Spacer().frame(height: 100) }
            }
            .padding(isStory ? 48 : 40)
        }
        .frame(width: aspectRatio.size.width, height: aspectRatio.size.height)
    }

    // MARK: - Score Ring

    private var scoreRing: some View {
        ZStack {
            // Background ring
            Circle()
                .stroke(.white.opacity(0.1), lineWidth: isStory ? 16 : 12)
                .frame(width: ringSize, height: ringSize)

            // Progress ring
            Circle()
                .trim(from: 0, to: CGFloat(score) / 100.0)
                .stroke(
                    AngularGradient(
                        colors: [accentColor.opacity(0.6), accentColor, CredoColors.teal],
                        center: .center,
                        startAngle: .degrees(0),
                        endAngle: .degrees(360)
                    ),
                    style: StrokeStyle(lineWidth: isStory ? 16 : 12, lineCap: .round)
                )
                .frame(width: ringSize, height: ringSize)
                .rotationEffect(.degrees(-90))

            // Score number
            VStack(spacing: 4) {
                Text("\(score)")
                    .font(.credoMono(size: isStory ? 96 : 72, weight: .bold))
                    .foregroundStyle(.white)
                Text("CREDO SCORE")
                    .font(.credoMono(size: 12, weight: .medium))
                    .foregroundStyle(.white.opacity(0.5))
                    .tracking(3)
            }
        }
    }

    private var ringSize: CGFloat {
        isStory ? 320 : 260
    }

    // MARK: - Tier Label

    private var tierLabel: some View {
        Text(tierName.uppercased())
            .font(.credoDisplay(size: isStory ? 36 : 28))
            .foregroundStyle(tierColor)
            .tracking(6)
    }

    private var tierName: String {
        switch score {
        case 90...100: return "Elite"
        case 70..<90: return "Advanced"
        case 40..<70: return "Intermediate"
        default: return "Beginner"
        }
    }

    private var tierColor: Color {
        switch score {
        case 90...100: return accentColor
        case 70..<90: return CredoColors.teal
        case 40..<70: return Color(hex: "F5A623")
        default: return .white.opacity(0.6)
        }
    }

    // MARK: - Pillar Breakdown

    private var pillarBreakdown: some View {
        VStack(spacing: isStory ? 24 : 16) {
            ForEach(Array(pillarScores.enumerated()), id: \.offset) { _, pillar in
                pillarRow(name: pillar.name, score: pillar.score, color: pillarColor(for: pillar.name))
            }
        }
        .padding(.horizontal, isStory ? 60 : 40)
    }

    private func pillarRow(name: String, score: Int, color: Color) -> some View {
        HStack(spacing: 16) {
            Text(name.uppercased())
                .font(.credoMono(size: 13, weight: .medium))
                .foregroundStyle(.white.opacity(0.6))
                .tracking(2)
                .frame(width: 120, alignment: .leading)

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    // Track
                    RoundedRectangle(cornerRadius: 4)
                        .fill(.white.opacity(0.1))
                        .frame(height: 8)

                    // Fill
                    RoundedRectangle(cornerRadius: 4)
                        .fill(
                            LinearGradient(
                                colors: [color.opacity(0.7), color],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: geo.size.width * CGFloat(score) / 100.0, height: 8)
                }
                .frame(height: 8)
                .frame(maxHeight: .infinity, alignment: .center)
            }
            .frame(height: 20)

            Text("\(score)")
                .font(.credoMono(size: 16, weight: .bold))
                .foregroundStyle(.white.opacity(0.8))
                .frame(width: 40, alignment: .trailing)
        }
    }

    private func pillarColor(for name: String) -> Color {
        switch name.lowercased() {
        case "strength": return accentColor
        case "cardio": return CredoColors.cardio
        case "stability": return CredoColors.teal
        case "nutrition": return CredoColors.nutrition
        default: return .white
        }
    }
}

#Preview("Square") {
    CredoScoreBadgeCard(
        score: 74,
        pillarScores: [
            ("Strength", 82),
            ("Cardio", 76),
            ("Stability", 41),
            ("Nutrition", 85)
        ],
        aspectRatio: .square
    )
    .scaleEffect(0.3)
}
