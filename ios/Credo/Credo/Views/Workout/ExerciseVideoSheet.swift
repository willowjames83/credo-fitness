import SwiftUI
import SafariServices

struct ExerciseVideoSheet: View {
    let exerciseName: String
    let shortVideoURL: String?
    let detailedVideoURL: String?

    @Environment(\.dismiss) private var dismiss
    @State private var safariURL: URL?

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Text(exerciseName)
                    .font(.credoDisplay(size: 20))
                    .foregroundStyle(CredoColors.textPrimary)

                Spacer()

                Button {
                    dismiss()
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 24))
                        .foregroundStyle(CredoColors.textTertiary)
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 20)
            .padding(.top, 24)
            .padding(.bottom, 16)

            // Video cards
            VStack(spacing: 12) {
                videoCard(
                    title: "Quick Demo",
                    subtitle: "~30-60 sec form check",
                    icon: "play.fill",
                    iconColor: CredoColors.accent,
                    iconBackground: CredoColors.accentLight,
                    url: shortVideoURL
                )

                videoCard(
                    title: "Full Tutorial",
                    subtitle: "Complete exercise breakdown",
                    icon: "book.fill",
                    iconColor: CredoColors.teal,
                    iconBackground: CredoColors.tealLight,
                    url: detailedVideoURL
                )
            }
            .padding(.horizontal, 20)

            Spacer()
        }
        .background(CredoColors.bg)
        .presentationDetents([.medium])
        .presentationDragIndicator(.visible)
        .fullScreenCover(item: $safariURL) { url in
            SafariView(url: url)
                .ignoresSafeArea()
        }
    }

    @ViewBuilder
    private func videoCard(
        title: String,
        subtitle: String,
        icon: String,
        iconColor: Color,
        iconBackground: Color,
        url: String?
    ) -> some View {
        let isAvailable = url != nil

        Button {
            if let urlString = url, let parsed = URL(string: urlString) {
                safariURL = parsed
            }
        } label: {
            HStack(spacing: 14) {
                // Icon circle
                ZStack {
                    Circle()
                        .fill(iconBackground)
                        .frame(width: 44, height: 44)

                    Image(systemName: icon)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(iconColor)
                }

                // Text
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.credoBody(size: 15, weight: .semibold))
                        .foregroundStyle(CredoColors.textPrimary)

                    Text(isAvailable ? subtitle : "Coming soon")
                        .font(.credoBody(size: 13, weight: .regular))
                        .foregroundStyle(CredoColors.textSecondary)
                }

                Spacer()

                if isAvailable {
                    Image(systemName: "arrow.up.right")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(CredoColors.textTertiary)
                }
            }
            .padding(14)
            .background(CredoColors.surface)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(CredoColors.border, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
        .disabled(!isAvailable)
        .opacity(isAvailable ? 1.0 : 0.4)
    }
}

// MARK: - Safari View wrapper

extension URL: @retroactive Identifiable {
    public var id: String { absoluteString }
}

struct SafariView: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> SFSafariViewController {
        SFSafariViewController(url: url)
    }

    func updateUIViewController(_ uiViewController: SFSafariViewController, context: Context) {}
}
