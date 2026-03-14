import SwiftUI

struct MealLogSection: View {
    let mealType: MealType
    let entries: [NutritionEntry]
    let onDelete: (IndexSet) -> Void

    @State private var isExpanded = true

    private var totalCalories: Int {
        entries.reduce(0) { $0 + $1.totalCalories }
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header
            Button {
                withAnimation(.easeInOut(duration: 0.2)) {
                    isExpanded.toggle()
                }
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: mealType.icon)
                        .font(.system(size: 14))
                        .foregroundStyle(CredoColors.accent)

                    Text(mealType.displayName)
                        .font(.credoBody(size: 14, weight: .semibold))
                        .foregroundStyle(CredoColors.textPrimary)

                    Spacer()

                    Text("\(totalCalories) cal")
                        .font(.credoMono(size: 13, weight: .medium))
                        .foregroundStyle(CredoColors.textSecondary)

                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(CredoColors.textTertiary)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
            }
            .buttonStyle(.plain)

            if isExpanded {
                Divider()
                    .foregroundStyle(CredoColors.border)

                ForEach(Array(entries.enumerated()), id: \.element.id) { index, entry in
                    NutritionEntryRow(entry: entry)
                        .padding(.horizontal, 16)
                        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                            Button(role: .destructive) {
                                onDelete(IndexSet(integer: index))
                            } label: {
                                Label("Delete", systemImage: "trash")
                            }
                        }

                    if index < entries.count - 1 {
                        Divider()
                            .padding(.leading, 16)
                    }
                }
            }
        }
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }
}

#Preview {
    MealLogSection(
        mealType: .breakfast,
        entries: Array(MockNutrition.entries.prefix(2)),
        onDelete: { _ in }
    )
    .padding()
}
