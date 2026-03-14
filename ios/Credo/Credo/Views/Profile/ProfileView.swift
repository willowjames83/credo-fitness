import SwiftUI

struct ProfileView: View {
    @State private var vm = ProfileViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                ProfileHeaderView(
                    name: vm.userName,
                    initials: vm.userInitials,
                    summary: vm.profileSummary
                )
                .padding(.vertical, 8)

                ProgramStatsCard()

                // Sync Status
                if vm.isLoggedIn {
                    SyncStatusBadge()
                }

                ForEach(Array(vm.sections.enumerated()), id: \.offset) { _, section in
                    SettingsSectionView(section: section)
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, 24)
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
