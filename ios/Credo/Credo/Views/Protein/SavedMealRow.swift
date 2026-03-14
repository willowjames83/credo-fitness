import SwiftUI

struct SavedMealRow: View {
    let meal: SavedMeal
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack {
                Text(meal.name)
                    .font(.credoBody(size: 14, weight: .medium))
                    .foregroundStyle(CredoColors.textPrimary)

                Spacer()

                Text("\(meal.grams)g")
                    .font(.credoMono(size: 14, weight: .medium))
                    .foregroundStyle(CredoColors.nutrition)

                Image(systemName: "chevron.right")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(CredoColors.textTertiary)
            }
            .padding(.vertical, 12)
        }
        .buttonStyle(.plain)
    }
}
