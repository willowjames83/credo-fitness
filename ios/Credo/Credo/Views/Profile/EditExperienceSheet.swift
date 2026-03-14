import SwiftUI

struct EditExperienceSheet: View {
    let store = WorkoutStore.shared
    @State private var selected: String
    @Environment(\.dismiss) var dismiss

    init() {
        _selected = State(initialValue: WorkoutStore.shared.userProfile?.experienceLevel ?? "intermediate")
    }

    private let levels: [(id: String, title: String, description: String)] = [
        ("beginner", "Beginner", "Less than 1 year of consistent training"),
        ("intermediate", "Intermediate", "1-3 years of consistent training"),
        ("advanced", "Advanced", "3+ years of consistent training"),
    ]

    var body: some View {
        NavigationStack {
            VStack(spacing: 12) {
                ForEach(levels, id: \.id) { level in
                    Button {
                        selected = level.id
                    } label: {
                        VStack(alignment: .leading, spacing: 6) {
                            Text(level.title)
                                .font(.credoBody(size: 16, weight: .semibold))
                                .foregroundStyle(CredoColors.textPrimary)

                            Text(level.description)
                                .font(.credoBody(size: 13, weight: .regular))
                                .foregroundStyle(CredoColors.textSecondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(16)
                        .background(CredoColors.surface)
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .stroke(
                                    selected == level.id ? CredoColors.accent : CredoColors.border,
                                    lineWidth: selected == level.id ? 2 : 1
                                )
                        )
                    }
                    .buttonStyle(.plain)
                }

                Spacer()

                // Save button
                Button {
                    store.userProfile?.experienceLevel = selected
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
            .padding(.top, 8)
            .padding(.bottom, 24)
            .background(CredoColors.bg)
            .navigationTitle("Experience Level")
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
