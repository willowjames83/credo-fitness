import SwiftUI
import Charts

struct WeeklyComparisonEntry: Identifiable {
    let id = UUID()
    let pillar: String
    let period: String
    let score: Int
    let color: Color
}

struct WeeklyComparisonChart: View {
    let thisWeek: [Pillar: Int]
    let lastWeek: [Pillar: Int]

    @State private var animationProgress: CGFloat = 0

    private var entries: [WeeklyComparisonEntry] {
        var result: [WeeklyComparisonEntry] = []
        for pillar in Pillar.allCases {
            result.append(WeeklyComparisonEntry(
                pillar: pillar.label,
                period: "Last Week",
                score: lastWeek[pillar] ?? 0,
                color: pillar.color.opacity(0.4)
            ))
            result.append(WeeklyComparisonEntry(
                pillar: pillar.label,
                period: "This Week",
                score: thisWeek[pillar] ?? 0,
                color: pillar.color
            ))
        }
        return result
    }

    var body: some View {
        Chart(entries) { entry in
            BarMark(
                x: .value("Pillar", entry.pillar),
                y: .value("Score", Double(entry.score) * animationProgress)
            )
            .foregroundStyle(entry.color)
            .position(by: .value("Period", entry.period))
            .cornerRadius(4)
        }
        .chartYScale(domain: 0...100)
        .chartYAxis {
            AxisMarks(position: .leading, values: [0, 25, 50, 75, 100]) { value in
                AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5))
                    .foregroundStyle(CredoColors.border)
                AxisValueLabel {
                    if let intValue = value.as(Int.self) {
                        Text("\(intValue)")
                            .font(.credoMono(size: 10))
                            .foregroundStyle(CredoColors.textTertiary)
                    }
                }
            }
        }
        .chartXAxis {
            AxisMarks { value in
                AxisValueLabel {
                    if let label = value.as(String.self) {
                        Text(label)
                            .font(.credoMono(size: 10))
                            .foregroundStyle(CredoColors.textSecondary)
                    }
                }
            }
        }
        .chartLegend(position: .bottom, alignment: .center, spacing: 12) {
            HStack(spacing: 16) {
                HStack(spacing: 4) {
                    Circle()
                        .fill(CredoColors.textTertiary.opacity(0.4))
                        .frame(width: 8, height: 8)
                    Text("Last Week")
                        .font(.credoBody(size: 11))
                        .foregroundStyle(CredoColors.textSecondary)
                }
                HStack(spacing: 4) {
                    Circle()
                        .fill(CredoColors.textPrimary)
                        .frame(width: 8, height: 8)
                    Text("This Week")
                        .font(.credoBody(size: 11))
                        .foregroundStyle(CredoColors.textSecondary)
                }
            }
        }
        .frame(height: 200)
        .onAppear {
            withAnimation(.easeOut(duration: 0.7)) {
                animationProgress = 1.0
            }
        }
    }
}
