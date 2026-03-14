import SwiftUI

struct ProgramSelectorView: View {
    let store = WorkoutStore.shared
    let onStartWorkout: (ProgramDay, ProgramTemplate, Int) -> Void

    @State private var showingPicker: Bool = false

    var body: some View {
        if let program = store.selectedProgram, !showingPicker {
            dayScheduleView(program: program)
        } else {
            templatePickerView
        }
    }

    // MARK: - Template Picker (State 1)

    private var templatePickerView: some View {
        ScrollView {
            VStack(spacing: 20) {
                VStack(spacing: 8) {
                    Text("Choose Your Program")
                        .font(.credoDisplay(size: 24))
                        .foregroundStyle(CredoColors.textPrimary)

                    Text("Select a training split that fits your schedule")
                        .font(.credoBody(size: 14, weight: .regular))
                        .foregroundStyle(CredoColors.textSecondary)
                }
                .padding(.top, 8)

                VStack(spacing: 12) {
                    ForEach(ProgramTemplate.allCases) { template in
                        templateCard(template)
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 24)
        }
    }

    private func templateCard(_ template: ProgramTemplate) -> some View {
        Button {
            store.selectedProgram = template
            store.currentDayIndex = 0
            store.currentWeek = 1
            store.save()
            showingPicker = false
        } label: {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text(template.displayName)
                        .font(.credoBody(size: 16, weight: .semibold))
                        .foregroundStyle(CredoColors.textPrimary)

                    Spacer()

                    Text("\(template.daysPerWeek) days")
                        .font(.credoBody(size: 12, weight: .semibold))
                        .foregroundStyle(CredoColors.accent)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(CredoColors.accentLight)
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                }

                Text(template.levelRequirement)
                    .font(.credoBody(size: 13, weight: .regular))
                    .foregroundStyle(CredoColors.textSecondary)

                HStack(spacing: 6) {
                    ForEach(template.dayLabels, id: \.self) { label in
                        Text(label)
                            .font(.credoBody(size: 11, weight: .medium))
                            .foregroundStyle(CredoColors.textTertiary)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(CredoColors.surface)
                            .clipShape(RoundedRectangle(cornerRadius: 6))
                            .overlay(
                                RoundedRectangle(cornerRadius: 6)
                                    .stroke(CredoColors.border, lineWidth: 1)
                            )
                    }
                }
            }
            .padding(16)
            .background(CredoColors.surface)
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(CredoColors.border, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Day Schedule (State 2)

    private func dayScheduleView(program: ProgramTemplate) -> some View {
        let userWeight = store.userProfile?.weight ?? mockUser.weight
        let days = ProgramGenerator.generateDays(for: program, userWeight: userWeight)
        let nextDayIndex = store.currentDayIndex % days.count

        return ScrollView {
            VStack(spacing: 16) {
                // Header section
                VStack(spacing: 6) {
                    Text(program.displayName)
                        .font(.credoDisplay(size: 24))
                        .foregroundStyle(CredoColors.textPrimary)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    Rectangle()
                        .fill(CredoColors.border)
                        .frame(height: 1)

                    HStack {
                        Text("Week \(store.currentWeek) of your program")
                            .font(.credoBody(size: 14, weight: .medium))
                            .foregroundStyle(CredoColors.textSecondary)

                        Spacer()

                        Text("\(store.totalWorkoutsCompleted) workouts completed")
                            .font(.credoBody(size: 12, weight: .regular))
                            .foregroundStyle(CredoColors.textTertiary)
                    }
                }

                // This week's workouts
                VStack(alignment: .leading, spacing: 4) {
                    Text("This Week")
                        .font(.credoBody(size: 13, weight: .semibold))
                        .foregroundStyle(CredoColors.textSecondary)
                        .padding(.bottom, 4)

                    VStack(spacing: 10) {
                        ForEach(Array(days.enumerated()), id: \.element.id) { index, day in
                            let isCompleted = store.isDayCompletedThisWeek(dayIndex: index)
                            let isNext = index == nextDayIndex && !isCompleted
                            let isFuture = index > nextDayIndex && !isCompleted
                            dayCard(day: day, index: index, isCompleted: isCompleted, isNext: isNext, isFuture: isFuture, program: program)
                        }
                    }
                }

                // Program continuation message
                VStack(spacing: 8) {
                    Rectangle()
                        .fill(CredoColors.border)
                        .frame(height: 1)

                    Text("Your program continues each week with progressive overload \u{2014} weights adjust based on your performance.")
                        .font(.credoBody(size: 13, weight: .regular))
                        .foregroundStyle(CredoColors.textSecondary)
                        .multilineTextAlignment(.center)

                    Text("Week \(store.currentWeek + 1) starts after you complete this week\u{2019}s workouts.")
                        .font(.credoBody(size: 13, weight: .medium))
                        .foregroundStyle(CredoColors.teal)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 4)

                Button {
                    showingPicker = true
                } label: {
                    Text("Change Program")
                        .font(.credoBody(size: 14, weight: .medium))
                        .foregroundStyle(CredoColors.accent)
                }
                .padding(.top, 8)
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, 24)
        }
    }

    private func dayCard(day: ProgramDay, index: Int, isCompleted: Bool, isNext: Bool, isFuture: Bool, program: ProgramTemplate) -> some View {
        let estimatedMinutes = day.exercises.count * 8
        let completedWorkout = store.completedWorkoutForDay(index)

        return HStack {
            if isNext {
                RoundedRectangle(cornerRadius: 2)
                    .fill(CredoColors.accent)
                    .frame(width: 3)
            }

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    if isCompleted {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 14))
                            .foregroundStyle(CredoColors.success)
                    } else if isNext {
                        Circle()
                            .fill(CredoColors.accent)
                            .frame(width: 8, height: 8)
                    } else {
                        Circle()
                            .fill(CredoColors.border)
                            .frame(width: 8, height: 8)
                    }

                    Text("Day \(index + 1): \(day.label)")
                        .font(.credoBody(size: 15, weight: isNext ? .semibold : .medium))
                        .foregroundStyle(isFuture ? CredoColors.textTertiary : CredoColors.textPrimary)

                    Spacer()

                    if isCompleted {
                        Text("Completed")
                            .font(.credoBody(size: 11, weight: .semibold))
                            .foregroundStyle(CredoColors.success)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(CredoColors.successLight)
                            .clipShape(RoundedRectangle(cornerRadius: 6))
                    } else if isNext {
                        Text("Up Next")
                            .font(.credoBody(size: 11, weight: .semibold))
                            .foregroundStyle(CredoColors.accent)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(CredoColors.accentLight)
                            .clipShape(RoundedRectangle(cornerRadius: 6))
                    }
                }

                if isCompleted, let completed = completedWorkout {
                    let completedDate = completed.date
                    let formatter = Self.dayDateFormatter
                    let durationMin = completed.durationSeconds / 60

                    Text(formatter.string(from: completedDate))
                        .font(.credoBody(size: 13, weight: .regular))
                        .foregroundStyle(CredoColors.textTertiary)
                        .padding(.leading, 22)

                    Text("\(day.exercises.count) exercises \u{00B7} \(durationMin) min")
                        .font(.credoBody(size: 13, weight: .regular))
                        .foregroundStyle(CredoColors.textSecondary)
                        .padding(.leading, 22)
                } else if isNext {
                    Text("Up next")
                        .font(.credoBody(size: 13, weight: .regular))
                        .foregroundStyle(CredoColors.accent)
                        .padding(.leading, 20)

                    Text("\(day.exercises.count) exercises \u{00B7} ~\(estimatedMinutes) min")
                        .font(.credoBody(size: 13, weight: .regular))
                        .foregroundStyle(CredoColors.textSecondary)
                        .padding(.leading, 20)

                    Button {
                        onStartWorkout(day, program, store.currentWeek)
                    } label: {
                        HStack(spacing: 4) {
                            Text("Start Workout")
                                .font(.credoBody(size: 13, weight: .semibold))
                            Image(systemName: "arrow.right")
                                .font(.system(size: 11, weight: .semibold))
                        }
                        .foregroundStyle(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(CredoColors.accent)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                    .padding(.leading, 20)
                    .padding(.top, 2)
                } else {
                    Text("\(day.exercises.count) exercises \u{00B7} ~\(estimatedMinutes) min")
                        .font(.credoBody(size: 13, weight: .regular))
                        .foregroundStyle(CredoColors.textTertiary)
                        .padding(.leading, 20)
                }
            }

            Spacer()
        }
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(isNext ? CredoColors.accent.opacity(0.3) : isCompleted ? CredoColors.success.opacity(0.2) : CredoColors.border, lineWidth: 1)
        )
        .opacity(isFuture ? 0.6 : 1.0)
    }

    private static let dayDateFormatter: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "EEE, MMM d"
        return f
    }()
}
