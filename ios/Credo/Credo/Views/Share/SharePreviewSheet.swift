import SwiftUI

struct SharePreviewSheet: View {
    @Bindable var viewModel: ShareViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                CredoColors.surface
                    .ignoresSafeArea()

                VStack(spacing: 24) {
                    // Aspect ratio toggle
                    aspectRatioPicker

                    // Card preview
                    cardPreview

                    Spacer()

                    // Share button
                    shareButton
                }
                .padding(.horizontal, 20)
                .padding(.top, 12)
                .padding(.bottom, 24)

                // Loading overlay
                if viewModel.isRendering {
                    loadingOverlay
                }
            }
            .navigationTitle("Share")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundStyle(CredoColors.textSecondary)
                }
            }
            .onAppear {
                viewModel.render()
            }
            .sheet(isPresented: $viewModel.isShareSheetPresented) {
                if let image = viewModel.renderedImage {
                    ActivityViewRepresentable(activityItems: [image])
                        .presentationDetents([.medium, .large])
                }
            }
        }
    }

    // MARK: - Aspect Ratio Picker

    private var aspectRatioPicker: some View {
        Picker("Aspect Ratio", selection: $viewModel.aspectRatio) {
            ForEach(AspectRatio.allCases) { ratio in
                Text(ratio.label).tag(ratio)
            }
        }
        .pickerStyle(.segmented)
        .padding(.horizontal, 40)
        .onChange(of: viewModel.aspectRatio) { _, _ in
            viewModel.render()
        }
    }

    // MARK: - Card Preview

    private var cardPreview: some View {
        Group {
            if let image = viewModel.renderedImage {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .shadow(color: .black.opacity(0.2), radius: 20, x: 0, y: 10)
                    .padding(.horizontal, viewModel.aspectRatio == .story ? 60 : 20)
            } else {
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(hex: "1C1C1E"))
                    .aspectRatio(
                        viewModel.aspectRatio.size.width / viewModel.aspectRatio.size.height,
                        contentMode: .fit
                    )
                    .padding(.horizontal, viewModel.aspectRatio == .story ? 60 : 20)
                    .overlay {
                        ProgressView()
                            .tint(.white)
                    }
            }
        }
    }

    // MARK: - Share Button

    private var shareButton: some View {
        Button {
            viewModel.share()
        } label: {
            HStack(spacing: 10) {
                Image(systemName: "square.and.arrow.up")
                    .font(.system(size: 18, weight: .semibold))
                Text("Share")
                    .font(.credoBody(size: 18, weight: .semibold))
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .fill(CredoColors.accent)
            )
        }
        .disabled(viewModel.renderedImage == nil || viewModel.isRendering)
        .opacity(viewModel.renderedImage == nil ? 0.5 : 1.0)
    }

    // MARK: - Loading Overlay

    private var loadingOverlay: some View {
        ZStack {
            Color.black.opacity(0.3)
                .ignoresSafeArea()
            ProgressView()
                .scaleEffect(1.5)
                .tint(.white)
        }
    }
}

// MARK: - UIActivityViewController Representable

struct ActivityViewRepresentable: UIViewControllerRepresentable {
    let activityItems: [Any]
    var applicationActivities: [UIActivity]? = nil

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(
            activityItems: activityItems,
            applicationActivities: applicationActivities
        )
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
