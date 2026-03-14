import SwiftUI

struct RIRSheetView: View {
    let onSubmit: (Int) -> Void

    var body: some View {
        VStack(spacing: 24) {
            Text("How many more reps\ncould you have done?")
                .font(.credoBody(size: 18, weight: .semibold))
                .foregroundStyle(CredoColors.textPrimary)
                .multilineTextAlignment(.center)
                .padding(.top, 24)

            HStack(spacing: 12) {
                rirButton(value: 0, label: "0", descriptor: "Maxed out")
                rirButton(value: 1, label: "1-2", descriptor: "Good effort")
                rirButton(value: 3, label: "3+", descriptor: "Felt easy")
            }
            .padding(.horizontal, 16)

            Text("This helps us adjust your\nweights for next session")
                .font(.credoBody(size: 13, weight: .regular))
                .foregroundStyle(CredoColors.textTertiary)
                .multilineTextAlignment(.center)

            Spacer()
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 20)
    }

    private func rirButton(value: Int, label: String, descriptor: String) -> some View {
        Button {
            onSubmit(value)
        } label: {
            VStack(spacing: 8) {
                Text(label)
                    .font(.credoMono(size: 24, weight: .bold))
                    .foregroundStyle(CredoColors.textPrimary)

                Text(descriptor)
                    .font(.credoBody(size: 12, weight: .medium))
                    .foregroundStyle(CredoColors.textSecondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
            .background(CredoColors.surface)
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(CredoColors.border, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}
