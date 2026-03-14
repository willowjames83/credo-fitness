import SwiftUI

struct CompositeCard: View {
    let composite: CompositePercentile

    var body: some View {
        VStack(spacing: 8) {
            Text("CREDO TEN COMPOSITE")
                .font(.credoBody(size: 11, weight: .semibold))
                .tracking(1.5)
                .foregroundStyle(CredoColors.textTertiary)
                .textCase(.uppercase)

            Text(ordinalString(composite.value))
                .font(.credoMono(size: 32, weight: .bold))
                .foregroundStyle(CredoColors.textPrimary)

            Text("percentile for \(composite.context)")
                .font(.credoBody(size: 13, weight: .regular))
                .foregroundStyle(CredoColors.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(20)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(CredoColors.border, lineWidth: 1)
        )
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
