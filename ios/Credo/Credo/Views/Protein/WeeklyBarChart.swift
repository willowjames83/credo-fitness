import SwiftUI

struct WeeklyBarChart: View {
    let data: [ProteinDay]

    private let barHeight: CGFloat = 80

    private var maxAmount: Int {
        max(data.map(\.target).max() ?? 1, data.map(\.amount).max() ?? 1)
    }

    var body: some View {
        HStack(spacing: 6) {
            ForEach(data) { day in
                VStack(spacing: 4) {
                    // Bar area
                    VStack {
                        Spacer()

                        RoundedRectangle(cornerRadius: 4)
                            .fill(barColor(for: day))
                            .frame(height: barFillHeight(for: day))
                    }
                    .frame(height: barHeight)

                    // Amount
                    Text("\(day.amount)")
                        .font(.credoBody(size: 11, weight: .regular))
                        .foregroundStyle(CredoColors.textSecondary)

                    // Day label
                    Text(day.day)
                        .font(.credoBody(size: 11, weight: day.isToday ? .bold : .regular))
                        .foregroundStyle(day.isToday ? CredoColors.accent : CredoColors.textSecondary)
                }
                .frame(maxWidth: .infinity)
            }
        }
    }

    private func barFillHeight(for day: ProteinDay) -> CGFloat {
        guard maxAmount > 0 else { return 0 }
        return CGFloat(day.amount) / CGFloat(maxAmount) * barHeight
    }

    private func barColor(for day: ProteinDay) -> Color {
        day.hit ? CredoColors.success.opacity(0.2) : CredoColors.warning.opacity(0.2)
    }
}
