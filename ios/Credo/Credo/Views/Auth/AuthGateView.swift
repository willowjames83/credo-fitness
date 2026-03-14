import SwiftUI

struct AuthGateView<Content: View>: View {
    @ViewBuilder let content: () -> Content

    private var authService: AuthService { AuthService.shared }

    var body: some View {
        if authService.isLoggedIn {
            content()
        } else {
            LoginView()
        }
    }
}

#Preview {
    AuthGateView {
        Text("Authenticated Content")
    }
}
