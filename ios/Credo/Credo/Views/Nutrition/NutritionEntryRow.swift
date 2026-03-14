import SwiftUI

struct NutritionEntryRow: View {
    let entry: NutritionEntry

    var body: some View {
        VStack(spacing: 6) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(entry.name)
                        .font(.credoBody(size: 15, weight: .medium))
                        .foregroundStyle(CredoColors.textPrimary)
                        .lineLimit(1)

                    if let serving = entry.servingSize {
                        let servingText = entry.servingCount != 1.0
                            ? "\(formatServingCount(entry.servingCount)) x \(serving)"
                            : serving
                        Text(servingText)
                            .font(.credoBody(size: 12))
                            .foregroundStyle(CredoColors.textTertiary)
                    }
                }

                Spacer()

                Text("\(entry.totalCalories) cal")
                    .font(.credoMono(size: 14, weight: .semibold))
                    .foregroundStyle(CredoColors.textPrimary)
            }

            MacroBar(
                proteinG: entry.totalProtein,
                carbsG: entry.totalCarbs,
                fatG: entry.totalFat,
                height: 4
            )
        }
        .padding(.vertical, 8)
    }

    private func formatServingCount(_ count: Double) -> String {
        if count == floor(count) {
            return "\(Int(count))"
        }
        return String(format: "%.1f", count)
    }
}

#Preview {
    VStack(spacing: 0) {
        NutritionEntryRow(entry: MockNutrition.entries[0])
        Divider()
        NutritionEntryRow(entry: MockNutrition.entries[2])
    }
    .padding(.horizontal, 16)
}
