import SwiftUI

struct OnboardingBenchmarksStep: View {
    @Binding var benchPress: String
    @Binding var squat: String
    @Binding var deadlift: String
    @Binding var ohp: String

    var body: some View {
        VStack(alignment: .leading, spacing: 32) {
            // Header
            VStack(alignment: .leading, spacing: 8) {
                Text("Key benchmarks")
                    .font(.credoDisplay(size: 26))
                    .foregroundStyle(CredoColors.textPrimary)

                Text("Do you know any of these numbers? They help us dial in your weights.")
                    .font(.credoBody(size: 15, weight: .regular))
                    .foregroundStyle(CredoColors.textSecondary)
            }

            VStack(spacing: 16) {
                benchmarkField(label: "Bench Press 1RM", placeholder: "e.g. 185", value: $benchPress)
                benchmarkField(label: "Back Squat 1RM", placeholder: "e.g. 225", value: $squat)
                benchmarkField(label: "Deadlift 1RM", placeholder: "e.g. 275", value: $deadlift)
                benchmarkField(label: "Overhead Press 1RM", placeholder: "e.g. 115", value: $ohp)
            }

            Text("All fields are optional. Leave blank to skip.")
                .font(.credoBody(size: 13, weight: .regular))
                .foregroundStyle(CredoColors.textTertiary)

            Spacer()
        }
    }

    private func benchmarkField(label: String, placeholder: String, value: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.credoBody(size: 13, weight: .semibold))
                .foregroundStyle(CredoColors.textSecondary)

            HStack {
                TextField(placeholder, text: value)
                    .font(.credoMono(size: 16, weight: .semibold))
                    .foregroundStyle(CredoColors.textPrimary)
                    .keyboardType(.numberPad)

                if !value.wrappedValue.isEmpty {
                    Text("lbs")
                        .font(.credoBody(size: 13, weight: .medium))
                        .foregroundStyle(CredoColors.textTertiary)
                }
            }
            .padding(12)
            .background(CredoColors.surface)
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(CredoColors.border, lineWidth: 1)
            )
        }
    }
}
