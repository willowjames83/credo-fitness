import SwiftUI

struct OnboardingReadyStep: View {
    let name: String

    @State private var checkmarkScale: CGFloat = 0
    @State private var checkmarkOpacity: Double = 0
    @State private var textOpacity: Double = 0
    @State private var confettiVisible = false

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // Confetti-like accent dots + checkmark
            ZStack {
                // Floating accent dots
                ForEach(0..<12, id: \.self) { i in
                    Circle()
                        .fill(dotColor(for: i))
                        .frame(width: CGFloat.random(in: 4...8), height: CGFloat.random(in: 4...8))
                        .offset(
                            x: confettiVisible ? CGFloat.random(in: -60...60) : 0,
                            y: confettiVisible ? CGFloat.random(in: -80...(-20)) : 0
                        )
                        .opacity(confettiVisible ? 0 : 0.8)
                        .animation(
                            .easeOut(duration: Double.random(in: 1.5...2.5))
                                .delay(0.3 + Double(i) * 0.05),
                            value: confettiVisible
                        )
                }

                // Checkmark
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 80))
                    .foregroundStyle(CredoColors.accent)
                    .scaleEffect(checkmarkScale)
                    .opacity(checkmarkOpacity)
            }

            VStack(spacing: 12) {
                Text("You're ready.")
                    .font(.credoDisplay(size: 32))
                    .foregroundStyle(CredoColors.textPrimary)
                    .multilineTextAlignment(.center)
                    .opacity(textOpacity)

                if !name.isEmpty {
                    Text("Let's build something great, \(name).")
                        .font(.credoBody(size: 16, weight: .regular))
                        .foregroundStyle(CredoColors.textSecondary)
                        .multilineTextAlignment(.center)
                        .opacity(textOpacity)
                } else {
                    Text("Choose your program to start training")
                        .font(.credoBody(size: 16, weight: .regular))
                        .foregroundStyle(CredoColors.textSecondary)
                        .multilineTextAlignment(.center)
                        .opacity(textOpacity)
                }
            }

            Spacer()
        }
        .frame(maxWidth: .infinity)
        .onAppear {
            withAnimation(.spring(response: 0.6, dampingFraction: 0.6).delay(0.1)) {
                checkmarkScale = 1.0
                checkmarkOpacity = 1.0
            }
            withAnimation(.easeOut(duration: 0.6).delay(0.4)) {
                textOpacity = 1.0
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                confettiVisible = true
            }
        }
    }

    private func dotColor(for index: Int) -> Color {
        let colors: [Color] = [
            CredoColors.accent,
            CredoColors.teal,
            CredoColors.cardio,
            CredoColors.accent.opacity(0.6)
        ]
        return colors[index % colors.count]
    }
}
