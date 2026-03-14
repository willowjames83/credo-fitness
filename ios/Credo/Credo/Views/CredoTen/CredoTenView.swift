import SwiftUI

struct CredoTenView: View {
    @State private var vm = CredoTenViewModel()
    @State private var showLogBenchmark = false

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Title
                VStack(spacing: 6) {
                    Text("The Credo Ten")
                        .font(.credoDisplay(size: 24))
                        .foregroundStyle(CredoColors.textPrimary)

                    Text("Your functional fitness benchmarks")
                        .font(.credoBody(size: 14, weight: .regular))
                        .foregroundStyle(CredoColors.textSecondary)
                }
                .padding(.bottom, 4)

                // Composite card
                CompositeCard(composite: vm.composite)

                // Benchmark cards
                VStack(spacing: 10) {
                    ForEach(vm.benchmarks) { benchmark in
                        BenchmarkCard(
                            benchmark: benchmark,
                            formattedValue: vm.formatValue(benchmark),
                            isTested: vm.isTested(benchmark),
                            percentile: benchmark.percentile,
                            demographicLabel: vm.demographicLabel,
                            exerciseId: vm.exerciseId(for: benchmark)
                        )
                    }
                }

                // Log benchmark button
                Button {
                    showLogBenchmark = true
                } label: {
                    Text("Log Benchmark Test")
                        .font(.credoBody(size: 14, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(CredoColors.teal)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .padding(.top, 4)

                // Breakdown link
                NavigationLink {
                    StrengthBreakdownView()
                } label: {
                    HStack {
                        Text("See Full Breakdown")
                            .font(.credoBody(size: 14, weight: .semibold))
                            .foregroundStyle(CredoColors.teal)

                        Image(systemName: "arrow.right")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundStyle(CredoColors.teal)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(CredoColors.tealLight)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(CredoColors.teal.opacity(0.3), lineWidth: 1)
                    )
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, 24)
        }
        .sheet(isPresented: $showLogBenchmark) {
            LogBenchmarkSheet()
        }
    }
}
