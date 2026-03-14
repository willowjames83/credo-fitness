import SwiftUI

struct RegisterView: View {
    @State private var viewModel = AuthViewModel()
    var onSwitchToLogin: (() -> Void)?

    init(onSwitchToLogin: (() -> Void)? = nil) {
        self.onSwitchToLogin = onSwitchToLogin
        let vm = AuthViewModel()
        vm.isLoginMode = false
        _viewModel = State(initialValue: vm)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 28) {
                Spacer()
                    .frame(height: 32)

                // Header
                VStack(spacing: 8) {
                    Text("CREDO")
                        .font(.credoDisplay(size: 36))
                        .foregroundColor(CredoColors.accent)

                    Text("Create your account")
                        .font(.credoBody(size: 16))
                        .foregroundColor(CredoColors.textSecondary)
                }

                // Form Fields
                VStack(spacing: 16) {
                    // Name
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Name")
                            .font(.credoBody(size: 14, weight: .medium))
                            .foregroundColor(CredoColors.textSecondary)

                        TextField("Your name", text: $viewModel.name)
                            .textContentType(.name)
                            .autocapitalization(.words)
                            .padding(12)
                            .background(CredoColors.surface)
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(CredoColors.border, lineWidth: 1)
                            )
                    }

                    // Email
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Email")
                            .font(.credoBody(size: 14, weight: .medium))
                            .foregroundColor(CredoColors.textSecondary)

                        TextField("you@example.com", text: $viewModel.email)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                            .disableAutocorrection(true)
                            .padding(12)
                            .background(CredoColors.surface)
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(CredoColors.border, lineWidth: 1)
                            )
                    }

                    // Password
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Password")
                            .font(.credoBody(size: 14, weight: .medium))
                            .foregroundColor(CredoColors.textSecondary)

                        SecureField("At least 8 characters", text: $viewModel.password)
                            .textContentType(.newPassword)
                            .padding(12)
                            .background(CredoColors.surface)
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(CredoColors.border, lineWidth: 1)
                            )
                    }

                    // Confirm Password
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Confirm Password")
                            .font(.credoBody(size: 14, weight: .medium))
                            .foregroundColor(CredoColors.textSecondary)

                        SecureField("Re-enter password", text: $viewModel.confirmPassword)
                            .textContentType(.newPassword)
                            .padding(12)
                            .background(CredoColors.surface)
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(CredoColors.border, lineWidth: 1)
                            )
                    }
                }

                // Error Message
                if let error = viewModel.errorMessage {
                    Text(error)
                        .font(.credoBody(size: 14))
                        .foregroundColor(CredoColors.danger)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }

                // Create Account Button
                Button(action: { viewModel.register() }) {
                    HStack {
                        if viewModel.isLoading {
                            ProgressView()
                                .tint(.white)
                        }
                        Text("Create Account")
                            .font(.credoBody(size: 16, weight: .semibold))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(CredoColors.accent)
                    .foregroundColor(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .disabled(viewModel.isLoading)
                .opacity(viewModel.isLoading ? 0.7 : 1)

                // Switch to Login
                Button(action: {
                    onSwitchToLogin?()
                }) {
                    Text("Already have an account? Sign In")
                        .font(.credoBody(size: 15, weight: .medium))
                        .foregroundColor(CredoColors.accent)
                }

                Spacer()
            }
            .padding(.horizontal, 24)
        }
        .background(CredoColors.bg.ignoresSafeArea())
    }
}

#Preview {
    RegisterView()
}
