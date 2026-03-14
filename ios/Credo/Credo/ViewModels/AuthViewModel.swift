import Foundation

@Observable
final class AuthViewModel {
    var email: String = ""
    var password: String = ""
    var name: String = ""
    var confirmPassword: String = ""
    var isLoading: Bool = false
    var errorMessage: String?
    var isLoginMode: Bool = true

    private let authService = AuthService.shared

    // MARK: - Actions

    func login() {
        guard validateFields() else { return }

        isLoading = true
        errorMessage = nil

        Task { @MainActor in
            do {
                try await authService.login(email: email.trimmingCharacters(in: .whitespaces), password: password)
                clearFields()
            } catch {
                errorMessage = error.localizedDescription
            }
            isLoading = false
        }
    }

    func register() {
        guard validateFields() else { return }

        isLoading = true
        errorMessage = nil

        Task { @MainActor in
            do {
                try await authService.register(
                    name: name.trimmingCharacters(in: .whitespaces),
                    email: email.trimmingCharacters(in: .whitespaces),
                    password: password
                )
                clearFields()
            } catch {
                errorMessage = error.localizedDescription
            }
            isLoading = false
        }
    }

    // MARK: - Validation

    func validateFields() -> Bool {
        errorMessage = nil

        if !isLoginMode && name.trimmingCharacters(in: .whitespaces).isEmpty {
            errorMessage = "Name is required."
            return false
        }

        let trimmedEmail = email.trimmingCharacters(in: .whitespaces)
        if trimmedEmail.isEmpty {
            errorMessage = "Email is required."
            return false
        }

        // Basic email format check
        let emailRegex = #"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"#
        if trimmedEmail.range(of: emailRegex, options: .regularExpression) == nil {
            errorMessage = "Please enter a valid email address."
            return false
        }

        if password.count < 8 {
            errorMessage = "Password must be at least 8 characters."
            return false
        }

        if !isLoginMode && password != confirmPassword {
            errorMessage = "Passwords do not match."
            return false
        }

        return true
    }

    // MARK: - Helpers

    private func clearFields() {
        email = ""
        password = ""
        name = ""
        confirmPassword = ""
        errorMessage = nil
    }
}
