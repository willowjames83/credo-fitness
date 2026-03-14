import SwiftUI

struct ProteinView: View {
    @State private var vm = ProteinViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Header
                Text("TODAY'S PROTEIN")
                    .font(.credoBody(size: 11, weight: .semibold))
                    .tracking(1.5)
                    .foregroundStyle(CredoColors.textTertiary)
                    .textCase(.uppercase)

                // Protein ring
                ProteinRing(current: vm.current, target: vm.target)

                // Quick add buttons
                QuickAddButtonRow { grams in
                    vm.addGrams(grams)
                }

                // This Week
                SectionHeader(title: "This Week")

                WeeklyBarChart(data: vm.weekData)

                // Saved Meals
                SectionHeader(title: "Saved Meals")

                VStack(spacing: 0) {
                    ForEach(Array(vm.savedMeals.enumerated()), id: \.element.id) { index, meal in
                        SavedMealRow(meal: meal) {
                            vm.addMeal(meal)
                        }

                        if index < vm.savedMeals.count - 1 {
                            Divider()
                                .foregroundStyle(CredoColors.border)
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 4)
                .background(CredoColors.surface)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(CredoColors.border, lineWidth: 1)
                )
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, 24)
        }
    }
}
