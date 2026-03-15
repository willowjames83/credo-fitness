import SwiftUI
import Charts

struct ScoreTrendChart: View {
    let dataPoints: [ChartDataPoint]
    var color: Color = CredoColors.accent
    var showArea: Bool = true
    var height: CGFloat = 220

    @State private var animationProgress: CGFloat = 0

    var body: some View {
        Chart {
            ForEach(dataPoints) { point in
                LineMark(
                    x: .value("Week", point.label),
                    y: .value("Score", Double(point.score) * animationProgress)
                )
                .foregroundStyle(color)
                .interpolationMethod(.catmullRom)
                .lineStyle(StrokeStyle(lineWidth: 2.5))

                if showArea {
                    AreaMark(
                        x: .value("Week", point.label),
                        y: .value("Score", Double(point.score) * animationProgress)
                    )
                    .foregroundStyle(
                        LinearGradient(
                            colors: [color.opacity(0.25), color.opacity(0.0)],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .interpolationMethod(.catmullRom)
                }
            }

            // Annotation at last data point
            if let last = dataPoints.last {
                PointMark(
                    x: .value("Week", last.label),
                    y: .value("Score", Double(last.score) * animationProgress)
                )
                .foregroundStyle(color)
                .symbolSize(50)
                .annotation(position: .top, spacing: 6) {
                    Text("\(last.score)")
                        .font(.credoMono(size: 13, weight: .semibold))
                        .foregroundStyle(color)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(
                            Capsule()
                                .fill(color.opacity(0.12))
                        )
                }
            }
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
                            .foregroundStyle(CredoColors.textTertiary)
                    }
                }
            }
        }
        .frame(height: height)
        .onAppear {
            withAnimation(.easeOut(duration: 0.8)) {
                animationProgress = 1.0
            }
        }
        .onChange(of: dataPoints.count) {
            animationProgress = 0
            withAnimation(.easeOut(duration: 0.8)) {
                animationProgress = 1.0
            }
        }
    }
}
