import SwiftUI

struct PillarBadge: View {
    let pillar: Pillar

    var body: some View {
        Text(pillar.label.uppercased())
            .font(.credoBody(size: 11, weight: .semibold))
            .foregroundStyle(pillar.color)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(pillar.bgColor)
            .clipShape(Capsule())
    }
}

#Preview {
    HStack(spacing: 8) {
        PillarBadge(pillar: .strength)
        PillarBadge(pillar: .stability)
        PillarBadge(pillar: .cardio)
        PillarBadge(pillar: .nutrition)
    }
    .padding()
}
