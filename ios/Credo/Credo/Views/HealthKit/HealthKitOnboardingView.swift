import SwiftUI

struct HealthKitOnboardingView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var viewModel = HealthKitViewModel()
    @State private var isConnecting = false

    var onComplete: (() -> Void)?

    var body: some View {
        VStack(spacing: 0) {
            // MARK: - Header
            VStack(spacing: 12) {
                Image(systemName: "heart.text.square.fill")
                    .font(.system(size: 48))
                    .foregroundStyle(CredoColors.accent)
                    .padding(.top, 32)

                Text("Connect Apple Health")
                    .font(.credoDisplay(size: 24))
                    .foregroundStyle(CredoColors.textPrimary)

                Text("Credo uses health data to personalize your training and track recovery metrics.")
                    .font(.credoBody(size: 15))
                    .foregroundStyle(CredoColors.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)
            }
            .padding(.bottom, 24)

            // MARK: - Permission List
            ScrollView {
                VStack(spacing: 0) {
                    ForEach(HealthKitPermissions.permissionDescriptions) { item in
                        PermissionRow(item: item)

                        if item.id != HealthKitPermissions.permissionDescriptions.last?.id {
                            Divider()
                                .foregroundStyle(CredoColors.border)
                                .padding(.leading, 56)
                        }
                    }
                }
                .padding(16)
                .background(CredoColors.surface)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(CredoColors.border, lineWidth: 1)
                )
                .padding(.horizontal, 16)
            }

            Spacer()

            // MARK: - Actions
            VStack(spacing: 12) {
                if let error = viewModel.errorMessage {
                    Text(error)
                        .font(.credoBody(size: 13, weight: .medium))
                        .foregroundStyle(CredoColors.danger)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 16)
                }

                if viewModel.authorizationStatus == .authorized {
                    HStack(spacing: 8) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(CredoColors.success)
                        Text("Connected to Apple Health")
                            .font(.credoBody(size: 16, weight: .semibold))
                            .foregroundStyle(CredoColors.success)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(CredoColors.success.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .onAppear {
                        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                            onComplete?()
                            dismiss()
                        }
                    }
                } else {
                    Button {
                        isConnecting = true
                        Task {
                            await viewModel.requestAccess()
                            isConnecting = false
                        }
                    } label: {
                        HStack(spacing: 8) {
                            if isConnecting {
                                ProgressView()
                                    .tint(.white)
                            }
                            Text("Connect Apple Health")
                                .font(.credoBody(size: 16, weight: .semibold))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(CredoColors.accent)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    .disabled(isConnecting)
                }

                Button {
                    dismiss()
                } label: {
                    Text(viewModel.authorizationStatus == .authorized ? "Done" : "Maybe Later")
                        .font(.credoBody(size: 15))
                        .foregroundStyle(CredoColors.textSecondary)
                }
                .padding(.bottom, 8)
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 16)
        }
        .background(CredoColors.bg)
    }
}

// MARK: - Permission Row

private struct PermissionRow: View {
    let item: HealthKitPermissions.PermissionItem

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: item.iconName)
                .font(.system(size: 18))
                .foregroundStyle(CredoColors.teal)
                .frame(width: 32, height: 32)

            VStack(alignment: .leading, spacing: 2) {
                Text(item.type)
                    .font(.credoBody(size: 15, weight: .medium))
                    .foregroundStyle(CredoColors.textPrimary)

                Text(item.reason)
                    .font(.credoBody(size: 13))
                    .foregroundStyle(CredoColors.textSecondary)
            }

            Spacer()
        }
        .padding(.vertical, 10)
    }
}

#Preview {
    HealthKitOnboardingView()
}
