import SwiftUI

struct ContentView: View {
    @State private var selectedTab: Int = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            NavigationStack {
                DashboardView(onSwitchToWorkout: {
                    selectedTab = 1
                })
                    .navigationTitle("")
                    .toolbar {
                        ToolbarItem(placement: .principal) {
                            credoWordmark
                        }
                    }
            }
            .tag(0)
            .tabItem {
                Label("Dashboard", systemImage: "square.grid.2x2")
            }

            NavigationStack {
                WorkoutView()
                    .navigationTitle("")
                    .toolbar {
                        ToolbarItem(placement: .principal) {
                            credoWordmark
                        }
                    }
            }
            .tag(1)
            .tabItem {
                Label("Workout", systemImage: "dumbbell")
            }

            NavigationStack {
                CredoTenView()
                    .navigationTitle("")
                    .toolbar {
                        ToolbarItem(placement: .principal) {
                            credoWordmark
                        }
                    }
            }
            .tag(2)
            .tabItem {
                Label("Credo Ten", systemImage: "hexagon")
            }

            NavigationStack {
                CoachView()
                    .toolbar {
                        ToolbarItem(placement: .principal) {
                            credoWordmark
                        }
                    }
            }
            .tag(3)
            .tabItem {
                Label("Coach", systemImage: "bubble.left.and.text.bubble.right")
            }

            NavigationStack {
                ProteinView()
                    .navigationTitle("")
                    .toolbar {
                        ToolbarItem(placement: .principal) {
                            credoWordmark
                        }
                    }
            }
            .tag(4)
            .tabItem {
                Label("Protein", systemImage: "fork.knife")
            }

            NavigationStack {
                ProfileView()
                    .navigationTitle("")
                    .toolbar {
                        ToolbarItem(placement: .principal) {
                            credoWordmark
                        }
                    }
            }
            .tag(5)
            .tabItem {
                Label("Profile", systemImage: "person")
            }
        }
        .tint(CredoColors.accent)
    }

    private var credoWordmark: some View {
        Text("CREDO")
            .font(.system(size: 11, weight: .bold))
            .tracking(2.5)
            .foregroundStyle(CredoColors.accent)
    }
}
