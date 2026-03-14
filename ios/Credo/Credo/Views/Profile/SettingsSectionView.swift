import SwiftUI

struct SettingsSectionView: View {
    let section: SettingsSection

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            SectionHeader(title: section.title)

            VStack(spacing: 0) {
                ForEach(Array(section.rows.enumerated()), id: \.offset) { index, row in
                    SettingsRowView(row: row)

                    if index < section.rows.count - 1 {
                        Divider()
                            .foregroundStyle(CredoColors.border)
                            .padding(.horizontal, 16)
                    }
                }
            }
            .background(CredoColors.surface)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(CredoColors.border, lineWidth: 1)
            )
        }
    }
}
