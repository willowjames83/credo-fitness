import SwiftUI

struct DashboardView: View {
    @State private var vm = DashboardViewModel()
    var onSwitchToWorkout: (() -> Void)?

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Week label
                Text("WEEK \(vm.store.currentWeek)")
                    .font(.credoBody(size: 11, weight: .semibold))
                    .tracking(1.5)
                    .foregroundStyle(CredoColors.textTertiary)
                    .textCase(.uppercase)

                // Credo Score Ring
                if vm.hasWorkoutData {
                    CredoScoreRing(score: vm.credoScore.score)

                    // Delta
                    if vm.credoScore.delta != 0 {
                        Text("+\(vm.credoScore.delta) from last week")
                            .font(.credoBody(size: 12, weight: .medium))
                            .foregroundStyle(CredoColors.success)
                    }
                } else {
                    // No data state
                    ZStack {
                        Circle()
                            .stroke(CredoColors.surfaceElevated, lineWidth: 10)
                            .frame(width: 160, height: 160)

                        VStack(spacing: 2) {
                            Text("--")
                                .font(.credoMono(size: 44, weight: .bold))
                                .foregroundStyle(CredoColors.textTertiary)

                            Text("No data yet")
                                .font(.credoBody(size: 13, weight: .medium))
                                .foregroundStyle(CredoColors.textTertiary)
                        }
                    }
                }

                // This Week section
                SectionHeader(title: "This Week")
                    .padding(.top, 4)

                VStack(spacing: 10) {
                    ForEach(Pillar.allCases, id: \.self) { pillar in
                        if let pillarScore = vm.pillarScores[pillar] {
                            PillarCard(
                                pillar: pillar,
                                score: pillarScore.score,
                                metrics: pillarScore.metrics,
                                isWeakest: pillarScore.isWeakest
                            )
                        }
                    }
                }

                // Muscle Recovery
                if vm.hasWorkoutData {
                    MuscleRecoveryCard(statuses: vm.muscleRecoveryStatuses)
                        .padding(.top, 4)
                }

                // Health Dashboard
                HealthDashboardCard()
                    .padding(.top, 4)

                // Progression Insights
                if !vm.topProgressionInsights.isEmpty {
                    progressionInsightsSection
                        .padding(.top, 4)
                }

                // Cardio This Week
                cardioSummaryCard
                    .padding(.top, 4)

                // AI Coach Card
                aiCoachCard
                    .padding(.top, 4)

                // Today's Workout
                if !vm.store.hasCompletedOnboarding {
                    onboardingPromptCard
                        .padding(.top, 4)
                } else if vm.hasProgramSelected {
                    TodaysWorkoutCard(
                        name: vm.todayWorkoutName,
                        detail: vm.todayWorkoutDetail,
                        subtitle: vm.todayWorkoutSubtitle,
                        weekProgress: vm.weekProgress,
                        onStartWorkout: {
                            onSwitchToWorkout?()
                        }
                    )
                    .padding(.top, 4)
                } else {
                    setupProgramCard
                        .padding(.top, 4)
                }

