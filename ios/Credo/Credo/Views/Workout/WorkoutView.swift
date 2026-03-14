import SwiftUI

struct WorkoutView: View {
    @State private var vm = WorkoutViewModel()

    @State private var showOnboarding: Bool = !WorkoutStore.shared.hasCompletedOnboarding

    var body: some View {
        Group {
            if showOnboarding {
                OnboardingView {
                    withAnimation {
                        showOnboarding = false
                    }
                }
            } else if vm.isWorkoutActive {
                activeWorkoutView
            } else if vm.showWorkoutSummary {
                workoutSummaryView
            } else {
                noActiveWorkoutView
            }
        }
        .sheet(isPresented: $vm.showRIRSheet) {
            RIRSheetView { rir in
                vm.submitRIR(rir)
            }
            .presentationDetents([.medium])
            .presentationDragIndicator(.visible)
        }
        .sheet(isPresented: $vm.showExerciseSwapSheet) {
            if let exercise = vm.session?.currentExercise {
                ExerciseSwapSheet(
                    currentExercise: exercise,
                    alternatives: vm.swapAlternatives,
                    onSwap: { newId in
                        vm.swapExercise(with: newId)
                    }
                )
                .presentationDetents([.large])
                .presentationDragIndicator(.visible)
            }
        }
    }

    // MARK: - Active Workout

    private var activeWorkoutView: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Header
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(vm.session?.dayLabel ?? "Workout")
                            .font(.credoBody(size: 18, weight: .semibold))
                            .foregroundStyle(CredoColors.textPrimary)

