import SwiftUI

struct ProfileHeaderView: View {
    let name: String
    let initials: String
    let summary: String

    var body: some View {
        VStack(spacing: 8) {
            // Avatar circle with initials
            ZStack {
                Circle()
                    .fill(CredoColors.surface)
                    .frame(width: 64, height: 64)
                    .overlay(
                        Circle()
                            .stroke(CredoColors.border, lineWidth: 1)
                    )

                Text(initials)
                    .font(.credoBody(size: 22, weight: .bold))
                    .foregroundStyle(CredoColors.textPrimary)
            }

            // Name
            Text(name)
                .font(.credoBody(size: 18, weight: .semibold))
                .foregroundStyle(CredoColors.textPrimary)

            // Details
            Text(summary)
                .font(.credoBody(size: 13, weight: .regular))
                .foregroundStyle(CredoColors.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }
}
