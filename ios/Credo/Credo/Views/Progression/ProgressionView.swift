import SwiftUI

struct ProgressionView: View {
    @State private var viewModel = ProgressionViewModel()
    @State private var selectedFilter: InsightType?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    summarySection
                    filterPicker
                    insightsSection
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 32)
            }
            .background(CredoColors.bg)
            .navigationTitle("Progression")
            .onAppear { viewModel.refresh() }
        }
    }

    // MARK: - Summary Cards

    private var summarySection: some View {
        HStack(spacing: 12) {
            SummaryCard(
                value: "\(viewModel.progressingCount)",
                label: "Progressing",
                icon: "arrow.up.right",
                iconColor: CredoColors.success
            )
            SummaryCard(
                value: "\(viewModel.plateauCount)",
                label: "Plateaus",
                icon: "exclamationmark.triangle",
                iconColor: CredoColors.warning
            )
            SummaryCard(
                value: "\(viewModel.deloadCount)",
                label: "Deload",
                icon: "arrow.down.right",
                iconColor: CredoColors.danger
            )
        }
    }

    // MARK: - Filter Picker

    private var filterPicker: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                FilterChip(label: "All", isSelected: selectedFilter == nil) {
                    selectedFilter = nil
                }
                ForEach(InsightType.allCases, id: \.self) { type in
                    FilterChip(
                        label: type.label,
                        isSelected: selectedFilter == type,
                        color: type.color
                    ) {
                        selectedFilter = (selectedFilter == type) ? nil : type
                    }
                }
            }
        }
    }

    // MARK: - Insights List

    private var insightsSection: some View {
        let filtered = selectedFilter == nil
            ? viewModel.insights
            : viewModel.insightsForType(selectedFilter!)

        return VStack(spacing: 12) {
            if filtered.isEmpty {
                emptyState
            } else {
                ForEach(filtered) { insight in
                    NavigationLink {
                        ExerciseProgressDetailView(
                            exerciseId: insight.exerciseId,
                            viewModel: viewModel
                        )
                    } label: {
                        ProgressionInsightCard(insight: insight)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "chart.line.uptrend.xyaxis")
                .font(.system(size: 40))
                .foregroundStyle(CredoColors.textTertiary)
            Text("No insights yet")
                .credoBody(size: 16, weight: .semibold)
                .foregroundStyle(CredoColors.textPrimary)
            Text("Complete a few more workouts and progression insights will appear here.")
                .credoBody(size: 14)
                .foregroundStyle(CredoColors.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(.vertical, 40)
    }
}

// MARK: - Summary Card

private struct SummaryCard: View {
    let value: String
    let label: String
    let icon: String
    let iconColor: Color

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(iconColor)
            Text(value)
                .credoMono(size: 22, weight: .bold)
                .foregroundStyle(CredoColors.textPrimary)
            Text(label)
                .credoBody(size: 12)
                .foregroundStyle(CredoColors.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }
}

// MARK: - Filter Chip

private struct FilterChip: View {
    let label: String
    let isSelected: Bool
    var color: Color = CredoColors.accent
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(label)
                .credoBody(size: 13, weight: isSelected ? .semibold : .regular)
                .foregroundStyle(isSelected ? .white : CredoColors.textSecondary)
                .padding(.horizontal, 14)
                .padding(.vertical, 7)
                .background(isSelected ? color : CredoColors.surface)
                .clipShape(Capsule())
                .overlay(
                    Capsule().stroke(
                        isSelected ? color : CredoColors.border,
                        lineWidth: 1
                    )
                )
        }
    }
}

// MARK: - Preview

#Preview {
    ProgressionView()
}
