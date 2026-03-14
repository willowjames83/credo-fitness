import Foundation

// MARK: - Request Models

struct LoginRequest: Encodable {
    let email: String
    let password: String
}

struct RegisterRequest: Encodable {
    let email: String
    let password: String
    let name: String
    let age: Int?
    let sex: String?
    let weight: Int?
    let experienceLevel: String?
    let trainingGoal: String?

    init(name: String, email: String, password: String) {
        self.name = name
        self.email = email
        self.password = password
        self.age = nil
        self.sex = nil
        self.weight = nil
        self.experienceLevel = nil
        self.trainingGoal = nil
    }
}

struct UpdateProfileRequest: Encodable {
    let name: String?
    let age: Int?
    let sex: String?
    let weight: Int?
    let experienceLevel: String?
    let trainingGoal: String?
}

// MARK: - Response Models

struct AuthResponse: Decodable {
    let data: AuthData
}

struct AuthData: Decodable {
    let token: String
    let user: UserResponse
}

struct UserResponse: Decodable {
    let id: String
    let email: String
    let name: String
    let age: Int?
    let sex: String?
    let weight: Int?
    let experienceLevel: String?
    let trainingGoal: String?
    let createdAt: String?
    let updatedAt: String?
}

struct UserProfileResponse: Decodable {
    let data: UserResponse
}
