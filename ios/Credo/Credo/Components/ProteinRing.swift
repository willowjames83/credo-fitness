import SwiftUI

struct ProteinRing: View {
    let current: Int
    let target: Int
    var size: CGFloat = 140
    var strokeWidth: CGFloat = 10

    @State private var animatedProgress: CGFloat = 0

    private var progress: CGFloat {
        guard target > 0 else { return 0 }
        return min(CGFloat(current) / CGFloat(target), 1.0)
    }

    private var ringColor: Color {
        current >= target ? CredoColors.success : CredoColors.nutrition
    }

    var body: some View {
        ZStack {
            // Track
            Circle()
                .stroke(CredoColors.surfaceElevated, lineWidth: strokeWidth)
                .frame(width: size, height: size)

            // Progress arc
            Circle()
                .trim(from: 0, to: animatedProgress)
                .stroke(ringColor, style: StrokeStyle(lineWidth: strokeWidth, lineCap: .round))
                .frame(width: size, height: size)
                .rotationEffect(.degrees(-90))

            // Center content
            VStack(spacing: 2) {
                Text("\(current)")
                    .font(.credoMono(size: size * 0.25, weight: .bold))
                    .foregroundStyle(CredoColors.textPrimary)

                Text("of \(target)g")
                    .font(.credoBody(size: 13, weight: .regular))
                    .foregroundStyle(CredoColors.textSecondary)
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 1.0)) {
                animatedProgress = progress
            }
        }
        .onChange(of: current) {
            withAnimation(.easeOut(duration: 0.5)) {
                animatedProgress = progress
            }
        }
    }
}

#Preview {
    VStack(spacing: 32) {
        ProteinRing(current: 120, target: 180)
        ProteinRing(current: 185, target: 180)
    }
    .padding()
}
