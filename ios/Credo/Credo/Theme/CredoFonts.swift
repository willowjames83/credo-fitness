import SwiftUI

extension Font {
    static func credoDisplay(size: CGFloat) -> Font {
        .system(size: size, weight: .bold, design: .serif)
    }

    static func credoBody(size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .system(size: size, weight: weight, design: .default)
    }

    static func credoMono(size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .system(size: size, weight: weight, design: .monospaced)
    }
}

struct CredoDisplayModifier: ViewModifier {
    let size: CGFloat

    func body(content: Content) -> some View {
        content.font(.credoDisplay(size: size))
    }
}

struct CredoBodyModifier: ViewModifier {
    let size: CGFloat
    let weight: Font.Weight

    func body(content: Content) -> some View {
        content.font(.credoBody(size: size, weight: weight))
    }
}

struct CredoMonoModifier: ViewModifier {
    let size: CGFloat
    let weight: Font.Weight

    func body(content: Content) -> some View {
        content.font(.credoMono(size: size, weight: weight))
    }
}

extension View {
    func credoDisplay(size: CGFloat = 28) -> some View {
        modifier(CredoDisplayModifier(size: size))
    }

    func credoBody(size: CGFloat = 16, weight: Font.Weight = .regular) -> some View {
        modifier(CredoBodyModifier(size: size, weight: weight))
    }

    func credoMono(size: CGFloat = 14, weight: Font.Weight = .regular) -> some View {
        modifier(CredoMonoModifier(size: size, weight: weight))
    }
}
