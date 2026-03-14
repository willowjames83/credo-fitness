import SwiftUI

struct AddFoodView: View {
    let selectedDate: Date
    let onAdd: (NutritionEntry) -> Void

    @Environment(\.dismiss) private var dismiss

    @State private var searchText = ""
    @State private var selectedFood: FoodItem?
    @State private var servingCount: Double = 1.0
    @State private var selectedMealType: MealType = .lunch
    @State private var showManualEntry = false

    // Manual entry fields
    @State private var manualName = ""
    @State private var manualCalories = ""
    @State private var manualProtein = ""
    @State private var manualCarbs = ""
    @State private var manualFat = ""
    @State private var manualServingSize = ""

    private var recentFoods: [FoodItem] {
        NutritionStore.shared.recentFoods(limit: 10)
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Meal type picker
                Picker("Meal", selection: $selectedMealType) {
                    ForEach(MealType.allCases) { type in
                        Label(type.displayName, systemImage: type.icon)
                            .tag(type)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)

                if let food = selectedFood {
                    selectedFoodDetail(food)
                } else if showManualEntry {
                    manualEntryForm
                } else {
                    searchSection
                }
            }
            .background(CredoColors.bg)
            .navigationTitle("Add Food")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(CredoColors.textSecondary)
                }

                if selectedFood != nil || showManualEntry {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Add") { saveEntry() }
                            .font(.credoBody(size: 16, weight: .semibold))
                            .foregroundStyle(CredoColors.accent)
                            .disabled(showManualEntry && manualName.isEmpty)
                    }
                }
            }
        }
    }

    // MARK: - Search Section

    @ViewBuilder
    private var searchSection: some View {
        // Search bar
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(CredoColors.textTertiary)
            TextField("Search foods...", text: $searchText)
                .font(.credoBody(size: 15))
                .autocorrectionDisabled()
        }
        .padding(10)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(CredoColors.border, lineWidth: 1))
        .padding(.horizontal, 16)
        .padding(.vertical, 8)

        // Manual entry button
        Button {
            showManualEntry = true
        } label: {
            HStack(spacing: 8) {
                Image(systemName: "square.and.pencil")
                    .font(.system(size: 14))
                Text("Enter manually")
                    .font(.credoBody(size: 14, weight: .medium))
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(CredoColors.textTertiary)
            }
            .foregroundStyle(CredoColors.accent)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
        }

        // Recent foods
        if searchText.isEmpty && !recentFoods.isEmpty {
            HStack {
                Text("RECENT")
                    .font(.credoBody(size: 11, weight: .semibold))
                    .tracking(1.5)
                    .foregroundStyle(CredoColors.textTertiary)
                Spacer()
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)
        }

        FoodSearchView(searchText: $searchText) { food in
            withAnimation(.easeInOut(duration: 0.2)) {
                selectedFood = food
                servingCount = 1.0
            }
        }
    }

    // MARK: - Selected Food Detail

    @ViewBuilder
    private func selectedFoodDetail(_ food: FoodItem) -> some View {
        ScrollView {
            VStack(spacing: 16) {
                // Food info card
                VStack(spacing: 12) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(food.name)
                                .font(.credoBody(size: 18, weight: .semibold))
                                .foregroundStyle(CredoColors.textPrimary)

                            Text(food.servingSize)
                                .font(.credoBody(size: 14))
                                .foregroundStyle(CredoColors.textSecondary)
                        }

                        Spacer()

                        Button {
                            withAnimation { selectedFood = nil }
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundStyle(CredoColors.textTertiary)
                                .font(.system(size: 22))
                        }
                    }

                    Divider()

                    // Serving stepper
                    HStack {
                        Text("Servings")
                            .font(.credoBody(size: 15, weight: .medium))
                            .foregroundStyle(CredoColors.textPrimary)

                        Spacer()

                        HStack(spacing: 16) {
                            Button {
                                if servingCount > 0.5 { servingCount -= 0.5 }
                            } label: {
                                Image(systemName: "minus.circle.fill")
                                    .font(.system(size: 24))
                                    .foregroundStyle(CredoColors.accent)
                            }

                            Text(formatServing(servingCount))
                                .font(.credoMono(size: 18, weight: .semibold))
                                .foregroundStyle(CredoColors.textPrimary)
                                .frame(minWidth: 36)

                            Button {
                                servingCount += 0.5
                            } label: {
                                Image(systemName: "plus.circle.fill")
                                    .font(.system(size: 24))
                                    .foregroundStyle(CredoColors.accent)
                            }
                        }
                    }

                    Divider()

                    // Macro preview
                    let totalCal = Int(Double(food.caloriesPerServing) * servingCount)
                    let totalP = food.proteinPerServing * servingCount
                    let totalC = food.carbsPerServing * servingCount
                    let totalF = food.fatPerServing * servingCount

                    HStack {
                        Text("\(totalCal) calories")
                            .font(.credoDisplay(size: 22))
                            .foregroundStyle(CredoColors.textPrimary)
                        Spacer()
                    }

                    MacroBar(
                        proteinG: totalP,
                        carbsG: totalC,
                        fatG: totalF,
                        showLabels: true,
                        height: 10
                    )
                }
                .padding(16)
                .background(CredoColors.surface)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(CredoColors.border, lineWidth: 1))
            }
            .padding(16)
        }
    }

    // MARK: - Manual Entry

    @ViewBuilder
    private var manualEntryForm: some View {
        ScrollView {
            VStack(spacing: 16) {
                VStack(spacing: 12) {
                    entryField(title: "Food Name", text: $manualName, placeholder: "e.g. Grilled Chicken")
                    entryField(title: "Serving Size", text: $manualServingSize, placeholder: "e.g. 4 oz")

                    Divider()

                    numericField(title: "Calories", text: $manualCalories, placeholder: "0")
                    numericField(title: "Protein (g)", text: $manualProtein, placeholder: "0")
                    numericField(title: "Carbs (g)", text: $manualCarbs, placeholder: "0")
                    numericField(title: "Fat (g)", text: $manualFat, placeholder: "0")
                }
                .padding(16)
                .background(CredoColors.surface)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(CredoColors.border, lineWidth: 1))

                Button {
                    showManualEntry = false
                } label: {
                    Text("Back to search")
                        .font(.credoBody(size: 14, weight: .medium))
                        .foregroundStyle(CredoColors.textSecondary)
                }
            }
            .padding(16)
        }
    }

    @ViewBuilder
    private func entryField(title: String, text: Binding<String>, placeholder: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.credoBody(size: 12, weight: .medium))
                .foregroundStyle(CredoColors.textSecondary)
            TextField(placeholder, text: text)
                .font(.credoBody(size: 15))
                .foregroundStyle(CredoColors.textPrimary)
        }
    }

    @ViewBuilder
    private func numericField(title: String, text: Binding<String>, placeholder: String) -> some View {
        HStack {
            Text(title)
                .font(.credoBody(size: 14, weight: .medium))
                .foregroundStyle(CredoColors.textPrimary)
            Spacer()
            TextField(placeholder, text: text)
                .font(.credoMono(size: 16, weight: .medium))
                .foregroundStyle(CredoColors.textPrimary)
                .keyboardType(.numberPad)
                .multilineTextAlignment(.trailing)
                .frame(width: 80)
        }
    }

    // MARK: - Helpers

    private func saveEntry() {
        if showManualEntry {
            let entry = NutritionEntry(
                name: manualName,
                calories: Int(manualCalories) ?? 0,
                proteinG: Double(manualProtein) ?? 0,
                carbsG: Double(manualCarbs) ?? 0,
                fatG: Double(manualFat) ?? 0,
                mealType: selectedMealType,
                date: selectedDate,
                servingSize: manualServingSize.isEmpty ? nil : manualServingSize,
                servingCount: 1.0
            )
            onAdd(entry)
        } else if let food = selectedFood {
            let entry = food.toEntry(
                mealType: selectedMealType,
                servingCount: servingCount,
                date: selectedDate
            )
            onAdd(entry)
        }
        dismiss()
    }

    private func formatServing(_ count: Double) -> String {
        if count == floor(count) { return "\(Int(count))" }
        return String(format: "%.1f", count)
    }
}

#Preview {
    AddFoodView(selectedDate: Date()) { entry in
        print("Added: \(entry.name)")
    }
}
