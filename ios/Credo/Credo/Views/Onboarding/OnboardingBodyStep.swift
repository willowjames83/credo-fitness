import SwiftUI

struct OnboardingBodyStep: View {
    @Binding var weight: String
    @Binding var heightFeet: Int
    @Binding var heightInches: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 32) {
            // Header
            VStack(alignment: .leading, spacing: 8) {
                Text("Your body")
                    .font(.credoDisplay(size: 26))
                    .foregroundStyle(CredoColors.textPrimary)

                Text("We use your weight to calculate starting loads")
                    .font(.credoBody(size: 15, weight: .regular))
                    .foregroundStyle(CredoColors.textSecondary)
            }

            VStack(alignment: .leading, spacing: 20) {
                // Weight
                VStack(alignment: .leading, spacing: 6) {
                    Text("Weight (lbs)")
                        .font(.credoBody(size: 13, weight: .semibold))
                        .foregroundStyle(CredoColors.textSecondary)

                    TextField("185", text: $weight)
                        .font(.credoMono(size: 18, weight: .semibold))
                        .foregroundStyle(CredoColors.textPrimary)
                        .keyboardType(.numberPad)
                        .padding(12)
                        .background(CredoColors.surface)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(CredoColors.border, lineWidth: 1)
                        )
                }

                // Height (optional)
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text("Height")
                            .font(.credoBody(size: 13, weight: .semibold))
                            .foregroundStyle(CredoColors.textSecondary)

                        Text("(optional)")
                            .font(.credoBody(size: 12, weight: .regular))
                            .foregroundStyle(CredoColors.textTertiary)
                    }

                    HStack(spacing: 12) {
                        // Feet
                        HStack(spacing: 4) {
                            Picker("Feet", selection: $heightFeet) {
                                ForEach(4...7, id: \.self) { ft in
                                    Text("\(ft)").tag(ft)
                                }
                            }
                            .pickerStyle(.wheel)
                            .frame(width: 60, height: 100)
                            .clipped()

                            Text("ft")
                                .font(.credoBody(size: 14, weight: .medium))
                                .foregroundStyle(CredoColors.textSecondary)
                        }

                        // Inches
                        HStack(spacing: 4) {
                            Picker("Inches", selection: $heightInches) {
                                ForEach(0...11, id: \.self) { inch in
                                    Text("\(inch)").tag(inch)
                                }
                            }
                            .pickerStyle(.wheel)
                            .frame(width: 60, height: 100)
                            .clipped()

                            Text("in")
                                .font(.credoBody(size: 14, weight: .medium))
                                .foregroundStyle(CredoColors.textSecondary)
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

            Spacer()
        }
    }
}
