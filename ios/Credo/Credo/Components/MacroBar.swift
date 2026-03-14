import SwiftUI

struct MacroBar: View {
    let proteinG: Double
    let carbsG: Double
    let fatG: Double
    var showLabels: Bool = false
    var height: CGFloat = 8

    private var total: Double {
        proteinG + carbsG + fatG
    }

    private var proteinFraction: CGFloat {
        total > 0 ? CGFloat(proteinG / total) : 0
    }

    private var carbsFraction: CGFloat {
        total > 0 ? CGFloat(carbsG / total) : 0
    }

    private var fatFraction: CGFloat {
        total > 0 ? CGFloat(fatG / total) : 0
    }

    var body: some View {
        VStack(spacing: 4) {
            GeometryReader { geo in
                HStack(spacing: 1) {
                    if proteinFraction > 0 {
                        RoundedRectangle(cornerRadius: height / 2)
                            .fill(CredoColors.accent)
                            .frame(width: max(geo.size.width * proteinFraction, 2))
                    }
                    if carbsFraction > 0 {
                        RoundedRectangle(cornerRadius: height / 2)
                            .fill(CredoColors.teal)
                            .frame(width: max(geo.size.width * carbsFraction, 2))
                    }
                    if fatFraction > 0 {
                        RoundedRectangle(cornerRadius: height / 2)
                            .fill(Color.yellow)
                            .frame(width: max(geo.size.width * fatFraction, 2))
                    }
                }
            }
            .frame(height: height)
            .background(CredoColors.surface)
            .clipShape(RoundedRectangle(cornerRadius: height / 2))

            if showLabels {
                HStack(spacing: 12) {
                    MacroLegendItem(color: CredoColors.accent, label: "P", value: proteinG)
                    MacroLegendItem(color: CredoColors.teal, label: "C", value: carbsG)
                    MacroLegendItem(color: .yellow, label: "F", value: fatG)
                }
                .font(.credoMono(size: 11))
            }
        }
    }
}

private struct MacroLegendItem: View {
    let color: Color
    let label: String
    let value: Double

    var body: some View {
        HStack(spacing: 3) {
            Circle()
                .fill(color)
                .frame(width: 6, height: 6)
            Text("\(label) \(Int(value))g")
                .foregroundStyle(CredoColors.textSecondary)
        }
    }
}

#Preview {
    VStack(spacing: 20) {
        MacroBar(proteinG: 120, carbsG: 200, fatG: 65, showLabels: true)
        MacroBar(proteinG: 40, carbsG: 50, fatG: 8)
    }
    .padding()
}
