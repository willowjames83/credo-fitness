import SwiftUI

struct StrengthBreakdownView: View {
    @State private var vm = StrengthBreakdownViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                ForEach(vm.subscoreDetails) { detail in
                    SubscoreSectionCard(detail: detail, demographicLabel: vm.demographicLabel)
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, 24)
        }
        .background(CredoColors.bg)
        .navigationTitle("Strength Breakdown")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Subscore Section Card

private struct SubscoreSectionCard: View {
    let detail: SubscoreDetail
    let demographicLabel: String

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header: category name, weight, score
            HStack(alignment: .firstTextBaseline) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(detail.category)
                        .font(.credoBody(size: 15, weight: .semibold))
                        .foregroundStyle(CredoColors.textPrimary)

                    Text("\(detail.weightPercent)% of total")
                        .font(.credoBody(size: 12, weight: .regular))
                        .foregroundStyle(CredoColors.textTertiary)
                }

                Spacer()

                Text("\(detail.score)")
                    .font(.credoMono(size: 22, weight: .bold))
                    .foregroundStyle(detail.score > 0 ? CredoColors.textPrimary : CredoColors.textTertiary)
            }

            // Percentile bar for the subscore
            PercentileBarView(
                percentile: detail.score,
                demographicLabel: demographicLabel
            )

            // Divider
            Rectangle()
                .fill(CredoColors.border)
                .frame(height: 1)

            // Exercise rows
            VStack(spacing: 8) {
                ForEach(detail.exercises) { exercise in
                    ExerciseRow(exercise: exercise)
                }
            }
        }
        .padding(14)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }
}

// MARK: - Exercise Row

private struct ExerciseRow: View {
    let exercise: ExerciseDetail

    var body: some View {
        HStack {
            Text(exercise.name)
                .font(.credoBody(size: 13, weight: .medium))
                .foregroundStyle(exercise.oneRM != nil ? CredoColors.textPrimary : CredoColors.textTertiary)

            Spacer()

            if let oneRM = exercise.oneRM, let percentile = exercise.percentile {
                HStack(spacing: 8) {
                    Text("\(Int(oneRM)) lbs")
                        .font(.credoMono(size: 13, weight: .medium))
                        .foregroundStyle(CredoColors.textSecondary)

                    Text(ordinalString(percentile))
                        .font(.credoMono(size: 13, weight: .bold))
                        .foregroundStyle(colorForPercentile(percentile))
                }
            } else {
                Text("Not tested")
                    .font(.credoBody(size: 12, weight: .regular))
                    .foregroundStyle(CredoColors.textTertiary)
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

    private func colorForPercentile(_ pct: Int) -> Color {
        if pct < 30 {
            return Color(hex: "EF4444")
        } else if pct < 60 {
            return Color(hex: "F59E0B")
        } else {
            return Color(hex: "22C55E")
        }
    }
}

#Preview {
    NavigationStack {
        StrengthBreakdownView()
    }
}
