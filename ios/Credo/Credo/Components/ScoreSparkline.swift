import SwiftUI
import Charts

struct ScoreSparkline: View {
    let scores: [Int]
    var color: Color = CredoColors.accent
    var height: CGFloat = 40

    @State private var trimEnd: CGFloat = 0

    private var indexedScores: [(index: Int, score: Int)] {
        scores.enumerated().map { ($0.offset, $0.element) }
    }

    var body: some View {
        Chart {
            ForEach(indexedScores, id: \.index) { item in
                LineMark(
                    x: .value("Index", item.index),
                    y: .value("Score", item.score)
                )
                .foregroundStyle(color.opacity(Double(trimEnd)))
                .interpolationMethod(.catmullRom)
                .lineStyle(StrokeStyle(lineWidth: 1.5))
            }
        }
        .chartYScale(domain: (indexedScores.map(\.score).min() ?? 0)...(indexedScores.map(\.score).max() ?? 100))
        .chartXAxis(.hidden)
        .chartYAxis(.hidden)
        .frame(height: height)
        .onAppear {
            withAnimation(.easeOut(duration: 0.8)) {
                trimEnd = 1.0
            }
        }
    }
}
