import SwiftUI

struct FoodSearchView: View {
    @Binding var searchText: String
    let onSelect: (FoodItem) -> Void

    private var results: [FoodItem] {
        let dbResults = FoodDatabase.search(query: searchText)
        let customResults = NutritionStore.shared.customFoods.filter { food in
            searchText.isEmpty || food.name.lowercased().contains(searchText.lowercased())
        }
        return customResults + dbResults
    }

    var body: some View {
        List {
            if results.isEmpty {
                VStack(spacing: 8) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 28))
                        .foregroundStyle(CredoColors.textTertiary)
                    Text("No foods found")
                        .font(.credoBody(size: 15, weight: .medium))
                        .foregroundStyle(CredoColors.textSecondary)
                    Text("Try a different search or add manually")
                        .font(.credoBody(size: 13))
                        .foregroundStyle(CredoColors.textTertiary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 40)
                .listRowBackground(Color.clear)
                .listRowSeparator(.hidden)
            } else {
                ForEach(results) { food in
                    Button {
                        onSelect(food)
                    } label: {
                        FoodSearchRow(food: food)
                    }
                    .listRowBackground(Color.clear)
                }
            }
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
    }
}

struct FoodSearchRow: View {
    let food: FoodItem

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 3) {
                Text(food.name)
                    .font(.credoBody(size: 15, weight: .medium))
                    .foregroundStyle(CredoColors.textPrimary)
                    .lineLimit(1)

                HStack(spacing: 6) {
                    if let brand = food.brand, !brand.isEmpty {
                        Text(brand)
                            .font(.credoBody(size: 12))
                            .foregroundStyle(CredoColors.textTertiary)

                        Text("·")
                            .foregroundStyle(CredoColors.textTertiary)
                    }

                    Text(food.servingSize)
                        .font(.credoBody(size: 12))
                        .foregroundStyle(CredoColors.textTertiary)
                }

                Text(food.macroSummary)
                    .font(.credoMono(size: 11))
                    .foregroundStyle(CredoColors.textSecondary)
            }

            Spacer()

            Text("\(food.caloriesPerServing)")
                .font(.credoMono(size: 16, weight: .semibold))
                .foregroundStyle(CredoColors.textPrimary)
            Text("cal")
                .font(.credoBody(size: 11))
                .foregroundStyle(CredoColors.textTertiary)
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    FoodSearchView(searchText: .constant("chicken")) { food in
        print(food.name)
    }
}
