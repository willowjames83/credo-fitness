import SwiftUI

struct RestTimerView: View {
    let timeFormatted: String
    let progress: Double  // 0.0 to 1.0
    let selectedDuration: Int
    let onSelectDuration: (Int) -> Void
    let onSkip: () -> Void

    private let durations = [60, 90, 120, 180]

    var body: some View {
        VStack(spacing: 12) {
            Text("Rest Timer")
                .font(.credoBody(size: 12, weight: .medium))
                .foregroundStyle(CredoColors.accent)

            // Countdown
            Text(timeFormatted)
                .font(.credoMono(size: 36, weight: .bold))
                .foregroundStyle(CredoColors.accent)

            // Progress bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(CredoColors.border)
                        .frame(height: 6)

                    RoundedRectangle(cornerRadius: 4)
                        .fill(CredoColors.accent)
                        .frame(width: geometry.size.width * progress, height: 6)
                        .animation(.linear(duration: 1), value: progress)
                }
            }
            .frame(height: 6)
            .padding(.horizontal, 8)

            // Duration selector chips
            HStack(spacing: 8) {
                ForEach(durations, id: \.self) { duration in
                    Button {
                        onSelectDuration(duration)
                    } label: {
                        Text(durationLabel(duration))
                            .font(.credoBody(size: 12, weight: .medium))
                            .foregroundStyle(
                                selectedDuration == duration
                                    ? Color.white
                                    : CredoColors.textSecondary
                            )
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(
                                selectedDuration == duration
                                    ? CredoColors.accent
                                    : CredoColors.surface
                            )
                            .clipShape(Capsule())
                            .overlay(
                                Capsule()
                                    .stroke(
                                        selectedDuration == duration
                                            ? Color.clear
                                            : CredoColors.border,
                                        lineWidth: 1
                                    )
                            )
                    }
                    .buttonStyle(.plain)
                }
            }

            // Skip button
            Button(action: onSkip) {
                Text("Skip")
                    .font(.credoBody(size: 14, weight: .semibold))
                    .foregroundStyle(CredoColors.accent)
            }
            .buttonStyle(.plain)
            .padding(.top, 4)
        }
        .frame(maxWidth: .infinity)
        .padding(16)
        .background(
            CredoColors.accentLight.opacity(progress)
                .animation(.linear(duration: 1), value: progress)
        )
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(CredoColors.accent.opacity(0.3), lineWidth: 1)
        )
    }

    private func durationLabel(_ seconds: Int) -> String {
        if seconds < 60 {
            return "\(seconds)s"
        }
        let minutes = seconds / 60
        let remaining = seconds % 60
        if remaining == 0 {
            return "\(minutes)m"
        }
        return "\(minutes)m \(remaining)s"
    }
}
