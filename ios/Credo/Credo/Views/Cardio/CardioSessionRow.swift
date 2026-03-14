import SwiftUI

struct CardioSessionRow: View {
    let session: CardioSession

    var body: some View {
        HStack(spacing: 12) {
            // Type Icon
            Image(systemName: session.type.icon)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(.white)
                .frame(width: 36, height: 36)
                .background(CredoColors.cardio)
                .clipShape(Circle())

            // Type Name & Date
            VStack(alignment: .leading, spacing: 2) {
                Text(session.type.displayName)
                    .font(.credoBody(size: 14, weight: .medium))
                    .foregroundStyle(CredoColors.textPrimary)

                Text(formattedDate(session.date))
                    .font(.credoBody(size: 12, weight: .regular))
                    .foregroundStyle(CredoColors.textSecondary)
            }

            Spacer()

            // Duration & Distance
            VStack(alignment: .trailing, spacing: 2) {
                Text(session.formattedDuration)
                    .font(.credoMono(size: 14, weight: .semibold))
                    .foregroundStyle(CredoColors.textPrimary)

                if let miles = session.distanceMiles {
                    Text(String(format: "%.1f mi", miles))
                        .font(.credoMono(size: 12, weight: .regular))
                        .foregroundStyle(CredoColors.textSecondary)
                }
            }

            Image(systemName: "chevron.right")
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(CredoColors.textTertiary)
        }
        .padding(14)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }

    private func formattedDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE, MMM d"
        return formatter.string(from: date)
    }
}
