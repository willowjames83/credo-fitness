import SwiftUI

struct PercentileBarView: View {
    let percentile: Int
    let demographicLabel: String

    @State private var animatedFraction: CGFloat = 0

    private var fraction: CGFloat {
        CGFloat(max(0, min(percentile, 100))) / 100.0
    }

    private var isEmpty: Bool {
        percentile <= 0
    }

    var body: some View {
        VStack(spacing: 6) {
            GeometryReader { geo in
                let barWidth = geo.size.width
                let pinX = barWidth * animatedFraction

                ZStack(alignment: .leading) {
                    // Gradient bar track
                    RoundedRectangle(cornerRadius: 6)
                        .fill(
                            isEmpty
                            ? AnyShapeStyle(CredoColors.surfaceElevated)
                            : AnyShapeStyle(
                                LinearGradient(
                                    colors: [
                                        Color(hex: "EF4444"), // red
                                        Color(hex: "F59E0B"), // yellow
                                        Color(hex: "22C55E"), // green
                                    ],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                        )
                        .frame(height: 10)
                        .opacity(isEmpty ? 1.0 : 0.3)

                    if !isEmpty {
                        // Filled portion
                        RoundedRectangle(cornerRadius: 6)
                            .fill(
                                LinearGradient(
                                    colors: [
                                        Color(hex: "EF4444"),
                                        Color(hex: "F59E0B"),
                                        Color(hex: "22C55E"),
                                    ],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .frame(width: pinX, height: 10)

                        // Pin indicator
                        VStack(spacing: 2) {
                            Text("\(percentile)")
                                .font(.credoMono(size: 10, weight: .bold))
                                .foregroundStyle(CredoColors.textPrimary)

                            Circle()
                                .fill(.white)
                                .frame(width: 14, height: 14)
                                .shadow(color: .black.opacity(0.2), radius: 2, y: 1)
                                .overlay(
                                    Circle()
                                        .stroke(colorForPercentile(percentile), lineWidth: 2)
                                )
                        }
                        .offset(x: pinX - 7, y: -12)
                    }
                }
            }
            .frame(height: 28)

            // Demographic label
            Text(demographicLabel)
                .font(.credoBody(size: 11, weight: .regular))
                .foregroundStyle(CredoColors.textTertiary)
        }
        .opacity(isEmpty ? 0.5 : 1.0)
        .onAppear {
            withAnimation(.easeOut(duration: 0.8)) {
                animatedFraction = fraction
            }
        }
    }

    private func colorForPercentile(_ pct: Int) -> Color {
        if pct < 30 {
            return Color(hex: "EF4444")
        } else if pct < 60 {
            return Color(hex: "F59E0B")
        } else {
            return Color(hex: "22C55E")
        }
    }
}

#Preview {
    VStack(spacing: 24) {
        PercentileBarView(percentile: 72, demographicLabel: "vs. Males 30-39")
        PercentileBarView(percentile: 25, demographicLabel: "vs. Males 30-39")
        PercentileBarView(percentile: 0, demographicLabel: "vs. Males 30-39")
        PercentileBarView(percentile: 92, demographicLabel: "vs. Females 25-29")
    }
    .padding()
}
