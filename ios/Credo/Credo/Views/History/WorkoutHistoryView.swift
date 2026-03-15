import SwiftUI

struct WorkoutHistoryView: View {
    @State private var vm = WorkoutHistoryViewModel()
    @State private var emptyStateAppeared = false

    var body: some View {
        Group {
            if vm.groupedWorkouts.isEmpty {
                emptyState
            } else {
                workoutList
            }
        }
        .navigationTitle("Workout History")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var emptyState: some View {
        VStack(spacing: 20) {
            // Layered icon composition
            ZStack {
                Image(systemName: "dumbbell.fill")
                    .font(.system(size: 80, weight: .ultraLight))
                    .foregroundStyle(CredoColors.accent.opacity(0.08))

                Image(systemName: "dumbbell.fill")
                    .font(.system(size: 36, weight: .medium))
                    .foregroundStyle(CredoColors.accent.opacity(0.6))
            }

            VStack(spacing: 8) {
                Text("No workouts yet")
                    .font(.credoDisplay(size: 22))
                    .foregroundStyle(CredoColors.textPrimary)

                Text("Your story starts with one rep")
                    .font(.credoBody(size: 15, weight: .regular))
                    .foregroundStyle(CredoColors.textSecondary)
                    .multilineTextAlignment(.center)
            }

            Button {
                // Navigate to workout tab
                NotificationCenter.default.post(
                    name: Notification.Name("SwitchToWorkoutTab"),
                    object: nil
                )
            } label: {
                Text("Start First Workout")
                    .font(.credoBody(size: 15, weight: .semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 28)
                    .padding(.vertical, 12)
                    .background(CredoColors.accent)
                    .clipShape(Capsule())
            }
            .padding(.top, 4)
        }
        .padding(.horizontal, 40)
        .frame(maxHeight: .infinity)
        .scaleEffect(emptyStateAppeared ? 1 : 0.9)
        .opacity(emptyStateAppeared ? 1 : 0)
        .onAppear {
            withAnimation(.spring(response: 0.6, dampingFraction: 0.75)) {
                emptyStateAppeared = true
            }
        }
    }

    private var workoutList: some View {
        ScrollView {
            LazyVStack(spacing: 16, pinnedViews: [.sectionHeaders]) {
                ForEach(vm.groupedWorkouts, id: \.0) { monthLabel, workouts in
                    Section {
                        VStack(spacing: 10) {
                            ForEach(Array(workouts.enumerated()), id: \.offset) { index, workout in
                                NavigationLink {
                                    WorkoutDetailView(workout: workout)
                                } label: {
                                    WorkoutHistoryRow(
                                        workout: workout,
                                        dayLabel: vm.dayLabel(for: workout),
                                        exerciseCount: workout.exercises.count,
                                        duration: vm.formattedDuration(workout.durationSeconds),
                                        volume: vm.formattedVolume(vm.totalVolume(for: workout)),
                                        hasPR: !vm.prsInWorkout(workout).isEmpty
                                    )
                                }
                                .buttonStyle(.plain)
                                .transition(.move(edge: .bottom).combined(with: .opacity))
                            }
                        }
                    } header: {
                        HStack {
                            Text(monthLabel.uppercased())
                                .font(.credoBody(size: 11, weight: .semibold))
                                .foregroundStyle(CredoColors.textTertiary)
                                .tracking(1.5)
                            Spacer()
                        }
                        .padding(.vertical, 8)
                        .background(CredoColors.bg)
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, 24)
        }
    }
}
