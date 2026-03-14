import SwiftUI

struct SuggestedPromptChip: View {
    let text: String
    let onTap: (String) -> Void

    var body: some View {
        Button {
            onTap(text)
        } label: {
            Text(text)
                .font(.credoBody(size: 13, weight: .medium))
                .foregroundStyle(CredoColors.accent)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(CredoColors.surface)
                .clipShape(Capsule())
                .overlay(
                    Capsule()
                        .stroke(CredoColors.border, lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
    }
}
