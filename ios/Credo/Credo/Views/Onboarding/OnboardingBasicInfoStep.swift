import SwiftUI

struct OnboardingBasicInfoStep: View {
    @Binding var name: String
    @Binding var age: Int
    @Binding var sex: String

    var body: some View {
        VStack(alignment: .leading, spacing: 32) {
            // Header
            VStack(alignment: .leading, spacing: 8) {
                Text("Let's get to know you")
                    .font(.credoDisplay(size: 26))
                    .foregroundStyle(CredoColors.textPrimary)

                Text("We'll use this to personalize your training")
                    .font(.credoBody(size: 15, weight: .regular))
                    .foregroundStyle(CredoColors.textSecondary)
            }

            VStack(alignment: .leading, spacing: 20) {
                // Name
                VStack(alignment: .leading, spacing: 6) {
                    Text("Name")
                        .font(.credoBody(size: 13, weight: .semibold))
                        .foregroundStyle(CredoColors.textSecondary)

                    TextField("Your name", text: $name)
                        .font(.credoBody(size: 16, weight: .regular))
                        .foregroundStyle(CredoColors.textPrimary)
                        .padding(12)
                        .background(CredoColors.surface)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(CredoColors.border, lineWidth: 1)
                        )
                }

                // Age
                VStack(alignment: .leading, spacing: 6) {
                    Text("Age")
                        .font(.credoBody(size: 13, weight: .semibold))
                        .foregroundStyle(CredoColors.textSecondary)

                    HStack {
                        Text("\(age)")
                            .font(.credoMono(size: 18, weight: .semibold))
                            .foregroundStyle(CredoColors.textPrimary)
                            .frame(width: 48)

                        Spacer()

                        Stepper("", value: $age, in: 16...80)
                            .labelsHidden()
                    }
                    .padding(12)
                    .background(CredoColors.surface)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(CredoColors.border, lineWidth: 1)
                    )
                }

                // Sex
                VStack(alignment: .leading, spacing: 6) {
                    Text("Sex")
                        .font(.credoBody(size: 13, weight: .semibold))
                        .foregroundStyle(CredoColors.textSecondary)

                    HStack(spacing: 12) {
                        sexPill("Male")
                        sexPill("Female")
                    }
                }
            }

            Spacer()
        }
    }

    private func sexPill(_ value: String) -> some View {
        Button {
            sex = value
        } label: {
            Text(value)
                .font(.credoBody(size: 15, weight: .semibold))
                .foregroundStyle(sex == value ? .white : CredoColors.textPrimary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(sex == value ? CredoColors.accent : CredoColors.surface)
                .clipShape(RoundedRectangle(cornerRadius: 10))
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(sex == value ? Color.clear : CredoColors.border, lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
    }
}
