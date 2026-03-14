import SwiftUI

struct ExerciseProgressDetailView: View {
    let exerciseId: String
    @Bindable var viewModel: ProgressionViewModel

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                chartSection
                statsSection
                suggestionSection
                historySection
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)
            .padding(.bottom, 32)
        }
        .background(CredoColors.bg)
        .navigationTitle(exerciseName)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            viewModel.selectExercise(exerciseId)
        }
    }

    private var exerciseName: String {
        ExerciseLibrary.find(exerciseId)?.name ?? "Exercise"
    }

    // MARK: - Chart

    private var chartSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Estimated 1RM Over Time")
                .credoBody(size: 14, weight: .semibold)
                .foregroundStyle(CredoColors.textSecondary)
            ExerciseProgressChart(data: viewModel.chartData)
        }
    }

    // MARK: - Stats

    private var statsSection: some View {
        HStack(spacing: 12) {
            StatBox(
                label: "Est 1RM",
                value: viewModel.current1RM.map { formatWeight($0) } ?? "--",
                unit: "lbs"
            )
            if let best = viewModel.bestSet {
                StatBox(
                    label: "Best Set",
                    value: "\(formatWeight(best.weight))x\(best.reps)",
                    unit: ""
                )
            }
            StatBox(
                label: "Sessions",
                value: "\(viewModel.sessionsTracked)",
                unit: "tracked"
            )
        }
    }

    // MARK: - Suggestion Card

    @ViewBuilder
    private var suggestionSection: some View {
        if let suggestion = viewModel.currentSuggestion {
            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 8) {
                    Image(systemName: "lightbulb.fill")
                        .foregroundStyle(CredoColors.accent)
                    Text("Next Session Suggestion")
                        .credoBody(size: 15, weight: .semibold)
                        .foregroundStyle(CredoColors.textPrimary)
                }
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Increase to \(formatWeight(suggestion.suggestedWeight)) lbs")
                            .credoBody(size: 16, weight: .bold)
                            .foregroundStyle(CredoColors.success)
                        Text(suggestion.reason)
                            .credoBody(size: 13)
                            .foregroundStyle(CredoColors.textSecondary)
                    }
                    Spacer()
                    confidenceBadge(suggestion.confidence)
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
    }

    private func confidenceBadge(_ confidence: Double) -> some View {
        let pct = Int(confidence * 100)
        let color: Color = confidence >= 0.8
            ? CredoColors.success
            : confidence >= 0.6 ? CredoColors.warning : CredoColors.textTertiary
        return Text("\(pct)%")
            .credoMono(size: 13, weight: .semibold)
            .foregroundStyle(color)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(color.opacity(0.12))
            .clipShape(Capsule())
    }

    // MARK: - Session History

    private var historySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Session History")
                .credoBody(size: 14, weight: .semibold)
                .foregroundStyle(CredoColors.textSecondary)

            if viewModel.sessionHistory.isEmpty {
                Text("No sessions recorded yet.")
                    .credoBody(size: 14)
                    .foregroundStyle(CredoColors.textTertiary)
                    .padding(.vertical, 16)
            } else {
                ForEach(viewModel.sessionHistory, id: \.date) { session in
                    sessionRow(session)
                }
            }
        }
    }

    private func sessionRow(
        _ session: (date: Date, weight: Double, reps: Int, rir: Int, estimated1RM: Double)
    ) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 3) {
                Text(session.date, style: .date)
                    .credoBody(size: 14, weight: .medium)
                    .foregroundStyle(CredoColors.textPrimary)
                Text("\(formatWeight(session.weight)) lbs x \(session.reps) reps  ·  RIR \(session.rir)")
                    .credoMono(size: 12)
                    .foregroundStyle(CredoColors.textSecondary)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text(formatWeight(session.estimated1RM))
                    .credoMono(size: 15, weight: .bold)
                    .foregroundStyle(CredoColors.textPrimary)
                Text("e1RM")
                    .credoMono(size: 10)
                    .foregroundStyle(CredoColors.textTertiary)
            }
        }
        .padding(12)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }

    private func formatWeight(_ weight: Double) -> String {
        weight.formattedWeight
    }
}

// MARK: - Stat Box

private struct StatBox: View {
    let label: String
    let value: String
    let unit: String

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .credoMono(size: 18, weight: .bold)
                .foregroundStyle(CredoColors.textPrimary)
            if !unit.isEmpty {
                Text(unit)
                    .credoMono(size: 10)
                    .foregroundStyle(CredoColors.textTertiary)
            }
            Text(label)
                .credoBody(size: 12)
                .foregroundStyle(CredoColors.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }
}

#Preview {
    NavigationStack {
        ExerciseProgressDetailView(
            exerciseId: "bench_press",
            viewModel: ProgressionViewModel()
        )
    }
}
