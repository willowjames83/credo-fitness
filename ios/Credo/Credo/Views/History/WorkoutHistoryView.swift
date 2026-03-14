import SwiftUI

struct WorkoutHistoryView: View {
    @State private var vm = WorkoutHistoryViewModel()

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
        VStack(spacing: 12) {
            Image(systemName: "dumbbell")
                .font(.system(size: 40))
                .foregroundStyle(CredoColors.textTertiary)

            Text("No workouts yet")
                .font(.credoBody(size: 16, weight: .medium))
                .foregroundStyle(CredoColors.textSecondary)

            Text("Complete your first workout to start tracking your history")
                .font(.credoBody(size: 13, weight: .regular))
                .foregroundStyle(CredoColors.textTertiary)
                .multilineTextAlignment(.center)
        }
        .padding(.horizontal, 40)
        .frame(maxHeight: .infinity)
    }

    private var workoutList: some View {
        ScrollView {
            LazyVStack(spacing: 16, pinnedViews: [.sectionHeaders]) {
                ForEach(vm.groupedWorkouts, id: \.0) { monthLabel, workouts in
                    Section {
                        VStack(spacing: 10) {
                            ForEach(Array(workouts.enumerated()), id: \.offset) { _, workout in
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