                // Recent Workouts
                if !vm.store.workoutHistory.isEmpty {
                    recentWorkoutsSection
                        .padding(.top, 4)
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, 24)
        }
    }

    // MARK: - Recent Workouts

    private var recentWorkoutsSection: some View {
        VStack(spacing: 10) {
            HStack {
                SectionHeader(title: "Recent Workouts")
                Spacer()
                NavigationLink {
                    WorkoutHistoryView()
                } label: {
                    Text("See All")
                        .font(.credoBody(size: 13, weight: .medium))
                        .foregroundStyle(CredoColors.accent)
                }
            }

            VStack(spacing: 8) {
                ForEach(Array(vm.store.workoutHistory.suffix(3).reversed().enumerated()), id: \.offset) { _, workout in
                    NavigationLink {
                        WorkoutDetailView(workout: workout)
                    } label: {
                        recentWorkoutRow(workout)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private func recentWorkoutRow(_ workout: CompletedWorkout) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(dayLabelFor(workout))
                    .font(.credoBody(size: 14, weight: .medium))
                    .foregroundStyle(CredoColors.textPrimary)

                Text(recentDateFormatted(workout.date))
                    .font(.credoBody(size: 12, weight: .regular))
                    .foregroundStyle(CredoColors.textSecondary)
            }

            Spacer()

            Text("\(workout.durationSeconds / 60) min")
                .font(.credoMono(size: 13, weight: .semibold))
                .foregroundStyle(CredoColors.textSecondary)

            Image(systemName: "chevron.right")
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(CredoColors.textTertiary)
        }
        .padding(14)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }

    private func dayLabelFor(_ workout: CompletedWorkout) -> String {
        guard let template = ProgramTemplate(rawValue: workout.programTemplate) else {
            return "Workout"
        }
        let labels = template.dayLabels
        guard workout.dayIndex < labels.count else { return "Workout" }
        return labels[workout.dayIndex]
    }

    private func recentDateFormatted(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE, MMM d"
        return formatter.string(from: date)
    }

    // MARK: - Progression Insights

    private var progressionInsightsSection: some View {
        VStack(spacing: 10) {
            HStack {
                SectionHeader(title: "Progression Insights")
                Spacer()
                NavigationLink {
                    ProgressionView()
                } label: {
                    Text("View All")
                        .font(.credoBody(size: 13, weight: .medium))
                        .foregroundStyle(CredoColors.accent)
                }
            }

            VStack(spacing: 8) {
                ForEach(vm.topProgressionInsights) { insight in
                    NavigationLink {
                        ProgressionView()
                    } label: {
                        ProgressionInsightCard(insight: insight)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    // MARK: - Cardio Summary

    private var cardioSummaryCard: some View {
        NavigationLink {
            CardioView()
        } label: {
            HStack(spacing: 12) {
                Image(systemName: "heart.circle.fill")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(CredoColors.cardio)
                    .frame(width: 36, height: 36)
                    .background(CredoColors.cardioLight)
                    .clipShape(RoundedRectangle(cornerRadius: 10))

                VStack(alignment: .leading, spacing: 2) {
                    Text("Cardio This Week")
                        .font(.credoBody(size: 14, weight: .semibold))
                        .foregroundStyle(CredoColors.textPrimary)

                    Text("\(vm.weeklyCardioMinutes) min \u{00B7} \(vm.weeklyCardioSessions) sessions")
                        .font(.credoBody(size: 12, weight: .regular))
                        .foregroundStyle(CredoColors.textSecondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(CredoColors.textTertiary)
            }
            .padding(14)
            .background(CredoColors.surface)
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(CredoColors.border, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    private var aiCoachCard: some View {
        NavigationLink {
            CoachView()
        } label: {
            HStack(spacing: 12) {
                Image(systemName: "sparkles")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(CredoColors.accent)
                    .frame(width: 36, height: 36)
                    .background(CredoColors.accentLight)
                    .clipShape(RoundedRectangle(cornerRadius: 10))

                VStack(alignment: .leading, spacing: 2) {
                    Text("AI Coach")
                        .font(.credoBody(size: 14, weight: .semibold))
                        .foregroundStyle(CredoColors.textPrimary)

                    Text("Get personalized training advice")
                        .font(.credoBody(size: 12, weight: .regular))
                        .foregroundStyle(CredoColors.textSecondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(CredoColors.textTertiary)
            }
            .padding(14)
            .background(CredoColors.surface)
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(CredoColors.border, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    private var onboardingPromptCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Welcome to Credo")
                .font(.credoBody(size: 13, weight: .semibold))
                .foregroundStyle(CredoColors.textSecondary)

            Text("Set up your profile")
                .font(.credoBody(size: 14, weight: .medium))
                .foregroundStyle(CredoColors.textPrimary)

            Text("Complete a quick setup so we can personalize your training weights and program")
                .font(.credoBody(size: 13, weight: .regular))
                .foregroundStyle(CredoColors.textSecondary)

            Button {
                onSwitchToWorkout?()
            } label: {
                Text("Get Started")
                    .font(.credoBody(size: 14, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(CredoColors.accent)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }
            .padding(.top, 4)
        }
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }

    private var setupProgramCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Get Started")
                .font(.credoBody(size: 13, weight: .semibold))
                .foregroundStyle(CredoColors.textSecondary)

            Text("No program selected")
                .font(.credoBody(size: 14, weight: .medium))
                .foregroundStyle(CredoColors.textPrimary)

            Text("Choose a training program to start tracking your workouts")
                .font(.credoBody(size: 13, weight: .regular))
                .foregroundStyle(CredoColors.textSecondary)

            Button {
                onSwitchToWorkout?()
            } label: {
                Text("Set Up Program")
                    .font(.credoBody(size: 14, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(CredoColors.accent)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }
            .padding(.top, 4)
        }
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }
}
