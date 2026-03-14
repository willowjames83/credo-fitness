import SwiftUI

struct HealthDashboardCard: View {
    @State private var viewModel = HealthKitViewModel()
    @State private var showOnboarding = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                Image(systemName: "heart.text.square.fill")
                    .font(.system(size: 16))
                    .foregroundStyle(CredoColors.teal)

                Text("Health")
                    .font(.credoBody(size: 15, weight: .semibold))
                    .foregroundStyle(CredoColors.textPrimary)

                Spacer()

                if viewModel.authorizationStatus == .authorized && viewModel.isLoading {
                    ProgressView()
                        .controlSize(.mini)
                }
            }

            if viewModel.authorizationStatus == .authorized {
                // 2x2 Grid
                LazyVGrid(columns: [
                    GridItem(.flexible(), spacing: 12),
                    GridItem(.flexible(), spacing: 12)
                ], spacing: 12) {
                    MetricCell(
                        icon: "figure.walk",
                        value: viewModel.formatSteps(),
                        label: "Steps",
                        color: CredoColors.teal
                    )
                    MetricCell(
                        icon: "heart.fill",
                        value: viewModel.formatHeartRate(),
                        label: "Resting HR",
                        color: CredoColors.accent
                    )
                    MetricCell(
                        icon: "bed.double.fill",
                        value: viewModel.formatSleep(),
                        label: "Sleep",
                        color: CredoColors.cardio
                    )
                    MetricCell(
                        icon: "scalemass.fill",
                        value: viewModel.formatWeight(),
                        label: "Weight",
                        color: CredoColors.nutrition
                    )
                }
            } else {
                // Connect prompt
                VStack(spacing: 8) {
                    Text("Connect Apple Health to see your daily metrics here.")
                        .font(.credoBody(size: 14))
                        .foregroundStyle(CredoColors.textSecondary)
                        .multilineTextAlignment(.center)

                    Button {
                        showOnboarding = true
                    } label: {
                        Text("Connect Health")
                            .font(.credoBody(size: 14, weight: .semibold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 10)
                            .background(CredoColors.accent)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
            }
        }
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
        .task {
            if viewModel.authorizationStatus == .authorized {
                await viewModel.refresh()
            }
        }
        .sheet(isPresented: $showOnboarding) {
            HealthKitOnboardingView {
                Task {
                    await viewModel.refresh()
                }
            }
        }
    }
}

// MARK: - Metric Cell

private struct MetricCell: View {
    let icon: String
    let value: String
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 14))
                .foregroundStyle(color)

            Text(value)
                .font(.credoMono(size: 18, weight: .semibold))
                .foregroundStyle(CredoColors.textPrimary)

            Text(label)
                .font(.credoBody(size: 11))
                .foregroundStyle(CredoColors.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 10)
        .background(CredoColors.bg)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

#Preview {
    VStack {
        HealthDashboardCard()
            .padding(16)
    }
    .background(CredoColors.bg)
}
