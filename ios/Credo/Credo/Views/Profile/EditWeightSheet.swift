import SwiftUI

struct EditWeightSheet: View {
    let store = WorkoutStore.shared
    @State private var weight: Int
    @State private var weightString: String
    @State private var isEditingText: Bool = false
    @Environment(\.dismiss) var dismiss

    init() {
        let currentWeight = WorkoutStore.shared.userProfile?.weight ?? 185
        _weight = State(initialValue: currentWeight)
        _weightString = State(initialValue: "\(currentWeight)")
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Spacer()

                // Current weight display
                VStack(spacing: 4) {
                    Text("Body Weight")
                        .font(.credoBody(size: 14, weight: .medium))
                        .foregroundStyle(CredoColors.textSecondary)

                    if isEditingText {
                        HStack(alignment: .firstTextBaseline, spacing: 4) {
                            TextField("", text: $weightString)
                                .font(.credoMono(size: 48, weight: .bold))
                                .foregroundStyle(CredoColors.textPrimary)
                                .keyboardType(.numberPad)
                                .multilineTextAlignment(.center)
                                .frame(width: 140)
                                .onChange(of: weightString) { _, newValue in
                                    if let parsed = Int(newValue) {
                                        weight = parsed
                                    }
                                }

                            Text("lbs")
                                .font(.credoBody(size: 18, weight: .medium))
                                .foregroundStyle(CredoColors.textTertiary)
                        }
                    } else {
                        Button {
                            isEditingText = true
                        } label: {
                            HStack(alignment: .firstTextBaseline, spacing: 4) {
                                Text("\(weight)")
                                    .font(.credoMono(size: 48, weight: .bold))
                                    .foregroundStyle(CredoColors.textPrimary)

                                Text("lbs")
                                    .font(.credoBody(size: 18, weight: .medium))
                                    .foregroundStyle(CredoColors.textTertiary)
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }

                // Stepper buttons
                HStack(spacing: 32) {
                    Button {
                        if weight > 50 {
                            weight -= 1
                            weightString = "\(weight)"
                        }
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "minus")
                                .font(.system(size: 14, weight: .semibold))
                            Text("1 lb")
                                .font(.credoBody(size: 14, weight: .semibold))
                        }
                        .foregroundStyle(CredoColors.accent)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 12)
                        .background(CredoColors.surface)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(CredoColors.border, lineWidth: 1)
                        )
                    }
                    .buttonStyle(.plain)

                    Button {
                        if weight < 500 {
                            weight += 1
                            weightString = "\(weight)"
                        }
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "plus")
                                .font(.system(size: 14, weight: .semibold))
                            Text("1 lb")
                                .font(.credoBody(size: 14, weight: .semibold))
                        }
                        .foregroundStyle(CredoColors.accent)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 12)
                        .background(CredoColors.surface)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(CredoColors.border, lineWidth: 1)
                        )
                    }
                    .buttonStyle(.plain)
                }

                Spacer()

                // Save button
                Button {
                    store.userProfile?.weight = weight
                    store.save()
                    dismiss()
                } label: {
                    Text("Save")
                        .font(.credoBody(size: 16, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(CredoColors.accent)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 24)
            .background(CredoColors.bg)
            .navigationTitle("Edit Weight")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundStyle(CredoColors.textSecondary)
                }
            }
        }
    }
}
