import SwiftUI

struct SetRowView: View {
    let setNumber: Int
    @Binding var weight: Double
    @Binding var reps: String
    let completed: Bool
    let onToggle: () -> Void
    var isWarmup: Bool = false

    @State private var weightText: String = ""

    private var setLabel: String {
        if isWarmup {
            return setNumber == -2 ? "W1" : "W2"
        }
        return "\(setNumber)"
    }

    var body: some View {
        HStack(spacing: 0) {
            // Set number
            Text(setLabel)
                .font(.credoMono(size: 13, weight: .medium))
                .foregroundStyle(isWarmup ? CredoColors.textTertiary : CredoColors.textSecondary)
                .frame(width: 40, alignment: .leading)

            if isWarmup {
                // Read-only weight for warmup
                Text(weight > 0 ? String(format: "%.0f", weight) : "—")
                    .font(.credoMono(size: 14, weight: .medium))
                    .foregroundStyle(CredoColors.textTertiary)
                    .frame(width: 60, alignment: .leading)

                // Read-only reps for warmup
                Text(reps.isEmpty ? "—" : reps)
                    .font(.credoMono(size: 14, weight: .medium))
                    .foregroundStyle(CredoColors.textTertiary)
                    .frame(width: 50, alignment: .leading)
            } else {
                // Weight field
                TextField("0", text: $weightText)
                    .font(.credoMono(size: 14, weight: .semibold))
                    .foregroundStyle(CredoColors.textPrimary)
                    .keyboardType(.decimalPad)
                    .frame(width: 60, alignment: .leading)
                    .multilineTextAlignment(.leading)
                    .onChange(of: weightText) { _, newValue in
                        if let parsed = Double(newValue) {
                            weight = parsed
                        }
                    }

                // Reps field
                TextField("—", text: $reps)
                    .font(.credoMono(size: 14, weight: .semibold))
                    .foregroundStyle(CredoColors.textPrimary)
                    .keyboardType(.numberPad)
                    .frame(width: 50, alignment: .leading)
                    .multilineTextAlignment(.leading)
            }

            Spacer()

            // Completion checkbox
            Button(action: onToggle) {
                ZStack {
                    Circle()
                        .fill(completed
                              ? (isWarmup ? CredoColors.success.opacity(0.08) : CredoColors.success.opacity(0.15))
                              : Color.clear)
                        .frame(width: 28, height: 28)

                    Circle()
                        .stroke(completed
                                ? (isWarmup ? CredoColors.success.opacity(0.5) : CredoColors.success)
                                : (isWarmup ? CredoColors.border.opacity(0.5) : CredoColors.border),
                                lineWidth: 1.5)
                        .frame(width: 28, height: 28)

                    if completed {
                        Image(systemName: "checkmark")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundStyle(isWarmup ? CredoColors.success.opacity(0.5) : CredoColors.success)
                    }
                }
            }
            .buttonStyle(.plain)
        }
        .padding(.vertical, 6)
        .opacity(completed ? (isWarmup ? 0.4 : 0.5) : (isWarmup ? 0.7 : 1.0))
        .onAppear {
            weightText = weight > 0 ? String(format: "%.0f", weight) : ""
        }
    }
}
