import SwiftUI

struct HealthDetailView: View {
    @State private var viewModel = HealthKitViewModel()
    @State private var showOnboarding = false

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                if viewModel.authorizationStatus != .authorized {
                    unauthorizedSection
                } else {
                    metricsSection
                    weightEntrySection
                    cardioWorkoutsSection
                    settingsSection
                }
            }
            .padding(16)
        }
        .background(CredoColors.bg)
        .navigationTitle("Health Data")
        .task {
            if viewModel.authorizationStatus == .authorized {
                await viewModel.refresh()
            }
        }
        .refreshable {
            await viewModel.refresh()
        }
        .sheet(isPresented: $showOnboarding) {
            HealthKitOnboardingView {
                Task {
                    await viewModel.refresh()
                }
            }
        }
    }

    // MARK: - Unauthorized

    private var unauthorizedSection: some View {
        VStack(spacing: 16) {
            Image(systemName: "heart.text.square.fill")
                .font(.system(size: 44))
                .foregroundStyle(CredoColors.textTertiary)

            Text("Apple Health Not Connected")
                .font(.credoBody(size: 17, weight: .semibold))
                .foregroundStyle(CredoColors.textPrimary)

            Text("Connect Apple Health to view your body metrics, sleep data, and cardio workouts.")
                .font(.credoBody(size: 15))
                .foregroundStyle(CredoColors.textSecondary)
                .multilineTextAlignment(.center)

            Button {
                showOnboarding = true
            } label: {
                Text("Connect Apple Health")
                    .font(.credoBody(size: 16, weight: .semibold))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(CredoColors.accent)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
        .padding(24)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }

    // MARK: - Metrics Section

    private var metricsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Current Metrics")
                .font(.credoBody(size: 15, weight: .semibold))
                .foregroundStyle(CredoColors.textPrimary)

            VStack(spacing: 0) {
                MetricRow(
                    icon: "scalemass.fill",
                    label: "Weight",
                    value: viewModel.formatWeight(),
                    unit: "lbs",
                    color: CredoColors.nutrition
                )
                Divider().foregroundStyle(CredoColors.border)

                MetricRow(
                    icon: "heart.fill",
                    label: "Resting Heart Rate",
                    value: viewModel.formatHeartRate(),
                    unit: "bpm",
                    color: CredoColors.accent
                )
                Divider().foregroundStyle(CredoColors.border)

                MetricRow(
                    icon: "figure.walk",
                    label: "Today's Steps",
                    value: viewModel.formatSteps(),
                    unit: nil,
                    color: CredoColors.teal
                )
                Divider().foregroundStyle(CredoColors.border)

                MetricRow(
                    icon: "bed.double.fill",
                    label: "Last Night's Sleep",
                    value: viewModel.formatSleep(),
                    unit: nil,
                    color: CredoColors.cardio
                )
                Divider().foregroundStyle(CredoColors.border)

                MetricRow(
                    icon: "figure.run",
                    label: "Weekly Active Minutes",
                    value: viewModel.formatActiveMinutes(),
                    unit: "min",
                    color: CredoColors.teal
                )
            }
            .padding(16)
            .background(CredoColors.surface)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(CredoColors.border, lineWidth: 1)
            )
        }
    }

    // MARK: - Weight Entry

    private var weightEntrySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Log Weight")
                .font(.credoBody(size: 15, weight: .semibold))
                .foregroundStyle(CredoColors.textPrimary)

            VStack(spacing: 12) {
                HStack(spacing: 12) {
                    HStack(spacing: 4) {
                        TextField("e.g. 185", text: $viewModel.weightEntryText)
                            .font(.credoMono(size: 18, weight: .medium))
                            .keyboardType(.decimalPad)

                        Text("lbs")
                            .font(.credoBody(size: 14))
                            .foregroundStyle(CredoColors.textSecondary)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .background(CredoColors.bg)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(CredoColors.border, lineWidth: 1)
                    )

                    Button {
                        Task {
                            await viewModel.saveWeight()
                        }
                    } label: {
                        if viewModel.isSavingWeight {
                            ProgressView()
                                .tint(.white)
                                .frame(width: 60, height: 40)
                        } else {
                            Text("Save")
                                .font(.credoBody(size: 14, weight: .semibold))
                                .foregroundStyle(.white)
                                .frame(width: 60, height: 40)
                        }
                    }
                    .background(CredoColors.accent)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                    .disabled(viewModel.isSavingWeight || viewModel.weightEntryText.isEmpty)
                }

                if let error = viewModel.errorMessage {
                    Text(error)
                        .font(.credoBody(size: 13))
                        .foregroundStyle(CredoColors.danger)
                }

                Text("Saves to Apple Health and updates your Credo profile.")
                    .font(.credoBody(size: 12))
                    .foregroundStyle(CredoColors.textTertiary)
            }
            .padding(16)
            .background(CredoColors.surface)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(CredoColors.border, lineWidth: 1)
            )
        }
    }

    // MARK: - Cardio Workouts

    private var cardioWorkoutsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recent Cardio")
                .font(.credoBody(size: 15, weight: .semibold))
                .foregroundStyle(CredoColors.textPrimary)

            if viewModel.recentCardioWorkouts.isEmpty {
                Text("No cardio workouts found in the last 30 days.")
                    .font(.credoBody(size: 14))
                    .foregroundStyle(CredoColors.textSecondary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 20)
                    .padding(16)
                    .background(CredoColors.surface)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(CredoColors.border, lineWidth: 1)
                    )
            } else {
                VStack(spacing: 0) {
                    ForEach(viewModel.recentCardioWorkouts.prefix(10)) { workout in
                        CardioWorkoutRow(workout: workout)

                        if workout.id != viewModel.recentCardioWorkouts.prefix(10).last?.id {
                            Divider().foregroundStyle(CredoColors.border)
                        }
                    }
                }
                .padding(16)
                .background(CredoColors.surface)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(CredoColors.border, lineWidth: 1)
                )
            }
        }
    }

    // MARK: - Settings

    private var settingsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Settings")
                .font(.credoBody(size: 15, weight: .semibold))
                .foregroundStyle(CredoColors.textPrimary)

            VStack(spacing: 0) {
                Toggle(isOn: $viewModel.autoSyncWeight) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Auto-Sync Weight")
                            .font(.credoBody(size: 15, weight: .medium))
                            .foregroundStyle(CredoColors.textPrimary)

                        Text("Automatically update your profile weight from Apple Health")
                            .font(.credoBody(size: 12))
                            .foregroundStyle(CredoColors.textSecondary)
                    }
                }
                .tint(CredoColors.accent)
                .padding(.vertical, 8)

                Divider().foregroundStyle(CredoColors.border)

                Button {
                    showOnboarding = true
                } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Manage Permissions")
                                .font(.credoBody(size: 15, weight: .medium))
                                .foregroundStyle(CredoColors.textPrimary)

                            Text("Review or update Apple Health data access")
                                .font(.credoBody(size: 12))
                                .foregroundStyle(CredoColors.textSecondary)
                        }
                        Spacer()
                        Image(systemName: "chevron.right")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundStyle(CredoColors.textTertiary)
                    }
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
        }
    }
}

