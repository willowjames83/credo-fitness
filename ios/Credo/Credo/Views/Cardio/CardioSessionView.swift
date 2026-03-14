import SwiftUI

struct CardioSessionView: View {
    @Bindable var vm: CardioViewModel
    @State private var distanceInput: String = ""
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button {
                    vm.cancelSession()
                    dismiss()
                } label: {
                    Text("Cancel")
                        .font(.credoBody(size: 15, weight: .medium))
                        .foregroundStyle(CredoColors.textSecondary)
                }

                Spacer()

                Text(vm.activeSessionType.displayName)
                    .font(.credoBody(size: 15, weight: .semibold))
                    .foregroundStyle(CredoColors.textPrimary)

                Spacer()

                // Invisible balance
                Text("Cancel")
                    .font(.credoBody(size: 15, weight: .medium))
                    .foregroundStyle(.clear)
            }
            .padding(.horizontal, 20)
            .padding(.top, 16)
            .padding(.bottom, 8)

            Spacer()

            // Activity Icon
            Image(systemName: vm.activeSessionType.icon)
                .font(.system(size: 48, weight: .light))
                .foregroundStyle(CredoColors.cardio)
                .padding(.bottom, 24)

            // Timer Display
            Text(vm.formattedElapsedTime)
                .font(.credoMono(size: 64, weight: .bold))
                .foregroundStyle(CredoColors.textPrimary)
                .monospacedDigit()

            Text("Duration")
                .font(.credoBody(size: 13, weight: .medium))
                .foregroundStyle(CredoColors.textSecondary)
                .padding(.top, 4)

            Spacer()

            // Optional Distance Field
            if vm.activeSessionType.defaultMetrics.contains(.distance) {
                VStack(spacing: 6) {
                    Text("Distance (miles)")
                        .font(.credoBody(size: 12, weight: .medium))
                        .foregroundStyle(CredoColors.textSecondary)

                    TextField("0.0", text: $distanceInput)
                        .font(.credoMono(size: 18, weight: .medium))
                        .foregroundStyle(CredoColors.textPrimary)
                        .multilineTextAlignment(.center)
                        .keyboardType(.decimalPad)
                        .frame(width: 120)
                        .padding(.vertical, 8)
                        .padding(.horizontal, 16)
                        .background(CredoColors.surface)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(CredoColors.border, lineWidth: 1)
                        )
                        .onChange(of: distanceInput) { _, newValue in
                            if let miles = Double(newValue) {
                                vm.activeDistanceMeters = miles * 1609.34
                            } else {
                                vm.activeDistanceMeters = nil
                            }
                        }
                }
                .padding(.bottom, 24)
            }

            // Complete Button
            Button {
                vm.stopSession()
                dismiss()
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "checkmark")
                        .font(.system(size: 15, weight: .bold))
                    Text("Complete")
                        .font(.credoBody(size: 16, weight: .semibold))
                }
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(CredoColors.accent)
                .clipShape(RoundedRectangle(cornerRadius: 14))
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 32)
        }
        .background(CredoColors.bg)
    }
}
