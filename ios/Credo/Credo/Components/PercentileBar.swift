import SwiftUI

struct PercentileBar: View {
    let percentile: Int
    let pillar: Pillar

    @State private var animatedWidth: CGFloat = 0

    private var fraction: CGFloat {
        CGFloat(max(0, min(percentile, 100))) / 100.0
    }

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                // Track
                RoundedRectangle(cornerRadius: 2)
                    .fill(CredoColors.surfaceElevated)
                    .frame(height: 4)

                // Fill
                RoundedRectangle(cornerRadius: 2)
                    .fill(pillar.color)
                    .frame(width: animatedWidth, height: 4)
            }
            .onAppear {
                withAnimation(.easeOut(duration: 1.0)) {
                    animatedWidth = geo.size.width * fraction
                }
            }
        }
        .frame(height: 4)
    }
}

#Preview {
    VStack(spacing: 20) {
        PercentileBar(percentile: 72, pillar: .strength)
        PercentileBar(percentile: 45, pillar: .cardio)
        PercentileBar(percentile: 88, pillar: .nutrition)
    }
    .padding()
}
