import SwiftUI

struct PRBadge: View {
    var body: some View {
        HStack(spacing: 3) {
            Image(systemName: "star.fill")
                .font(.system(size: 8))
            Text("PR")
                .font(.credoBody(size: 10, weight: .bold))
        }
        .foregroundStyle(.white)
        .padding(.horizontal, 6)
        .padding(.vertical, 2)
        .background(CredoColors.accent)
        .clipShape(Capsule())
    }
}

#Preview {
    PRBadge()
}
