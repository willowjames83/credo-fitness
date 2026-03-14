import SwiftUI

struct SyncStatusBadge: View {
    @State private var viewModel = SyncViewModel()
    @State private var isRotating = false

    var body: some View {
        Button(action: { viewModel.manualSync() }) {
            HStack(spacing: 6) {
                statusIcon
                    .font(.system(size: 14, weight: .medium))

                Text(statusText)
                    .font(.credoMono(size: 12))
                    .foregroundColor(CredoColors.textSecondary)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(CredoColors.surface)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(CredoColors.border, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
        .disabled(viewModel.syncStatus == .syncing)
    }

    // MARK: - Status Icon

    @ViewBuilder
    private var statusIcon: some View {
        switch viewModel.syncStatus {
        case .idle:
            Image(systemName: "arrow.triangle.2.circlepath")
                .foregroundColor(CredoColors.textTertiary)

        case .syncing:
            Image(systemName: "arrow.triangle.2.circlepath")
                .foregroundColor(CredoColors.accent)
                .rotationEffect(.degrees(isRotating ? 360 : 0))
                .animation(
                    .linear(duration: 1.0).repeatForever(autoreverses: false),
                    value: isRotating
                )
                .onAppear { isRotating = true }
                .onDisappear { isRotating = false }

        case .success:
            Image(systemName: "checkmark.circle")
                .foregroundColor(CredoColors.success)

        case .error:
            Image(systemName: "exclamationmark.circle")
                .foregroundColor(CredoColors.danger)
        }
    }

    // MARK: - Status Text

    private var statusText: String {
        switch viewModel.syncStatus {
        case .syncing:
            return "Syncing..."
        case .error(let msg):
            return msg.count > 20 ? "Sync error" : msg
        default:
            return viewModel.lastSyncFormatted
        }
    }
}

#Preview {
    VStack(spacing: 16) {
        SyncStatusBadge()
    }
    .padding()
}
