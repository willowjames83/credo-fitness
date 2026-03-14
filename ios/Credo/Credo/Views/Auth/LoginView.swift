import SwiftUI

struct LoginView: View {
    @State private var viewModel = AuthViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                Spacer()
                    .frame(height: 40)

                // Logo / Wordmark
                VStack(spacing: 8) {
                    Text("CREDO")
                        .font(.credoDisplay(size: 36))
                        .foregroundColor(CredoColors.accent)

                    Text("Sign in to sync your data")
                        .font(.credoBody(size: 16))
                        .foregroundColor(CredoColors.textSecondary)
                }

                // Form Fields
                VStack(spacing: 16) {
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

                        SecureField("Enter password", text: $viewModel.password)
                            .textContentType(.password)
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

                // Sign In Button
                Button(action: { viewModel.login() }) {
                    HStack {
                        if viewModel.isLoading {
                            ProgressView()
                                .tint(.white)
                        }
                        Text("Sign In")
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

                // Create Account Link
                Button(action: { viewModel.isLoginMode = false }) {
                    Text("Create Account")
                        .font(.credoBody(size: 15, weight: .medium))
                        .foregroundColor(CredoColors.accent)
                }

                Spacer()
            }
            .padding(.horizontal, 24)
        }
        .background(CredoColors.bg.ignoresSafeArea())
        .sheet(isPresented: Binding(
            get: { !viewModel.isLoginMode },
            set: { if $0 { viewModel.isLoginMode = false } else { viewModel.isLoginMode = true } }
        )) {
            RegisterView(onSwitchToLogin: {
                viewModel.isLoginMode = true
            })
        }
    }
}

#Preview {
    LoginView()
}
