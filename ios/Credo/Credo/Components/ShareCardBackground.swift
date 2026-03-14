import SwiftUI

struct ShareCardBackground: View {
    let aspectRatio: AspectRatio

    private let topColor = Color(hex: "2C2C2E")
    private let bottomColor = Color(hex: "1C1C1E")

    var body: some View {
        ZStack {
            // Dark gradient base
            LinearGradient(
                colors: [topColor, bottomColor],
                startPoint: .top,
                endPoint: .bottom
            )

            // Subtle grid pattern overlay
            gridPattern
                .opacity(0.05)

            // Watermark
            watermark
        }
        .frame(width: aspectRatio.size.width, height: aspectRatio.size.height)
    }

    // MARK: - Grid Pattern

    private var gridPattern: some View {
        Canvas { context, size in
            let spacing: CGFloat = 40
            let lineWidth: CGFloat = 0.5

            // Vertical lines
            var x: CGFloat = 0
            while x <= size.width {
                let path = Path { p in
                    p.move(to: CGPoint(x: x, y: 0))
                    p.addLine(to: CGPoint(x: x, y: size.height))
                }
                context.stroke(path, with: .color(.white), lineWidth: lineWidth)
                x += spacing
            }

            // Horizontal lines
            var y: CGFloat = 0
            while y <= size.height {
                let path = Path { p in
                    p.move(to: CGPoint(x: 0, y: y))
                    p.addLine(to: CGPoint(x: size.width, y: y))
                }
                context.stroke(path, with: .color(.white), lineWidth: lineWidth)
                y += spacing
            }
        }
    }

    // MARK: - Watermark

    private var watermark: some View {
        VStack {
            Spacer()
            HStack {
                Spacer()
                Text("CREDO")
                    .font(.credoDisplay(size: 64))
                    .foregroundStyle(.white.opacity(0.04))
                    .rotationEffect(.degrees(-15))
                    .padding(.trailing, 40)
                    .padding(.bottom, 40)
            }
        }
    }
}

#Preview {
    ShareCardBackground(aspectRatio: .square)
        .scaleEffect(0.3)
}
