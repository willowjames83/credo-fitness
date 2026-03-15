import SwiftUI

struct GenerateProgramView: View {
    @State private var vm = ProgramGeneratorViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        Group {
            switch vm.step {
            case .preferences:
                preferencesView
            case .generating:
                generatingView
            case .preview:
                previewView
            }
        }
        .background(CredoColors.bg)
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: - Preferences Step

    private var preferencesView: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 6) {
                    Text("Build Your Program")
                        .font(.credoDisplay(size: 26))
                        .foregroundStyle(CredoColors.textPrimary)

                    Text("AI-powered, personalized to your history and goals")
                        .font(.credoBody(size: 14, weight: .regular))
                        .foregroundStyle(CredoColors.textSecondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 8)

                // Days per week
                sectionCard(title: "Days per week") {
                    HStack(spacing: 8) {
                        ForEach(vm.daysOptions, id: \.self) { days in
                            chipButton(
                                label: "\(days)",
                                isSelected: vm.daysPerWeek == days
                            ) {
                                vm.daysPerWeek = days
                            }
                        }
                    }
                }

                // Session duration
                sectionCard(title: "Session length") {
                    HStack(spacing: 8) {
                        ForEach(vm.durationOptions, id: \.self) { duration in
                            chipButton(
                                label: "\(duration) min",
                                isSelected: vm.sessionDuration == duration
                            ) {
                                vm.sessionDuration = duration
                            }
                        }
                    }
                }

                // Focus
                sectionCard(title: "Training focus") {
                    HStack(spacing: 8) {
                        ForEach(vm.focusOptions, id: \.self) { option in
                            chipButton(
                                label: option,
                                isSelected: vm.focus == option
                            ) {
                                vm.focus = option
                            }
                        }
                    }
                }

                // Equipment
                sectionCard(title: "Available equipment") {
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 10) {
                        ForEach(vm.equipmentOptions, id: \.id) { equip in
                            equipmentToggle(equip)
                        }
                    }
                }

                // Additional notes
                sectionCard(title: "Anything else?") {
                    TextField("Injuries, preferences, specific goals...", text: $vm.additionalNotes, axis: .vertical)
                        .font(.credoBody(size: 14, weight: .regular))
                        .lineLimit(3...6)
                        .padding(12)
                        .background(CredoColors.bg)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(CredoColors.border, lineWidth: 1)
                        )
                }

                // Error
                if let error = vm.error {
                    Text(error)
                        .font(.credoBody(size: 13, weight: .medium))
                        .foregroundStyle(CredoColors.danger)
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color(hex: "FFE8E8"))
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                }

                // Generate button
                Button {
                    Task { await vm.generateProgram() }
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "sparkles")
                        Text("Generate My Program")
                    }
                    .font(.credoBody(size: 16, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(CredoColors.accent)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
    }

    // MARK: - Generating Step

    private var generatingView: some View {
        VStack(spacing: 24) {
            Spacer()

            // Animated ring
            ZStack {
                Circle()
                    .stroke(CredoColors.accent.opacity(0.15), lineWidth: 4)
                    .frame(width: 80, height: 80)

                Circle()
                    .trim(from: 0, to: 0.7)
                    .stroke(CredoColors.accent, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                    .frame(width: 80, height: 80)
                    .rotationEffect(.degrees(generatingRotation))

                Image(systemName: "sparkles")
                    .font(.system(size: 28, weight: .medium))
                    .foregroundStyle(CredoColors.accent)
            }

            VStack(spacing: 8) {
                Text("Building your program...")
                    .font(.credoDisplay(size: 22))
                    .foregroundStyle(CredoColors.textPrimary)

                Text("Analyzing your history and designing\na personalized training block")
                    .font(.credoBody(size: 14, weight: .regular))
                    .foregroundStyle(CredoColors.textSecondary)
                    .multilineTextAlignment(.center)
            }

            Spacer()
        }
        .onAppear { startRotation() }
    }

    @State private var generatingRotation: Double = 0

    private func startRotation() {
        withAnimation(.linear(duration: 1).repeatForever(autoreverses: false)) {
            generatingRotation = 360
        }
    }

    // MARK: - Preview Step

    private var previewView: some View {
        ScrollView {
            VStack(spacing: 20) {
                if let program = vm.generatedProgram {
                    // Header
                    VStack(spacing: 6) {
                        HStack(spacing: 6) {
                            Image(systemName: "sparkles")
                                .foregroundStyle(CredoColors.accent)
                            Text("AI-Generated")
                                .font(.credoBody(size: 12, weight: .semibold))
                                .foregroundStyle(CredoColors.accent)
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(CredoColors.accentLight)
                        .clipShape(RoundedRectangle(cornerRadius: 6))

                        Text(program.name)
                            .font(.credoDisplay(size: 26))
                            .foregroundStyle(CredoColors.textPrimary)
                    }
                    .padding(.top, 8)

                    // Inline detail view
                    ProgramDetailView(program: program)

                    // Actions
                    VStack(spacing: 12) {
                        Button {
                            vm.saveAndSelect()
                            dismiss()
                        } label: {
                            HStack(spacing: 8) {
                                Image(systemName: "checkmark.circle.fill")
                                Text("Save & Start")
                            }
                            .font(.credoBody(size: 16, weight: .semibold))
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(CredoColors.accent)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }

                        HStack(spacing: 12) {
                            Button {
                                Task { await vm.regenerate() }
                            } label: {
                                HStack(spacing: 6) {
                                    Image(systemName: "arrow.clockwise")
                                    Text("Regenerate")
                                }
                                .font(.credoBody(size: 14, weight: .medium))
                                .foregroundStyle(CredoColors.accent)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .background(CredoColors.accentLight)
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                            }

                            Button {
                                vm.tweakProgram()
                            } label: {
                                HStack(spacing: 6) {
                                    Image(systemName: "slider.horizontal.3")
                                    Text("Tweak")
                                }
                                .font(.credoBody(size: 14, weight: .medium))
                                .foregroundStyle(CredoColors.textSecondary)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .background(CredoColors.surface)
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(CredoColors.border, lineWidth: 1)
                                )
                            }
                        }
                    }
                    .padding(.top, 8)
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
    }

    // MARK: - Components

    private func sectionCard(title: String, @ViewBuilder content: () -> some View) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.credoBody(size: 13, weight: .semibold))
                .foregroundStyle(CredoColors.textSecondary)

            content()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }

    private func chipButton(label: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label)
                .font(.credoBody(size: 13, weight: isSelected ? .semibold : .medium))
                .foregroundStyle(isSelected ? .white : CredoColors.textPrimary)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(isSelected ? CredoColors.accent : CredoColors.bg)
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(isSelected ? Color.clear : CredoColors.border, lineWidth: 1)
                )
        }
    }

    private func equipmentToggle(_ equip: (id: String, label: String, icon: String)) -> some View {
        let isSelected = vm.equipmentAvailable.contains(equip.id)

        return Button {
            vm.toggleEquipment(equip.id)
        } label: {
            VStack(spacing: 6) {
                Image(systemName: equip.icon)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(isSelected ? CredoColors.accent : CredoColors.textTertiary)

                Text(equip.label)
                    .font(.credoBody(size: 11, weight: .medium))
                    .foregroundStyle(isSelected ? CredoColors.textPrimary : CredoColors.textTertiary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(isSelected ? CredoColors.accentLight : CredoColors.bg)
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(isSelected ? CredoColors.accent.opacity(0.4) : CredoColors.border, lineWidth: 1)
            )
        }
    }
}
