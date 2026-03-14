import SwiftUI

struct HeartRateZoneBar: View {
    let zones: [HeartRateZone]

    private var totalDuration: Int {
        zones.reduce(0) { $0 + $1.durationSeconds }
    }

    var body: some View {
        GeometryReader { geometry in
            HStack(spacing: 2) {
                ForEach(zones.sorted(by: { $0.zone < $1.zone })) { zone in
                    let fraction = totalDuration > 0
                        ? CGFloat(zone.durationSeconds) / CGFloat(totalDuration)
                        : 0

                    RoundedRectangle(cornerRadius: 3)
                        .fill(colorForZone(zone.zone))
                        .frame(width: max(fraction * (geometry.size.width - CGFloat(zones.count - 1) * 2), 4))
                }
            }
        }
        .frame(height: 16)
    }

    private func colorForZone(_ zone: Int) -> Color {
        switch zone {
        case 1: return CredoColors.textTertiary     // Gray
        case 2: return CredoColors.success           // Green
        case 3: return CredoColors.warning           // Yellow/Orange
        case 4: return CredoColors.accent            // Orange
        case 5: return CredoColors.danger            // Red
        default: return CredoColors.textTertiary
        }
    }
}

#Preview {
    HeartRateZoneBar(zones: [
        HeartRateZone(zone: 1, durationSeconds: 300, percentOfMax: 55),
        HeartRateZone(zone: 2, durationSeconds: 900, percentOfMax: 65),
        HeartRateZone(zone: 3, durationSeconds: 600, percentOfMax: 75),
        HeartRateZone(zone: 4, durationSeconds: 300, percentOfMax: 85),
        HeartRateZone(zone: 5, durationSeconds: 120, percentOfMax: 93),
    ])
    .padding()
}
