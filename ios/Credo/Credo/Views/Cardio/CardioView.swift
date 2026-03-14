import SwiftUI

struct CardioView: View {
    @State private var vm = CardioViewModel()
    @State private var showingTypeSheet = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Weekly Summary Card
                    weeklySummaryCard

                    // Start Session Button
                    startSessionButton

                    // Recent Sessions
                    if !vm.recentSessions.isEmpty {
                        recentSessionsSection
                    } else {
                        emptyStateCard
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 8)
                .padding(.bottom, 24)
            }
            .background(CredoColors.bg)
            .navigationTitle("Cardio")
            .navigationBarTitleDisplayMode(.large)
            .fullScreenCover(isPresented: $vm.isSessionActive) {
                CardioSessionView(vm: vm)
            }
            .sheet(isPresented: $showingTypeSheet) {
                cardioTypeSheet
            }
        }
    }

    // MARK: - Weekly Summary Card

    private var weeklySummaryCard: some View {
        VStack(spacing: 12) {
            HStack {
                Text("This Week")
                    .font(.credoBody(size: 13, weight: .semibold))
                    .foregroundStyle(CredoColors.textSecondary)
                Spacer()
                Text("Score: \(vm.cardioScore)")
                    .font(.credoMono(size: 13, weight: .semibold))
                    .foregroundStyle(CredoColors.cardio)
            }

            HStack(spacing: 0) {
                weeklyStatItem(
                    value: "\(vm.weeklyStats.totalMinutes)",
                    label: "Minutes",
                    icon: "clock"
                )
                Spacer()
                weeklyStatItem(
                    value: "\(vm.weeklyStats.sessionCount)",
                    label: "Sessions",
                    icon: "flame"
                )
                Spacer()
                weeklyStatItem(
                    value: "\(vm.weeklyStats.averageDuration)",
                    label: "Avg Min",
                    icon: "chart.bar"
                )
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

    private func weeklyStatItem(value: String, label: String, icon: String) -> some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(CredoColors.cardio)

            Text(value)
                .font(.credoMono(size: 22, weight: .bold))
                .foregroundStyle(CredoColors.textPrimary)

            Text(label)
                .font(.credoBody(size: 11, weight: .medium))
                .foregroundStyle(CredoColors.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Start Session Button

    private var startSessionButton: some View {
        Button {
            showingTypeSheet = true
        } label: {
            HStack(spacing: 8) {
                Image(systemName: "play.fill")
                    .font(.system(size: 14, weight: .semibold))
                Text("Start Session")
                    .font(.credoBody(size: 15, weight: .semibold))
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(CredoColors.accent)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    // MARK: - Cardio Type Sheet

    private var cardioTypeSheet: some View {
        NavigationStack {
            List {
                ForEach(CardioType.standardCases, id: \.displayName) { type in
                    Button {
                        showingTypeSheet = false
                        vm.startSession(type: type)
                    } label: {
                        HStack(spacing: 12) {
                            Image(systemName: type.icon)
                                .font(.system(size: 18, weight: .medium))
                                .foregroundStyle(CredoColors.cardio)
                                .frame(width: 36, height: 36)
                                .background(CredoColors.cardioLight)
                                .clipShape(RoundedRectangle(cornerRadius: 10))

                            Text(type.displayName)
                                .font(.credoBody(size: 15, weight: .medium))
                                .foregroundStyle(CredoColors.textPrimary)

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundStyle(CredoColors.textTertiary)
                        }
                    }
                }
            }
            .navigationTitle("Choose Activity")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        showingTypeSheet = false
                    }
                    .foregroundStyle(CredoColors.textSecondary)
                }
            }
        }
        .presentationDetents([.medium])
    }

    // MARK: - Recent Sessions

    private var recentSessionsSection: some View {
        VStack(spacing: 10) {
            HStack {
                SectionHeader(title: "Recent Sessions")
                Spacer()
                NavigationLink {
                    CardioHistoryView(vm: vm)
                } label: {
                    Text("See All")
                        .font(.credoBody(size: 13, weight: .medium))
                        .foregroundStyle(CredoColors.accent)
                }
            }

            VStack(spacing: 8) {
                ForEach(vm.recentSessions) { session in
                    NavigationLink {
                        CardioSessionDetailView(session: session, vm: vm)
                    } label: {
                        CardioSessionRow(session: session)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    // MARK: - Empty State

    private var emptyStateCard: some View {
        VStack(spacing: 8) {
            Image(systemName: "heart.circle")
                .font(.system(size: 36, weight: .light))
                .foregroundStyle(CredoColors.textTertiary)

            Text("No sessions yet")
                .font(.credoBody(size: 15, weight: .medium))
                .foregroundStyle(CredoColors.textPrimary)

            Text("Start a cardio session to begin tracking your conditioning")
                .font(.credoBody(size: 13, weight: .regular))
                .foregroundStyle(CredoColors.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .background(CredoColors.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(CredoColors.border, lineWidth: 1)
        )
    }
}

#Preview {
    CardioView()
}
