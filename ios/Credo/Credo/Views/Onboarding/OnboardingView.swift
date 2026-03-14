import SwiftUI

struct OnboardingView: View {
    let onComplete: () -> Void

    @State private var currentStep: Int = 0
    private let totalSteps = 6

    // Step 1: Basic Info
    @State private var name: String = ""
    @State private var age: Int = 30
    @State private var sex: String = "Male"

    // Step 2: Body
    @State private var weightText: String = ""
    @State private var heightFeet: Int = 5
    @State private var heightInches: Int = 10

    // Step 3: Experience
    @State private var experienceLevel: String = "intermediate"

    // Step 4: Benchmarks
    @State private var benchPressText: String = ""
    @State private var squatText: String = ""
    @State private var deadliftText: String = ""
    @State private var ohpText: String = ""

    // Step 5: Goal
    @State private var trainingGoal: String = "general_fitness"

    var body: some View {
        VStack(spacing: 0) {
            // Top bar with back button
            HStack {
                if currentStep > 0 {
                    Button {
                        withAnimation(.easeInOut(duration: 0.25)) {
                            currentStep -= 1
                        }
                    } label: {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(CredoColors.textSecondary)
                            .frame(width: 36, height: 36)
                    }
                    .buttonStyle(.plain)
                } else {
                    Spacer()
                        .frame(width: 36, height: 36)
                }

                Spacer()

                // Step indicator
                Text("\(currentStep + 1) of \(totalSteps)")
                    .font(.credoBody(size: 13, weight: .medium))
                    .foregroundStyle(CredoColors.textTertiary)

                Spacer()

                Spacer()
                    .frame(width: 36, height: 36)
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)

            // Progress dots
            HStack(spacing: 6) {
                ForEach(0..<totalSteps, id: \.self) { step in
                    RoundedRectangle(cornerRadius: 2)
                        .fill(step <= currentStep ? CredoColors.accent : CredoColors.border)
                        .frame(height: 3)
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 12)

            // Step content
            TabView(selection: $currentStep) {
                OnboardingBasicInfoStep(name: $name, age: $age, sex: $sex)
                    .tag(0)
                    .padding(.horizontal, 20)
                    .padding(.top, 24)

                OnboardingBodyStep(weight: $weightText, heightFeet: $heightFeet, heightInches: $heightInches)
                    .tag(1)
                    .padding(.horizontal, 20)
                    .padding(.top, 24)

                OnboardingExperienceStep(experienceLevel: $experienceLevel)
                    .tag(2)
                    .padding(.horizontal, 20)
                    .padding(.top, 24)

                OnboardingBenchmarksStep(benchPress: $benchPressText, squat: $squatText, deadlift: $deadliftText, ohp: $ohpText)
                    .tag(3)
                    .padding(.horizontal, 20)
                    .padding(.top, 24)

                OnboardingGoalStep(trainingGoal: $trainingGoal)
                    .tag(4)
                    .padding(.horizontal, 20)
                    .padding(.top, 24)

                OnboardingReadyStep(name: name)
                    .tag(5)
                    .padding(.horizontal, 20)
                    .padding(.top, 24)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .animation(.easeInOut(duration: 0.25), value: currentStep)

            // Bottom button
            Button {
                if currentStep < totalSteps - 1 {
                    withAnimation(.easeInOut(duration: 0.25)) {
                        currentStep += 1
                    }
                } else {
                    saveProfileAndComplete()
                }
            } label: {
                Text(currentStep == totalSteps - 1 ? "Get Started" : "Continue")
                    .font(.credoBody(size: 16, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(canContinue ? CredoColors.accent : CredoColors.accent.opacity(0.4))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .buttonStyle(.plain)
            .disabled(!canContinue)
            .padding(.horizontal, 20)
            .padding(.bottom, 24)
        }
        .background(CredoColors.bg)
    }

    // MARK: - Validation

    private var canContinue: Bool {
        switch currentStep {
        case 0:
            return !name.trimmingCharacters(in: .whitespaces).isEmpty
        case 1:
            return Int(weightText) != nil && Int(weightText)! > 0
        case 2:
            return !experienceLevel.isEmpty
        case 3:
            return true // benchmarks are optional
        case 4:
            return !trainingGoal.isEmpty
        case 5:
            return true
        default:
            return true
        }
    }

    // MARK: - Save

    private func saveProfileAndComplete() {
        let profile = UserProfile(
            name: name.trimmingCharacters(in: .whitespaces),
            age: age,
            sex: sex,
            weight: Int(weightText) ?? 185,
            heightFeet: heightFeet,
            heightInches: heightInches,
            experienceLevel: experienceLevel,
            trainingGoal: trainingGoal,
            benchPress1RM: Double(benchPressText),
            squat1RM: Double(squatText),
            deadlift1RM: Double(deadliftText),
            ohp1RM: Double(ohpText)
        )

        WorkoutStore.shared.userProfile = profile
        WorkoutStore.shared.save()
        onComplete()
    }
}
