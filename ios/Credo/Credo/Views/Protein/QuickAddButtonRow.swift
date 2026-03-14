import SwiftUI

struct QuickAddButtonRow: View {
    let onAdd: (Int) -> Void

    private let amounts = [20, 30, 40, 50]

    var body: some View {
        HStack(spacing: 8) {
            ForEach(amounts, id: \.self) { grams in
                Button {
                    onAdd(grams)
                } label: {
                    Text("+\(grams)g")
                        .font(.credoBody(size: 14, weight: .medium))
                        .foregroundStyle(CredoColors.textPrimary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(CredoColors.surface)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(CredoColors.border, lineWidth: 1)
                        )
                }
                .buttonStyle(.plain)
            }
        }
    }
}
