import SwiftUI
import Charts

struct ExerciseProgressChart: View {
    let data: [ExerciseProgressPoint]
    var showTrendLine: Bool = true

    var body: some View {
        if data.count < 2 {
            noDataView
        } else {
            chartView
                .frame(height: 220)
        }
    }

    // MARK: - Chart

    private var chartView: some View {
        Chart {
            // Area fill
            ForEach(data) { point in
                AreaMark(
                    x: .value("Date", point.date),
                    y: .value("Est 1RM", point.estimated1RM)
                )
                .foregroundStyle(
                    LinearGradient(
                        colors: [CredoColors.accent.opacity(0.15), CredoColors.accent.opacity(0.02)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .interpolationMethod(.catmullRom)
            }

            // Line
            ForEach(data) { point in
                LineMark(
                    x: .value("Date", point.date),
                    y: .value("Est 1RM", point.estimated1RM)
                )
                .foregroundStyle(CredoColors.accent)
                .lineStyle(StrokeStyle(lineWidth: 2.5, lineCap: .round, lineJoin: .round))
                .interpolationMethod(.catmullRom)
            }

            // Dot markers
            ForEach(data) { point in
                PointMark(
                    x: .value("Date", point.date),
                    y: .value("Est 1RM", point.estimated1RM)
                )
                .foregroundStyle(CredoColors.accent)
                .symbolSize(36)
            }

            // Trend line
            if showTrendLine, let trend = trendLine {
                LineMark(
                    x: .value("Date", trend.startDate),
                    y: .value("Trend", trend.startValue),
                    series: .value("Series", "trend")
                )
                .foregroundStyle(CredoColors.teal.opacity(0.5))
                .lineStyle(StrokeStyle(lineWidth: 1.5, dash: [6, 4]))

                LineMark(
                    x: .value("Date", trend.endDate),
                    y: .value("Trend", trend.endValue),
                    series: .value("Series", "trend")
                )
                .foregroundStyle(CredoColors.teal.opacity(0.5))
                .lineStyle(StrokeStyle(lineWidth: 1.5, dash: [6, 4]))
            }
        }
        .chartXAxis {
            AxisMarks(values: .stride(by: .weekOfYear)) { _ in
                AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5))
                    .foregroundStyle(CredoColors.border)
                AxisValueLabel(format: .dateTime.month(.abbreviated).day())
                    .foregroundStyle(CredoColors.textSecondary)
                    .font(.credoMono(size: 10))
            }
        }
        .chartYAxis {
            AxisMarks { _ in
                AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5))
                    .foregroundStyle(CredoColors.border)
                AxisValueLabel()
                    .foregroundStyle(CredoColors.textSecondary)
                    .font(.credoMono(size: 10))
            }
        }
        .chartYAxisLabel("lbs", position: .topLeading)
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }

    // MARK: - Trend Line Calculation (simple linear regression)

    private struct TrendLineData {
        let startDate: Date
        let endDate: Date
        let startValue: Double
        let endValue: Double
    }

    private var trendLine: TrendLineData? {
        guard data.count >= 3 else { return nil }
        let sorted = data.sorted { $0.date < $1.date }
        let n = Double(sorted.count)
        let xValues = sorted.map { $0.date.timeIntervalSince1970 }
        let yValues = sorted.map { $0.estimated1RM }

        let sumX = xValues.reduce(0, +)
        let sumY = yValues.reduce(0, +)
        let sumXY = zip(xValues, yValues).map(*).reduce(0, +)
        let sumX2 = xValues.map { $0 * $0 }.reduce(0, +)

        let denominator = n * sumX2 - sumX * sumX
        guard denominator != 0 else { return nil }

        let slope = (n * sumXY - sumX * sumY) / denominator
        let intercept = (sumY - slope * sumX) / n

        let startX = xValues.first!
        let endX = xValues.last!

        return TrendLineData(
            startDate: sorted.first!.date,
            endDate: sorted.last!.date,
            startValue: slope * startX + intercept,
            endValue: slope * endX + intercept
        )
    }

    // MARK: - Empty State

    private var noDataView: some View {
        VStack(spacing: 8) {
            Image(systemName: "chart.xyaxis.line")
                .font(.system(size: 28))
                .foregroundStyle(CredoColors.textTertiary)
            Text("Not enough data")
                .credoBody(size: 14)
                .foregroundStyle(CredoColors.textSecondary)
        }
        .frame(height: 160)
        .frame(maxWidth: .infinity)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }
}

#Preview {
    ExerciseProgressChart(data: MockProgression.benchPressProgress)
        .padding()
}
