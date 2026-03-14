import SwiftUI

struct SettingsRowView: View {
    let row: SettingsRow

    var body: some View {
        Group {
            if let action = row.action {
                Button(action: action) {
                    rowContent
                }
                .buttonStyle(.plain)
            } else {
                rowContent
            }
        }
    }

    private var rowContent: some View {
        HStack {
            Text(row.label)
                .font(.credoBody(size: 15, weight: .regular))
                .foregroundStyle(CredoColors.textPrimary)

            Spacer()

            if let detail = row.detail {
                Text(detail)
                    .font(.credoBody(size: 14, weight: .regular))
                    .foregroundStyle(row.detailColor ?? CredoColors.textSecondary)
            }

            Image(systemName: "chevron.right")
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(CredoColors.textTertiary)
        }
        .padding(.vertical, 12)
        .padding(.horizontal, 16)
    }
}
