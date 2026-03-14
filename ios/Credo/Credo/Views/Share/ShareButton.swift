import SwiftUI

// MARK: - Share Button Styles

enum ShareButtonStyle {
    case compact   // Icon only
    case full      // Icon + text
}

// MARK: - Share Button View

struct ShareButton: View {
    let content: ShareableContent
    var style: ShareButtonStyle = .full

    @State private var viewModel = ShareViewModel()
    @State private var isPresented = false

    var body: some View {
        Button {
            viewModel.content = content
            isPresented = true
        } label: {
            switch style {
            case .compact:
                Image(systemName: "square.and.arrow.up")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(CredoColors.accent)
            case .full:
                HStack(spacing: 8) {
                    Image(systemName: "square.and.arrow.up")
                        .font(.system(size: 14, weight: .semibold))
                    Text("Share")
                        .font(.credoBody(size: 15, weight: .semibold))
                }
                .foregroundStyle(CredoColors.accent)
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(CredoColors.accent, lineWidth: 1.5)
                )
            }
        }
        .sheet(isPresented: $isPresented) {
            SharePreviewSheet(viewModel: viewModel)
        }
    }
}

// MARK: - View Modifier

struct ShareButtonModifier: ViewModifier {
    let content: ShareableContent
    var style: ShareButtonStyle = .full

    func body(content: Content) -> some View {
        content.overlay(alignment: .topTrailing) {
            ShareButton(content: self.content, style: style)
        }
    }
}

extension View {
    func shareButton(content: ShareableContent, style: ShareButtonStyle = .full) -> some View {
        modifier(ShareButtonModifier(content: content, style: style))
    }
}

#Preview {
    VStack(spacing: 40) {
        ShareButton(
            content: .personalRecord(
                exerciseName: "Bench Press",
                weight: 225,
                reps: 5,
                estimated1RM: 253,
                date: Date()
            ),
            style: .full
        )

        ShareButton(
            content: .personalRecord(
                exerciseName: "Bench Press",
                weight: 225,
                reps: 5,
                estimated1RM: 253,
                date: Date()
            ),
            style: .compact
        )
    }
}