// MARK: - Metric Row

private struct MetricRow: View {
    let icon: String
    let label: String
    let value: String
    let unit: String?
    let color: Color

    var body: some View {
        HStack {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundStyle(color)
                .frame(width: 28)

            Text(label)
                .font(.credoBody(size: 15))
                .foregroundStyle(CredoColors.textPrimary)

            Spacer()

            HStack(spacing: 4) {
                Text(value)
                    .font(.credoMono(size: 16, weight: .semibold))
                    .foregroundStyle(CredoColors.textPrimary)

                if let unit = unit {
                    Text(unit)
                        .font(.credoBody(size: 12))
                        .foregroundStyle(CredoColors.textSecondary)
                }
            }
        }
        .padding(.vertical, 8)
    }
}

// MARK: - Cardio Workout Row

private struct CardioWorkoutRow: View {
    let workout: HealthKitCardioWorkout

    private var iconName: String {
        switch workout.type {
        case .running: return "figure.run"
        case .cycling: return "figure.outdoor.cycle"
        case .rowing: return "figure.rower"
        }
    }

    private var typeName: String {
        workout.type.rawValue.capitalized
    }

    private var dateFormatted: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: workout.date)
    }

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: iconName)
                .font(.system(size: 16))
                .foregroundStyle(CredoColors.cardio)
                .frame(width: 28)

            VStack(alignment: .leading, spacing: 2) {
                Text(typeName)
                    .font(.credoBody(size: 15, weight: .medium))
                    .foregroundStyle(CredoColors.textPrimary)

                Text(dateFormatted)
                    .font(.credoBody(size: 12))
                    .foregroundStyle(CredoColors.textSecondary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text(workout.formattedDuration)
                    .font(.credoMono(size: 14, weight: .medium))
                    .foregroundStyle(CredoColors.textPrimary)

                if let distance = workout.formattedDistance {
                    Text(distance)
                        .font(.credoMono(size: 12))
                        .foregroundStyle(CredoColors.textSecondary)
                }

                if let cals = workout.caloriesBurned {
                    Text("\(Int(cals)) cal")
                        .font(.credoMono(size: 12))
                        .foregroundStyle(CredoColors.textSecondary)
                }
            }
        }
        .padding(.vertical, 8)
    }
}

#Preview {
    NavigationStack {
        HealthDetailView()
    }
}
