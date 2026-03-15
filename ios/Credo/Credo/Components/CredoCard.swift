import SwiftUI

struct CredoCard: ViewModifier {
    var elevated: Bool = false

    func body(content: Content) -> some View {
        content
            .background(CredoColors.surface)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(CredoColors.border, lineWidth: 1)
            )
            .shadow(
                color: .black.opacity(elevated ? 0.08 : 0.04),
                radius: elevated ? 12 : 8,
                x: 0,
                y: elevated ? 4 : 2
            )
    }
}

extension View {
    func credoCard(elevated: Bool = false) -> some View {
        modifier(CredoCard(elevated: elevated))
    }
}
