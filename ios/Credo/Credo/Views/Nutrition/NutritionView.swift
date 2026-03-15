import SwiftUI

struct NutritionView: View {
    @State private var vm = NutritionViewModel()
    @State private var emptyStateAppeared = false

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            ScrollView {
                VStack(spacing: 16) {
                    // Date Navigation
                    dateNavigator

                    // Macro Rings
                    MacroRingsView(
                        caloriesRemaining: vm.caloriesRemaining,
                        calorieTarget: vm.dailyTarget.calorieTarget,
                        proteinProgress: vm.proteinProgress,
                        carbProgress: vm.carbProgress,
                        fatProgress: vm.fatProgress
                    )

                    // Ring Legend
                    MacroRingLegend(
                        proteinG: vm.proteinConsumed,
                        proteinTarget: vm.dailyTarget.proteinTargetG,
                        carbsG: vm.carbsConsumed,
                        carbTarget: vm.dailyTarget.carbTargetG,
                        fatG: vm.fatConsumed,
                        fatTarget: vm.dailyTarget.fatTargetG
                    )

                    // Calorie summary bar
                    calorieSummaryBar

                    // Weekly view button
                    Button {
                        vm.showingWeeklyView = true
                    } label: {
                        HStack {
                            Image(systemName: "chart.bar.fill")
                                .font(.system(size: 14))
                            Text("Weekly Overview")
                                .font(.credoBody(size: 14, weight: .medium))
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundStyle(CredoColors.textTertiary)
                        }
                        .foregroundStyle(CredoColors.accent)
                        .padding(16)
                        .background(CredoColors.surface)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(CredoColors.border, lineWidth: 1))
                    }

                    // Meal Log Sections
                    if vm.entriesByMealType.isEmpty {
                        emptyState
                    } else {
                        ForEach(vm.entriesByMealType, id: \.0) { mealType, entries in
                            MealLogSection(
                                mealType: mealType,
                                entries: entries,
                                onDelete: { offsets in
                                    vm.deleteEntries(at: offsets, from: entries)
                                }
                            )
                        }
                    }

                    // Bottom spacing for FAB
                    Spacer().frame(height: 80)
                }
                .padding(.horizontal, 20)
                .padding(.top, 8)
                .padding(.bottom, 24)
            }

            // Floating Action Button
            Button {
                vm.showingAddFood = true
            } label: {
                Image(systemName: "plus")
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(width: 56, height: 56)
                    .background(CredoColors.accent)
                    .clipShape(Circle())
                    .shadow(color: CredoColors.accent.opacity(0.3), radius: 8, x: 0, y: 4)
            }
            .padding(.trailing, 20)
            .padding(.bottom, 20)
        }
        .sheet(isPresented: $vm.showingAddFood) {
            AddFoodView(selectedDate: vm.selectedDate) { entry in
                vm.addEntry(entry)
            }
        }
        .sheet(isPresented: $vm.showingWeeklyView) {
            NutritionWeeklyView(
                data: vm.last7DaysMacros,
                calorieTarget: vm.dailyTarget.calorieTarget
            )
        }
    }

    // MARK: - Date Navigator

    @ViewBuilder
    private var dateNavigator: some View {
        HStack {
            Button {
                vm.goToPreviousDay()
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(CredoColors.textSecondary)
                    .frame(width: 32, height: 32)
            }

            Spacer()

            Button {
                vm.goToToday()
            } label: {
                Text(vm.formattedDate)
                    .font(.credoBody(size: 15, weight: .semibold))
                    .foregroundStyle(CredoColors.textPrimary)
            }

            Spacer()

            Button {
                vm.goToNextDay()
            } label: {
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(vm.isToday ? CredoColors.textTertiary : CredoColors.textSecondary)
                    .frame(width: 32, height: 32)
            }
            .disabled(vm.isToday)
        }
        .padding(.horizontal, 4)
    }

    // MARK: - Calorie Summary Bar

    @ViewBuilder
    private var calorieSummaryBar: some View {
        HStack(spacing: 0) {
            summaryCell(label: "Eaten", value: "\(vm.caloriesConsumed)")
            Divider().frame(height: 32)
            summaryCell(label: "Target", value: "\(vm.dailyTarget.calorieTarget)")
            Divider().frame(height: 32)
            summaryCell(label: "Remaining", value: "\(vm.caloriesRemaining)")
        }
        .padding(12)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(CredoColors.border, lineWidth: 1))
    }

    @ViewBuilder
    private func summaryCell(label: String, value: String) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.credoMono(size: 16, weight: .semibold))
                .foregroundStyle(CredoColors.textPrimary)
            Text(label)
                .font(.credoBody(size: 11))
                .foregroundStyle(CredoColors.textTertiary)
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Empty State

    @ViewBuilder
    private var emptyState: some View {
        VStack(spacing: 14) {
            Image(systemName: "fork.knife")
                .font(.system(size: 36, weight: .light))
                .foregroundStyle(CredoColors.nutrition)

            VStack(spacing: 6) {
                Text("Fuel your performance")
                    .font(.credoDisplay(size: 18))
                    .foregroundStyle(CredoColors.textPrimary)

                Text("Tap + to start tracking your nutrition")
                    .font(.credoBody(size: 14))
                    .foregroundStyle(CredoColors.textSecondary)
            }

            Button {
                vm.showingAddFood = true
            } label: {
                Text("Log Your First Meal")
                    .font(.credoBody(size: 14, weight: .semibold))
                    .foregroundStyle(CredoColors.nutrition)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(CredoColors.nutritionLight)
                    .clipShape(Capsule())
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 32)
        .padding(.horizontal, 20)
        .background(
            LinearGradient(
                colors: [
                    CredoColors.nutritionLight.opacity(0.5),
                    CredoColors.surface
                ],
                startPoint: .top,
                endPoint: .bottom
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
        .scaleEffect(emptyStateAppeared ? 1 : 0.95)
        .opacity(emptyStateAppeared ? 1 : 0)
        .onAppear {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) {
                emptyStateAppeared = true
            }
        }
    }
}

#Preview {
    NutritionView()
}
