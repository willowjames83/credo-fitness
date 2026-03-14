import SwiftUI

struct BenchmarkCard: View {
    let benchmark: Benchmark
    let formattedValue: String
    var isTested: Bool = true
    var percentile: Int? = nil
    var demographicLabel: String = ""
    var exerciseId: String? = nil

    @State private var showVideoSheet = false

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Top row: name + value
            HStack(alignment: .firstTextBaseline) {
                HStack(spacing: 6) {
                    PillarBadge(pillar: benchmark.pillar)

                    Text(benchmark.name)
                        .font(.credoBody(size: 14, weight: .semibold))
                        .foregroundStyle(isTested ? CredoColors.textPrimary : CredoColors.textTertiary)

                    if let eid = exerciseId,
                       let def = ExerciseLibrary.find(eid),
                       def.shortVideoURL != nil || def.detailedVideoURL != nil {
                        Button {
                            showVideoSheet = true
                        } label: {
                            Image(systemName: "play.circle")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundStyle(CredoColors.accent)
                        }
                        .buttonStyle(.plain)
                    }
                }

                Spacer()

                if isTested {
                    HStack(alignment: .firstTextBaseline, spacing: 2) {
                        Text(formattedValue)
                            .font(.credoMono(size: 18, weight: .bold))
                            .foregroundStyle(CredoColors.textPrimary)

                        Text(benchmark.unit)
                            .font(.credoBody(size: 13, weight: .regular))
                            .foregroundStyle(CredoColors.textSecondary)
                    }
                } else {
                    Text("\u{2014}")
                        .font(.credoMono(size: 18, weight: .bold))
                        .foregroundStyle(CredoColors.textTertiary)
                }
            }

            if isTested {
                // Middle row: last tested + delta
                HStack {
                    Text("Last tested: \(benchmark.lastTested)")
                        .font(.credoBody(size: 11, weight: .regular))
                        .foregroundStyle(CredoColors.textTertiary)

                    Spacer()

                    if !benchmark.delta.isEmpty {
                        Text(benchmark.delta)
                            .font(.credoBody(size: 12, weight: .medium))
                            .foregroundStyle(CredoColors.success)
                    }
                }

                // Existing percentile bar (original compact bar)
                HStack(spacing: 8) {
                    PercentileBar(percentile: benchmark.percentile, pillar: benchmark.pillar)

                    Text(ordinalString(benchmark.percentile))
                        .font(.credoMono(size: 12, weight: .medium))
                        .foregroundStyle(benchmark.pillar.color)
                }

                // Gradient percentile bar with demographic context
                if let pct = percentile, pct > 0, !demographicLabel.isEmpty {
                    PercentileBarView(
                        percentile: pct,
                        demographicLabel: demographicLabel
                    )
                    .padding(.top, 2)
                }
            } else {
                Text("Not tested")
                    .font(.credoBody(size: 12, weight: .regular))
                    .foregroundStyle(CredoColors.textTertiary)
            }
        }
        .padding(14)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
        .opacity(isTested ? 1.0 : 0.6)
        .sheet(isPresented: $showVideoSheet) {
            if let eid = exerciseId, let def = ExerciseLibrary.find(eid) {
                ExerciseVideoSheet(
                    exerciseName: def.name,
                    shortVideoURL: def.shortVideoURL,
                    detailedVideoURL: def.detailedVideoURL
                )
            }
        }
    }

    private func ordinalString(_ value: Int) -> String {
        let suffix: String
        let ones = value % 10
        let tens = value % 100
        if tens >= 11 && tens <= 13 {
            suffix = "th"
        } else {
            switch ones {
            case 1: suffix = "st"
            case 2: suffix = "nd"
            case 3: suffix = "rd"
            default: suffix = "th"
            }
        }
        return "\(value)\(suffix)"
    }
}