                        if let session = vm.session {
                            Text("Week \(session.week) \u{00B7} Exercise \(session.currentExerciseIndex + 1) of \(session.totalExercises)")
                                .font(.credoBody(size: 13, weight: .regular))
                                .foregroundStyle(CredoColors.textSecondary)
                        }
                    }

                    Spacer()

                    Text(vm.elapsedTimeFormatted)
                        .font(.credoMono(size: 16, weight: .semibold))
                        .foregroundStyle(CredoColors.accent)
                }

                // Current exercise - check if it's part of a superset
                if let currentSession = vm.session,
                   currentSession.currentExerciseIndex < currentSession.exercises.count {

                    let currentIndex = currentSession.currentExerciseIndex
                    let exercise = currentSession.exercises[currentIndex]

                    if let groupId = exercise.supersetGroupId,
                       let group = currentSession.supersetGroups.first(where: { $0.id == groupId }) {
                        // Render superset group
                        let groupExercises = group.exerciseIndices.compactMap { idx -> ActiveExercise? in
                            guard idx < currentSession.exercises.count else { return nil }
                            return currentSession.exercises[idx]
                        }
                        let labels = vm.supersetLabels(for: group)

                        SupersetGroupView(
                            supersetGroup: group,
                            exercises: groupExercises,
                            supersetLabels: labels,
                            currentExerciseIndex: currentIndex,
                            onToggleSet: { exerciseIndex, setIndex in
                                vm.toggleSetComplete(exerciseIndex: exerciseIndex, setIndex: setIndex)
                            },
                            onUpdateWeight: { exerciseIndex, setIndex, weight in
                                vm.updateWeight(exerciseIndex: exerciseIndex, setIndex: setIndex, weight: weight)
                            },
                            onUpdateReps: { exerciseIndex, setIndex, reps in
                                vm.updateReps(exerciseIndex: exerciseIndex, setIndex: setIndex, reps: reps)
                            },
                            onCompleteSupersetExercise: { exerciseIndex in
                                vm.completeSupersetExercise(at: exerciseIndex)
                            },
                            onSwapExercise: { exerciseIndex in
                                vm.swapExercise(at: exerciseIndex, with: "")
                                vm.showExerciseSwapSheet = true
                            },
                            onAddSet: { exerciseIndex in
                                vm.addSet(exerciseIndex: exerciseIndex)
                            },
                            onRemoveSet: { exerciseIndex, setIndex in
                                vm.removeSet(exerciseIndex: exerciseIndex, at: setIndex)
                            }
                        )
                    } else {
                        // Regular exercise card (not in a superset)
                        ExerciseCard(
                            exercise: exercise,
                            onToggleSet: { setIndex in
                                vm.toggleSetComplete(setIndex: setIndex)
                            },
                            onUpdateWeight: { setIndex, weight in
                                vm.updateWeight(setIndex: setIndex, weight: weight)
                            },
                            onUpdateReps: { setIndex, reps in
                                vm.updateReps(setIndex: setIndex, reps: reps)
                            },
                            onCompleteExercise: {
                                vm.completeCurrentExercise()
                            },
                            onSwapExercise: {
                                vm.showExerciseSwapSheet = true
                            },
                            onAddSet: {
                                vm.addSet()
                            },
                            onRemoveSet: { index in
                                vm.removeSet(at: index)
                            }
                        )
                    }
                }

                // Rest timer
                if vm.isRestTimerRunning {
                    VStack(spacing: 8) {
                        // Superset next exercise prompt
                        if let nextName = vm.supersetNextExerciseName {
                            HStack(spacing: 6) {
                                Image(systemName: "arrow.right.circle.fill")
                                    .font(.system(size: 14))
                                    .foregroundStyle(CredoColors.accent)
                                Text("Next: \(nextName)")
                                    .font(.credoBody(size: 14, weight: .semibold))
                                    .foregroundStyle(CredoColors.accent)
                            }
                            .padding(.bottom, 4)
                        }

                        RestTimerView(
                            timeFormatted: vm.restTimeFormatted,
                            progress: vm.restTimerProgress,
                            selectedDuration: vm.selectedRestDuration,
                            onSelectDuration: { duration in
                                vm.selectedRestDuration = duration
                                vm.startRestTimer()
                            },
                            onSkip: {
                                vm.skipRestTimer()
                            }
                        )
                    }
                }

                // Upcoming exercises
                if let upcoming = vm.session?.upcomingExercises, !upcoming.isEmpty {
                    SectionHeader(title: "Upcoming")

                    VStack(spacing: 8) {
                        ForEach(upcoming) { exercise in
                            HStack(spacing: 8) {
                                // Show superset label if applicable
                                if let groupId = exercise.supersetGroupId,
                                   let group = vm.session?.supersetGroups.first(where: { $0.id == groupId }) {
                                    let labels = vm.supersetLabels(for: group)
                                    if let exerciseIdx = group.exerciseIndices.firstIndex(where: { idx in
                                        idx < (vm.session?.exercises.count ?? 0) &&
                                        vm.session?.exercises[idx].id == exercise.id
                                    }) {
                                        Text(labels[exerciseIdx])
                                            .font(.credoMono(size: 10, weight: .bold))
                                            .foregroundStyle(.white)
                                            .padding(.horizontal, 5)
                                            .padding(.vertical, 2)
                                            .background(CredoColors.accent)
                                            .clipShape(Capsule())
                                    }
                                }
                                UpcomingExerciseRow(exercise: exercise)
                            }
                        }
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, 24)
        }
    }

    // MARK: - No Active Workout

    private var noActiveWorkoutView: some View {
        ProgramSelectorView { day, template, week in
            vm.startWorkout(from: day, template: template, week: week)
        }
    }

    // MARK: - Workout Summary

    private var workoutSummaryView: some View {
        ScrollView {
            VStack(spacing: 20) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 56))
                    .foregroundStyle(CredoColors.success)
                    .padding(.top, 32)

                Text("Workout Complete")
                    .font(.credoBody(size: 22, weight: .semibold))
                    .foregroundStyle(CredoColors.textPrimary)

                Text(vm.elapsedTimeFormatted)
                    .font(.credoMono(size: 18, weight: .semibold))
                    .foregroundStyle(CredoColors.textSecondary)

                // Total volume
                VStack(spacing: 4) {
                    Text("Total Volume")
                        .font(.credoBody(size: 12, weight: .regular))
                        .foregroundStyle(CredoColors.textTertiary)
                    Text(vm.formattedTotalVolume)
                        .font(.credoMono(size: 28, weight: .bold))
                        .foregroundStyle(CredoColors.textPrimary)
                }

                // Per-exercise breakdown
                VStack(spacing: 0) {
                    ForEach(Array(vm.summaryExercises.enumerated()), id: \.offset) { index, exercise in
                        if index > 0 {
                            Divider()
                        }
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                HStack(spacing: 6) {
                                    Text(exercise.name)
                                        .font(.credoBody(size: 14, weight: .medium))
                                        .foregroundStyle(CredoColors.textPrimary)
                                    if exercise.isPR {
                                        PRBadge()
                                    }
                                }
                                Text("\(exercise.sets) sets")
                                    .font(.credoBody(size: 12, weight: .regular))
                                    .foregroundStyle(CredoColors.textSecondary)
                            }

                            Spacer()

                            Text(formattedVolume(exercise.volume))
                                .font(.credoMono(size: 13, weight: .semibold))
                                .foregroundStyle(CredoColors.textPrimary)
                        }
                        .padding(.vertical, 10)
                    }
                }
                .padding(.horizontal, 16)
                .background(CredoColors.surface)
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(CredoColors.border, lineWidth: 1)
                )

                // PR celebration section
                if !vm.workoutPRs.isEmpty {
                    VStack(alignment: .leading, spacing: 10) {
                        HStack(spacing: 6) {
                            Image(systemName: "star.fill")
                                .font(.system(size: 14))
                                .foregroundStyle(CredoColors.accent)
                            Text("New Personal Records!")
                                .font(.credoBody(size: 15, weight: .semibold))
                                .foregroundStyle(CredoColors.accent)
                        }

                        ForEach(Array(vm.workoutPRs.enumerated()), id: \.offset) { _, pr in
                            HStack {
                                Text(ExerciseLibrary.find(pr.exerciseId)?.name ?? pr.exerciseId)
                                    .font(.credoBody(size: 14, weight: .medium))
                                    .foregroundStyle(CredoColors.textPrimary)

                                Spacer()

                                Text("\(Int(pr.previous1RM)) \u{2192} \(Int(pr.new1RM)) lbs")
                                    .font(.credoMono(size: 13, weight: .semibold))
                                    .foregroundStyle(CredoColors.success)
                            }
                        }
                    }
                    .padding(16)
                    .background(CredoColors.accent.opacity(0.08))
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14)
                            .stroke(CredoColors.accent.opacity(0.3), lineWidth: 1)
                    )
                }

                Button {
                    vm.dismissSummaryAndReset()
                } label: {
                    Text("Done")
                        .font(.credoBody(size: 16, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(CredoColors.accent)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .buttonStyle(.plain)
                .padding(.top, 8)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 24)
        }
    }

    private func summaryRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.credoBody(size: 14, weight: .regular))
                .foregroundStyle(CredoColors.textSecondary)
            Spacer()
            Text(value)
                .font(.credoMono(size: 14, weight: .semibold))
                .foregroundStyle(CredoColors.textPrimary)
        }
    }

    private func formattedVolume(_ volume: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.maximumFractionDigits = 0
        return (formatter.string(from: NSNumber(value: volume)) ?? "\(Int(volume))") + " lbs"
    }
}
