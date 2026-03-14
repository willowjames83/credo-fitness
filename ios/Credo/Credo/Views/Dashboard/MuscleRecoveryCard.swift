import SwiftUI

struct MuscleRecoveryCard: View {
    let statuses: [MuscleRecoveryStatus]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack(spacing: 6) {
                Text("Recovery Status")
                    .font(.credoBody(size: 15, weight: .semibold))
                    .foregroundStyle(CredoColors.textPrimary)

                Image(systemName: "info.circle")
                    .font(.system(size: 13))
                    .foregroundStyle(CredoColors.textTertiary)

                Spacer()
            }

            // Muscle group bars
            VStack(spacing: 10) {
                ForEach(statuses) { status in
                    MuscleRecoveryRow(status: status)
                }
            }
        }
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }
}

private struct MuscleRecoveryRow: View {
    let status: MuscleRecoveryStatus

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(status.displayName)
                    .font(.credoBody(size: 13, weight: .medium))
                    .foregroundStyle(CredoColors.textPrimary)

                Spacer()

                Text(statusLabel)
                    .font(.credoBody(size: 11, weight: .medium))
                    .foregroundStyle(statusColor)
            }

            // Progress bar (inverted: full = fatigued, empty = recovered)
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 3)
                        .fill(CredoColors.surfaceElevated)
                        .frame(height: 6)

                    RoundedRectangle(cornerRadius: 3)
                        .fill(statusColor)
                        .frame(width: max(0, geometry.size.width * CGFloat(status.fatigueLevel) / 100.0), height: 6)
                }
            }
            .frame(height: 6)
        }
    }

    private var statusLabel: String {
        if status.fatigueLevel < 30 {
            return "Recovered"
        } else if status.fatigueLevel < 60 {
            return "Recovering"
        } else {
            return "Fatigued"
        }
    }

    private var statusColor: Color {
        if status.fatigueLevel < 30 {
            return CredoColors.success
        } else if status.fatigueLevel < 60 {
            return CredoColors.warning
        } else {
            return CredoColors.accent
        }
    }
}
