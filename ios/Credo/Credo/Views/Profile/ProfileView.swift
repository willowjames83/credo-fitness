import SwiftUI

struct ProfileView: View {
    @State private var vm = ProfileViewModel()
    @State private var sectionsAppeared = false

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                ProfileHeaderView(
                    name: vm.userName,
                    initials: vm.userInitials,
                    summary: vm.profileSummary
                )
                .padding(.vertical, 8)
                .opacity(sectionsAppeared ? 1 : 0)
                .offset(y: sectionsAppeared ? 0 : 10)

                ProgramStatsCard()
                    .opacity(sectionsAppeared ? 1 : 0)
                    .offset(y: sectionsAppeared ? 0 : 10)

                // Sync Status
                if vm.isLoggedIn {
                    SyncStatusBadge()
                        .opacity(sectionsAppeared ? 1 : 0)
                        .offset(y: sectionsAppeared ? 0 : 10)
                }

                ForEach(Array(vm.sections.enumerated()), id: \.offset) { index, section in
                    SettingsSectionView(section: section)
                        .opacity(sectionsAppeared ? 1 : 0)
                        .offset(y: sectionsAppeared ? 0 : 12)
                        .animation(
                            .easeOut(duration: 0.4).delay(Double(index) * 0.06),
                            value: sectionsAppeared
                        )
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, 24)
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.5)) {
                sectionsAppeared = true
            }
        }
        .sheet(isPresented: $vm.showEditWeight) {
            EditWeightSheet()
                .presentationDetents([.medium])
                .presentationDragIndicator(.visible)
        }
        .sheet(isPresented: $vm.showEditExperience) {
            EditExperienceSheet()
                .presentationDetents([.medium])
                .presentationDragIndicator(.visible)
        }
        .sheet(isPresented: $vm.showLoginSheet) {
            LoginView()
        }
        .sheet(isPresented: $vm.showHealthKitOnboarding) {
            HealthKitOnboardingView()
                .presentationDragIndicator(.visible)
        }
    }
}
