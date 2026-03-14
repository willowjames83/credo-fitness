import Foundation

@Observable
final class AuthService {
    static let shared = AuthService()

    var isLoggedIn: Bool = false
    var currentUserEmail: String?
    var currentUserName: String?
    var authToken: String?

    private let tokenKey = "auth_token"
    private let emailKey = "auth_email"
    private let nameKey = "auth_name"
    private let api = APIClient.shared

    init() {
        restoreSession()
    }

    // MARK: - Public Methods

    func register(name: String, email: String, password: String) async throws {
        let request = RegisterRequest(name: name, email: email, password: password)
        let response: AuthResponse = try await api.post("/api/auth/register", body: request, token: nil)

        saveSession(
            token: response.data.token,
            email: response.data.user.email,
            name: response.data.user.name
        )
    }

    func login(email: String, password: String) async throws {
        let request = LoginRequest(email: email, password: password)
        let response: AuthResponse = try await api.post("/api/auth/login", body: request, token: nil)

        saveSession(
            token: response.data.token,
            email: response.data.user.email,
            name: response.data.user.name
        )
    }

    func logout() {
        KeychainHelper.delete(key: tokenKey)
        UserDefaults.standard.removeObject(forKey: emailKey)
        UserDefaults.standard.removeObject(forKey: nameKey)

        authToken = nil
        currentUserEmail = nil
        currentUserName = nil
        isLoggedIn = false
    }

    func fetchProfile() async throws -> UserResponse {
        guard let token = authToken else { throw APIError.unauthorized }
        let response: UserProfileResponse = try await api.get("/api/auth/me", token: token)
        currentUserEmail = response.data.email
        currentUserName = response.data.name
        return response.data
    }

    func updateProfile(_ fields: UpdateProfileRequest) async throws -> UserResponse {
        guard let token = authToken else { throw APIError.unauthorized }
        let response: UserProfileResponse = try await api.put("/api/auth/me", body: fields, token: token)
        currentUserEmail = response.data.email
        currentUserName = response.data.name
        return response.data
    }

    // MARK: - Private

    private func saveSession(token: String, email: String, name: String) {
        if let tokenData = token.data(using: .utf8) {
            KeychainHelper.save(key: tokenKey, data: tokenData)
        }
        UserDefaults.standard.set(email, forKey: emailKey)
        UserDefaults.standard.set(name, forKey: nameKey)

        authToken = token
        currentUserEmail = email
        currentUserName = name
        isLoggedIn = true
    }

    private func restoreSession() {
        guard let tokenData = KeychainHelper.read(key: tokenKey),
              let token = String(data: tokenData, encoding: .utf8) else {
            return
        }

        authToken = token
        currentUserEmail = UserDefaults.standard.string(forKey: emailKey)
        currentUserName = UserDefaults.standard.string(forKey: nameKey)
        isLoggedIn = true
    }
}
