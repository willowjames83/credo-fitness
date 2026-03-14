import SwiftUI
import Charts

struct NutritionWeeklyView: View {
    let data: [(date: Date, cal: Int, p: Double, c: Double, f: Double)]
    let calorieTarget: Int

    @Environment(\.dismiss) private var dismiss

    private var dayFormatter: DateFormatter {
        let f = DateFormatter()
        f.dateFormat = "EEE"
        return f
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Weekly calories chart
                    caloriesChart

                    // Weekly macros chart
                    macrosChart

                    // Weekly summary
                    weeklySummaryCard
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
            }
            .background(CredoColors.bg)
            .navigationTitle("Weekly Overview")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                        .foregroundStyle(CredoColors.accent)
                }
            }
        }
    }

    // MARK: - Calories Chart

    @ViewBuilder
    private var caloriesChart: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("DAILY CALORIES")
                .font(.credoBody(size: 11, weight: .semibold))
                .tracking(1.5)
                .foregroundStyle(CredoColors.textTertiary)

            Chart {
                ForEach(Array(data.enumerated()), id: \.offset) { _, day in
                    BarMark(
                        x: .value("Day", dayFormatter.string(from: day.date)),
                        y: .value("Calories", day.cal)
                    )
                    .foregroundStyle(
                        day.cal > 0
                            ? (abs(day.cal - calorieTarget) <= Int(Double(calorieTarget) * 0.1)
                                ? CredoColors.teal
                                : CredoColors.accent)
                            : CredoColors.border
                    )
                    .cornerRadius(4)
                }

                if calorieTarget > 0 {
                    RuleMark(y: .value("Target", calorieTarget))
                        .foregroundStyle(CredoColors.textTertiary)
                        .lineStyle(StrokeStyle(lineWidth: 1, dash: [5, 3]))
                        .annotation(position: .top, alignment: .trailing) {
                            Text("Target: \(calorieTarget)")
                                .font(.credoMono(size: 10))
                                .foregroundStyle(CredoColors.textTertiary)
                        }
                }
            }
            .frame(height: 200)
            .chartYAxis {
                AxisMarks(position: .leading) { value in
                    AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5))
                        .foregroundStyle(CredoColors.border)
                    AxisValueLabel {
                        if let intVal = value.as(Int.self) {
                            Text("\(intVal)")
                                .font(.credoMono(size: 10))
                                .foregroundStyle(CredoColors.textTertiary)
                        }
                    }
                }
            }
            .chartXAxis {
                AxisMarks { value in
                    AxisValueLabel {
                        if let str = value.as(String.self) {
                            Text(str)
                                .font(.credoMono(size: 10))
                                .foregroundStyle(CredoColors.textSecondary)
                        }
                    }
                }
            }
        }
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(CredoColors.border, lineWidth: 1))
    }

    // MARK: - Macros Chart

    @ViewBuilder
    private var macrosChart: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("DAILY MACROS")
                .font(.credoBody(size: 11, weight: .semibold))
                .tracking(1.5)
                .foregroundStyle(CredoColors.textTertiary)

            Chart {
                ForEach(Array(data.enumerated()), id: \.offset) { _, day in
                    let dayLabel = dayFormatter.string(from: day.date)

                    BarMark(
                        x: .value("Day", dayLabel),
                        y: .value("Grams", day.p)
                    )
                    .foregroundStyle(CredoColors.accent)
                    .position(by: .value("Macro", "Protein"))

                    BarMark(
                        x: .value("Day", dayLabel),
                        y: .value("Grams", day.c)
                    )
                    .foregroundStyle(CredoColors.teal)
                    .position(by: .value("Macro", "Carbs"))

                    BarMark(
                        x: .value("Day", dayLabel),
                        y: .value("Grams", day.f)
                    )
                    .foregroundStyle(Color.yellow)
                    .position(by: .value("Macro", "Fat"))
                }
            }
            .frame(height: 200)
            .chartForegroundStyleScale([
                "Protein": CredoColors.accent,
                "Carbs": CredoColors.teal,
                "Fat": Color.yellow,
            ])
            .chartLegend(position: .bottom, spacing: 12) {
                HStack(spacing: 16) {
                    legendDot(color: CredoColors.accent, label: "Protein")
                    legendDot(color: CredoColors.teal, label: "Carbs")
                    legendDot(color: .yellow, label: "Fat")
                }
                .font(.credoBody(size: 11))
            }
            .chartYAxis {
                AxisMarks(position: .leading) { value in
                    AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5))
                        .foregroundStyle(CredoColors.border)
                    AxisValueLabel {
                        if let intVal = value.as(Int.self) {
                            Text("\(intVal)g")
                                .font(.credoMono(size: 10))
                                .foregroundStyle(CredoColors.textTertiary)
                        }
                    }
                }
            }
            .chartXAxis {
                AxisMarks { value in
                    AxisValueLabel {
                        if let str = value.as(String.self) {
                            Text(str)
                                .font(.credoMono(size: 10))
                                .foregroundStyle(CredoColors.textSecondary)
                        }
                    }
                }
            }
        }
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(CredoColors.border, lineWidth: 1))
    }

    // MARK: - Weekly Summary Card

    @ViewBuilder
    private var weeklySummaryCard: some View {
        let daysWithData = data.filter { $0.cal > 0 }
        let avgCal = daysWithData.isEmpty ? 0 : daysWithData.reduce(0) { $0 + $1.cal } / daysWithData.count
        let avgP = daysWithData.isEmpty ? 0.0 : daysWithData.reduce(0.0) { $0 + $1.p } / Double(daysWithData.count)
        let avgC = daysWithData.isEmpty ? 0.0 : daysWithData.reduce(0.0) { $0 + $1.c } / Double(daysWithData.count)
        let avgF = daysWithData.isEmpty ? 0.0 : daysWithData.reduce(0.0) { $0 + $1.f } / Double(daysWithData.count)

        VStack(alignment: .leading, spacing: 12) {
            Text("WEEKLY AVERAGES")
                .font(.credoBody(size: 11, weight: .semibold))
                .tracking(1.5)
                .foregroundStyle(CredoColors.textTertiary)

            HStack(spacing: 0) {
                summaryItem(label: "Calories", value: "\(avgCal)")
                Divider().frame(height: 36)
                summaryItem(label: "Protein", value: "\(Int(avgP))g")
                Divider().frame(height: 36)
                summaryItem(label: "Carbs", value: "\(Int(avgC))g")
                Divider().frame(height: 36)
                summaryItem(label: "Fat", value: "\(Int(avgF))g")
            }

            HStack {
                Text("Days logged: \(daysWithData.count)/7")
                    .font(.credoBody(size: 13))
                    .foregroundStyle(CredoColors.textSecondary)
                Spacer()
            }
        }
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(CredoColors.border, lineWidth: 1))
    }

    @ViewBuilder
    private func summaryItem(label: String, value: String) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.credoMono(size: 16, weight: .semibold))
                .foregroundStyle(CredoColors.textPrimary)
            Text(label)
                .font(.credoBody(size: 11))
                .foregroundStyle(CredoColors.textTertiary)
        }
        .frame(maxWidth: .infinity)
    }

    @ViewBuilder
    private func legendDot(color: Color, label: String) -> some View {
        HStack(spacing: 4) {
            Circle().fill(color).frame(width: 6, height: 6)
            Text(label)
                .foregroundStyle(CredoColors.textSecondary)
        }
    }
}

#Preview {
    let calendar = Calendar.current
    let sampleData: [(date: Date, cal: Int, p: Double, c: Double, f: Double)] = (0..<7).map { offset in
        let date = calendar.date(byAdding: .day, value: -6 + offset, to: Date())!
        return (date, Int.random(in: 1800...2600), Double.random(in: 100...180), Double.random(in: 150...280), Double.random(in: 50...90))
    }

    NutritionWeeklyView(data: sampleData, calorieTarget: 2400)
}
