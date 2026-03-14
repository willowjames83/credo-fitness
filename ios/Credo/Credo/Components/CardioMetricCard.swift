import SwiftUI

struct CardioMetricCard: View {
    let icon: String
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(CredoColors.cardio)

            Text(value)
                .font(.credoMono(size: 18, weight: .bold))
                .foregroundStyle(CredoColors.textPrimary)
                .lineLimit(1)
                .minimumScaleFactor(0.7)

            Text(label)
                .font(.credoBody(size: 11, weight: .medium))
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
    HStack(spacing: 10) {
        CardioMetricCard(icon: "location", value: "3.21", label: "Miles")
        CardioMetricCard(icon: "clock", value: "32", label: "Minutes")
    }
    .padding()
}
