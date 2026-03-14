import SwiftUI

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

enum CredoColors {
    static let accent = Color(hex: "E8501A")
    static let accentLight = Color(hex: "FFF0E9")

    static let teal = Color(hex: "1A7A6D")
    static let tealLight = Color(hex: "E8F5F3")

    static let cardio = Color(hex: "2563EB")
    static let cardioLight = Color(hex: "EFF4FF")

    static let nutrition = Color(hex: "7C3AED")
    static let nutritionLight = Color(hex: "F3EEFF")

    static let bg = Color(hex: "FFFFFF")
    static let surface = Color(hex: "F7F7F8")
    static let surfaceElevated = Color(hex: "EEEFF1")
    static let border = Color(hex: "E5E5E8")

    static let textPrimary = Color(hex: "1A1A1E")
    static let textSecondary = Color(hex: "6B6B73")
    static let textTertiary = Color(hex: "9E9EA3")

    static let success = Color(hex: "2D8A4E")
    static let successLight = Color(hex: "E8F5ED")

    static let warning = Color(hex: "C47A1A")
    static let warningLight = Color(hex: "FFF3E0")

    static let danger = Color(hex: "C43B3B")
}
