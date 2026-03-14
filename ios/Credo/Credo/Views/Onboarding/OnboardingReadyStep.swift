import SwiftUI

struct OnboardingReadyStep: View {
    let name: String

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // Checkmark
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 64))
                .foregroundStyle(CredoColors.accent)

            VStack(spacing: 12) {
                Text("You're all set, \(name.isEmpty ? "there" : name)!")
                    .font(.credoDisplay(size: 26))
                    .foregroundStyle(CredoColors.textPrimary)
                    .multilineTextAlignment(.center)

                Text("Choose your program to start training")
                    .font(.credoBody(size: 15, weight: .regular))
                    .foregroundStyle(CredoColors.textSecondary)
                    .multilineTextAlignment(.center)
            }

            Spacer()
        }
        .frame(maxWidth: .infinity)
    }
}
