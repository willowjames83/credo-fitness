import SwiftUI
import Charts

struct TrendsView: View {
    @State private var viewModel = TrendsViewModel()
    @State private var animateContent = false

    var body: some View {
        ScrollView {
            if viewModel.hasData {
                content
            } else {
                emptyState
            }
        }
        .background(CredoColors.bg)
        .navigationTitle("Trends")
        .navigationBarTitleDisplayMode(.large)
    }

    // MARK: - Content

    @ViewBuilder
    private var content: some View {
        VStack(spacing: 24) {
            // Time range picker
            Picker("Time Range", selection: $viewModel.selectedRange) {
                ForEach(TimeRange.allCases, id: \.self) { range in
                    Text(range.rawValue).tag(range)
                }
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, 16)
            .padding(.top, 8)

            // Composite Score Chart
            compositeSection

            // Pillar Breakdown
            pillarBreakdownSection

            // Weekly Comparison
            weeklyComparisonSection

            Spacer(minLength: 32)
        }
        .animation(.easeInOut(duration: 0.3), value: viewModel.selectedRange)
    }

    // MARK: - Composite Score

    private var compositeSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .firstTextBaseline) {
                Text("Credo Score")
                    .font(.credoDisplay(size: 20))
                    .foregroundStyle(CredoColors.textPrimary)

                Spacer()

                HStack(spacing: 4) {
                    Text("\(viewModel.currentCompositeScore)")
                        .font(.credoMono(size: 24, weight: .bold))
                        .foregroundStyle(CredoColors.accent)

                    if viewModel.compositeDelta != 0 {
                        deltaLabel(viewModel.compositeDelta)
                    }
                }
            }

            ScoreTrendChart(
                dataPoints: viewModel.compositeData,
                color: CredoColors.accent,
                showArea: true,
                height: 220
            )
        }
        .padding(16)
        .background(CredoColors.surface)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(CredoColors.border, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .padding(.horizontal, 16)
    }

    // MARK: - Pillar Breakdown

    private var pillarBreakdownSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Pillar Trends")
                .font(.credoDisplay(size: 20))
                .foregroundStyle(CredoColors.textPrimary)
                .padding(.horizontal, 16)

            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 12),
                GridItem(.flexible(), spacing: 12)
            ], spacing: 12) {
                ForEach(Pillar.allCases, id: \.self) { pillar in
                    let d = viewModel.delta(for: pillar)
                    PillarSparkline(
                        pillar: pillar,
                        dataPoints: viewModel.pillarData(for: pillar),
                        currentScore: d.current,
                        delta: d.change
                    )
                }
            }
            .padding(.horizontal, 16)
        }
    }

    // MARK: - Weekly Comparison

    private var weeklyComparisonSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Weekly Comparison")
                .font(.credoDisplay(size: 20))
                .foregroundStyle(CredoColors.textPrimary)

            WeeklyComparisonChart(
                thisWeek: viewModel.thisWeekScores,
                lastWeek: viewModel.lastWeekScores
            )
        }
        .padding(16)
        .background(CredoColors.surface)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(CredoColors.border, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .padding(.horizontal, 16)
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 20) {
            Spacer(minLength: 80)

            Image(systemName: "chart.line.uptrend.xyaxis")
                .font(.system(size: 48, weight: .light))
                .foregroundStyle(CredoColors.textTertiary)

            VStack(spacing: 8) {
                Text("No Trend Data Yet")
                    .font(.credoDisplay(size: 22))
                    .foregroundStyle(CredoColors.textPrimary)

                Text("Track your progress over time \u{2014} your first trend data appears after one week.")
                    .font(.credoBody(size: 15))
                    .foregroundStyle(CredoColors.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
            }

            Spacer()
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Helpers

    private func deltaLabel(_ delta: Int) -> some View {
        HStack(spacing: 2) {
            Image(systemName: delta > 0 ? "arrow.up.right" : "arrow.down.right")
                .font(.system(size: 10, weight: .bold))
            Text("\(delta > 0 ? "+" : "")\(delta)")
                .font(.credoMono(size: 12, weight: .semibold))
        }
        .foregroundStyle(delta > 0 ? CredoColors.success : CredoColors.danger)
    }
}

#Preview {
    NavigationStack {
        TrendsView()
    }
}
