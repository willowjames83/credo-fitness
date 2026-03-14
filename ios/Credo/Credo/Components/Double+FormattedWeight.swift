import Foundation

extension Double {
    /// Format weight for display: "135" for whole numbers, "132.5" for fractional.
    var formattedWeight: String {
        truncatingRemainder(dividingBy: 1) == 0
            ? String(format: "%.0f", self)
            : String(format: "%.1f", self)
    }
}
