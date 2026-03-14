import SwiftUI

struct MacroRingsView: View {
    let caloriesRemaining: Int
    let calorieTarget: Int
    let proteinProgress: Double
    let carbProgress: Double
    let fatProgress: Double

    @State private var animatedProtein: Double = 0
    @State private var animatedCarbs: Double = 0
    @State private var animatedFat: Double = 0

    private let ringWidth: CGFloat = 12
    private let ringSpacing: CGFloat = 6

    var body: some View {
        ZStack {
            // Outer ring - Protein (accent/orange)
            ring(progress: animatedProtein, color: CredoColors.accent, radius: 80)

            // Middle ring - Carbs (teal)
            ring(progress: animatedCarbs, color: CredoColors.teal, radius: 80 - ringWidth - ringSpacing)

            // Inner ring - Fat (yellow)
            ring(progress: animatedFat, color: Color.yellow, radius: 80 - 2 * (ringWidth + ringSpacing))

            // Center content
            VStack(spacing: 2) {
                Text("\(caloriesRemaining)")
                    .font(.credoDisplay(size: 28))
                    .foregroundStyle(CredoColors.textPrimary)

                Text("cal left")
                    .font(.credoBody(size: 12, weight: .medium))
                    .foregroundStyle(CredoColors.textSecondary)
            }
        }
        .frame(width: 180, height: 180)
        .onAppear {
            withAnimation(.easeOut(duration: 0.8)) {
                animatedProtein = proteinProgress
                animatedCarbs = carbProgress
                animatedFat = fatProgress
            }
        }
        .onChange(of: proteinProgress) { _, new in
            withAnimation(.easeOut(duration: 0.4)) { animatedProtein = new }
        }
        .onChange(of: carbProgress) { _, new in
            withAnimation(.easeOut(duration: 0.4)) { animatedCarbs = new }
        }
        .onChange(of: fatProgress) { _, new in
            withAnimation(.easeOut(duration: 0.4)) { animatedFat = new }
        }
    }

    @ViewBuilder
    private func ring(progress: Double, color: Color, radius: CGFloat) -> some View {
        ZStack {
            Circle()
                .stroke(color.opacity(0.15), lineWidth: ringWidth)
                .frame(width: radius * 2, height: radius * 2)

            Circle()
                .trim(from: 0, to: min(progress, 1.0))
                .stroke(
                    color,
                    style: StrokeStyle(lineWidth: ringWidth, lineCap: .round)
                )
                .frame(width: radius * 2, height: radius * 2)
                .rotationEffect(.degrees(-90))
        }
    }
}

// MARK: - Ring Legend

struct MacroRingLegend: View {
    let proteinG: Double
    let proteinTarget: Double
    let carbsG: Double
    let carbTarget: Double
    let fatG: Double
    let fatTarget: Double

    var body: some View {
        HStack(spacing: 20) {
            legendItem(color: CredoColors.accent, label: "Protein", current: proteinG, target: proteinTarget)
            legendItem(color: CredoColors.teal, label: "Carbs", current: carbsG, target: carbTarget)
            legendItem(color: .yellow, label: "Fat", current: fatG, target: fatTarget)
        }
    }

    @ViewBuilder
    private func legendItem(color: Color, label: String, current: Double, target: Double) -> some View {
        VStack(spacing: 2) {
            HStack(spacing: 4) {
                Circle()
                    .fill(color)
                    .frame(width: 8, height: 8)
                Text(label)
                    .font(.credoBody(size: 11, weight: .medium))
                    .foregroundStyle(CredoColors.textSecondary)
            }
            Text("\(Int(current))/\(Int(target))g")
                .font(.credoMono(size: 12, weight: .medium))
                .foregroundStyle(CredoColors.textPrimary)
        }
    }
}

#Preview {
    VStack(spacing: 20) {
        MacroRingsView(
            caloriesRemaining: 850,
            calorieTarget: 2500,
            proteinProgress: 0.65,
            carbProgress: 0.45,
            fatProgress: 0.55
        )

        MacroRingLegend(
            proteinG: 120,
            proteinTarget: 185,
            carbsG: 150,
            carbTarget: 280,
            fatG: 42,
            fatTarget: 75
        )
    }
    .padding()
}
