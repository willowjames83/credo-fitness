import SwiftUI

struct CredoScoreRing: View {
    let score: Int
    var size: CGFloat = 160
    var strokeWidth: CGFloat = 10
    var color: Color = CredoColors.accent
    var domain: ScoreDomain = .credo
    var showLabel: Bool = true
    var animate: Bool = true

    @State private var animatedProgress: CGFloat = 0
    @State private var displayedScore: Int = 0

    private var targetProgress: CGFloat {
        CGFloat(score) / 100.0
    }

    var body: some View {
        ZStack {
            // Glow effect behind the ring
            Circle()
                .fill(color.opacity(0.12))
                .frame(width: size + strokeWidth * 2, height: size + strokeWidth * 2)
                .blur(radius: 16)
                .scaleEffect(animatedProgress > 0 ? 1.0 : 0.5)
                .opacity(animatedProgress > 0 ? 1.0 : 0.0)

            // Track
            Circle()
                .stroke(CredoColors.surfaceElevated, lineWidth: strokeWidth)
                .frame(width: size, height: size)

            // Progress arc
            Circle()
                .trim(from: 0, to: animatedProgress)
                .stroke(color, style: StrokeStyle(lineWidth: strokeWidth, lineCap: .round))
                .frame(width: size, height: size)
                .rotationEffect(.degrees(-90))

            // Center content
            VStack(spacing: 2) {
                Text("\(displayedScore)")
                    .font(.credoMono(size: size * 0.275, weight: .bold))
                    .foregroundStyle(CredoColors.textPrimary)

                if showLabel {
                    Text(ScoringEngine.getTierLabel(score: score, domain: domain))
                        .font(.credoBody(size: 13, weight: .medium))
                        .foregroundStyle(CredoColors.textSecondary)
                }
            }
        }
        .onAppear {
            if animate {
                withAnimation(.easeOut(duration: 1.2)) {
                    animatedProgress = targetProgress
                }
                animateCounter()
            } else {
                animatedProgress = targetProgress
                displayedScore = score
            }
        }
    }

    private func animateCounter() {
        let duration: Double = 1.2
        let steps = min(score, 60)
        guard steps > 0 else {
            displayedScore = score
            return
        }
        let interval = duration / Double(steps)

        for step in 1...steps {
            DispatchQueue.main.asyncAfter(deadline: .now() + interval * Double(step)) {
                displayedScore = Int(Double(score) * Double(step) / Double(steps))
            }
        }
    }
}

#Preview {
    VStack(spacing: 32) {
        CredoScoreRing(score: 72)
        CredoScoreRing(score: 58, size: 100, strokeWidth: 8, color: CredoColors.teal, domain: .stability)
    }
    .padding()
}
