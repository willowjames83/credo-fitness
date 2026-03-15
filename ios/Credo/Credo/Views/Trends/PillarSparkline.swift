import SwiftUI
import Charts

struct PillarSparkline: View {
    let pillar: Pillar
    let dataPoints: [ChartDataPoint]
    let currentScore: Int
    let delta: Int

    @State private var animationProgress: CGFloat = 0

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Header: icon + name + score
            HStack(spacing: 6) {
                Image(systemName: pillar.iconName)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(pillar.color)

                Text(pillar.label)
                    .font(.credoBody(size: 13, weight: .medium))
                    .foregroundStyle(CredoColors.textPrimary)

                Spacer()

                Text("\(currentScore)")
                    .font(.credoMono(size: 16, weight: .bold))
                    .foregroundStyle(CredoColors.textPrimary)
            }

            // Sparkline chart
            Chart {
                ForEach(dataPoints) { point in
                    LineMark(
                        x: .value("Week", point.week),
                        y: .value("Score", Double(point.score) * animationProgress)
                    )
                    .foregroundStyle(pillar.color)
                    .interpolationMethod(.catmullRom)
                    .lineStyle(StrokeStyle(lineWidth: 2))
                }
            }
            .chartYScale(domain: 0...100)
            .chartXAxis(.hidden)
            .chartYAxis(.hidden)
            .frame(height: 36)

            // Delta indicator
            HStack(spacing: 4) {
                if delta != 0 {
                    Image(systemName: delta > 0 ? "arrow.up.right" : "arrow.down.right")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(delta > 0 ? CredoColors.success : CredoColors.danger)

                    Text("\(delta > 0 ? "+" : "")\(delta)")
                        .font(.credoMono(size: 11, weight: .semibold))
                        .foregroundStyle(delta > 0 ? CredoColors.success : CredoColors.danger)

                    Text("pts")
                        .font(.credoBody(size: 11))
                        .foregroundStyle(CredoColors.textTertiary)
                } else {
                    Image(systemName: "minus")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(CredoColors.textTertiary)

                    Text("No change")
                        .font(.credoBody(size: 11))
                        .foregroundStyle(CredoColors.textTertiary)
                }

                Spacer()
            }
        }
        .padding(12)
        .background(CredoColors.surface)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .onAppear {
            withAnimation(.easeOut(duration: 0.6).delay(0.1)) {
                animationProgress = 1.0
            }
        }
    }
}
