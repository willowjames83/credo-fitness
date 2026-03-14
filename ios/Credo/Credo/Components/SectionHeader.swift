import SwiftUI

struct SectionHeader: View {
    let title: String

    var body: some View {
        Text(title.uppercased())
            .font(.credoBody(size: 11, weight: .semibold))
            .foregroundStyle(CredoColors.textTertiary)
            .tracking(1.5)
    }
}

#Preview {
    VStack(alignment: .leading, spacing: 20) {
        SectionHeader(title: "Your Pillars")
        SectionHeader(title: "Today's Workout")
        SectionHeader(title: "Benchmarks")
    }
    .padding()
}
