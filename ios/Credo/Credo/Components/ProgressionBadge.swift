import SwiftUI

enum ProgressionBadgeType {
    case upArrow    // Green — weight increase ready
    case pause      // Yellow — deload suggested
    case flame      // Accent — on a streak

    var icon: String {
        switch self {
        case .upArrow: return "arrow.up"
        case .pause:   return "pause"
        case .flame:   return "flame.fill"
        }
    }

    var color: Color {
        switch self {
        case .upArrow: return CredoColors.success
        case .pause:   return CredoColors.warning
        case .flame:   return CredoColors.accent
        }
    }
}

struct ProgressionBadge: View {
    let type: ProgressionBadgeType
    @State private var isPulsing = false

    var body: some View {
        ZStack {
            Circle()
                .fill(type.color.opacity(0.18))
                .frame(width: 24, height: 24)
                .scaleEffect(isPulsing ? 1.2 : 1.0)
                .opacity(isPulsing ? 0.6 : 1.0)

            Circle()
                .fill(type.color)
                .frame(width: 24, height: 24)

            Image(systemName: type.icon)
                .font(.system(size: 11, weight: .bold))
                .foregroundStyle(.white)
        }
        .onAppear {
            withAnimation(
                .easeInOut(duration: 1.0)
                .repeatForever(autoreverses: true)
            ) {
                isPulsing = true
            }
        }
    }
}

#Preview {
    HStack(spacing: 16) {
        ProgressionBadge(type: .upArrow)
        ProgressionBadge(type: .pause)
        ProgressionBadge(type: .flame)
    }
    .padding()
}
